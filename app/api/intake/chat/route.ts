import { NextRequest, NextResponse } from "next/server";
import { buildSystemPrompt } from "@/lib/intake/system-prompt";

// Models
const PRIMARY_MODEL = "nvidia/nemotron-3.5-super-vl:free";
const FALLBACK_MODEL = "minimax/minimax-m3:free";

// In-memory rate limiting: IP -> timestamps array
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_MINUTE = 10;

function checkRateLimit(clientIp: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const timestamps = rateLimitMap.get(clientIp) || [];

  // Filter timestamps within the active window
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (recent.length >= MAX_REQUESTS_PER_MINUTE) {
    rateLimitMap.set(clientIp, recent);
    return { allowed: false, remaining: 0 };
  }

  recent.push(now);
  rateLimitMap.set(clientIp, recent);

  // Periodic pruning to avoid memory growth
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
}

async function requestOpenRouter(
  model: string,
  messages: ChatMessage[],
  apiKey: string
): Promise<Response> {
  return await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": "https://nyayalink.in",
      "X-Title": "NyayaLink Legal Intake Assistant",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 800,
      temperature: 0.35,
      stream: true,
    }),
  });
}

export async function POST(req: NextRequest) {
  try {
    // 1. Identify Client IP & Apply Rate Limiting
    const forwarded = req.headers.get("x-forwarded-for");
    const clientIp = forwarded
      ? forwarded.split(",")[0].trim()
      : req.headers.get("x-real-ip") || "127.0.0.1";

    const { allowed, remaining } = checkRateLimit(clientIp);
    if (!allowed) {
      return NextResponse.json(
        {
          error:
            "Rate limit reached (10 queries per minute). Please wait a moment before asking further questions.",
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

    // 2. Server-side Secret Validation (NEVER exposed to client)
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey || apiKey === "your-openrouter-key-here" || apiKey.trim() === "") {
      return NextResponse.json(
        {
          error:
            "OPENROUTER_API_KEY is not configured on the server. Please set a valid OpenRouter API key in .env.local to enable real AI intake.",
        },
        { status: 503 }
      );
    }

    // 3. Parse and Validate Request Payload
    let body: RequestBody;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    const { messages = [], state, district } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Request must include a non-empty array of messages." },
        { status: 400 }
      );
    }

    // 4. Sanitize messages and prepend Server-Controlled System Prompt
    // Only permit user and assistant messages from the client. Never allow client to inject or override system prompts.
    const sanitizedChatMessages: ChatMessage[] = messages
      .filter(
        (m): m is ChatMessage =>
          Boolean(m) &&
          (m.role === "user" || m.role === "assistant") &&
          typeof m.content === "string" &&
          m.content.trim().length > 0
      )
      .slice(-8) // Keep last 8 turns for safety, token budgeting and speed
      .map((m) => ({
        role: m.role,
        content: m.content.slice(0, 1500), // Protect against prompt-stuffing
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

    // 5. Attempt Primary Model with Fallback Strategy
    let activeResponse: Response | null = null;
    let primaryErrorDetail = "";
    let primaryStatus = 0;

    try {
      const primaryRes = await requestOpenRouter(PRIMARY_MODEL, fullMessages, apiKey);
      if (primaryRes.ok && primaryRes.body) {
        activeResponse = primaryRes;
      } else {
        primaryStatus = primaryRes.status;
        const errText = await primaryRes.text();
        primaryErrorDetail = errText;
        console.warn(
          `[AI Intake] Primary model (${PRIMARY_MODEL}) failed [${primaryStatus}]:`,
          errText.slice(0, 200)
        );
      }
    } catch (err: unknown) {
      primaryErrorDetail = err instanceof Error ? err.message : String(err);
      console.warn(`[AI Intake] Primary model network error:`, primaryErrorDetail);
    }

    // If Primary failed, retry once with Fallback Model
    if (!activeResponse) {
      console.info(`[AI Intake] Retrying with fallback model (${FALLBACK_MODEL})...`);
      try {
        const fallbackRes = await requestOpenRouter(FALLBACK_MODEL, fullMessages, apiKey);
        if (fallbackRes.ok && fallbackRes.body) {
          activeResponse = fallbackRes;
        } else {
          const fallbackStatus = fallbackRes.status;
          const fallbackErrText = await fallbackRes.text();
          console.error(
            `[AI Intake] Fallback model (${FALLBACK_MODEL}) also failed [${fallbackStatus}]:`,
            fallbackErrText.slice(0, 200)
          );

          // Build a clear, diagnostic error message highlighting model slug issues if any 404 occurred
          const is404 = primaryStatus === 404 || fallbackStatus === 404;
          const errorMsg = is404
            ? `OpenRouter returned 404 for one or more model IDs. The model slug may no longer be available in OpenRouter's free catalog.\nPrimary (${PRIMARY_MODEL}): [${primaryStatus}] ${primaryErrorDetail.slice(0, 160)}\nFallback (${FALLBACK_MODEL}): [${fallbackStatus}] ${fallbackErrText.slice(0, 160)}`
            : `OpenRouter query failed on both models.\nPrimary (${PRIMARY_MODEL}): [${primaryStatus}] ${primaryErrorDetail.slice(0, 160)}\nFallback (${FALLBACK_MODEL}): [${fallbackStatus}] ${fallbackErrText.slice(0, 160)}`;

          return NextResponse.json({ error: errorMsg }, { status: 502 });
        }
      } catch (fallbackErr: unknown) {
        const fallbackMsg =
          fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr);
        return NextResponse.json(
          {
            error: `Both models failed.\nPrimary (${PRIMARY_MODEL}): ${primaryErrorDetail}\nFallback (${FALLBACK_MODEL}): ${fallbackMsg}`,
          },
          { status: 502 }
        );
      }
    }

    // 6. Stream SSE Tokens to Client via ReadableStream
    // We decode OpenRouter's SSE chunks server-side and stream text tokens directly.
    const openRouterReader = activeResponse.body!.getReader();
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        let buffer = "";

        try {
          while (true) {
            const { done, value } = await openRouterReader.read();
            if (done) {
              controller.close();
              break;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || trimmed.startsWith(":")) continue;

              if (trimmed === "data: [DONE]") {
                controller.close();
                return;
              }

              if (trimmed.startsWith("data: ")) {
                try {
                  const json = JSON.parse(trimmed.slice(6));
                  const delta = json.choices?.[0]?.delta?.content;
                  if (delta) {
                    controller.enqueue(encoder.encode(delta));
                  }
                } catch {
                  // Ignore JSON parse errors for fragmented or malformed lines
                }
              }
            }
          }
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
