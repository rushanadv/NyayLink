const fs = require("fs");
const path = require("path");

// Read .env.local
const envPath = path.join(__dirname, "../.env.local");
const envVars = {};
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, "utf8");
  envFile.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx !== -1) {
      envVars[trimmed.slice(0, eqIdx).trim()] = trimmed.slice(eqIdx + 1).trim();
    }
  });
}

const GROQ_API_KEY = envVars.GROQ_API_KEY;
const GROQ_MODEL = envVars.GROQ_MODEL || "openai/gpt-oss-120b";

console.log("======================================================================");
console.log(">>> NYAYLINK AI INTAKE & GROQ BACKEND AUTOMATED TEST SUITE <<<");
console.log("======================================================================");

async function runTests() {
  let passed = 0;
  let failed = 0;

  function assert(cond, desc, details) {
    if (cond) {
      passed++;
      console.log(`  ✓ [PASS] ${desc}`);
    } else {
      failed++;
      console.error(`  ❌ [FAIL] ${desc} — ${details || "Assertion failed"}`);
    }
  }

  // 1. Direct Groq Provider Connection Test
  console.log("\n[Test 1/6] Testing direct Groq API connectivity and target model...");
  if (!GROQ_API_KEY) {
    console.error("  ❌ [FAIL] GROQ_API_KEY is not defined in .env.local");
    failed++;
  } else {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [{ role: "user", content: "Reply with the word 'VERIFIED' only." }],
          max_tokens: 150,
          temperature: 0.1,
          reasoning_format: "hidden",
        }),
      });

      assert(res.ok, "Groq API returned HTTP 200 OK", `Status: ${res.status}`);
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content || "";
      assert(content.length > 0, "Model generated completion text", `Received: "${content}"`);
      assert(data.model === GROQ_MODEL, `Target model verified (${GROQ_MODEL})`, `Returned model: ${data.model}`);
    } catch (err) {
      assert(false, "Groq connection succeeded", err.message);
    }
  }

  // 2. Direct Groq Streaming & Incremental SSE Chunk Parsing Test
  console.log("\n[Test 2/6] Testing Groq SSE streaming with delta.content extraction...");
  if (GROQ_API_KEY) {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [
            {
              role: "user",
              content: "Briefly explain Section 138 of the Negotiable Instruments Act in 2 sentences.",
            },
          ],
          max_tokens: 250,
          temperature: 0.2,
          stream: true,
          reasoning_format: "hidden",
        }),
      });

      assert(res.ok, "Groq streaming response initiated HTTP 200", `Status: ${res.status}`);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let receivedTokens = 0;
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("data: ") && trimmed !== "data: [DONE]") {
            try {
              const json = JSON.parse(trimmed.slice(6));
              const deltaContent = json.choices?.[0]?.delta?.content;
              if (deltaContent) {
                receivedTokens++;
                fullText += deltaContent;
              }
            } catch {}
          }
        }
      }

      assert(receivedTokens > 5, "Received incremental stream tokens", `Token chunks: ${receivedTokens}`);
      assert(fullText.toLowerCase().includes("cheque") || fullText.toLowerCase().includes("dishonour") || fullText.toLowerCase().includes("negotiable"), "Generated accurate legal content", `Snippet: ${fullText.slice(0, 100)}...`);
    } catch (err) {
      assert(false, "Groq SSE streaming test succeeded", err.message);
    }
  }

  // 3. Verify No OpenRouter Dependencies or Secrets
  console.log("\n[Test 3/6] Verifying total removal of OpenRouter references from production code...");
  const filesToCheck = [
    "app/api/intake/chat/route.ts",
    "components/intake/chat-interface.tsx",
    ".env.example",
    "README.md",
  ];

  let hasOpenRouter = false;
  for (const rel of filesToCheck) {
    const full = path.join(__dirname, "..", rel);
    if (fs.existsSync(full)) {
      const content = fs.readFileSync(full, "utf8");
      if (content.toLowerCase().includes("openrouter")) {
        hasOpenRouter = true;
        console.error(`  ❌ [FAIL] ${rel} still contains OpenRouter reference!`);
      }
    }
  }
  assert(!hasOpenRouter, "Zero OpenRouter references in production intake files");

  // 4. Verify Secret Isolation: Key Never Exposed in Code or Responses
  console.log("\n[Test 4/6] Verifying secret key isolation (GROQ_API_KEY server-only)...");
  const clientFiles = [
    "components/intake/chat-interface.tsx",
    "components/intake/perimeter-glow.tsx",
    "components/intake/formatted-markdown.tsx",
    "app/intake/page.tsx",
    "app/intake/layout.tsx",
  ];

  let leakedInClient = false;
  for (const rel of clientFiles) {
    const full = path.join(__dirname, "..", rel);
    if (fs.existsSync(full)) {
      const content = fs.readFileSync(full, "utf8");
      if (content.includes("GROQ_API_KEY") || (GROQ_API_KEY && content.includes(GROQ_API_KEY))) {
        leakedInClient = true;
        console.error(`  ❌ [FAIL] ${rel} exposes GROQ_API_KEY in client component!`);
      }
    }
  }
  assert(!leakedInClient, "GROQ_API_KEY is strictly isolated to server-side code");

  // 5. Verify Fallback Model Availability
  console.log("\n[Test 5/6] Verifying Groq fallback model availability...");
  const FALLBACK_MODEL = envVars.GROQ_FALLBACK_MODEL || "openai/gpt-oss-20b";
  if (GROQ_API_KEY) {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: FALLBACK_MODEL,
          messages: [{ role: "user", content: "Say OK" }],
          max_tokens: 50,
          temperature: 0.1,
          reasoning_format: "hidden",
        }),
      });

      assert(res.ok, `Fallback model (${FALLBACK_MODEL}) is functional on Groq`, `Status: ${res.status}`);
    } catch (err) {
      assert(false, "Fallback model check succeeded", err.message);
    }
  }

  // 6. Verify System Prompt Integrity & Legal Boundaries
  console.log("\n[Test 6/6] Verifying system prompt boundaries under Indian jurisprudence...");
  const { buildSystemPrompt } = require("../lib/intake/system-prompt.ts");
  const prompt = buildSystemPrompt({ state: "Maharashtra" });
  assert(prompt.includes("Bharatiya Nyaya Sanhita"), "Prompt references BNS statutory framework");
  assert(prompt.includes("NOT an advocate"), "Enforces strict identity boundary (not an advocate)");
  assert(prompt.includes("ZERO HALLUCINATION OF STATUTES"), "Strictly prohibits hallucinating sections or limitation dates");
  assert(prompt.includes("Maharashtra"), "Injects state jurisdictional context dynamically");

  console.log("\n======================================================================");
  console.log(`>>> SUITE COMPLETE: ${passed} PASSED, ${failed} FAILED <<<`);
  console.log("======================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
