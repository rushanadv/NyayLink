import { NextRequest, NextResponse } from "next/server";
import { buildSystemPrompt } from "@/lib/intake/system-prompt";

export const maxDuration = 60;

// Configurable Models (server-side only)
const getPrimaryModel = (): string =>
  process.env.OPENROUTER_MODEL?.trim() || "nvidia/nemotron-3.5-super-vl:free";

const getFallbackModel = (): string =>
  process.env.OPENROUTER_FALLBACK_MODEL?.trim() || "nvidia/nemotron-3.5-lightning:free";

// In-memory rate limiting: IP -> timestamps array
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_MINUTE = 15;

function checkRateLimit(clientIp: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const timestamps = rateLimitMap.get(clientIp) || [];

  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (recent.length >= MAX_REQUESTS_PER_MINUTE) {
    rateLimitMap.set(clientIp, recent);
    return { allowed: false, remaining: 0 };
  }

  recent.push(now);
  rateLimitMap.set(clientIp, recent);

  // Periodic pruning
  if (rateLimitMap.size > 1000) {
    for (const [ip, list] of rateLimitMap.entries()) {
      const active = list.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
      if (active.length === 0) {
        rateLimitMap.delete(ip);
      } else {
        rateLimitMap.set(ip, active);
      }
    }
  }

  return { allowed: true, remaining: MAX_REQUESTS_PER_MINUTE - recent.length };
}

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface RequestBody {
  messages: ChatMessage[];
  state?: string;
  district?: string;
  isContinuation?: boolean;
}

async function requestOpenRouter(
  model: string,
  messages: ChatMessage[],
  apiKey: string,
  clientSignal?: AbortSignal
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 35000);

  if (clientSignal) {
    if (clientSignal.aborted) {
      controller.abort();
    } else {
      clientSignal.addEventListener("abort", () => controller.abort(), { once: true });
    }
  }

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://nyay.live",
        "X-Title": "NyayLink Legal Intake Assistant",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 1500,
        temperature: 0.25,
        stream: true,
        // Disable reasoning token overhead for dramatic TTFT speedup on supported reasoning models
        reasoning: { effort: "none" },
      }),
      signal: controller.signal,
    });
    return res;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function POST(req: NextRequest) {
  const requestStartTime = Date.now();

  try {
    // 1. Rate Limiting Check
    const forwarded = req.headers.get("x-forwarded-for");
    const clientIp = forwarded
      ? forwarded.split(",")[0].trim()
      : req.headers.get("x-real-ip") || "127.0.0.1";

    const { allowed, remaining } = checkRateLimit(clientIp);
    if (!allowed) {
      return NextResponse.json(
        {
          error:
            "Rate limit reached. Please wait a few moments before asking additional legal questions.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": "60",
            "X-RateLimit-Limit": `${MAX_REQUESTS_PER_MINUTE}`,
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    // 2. Secret Validation
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey || apiKey === "your-openrouter-key-here" || apiKey.trim() === "") {
      return NextResponse.json(
        {
          error:
            "OPENROUTER_API_KEY is not configured on the server. Please configure your key in environment settings.",
        },
        { status: 503 }
      );
    }

    // 3. Payload Parsing
    let body: RequestBody;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON request body." }, { status: 400 });
    }

    const { messages = [], state, district, isContinuation } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Request must include a non-empty array of messages." },
        { status: 400 }
      );
    }

    // 4. Sanitize messages & build bounded context window
    const sanitizedChatMessages: ChatMessage[] = messages
      .filter(
        (m): m is ChatMessage =>
          Boolean(m) &&
          (m.role === "user" || m.role === "assistant") &&
          typeof m.content === "string" &&
          m.content.trim().length > 0
      )
      .slice(-6) // Bounded context: last 6 turns preserve state without token bloat
      .map((m) => ({
        role: m.role,
        content: m.content.slice(0, 1500),
      }));

    if (sanitizedChatMessages.length === 0) {
      return NextResponse.json(
        { error: "No valid user or assistant messages found in request." },
        { status: 400 }
      );
    }

    const systemPrompt = buildSystemPrompt({ state, district });
    const fullMessages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...sanitizedChatMessages,
    ];

    if (isContinuation) {
      fullMessages.push({
        role: "user",
        content:
          "Please continue your legal explanation directly from the exact sentence where it was cut off. Do not repeat what you have already written.",
      });
    }

    // 5. Connect to OpenRouter (Primary Model -> Fallback on failure)
    const primaryModel = getPrimaryModel();
    const fallbackModel = getFallbackModel();

    let activeResponse: Response | null = null;
    let selectedModel = primaryModel;
    let primaryErrorDetail = "";
    let primaryStatus = 0;

    try {
      const primaryRes = await requestOpenRouter(primaryModel, fullMessages, apiKey, req.signal);
      if (primaryRes.ok && primaryRes.body) {
        activeResponse = primaryRes;
      } else {
        primaryStatus = primaryRes.status;
        const errText = await primaryRes.text();
        primaryErrorDetail = errText;
        console.warn(`[AI Intake] Primary model (${primaryModel}) failed [${primaryStatus}]`);
      }
    } catch (err: unknown) {
      primaryErrorDetail = err instanceof Error ? err.message : String(err);
      console.warn(`[AI Intake] Primary model network error: ${primaryErrorDetail}`);
    }

    // Fallback if primary model failed before emitting tokens
    if (!activeResponse) {
      console.info(`[AI Intake] Initiating fallback model (${fallbackModel})...`);
      selectedModel = fallbackModel;
      try {
        const fallbackRes = await requestOpenRouter(fallbackModel, fullMessages, apiKey, req.signal);
        if (fallbackRes.ok && fallbackRes.body) {
          activeResponse = fallbackRes;
        } else {
          const fallbackStatus = fallbackRes.status;
          const fallbackErrText = await fallbackRes.text();
          console.error(
            `[AI Intake] Fallback model (${fallbackModel}) failed [${fallbackStatus}]: ${fallbackErrText.slice(0, 160)}`
          );

          const is404 = primaryStatus === 404 || fallbackStatus === 404;
          const errorMsg = is404
            ? "The AI legal model is temporarily undergoing maintenance upstream. Please retry in a few moments."
            : "AI intake is temporarily unavailable from the upstream provider. Please retry shortly.";

          return NextResponse.json({ error: errorMsg }, { status: 502 });
        }
      } catch (fallbackErr: unknown) {
        const fallbackMsg =
          fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr);
        console.error(`[AI Intake] Fallback network exception: ${fallbackMsg}`);
        return NextResponse.json(
          { error: "Unable to establish connection with legal AI provider. Please retry." },
          { status: 502 }
        );
      }
    }

    // 6. Robust Server-Side SSE Token Parser and Stream Transmitter
    const openRouterReader = activeResponse.body!.getReader();
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        let buffer = "";
        let finishReason: string | null = null;
        let hasEmittedTokens = false;
        let streamError: string | null = null;
        let timeToFirstToken: number | null = null;

        try {
          while (true) {
            const { done, value } = await openRouterReader.read();
            if (done) {
              break;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || trimmed.startsWith(":")) continue;

              if (trimmed === "data: [DONE]") {
                continue;
              }

              if (trimmed.startsWith("data: ")) {
                try {
                  const json = JSON.parse(trimmed.slice(6));

                  // OpenRouter mid-stream error format
                  if (json.error) {
                    const rawMsg = json.error?.message || "Upstream provider stream error.";
                    console.error("[AI Intake] SSE chunk error received:", rawMsg);
                    streamError = rawMsg;
                    break;
                  }

                  const delta = json.choices?.[0]?.delta?.content;
                  if (delta) {
                    if (timeToFirstToken === null) {
                      timeToFirstToken = Date.now() - requestStartTime;
                    }
                    controller.enqueue(encoder.encode(delta));
                    hasEmittedTokens = true;
                  }

                  const reason = json.choices?.[0]?.finish_reason;
                  if (reason) {
                    finishReason = reason;
                  }
                } catch {
                  // Ignore JSON parse errors on fragmented lines
                }
              }
            }

            if (streamError) {
              break;
            }
          }

          // Flush decoder remainder
          const remainder = decoder.decode();
          if (remainder) {
            controller.enqueue(encoder.encode(remainder));
          }

          // Emit deterministic protocol completion token based on generation state
          if (streamError) {
            controller.enqueue(encoder.encode(`\n\n__NYAYLINK_ERROR__: ${streamError}`));
          } else if (hasEmittedTokens) {
            if (finishReason === "length") {
              controller.enqueue(encoder.encode("\n\n__NYAYLINK_TRUNCATED__"));
            } else if (finishReason === "content_filter") {
              controller.enqueue(encoder.encode("\n\n__NYAYLINK_FILTERED__"));
            } else {
              controller.enqueue(encoder.encode("\n\n__NYAYLINK_DONE__"));
            }
          }

          const totalDuration = Date.now() - requestStartTime;
          console.info(
            `[AI Intake] Request completed: model=${selectedModel}, TTFT=${timeToFirstToken ?? "none"}ms, total=${totalDuration}ms, finish=${finishReason || "natural"}`
          );

          controller.close();
        } catch (streamErr) {
          console.error("[AI Intake] Stream reading error:", streamErr);
          controller.error(streamErr);
        }
      },
      cancel() {
        openRouterReader.cancel().catch(() => {});
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "Transfer-Encoding": "chunked",
        "X-Content-Type-Options": "nosniff",
        "X-RateLimit-Remaining": `${remaining}`,
      },
    });
  } catch (err: unknown) {
    console.error("[AI Intake] Internal Route Handler error:", err);
    return NextResponse.json(
      { error: "Internal server error occurred while processing legal intake." },
      { status: 500 }
    );
  }
}
