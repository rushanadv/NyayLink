import { NextRequest, NextResponse } from "next/server";
import { buildSystemPrompt } from "@/lib/intake/system-prompt";
import {
  retrieveRelevantLegalSources,
  StatutoryReference,
} from "@/lib/legal/references";
import { IntakeFacts, IntakeIntent } from "@/lib/intake/fact-types";

export const maxDuration = 60;

// Configurable Models (server-side only)
const getPrimaryModel = (): string =>
  process.env.GROQ_MODEL?.trim() || "openai/gpt-oss-120b";

const getFallbackModel = (): string =>
  process.env.GROQ_FALLBACK_MODEL?.trim() || "openai/gpt-oss-20b";

// In-memory rate limiting: IP -> timestamps array
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_MINUTE = 20;

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
  intent?: IntakeIntent;
  confirmedFacts?: IntakeFacts;
  sources?: StatutoryReference[];
}

async function requestGroq(
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

  const payload: Record<string, unknown> = {
    model,
    messages,
    max_tokens: 2048,
    temperature: 0.25,
    stream: true,
  };

  // Configure reasoning only using options supported by the selected Groq model
  if (model.includes("gpt-oss")) {
    payload.reasoning_format = "hidden";
  }

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
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

    // 2. Secret Validation (Server-Side Only - Never Exposed)
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey === "your-groq-api-key-here" || apiKey.trim() === "") {
      console.error("[AI Intake] Server configuration notice: GROQ_API_KEY is not configured.");
      return NextResponse.json(
        {
          error:
            "The legal intake assistant service is temporarily unconfigured or undergoing maintenance. Please retry in a few moments.",
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

    const {
      messages = [],
      state,
      district,
      isContinuation,
      intent,
      confirmedFacts,
      sources,
    } = body;

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
        content: m.content.slice(0, 1800),
      }));

    if (sanitizedChatMessages.length === 0) {
      return NextResponse.json(
        { error: "No valid user or assistant messages found in request." },
        { status: 400 }
      );
    }

    // Retrieve relevant verified legal sources from India Code registry
    const latestUserQuery =
      [...sanitizedChatMessages].reverse().find((m) => m.role === "user")?.content || "";

    const activeSources: StatutoryReference[] =
      sources && sources.length > 0
        ? sources
        : retrieveRelevantLegalSources(latestUserQuery, {
            legalIssue: confirmedFacts?.legalIssue,
            possiblePracticeAreas: confirmedFacts?.possiblePracticeAreas,
            userRole: confirmedFacts?.userRole,
          });

    const systemPrompt = buildSystemPrompt({
      location: { state, district },
      confirmedFacts,
      retrievedSources: activeSources,
    });

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

    // 5. Connect to Groq (Primary Model -> Fallback on failure)
    const primaryModel = getPrimaryModel();
    const fallbackModel = getFallbackModel();

    let activeResponse: Response | null = null;
    let selectedModel = primaryModel;
    let primaryStatus = 0;

    try {
      const primaryRes = await requestGroq(primaryModel, fullMessages, apiKey, req.signal);
      if (primaryRes.ok && primaryRes.body) {
        activeResponse = primaryRes;
      } else {
        primaryStatus = primaryRes.status;
        const errText = await primaryRes.text();
        console.warn(
          `[AI Intake] Primary Groq model (${primaryModel}) failed [${primaryStatus}]: ${errText.slice(0, 160)}`
        );
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.warn(`[AI Intake] Primary Groq model network error: ${errMsg}`);
    }

    // Fallback if primary model failed before emitting tokens
    if (!activeResponse) {
      console.info(`[AI Intake] Initiating fallback Groq model (${fallbackModel})...`);
      selectedModel = fallbackModel;
      try {
        const fallbackRes = await requestGroq(fallbackModel, fullMessages, apiKey, req.signal);
        if (fallbackRes.ok && fallbackRes.body) {
          activeResponse = fallbackRes;
        } else {
          const fallbackStatus = fallbackRes.status;
          const fallbackErrText = await fallbackRes.text();
          console.error(
            `[AI Intake] Fallback Groq model (${fallbackModel}) failed [${fallbackStatus}]: ${fallbackErrText.slice(0, 160)}`
          );

          const is429 = primaryStatus === 429 || fallbackStatus === 429;
          const is404 = primaryStatus === 404 || fallbackStatus === 404;

          const errorMsg = is429
            ? "AI preconsultation is currently handling high request volume. Please retry in a few moments."
            : is404
            ? "The AI legal model is temporarily undergoing maintenance upstream. Please retry in a few moments."
            : "AI preconsultation is temporarily unavailable from the upstream provider. Please retry shortly.";

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
    const groqReader = activeResponse.body!.getReader();
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
            const { done, value } = await groqReader.read();
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

                  // Groq mid-stream error format
                  if (json.error) {
                    const rawMsg = json.error?.message || "Upstream provider stream error.";
                    console.error("[AI Intake] Groq SSE chunk error received:", rawMsg);
                    streamError = "Generation interrupted by upstream service.";
                    break;
                  }

                  const delta = json.choices?.[0]?.delta;
                  const content = delta?.content;
                  if (content) {
                    if (timeToFirstToken === null) {
                      timeToFirstToken = Date.now() - requestStartTime;
                    }
                    controller.enqueue(encoder.encode(content));
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

          // Emit verified sources metadata chunk
          if (activeSources.length > 0) {
            const serializedSources = JSON.stringify(
              activeSources.map((s) => ({
                id: s.id,
                actName: s.actName,
                actShortName: s.actShortName,
                section: s.section,
                provisionTitle: s.provisionTitle,
                officialSourceUrl: s.officialSourceUrl,
                sourcePublisher: s.sourcePublisher,
                lastCheckedDate: s.lastCheckedDate,
                verificationStatus: s.verificationStatus,
                category: s.category,
                plainSummary: s.plainSummary,
              }))
            );
            controller.enqueue(encoder.encode(`\n\n__NYAYLINK_SOURCES__:${serializedSources}`));
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
            `[AI Intake] Request completed: model=${selectedModel}, TTFT=${timeToFirstToken ?? "none"}ms, total=${totalDuration}ms, sources=${activeSources.length}, finish=${finishReason || "natural"}`
          );

          controller.close();
        } catch (streamErr) {
          console.error("[AI Intake] Stream reading error:", streamErr);
          controller.error(streamErr);
        }
      },
      cancel() {
        groqReader.cancel().catch(() => {});
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "Transfer-Encoding": "chunked",
        "X-Content-Type-Options": "nosniff",
        "X-RateLimit-Remaining": `${remaining}`,
        "X-NyayLink-Grounded": activeSources.length > 0 ? "true" : "false",
        "X-NyayLink-Sources-Count": String(activeSources.length),
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
