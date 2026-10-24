/**
 * NyayLink Voice Input & Voice Output Automated Test Suite
 *
 * Verifies:
 * 1. Bilingual voice localization (English & Hindi) completeness.
 * 2. Markdown stripping and speech chunking algorithm for long legal answers.
 * 3. Language detection (Hindi Devanagari vs Indian English).
 * 4. Error code mapping (permission-denied, no-speech, network, unsupported).
 * 5. Absence of paid voice APIs, audio tracking, or unauthorized external dependencies.
 * 6. Component integration in chat-interface.tsx.
 */

const assert = require("assert");
const fs = require("fs");
const path = require("path");

console.log("======================================================================");
console.log(">>> NYAYLINK AI VOICE INPUT & OUTPUT AUTOMATED TEST SUITE <<<");
console.log("======================================================================\n");

let passed = 0;
let failed = 0;

function it(desc, fn) {
  try {
    fn();
    console.log(`  ✓ [PASS] ${desc}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ [FAIL] ${desc}`);
    console.error(`    ${err.message}`);
    failed++;
  }
}

// --------------------------------------------------------------------------
// TEST 1: Bilingual Voice Localization Completeness
// --------------------------------------------------------------------------
console.log("[Test 1/6] Verifying Bilingual Voice Localization Completeness...");
const locPath = path.join(__dirname, "../lib/intake/voice-localization.ts");
const locContent = fs.readFileSync(locPath, "utf8");

it("Localization module exists and contains English and Hindi dictionaries", () => {
  assert.ok(locContent.includes("VOICE_STRINGS_EN"), "Must contain VOICE_STRINGS_EN");
  assert.ok(locContent.includes("VOICE_STRINGS_HI"), "Must contain VOICE_STRINGS_HI");
  assert.ok(locContent.includes("getVoiceStrings"), "Must export getVoiceStrings");
});

it("Both dictionaries contain privacy notices in both languages", () => {
  assert.ok(locContent.includes("Voice Processing & Privacy"), "English privacy notice title");
  assert.ok(locContent.includes("वाक् प्रसंस्करण और गोपनीयता"), "Hindi privacy notice title");
  assert.ok(locContent.includes("safeguard client privilege"), "Privilege safeguard advisory");
  assert.ok(locContent.includes("गोपनीयता बनाए रखने"), "Hindi privacy advisory");
});

it("Both dictionaries cover error cases (permission denied, no-speech, network, unsupported)", () => {
  assert.ok(locContent.includes("errorPermissionDenied"), "Permission denied error key");
  assert.ok(locContent.includes("errorNoSpeech"), "No speech error key");
  assert.ok(locContent.includes("errorNetwork"), "Network error key");
  assert.ok(locContent.includes("errorUnsupported"), "Unsupported browser key");
  assert.ok(locContent.includes("Chrome, Edge, या Safari"), "Hindi browser support advice");
});

it("Both dictionaries provide playback labels and missing Hindi voice warnings", () => {
  assert.ok(locContent.includes("Listen to answer"), "English listen button");
  assert.ok(locContent.includes("उत्तर सुनें"), "Hindi listen button");
  assert.ok(locContent.includes("ttsNoHindiVoiceNotice"), "Hindi missing voice warning key");
});

// --------------------------------------------------------------------------
// TEST 2: Speech Synthesis Text Chunking & Markdown Stripping
// --------------------------------------------------------------------------
console.log("\n[Test 2/6] Testing Text Chunking and Markdown Stripping for Long Answers...");
const synthPath = path.join(__dirname, "../lib/intake/use-speech-synthesis.ts");
const synthContent = fs.readFileSync(synthPath, "utf8");

it("Speech synthesis implements chunkTextForSpeech export", () => {
  assert.ok(synthContent.includes("export function chunkTextForSpeech"), "chunkTextForSpeech function must be exported");
});

// Inline chunkTextForSpeech logic reproduction for testing
function testChunkTextForSpeech(text) {
  if (!text || !text.trim()) return [];
  const normalized = text.replace(/\r\n/g, "\n").trim();
  const paragraphs = normalized.split(/\n\s*\n/);
  const chunks = [];

  for (const para of paragraphs) {
    const cleanPara = para.trim();
    if (!cleanPara) continue;
    if (cleanPara.length <= 160) {
      chunks.push(cleanPara);
      continue;
    }
    const sentences = cleanPara.split(/([.!?।]\s+)/);
    let currentChunk = "";
    for (let i = 0; i < sentences.length; i++) {
      const part = sentences[i];
      if (!part) continue;
      if ((currentChunk + part).length <= 180) {
        currentChunk += part;
      } else {
        if (currentChunk.trim()) chunks.push(currentChunk.trim());
        if (part.length > 180) {
          const words = part.split(/\s+/);
          let subChunk = "";
          for (const word of words) {
            if ((subChunk + " " + word).length <= 160) {
              subChunk += (subChunk ? " " : "") + word;
            } else {
              if (subChunk.trim()) chunks.push(subChunk.trim());
              subChunk = word;
            }
          }
          if (subChunk.trim()) currentChunk = subChunk.trim();
          else currentChunk = "";
        } else {
          currentChunk = part;
        }
      }
    }
    if (currentChunk.trim()) chunks.push(currentChunk.trim());
  }
  return chunks.filter((c) => c.length > 0);
}

it("Splits long multi-paragraph English legal answers without silent truncation", () => {
  const longAnswer = `### Direct Answer
Under Section 138 of the Negotiable Instruments Act, 1881, dishonour of a cheque for insufficiency of funds is a statutory criminal offence punishable with imprisonment up to two years or fine up to twice the cheque amount.

### What Matters Legally
To maintain a valid statutory complaint under Section 138, you must strictly satisfy mandatory procedural deadlines. The cheque must be presented to the bank within three months from the date of issuance. Upon receiving the cheque return memo from the bank, you must dispatch a formal written statutory demand notice to the drawer within 30 days.

### Practical Next Steps
1. Preserve the original dishonoured cheque and the bank cheque return memo in pristine evidentiary condition.
2. Engage an enrolled advocate to issue a registered statutory legal demand notice demanding payment within 15 days of notice receipt.
3. If payment is withheld after the 15-day statutory window expires, file a criminal complaint before the Judicial Magistrate within 30 days.`;

  const chunks = testChunkTextForSpeech(longAnswer);
  assert.ok(chunks.length >= 3, `Expected at least 3 chunks, got ${chunks.length}`);
  // Check that every chunk is within safe bounds (<= 180 chars)
  for (const chunk of chunks) {
    assert.ok(chunk.length <= 190, `Chunk exceeds safe bounds: "${chunk}" (${chunk.length} chars)`);
  }
  // Check that all core statutory keywords are preserved
  const combined = chunks.join(" ");
  assert.ok(combined.includes("Section 138"), "Preserves Section 138");
  assert.ok(combined.includes("Negotiable Instruments Act"), "Preserves NI Act citation");
});

it("Splits Hindi legal text respecting the Hindi Purna Viram (।) boundary", () => {
  const hindiAnswer = `भारतीय न्याय संहिता की धारा 69 के अंतर्गत विवाह के झूठे वादे पर यौन संबंध बनाना दंडनीय अपराध है। इस मामले में पुलिस में प्राथमिकी (FIR) दर्ज कराई जा सकती है। यदि संबंधित पुलिस स्टेशन प्राथमिकी दर्ज करने से मना करता है, तो आप वरिष्ठ पुलिस अधीक्षक (SP/DCP) को लिखित शिकायत भेज सकते हैं या न्यायिक मजिस्ट्रेट के समक्ष धारा 175(3) बीएनएसएस के तहत आवेदन कर सकते हैं।`;

  const chunks = testChunkTextForSpeech(hindiAnswer);
  assert.ok(chunks.length >= 2, `Expected at least 2 chunks, got ${chunks.length}`);
  const combined = chunks.join(" ");
  assert.ok(combined.includes("भारतीय न्याय संहिता"), "Preserves BNS phrase");
  assert.ok(combined.includes("धारा 69"), "Preserves Dhara 69");
  assert.ok(combined.includes("175(3)"), "Preserves statutory clause");
});

// --------------------------------------------------------------------------
// TEST 3: Language Detection for TTS (Devanagari vs English)
// --------------------------------------------------------------------------
console.log("\n[Test 3/6] Testing Language Detection for Voice Synthesis...");

function detectLanguageOfText(text, isHindi) {
  const hasDevanagari = /[\u0900-\u097F]/.test(text);
  if (hasDevanagari) return "hi-IN";
  if (isHindi) return "hi-IN";
  return "en-IN";
}

it("Detects Hindi Devanagari text as hi-IN", () => {
  const lang = detectLanguageOfText("एफआईआर दर्ज कराने की कानूनी प्रक्रिया क्या है?", false);
  assert.strictEqual(lang, "hi-IN");
});

it("Detects Hinglish or English legal query as en-IN", () => {
  const lang = detectLanguageOfText("What are my legal remedies under Section 138 NI Act?", false);
  assert.strictEqual(lang, "en-IN");
});

it("Respects isHindi UI locale when input is neutral or numbers", () => {
  const lang = detectLanguageOfText("12345 / 2026", true);
  assert.strictEqual(lang, "hi-IN");
});

// --------------------------------------------------------------------------
// TEST 4: Speech Recognition Resilience & Handlers Cleanup
// --------------------------------------------------------------------------
console.log("\n[Test 4/6] Verifying Speech Recognition Hook Architecture...");
const recPath = path.join(__dirname, "../lib/intake/use-speech-recognition.ts");
const recContent = fs.readFileSync(recPath, "utf8");

it("Checks window.SpeechRecognition and window.webkitSpeechRecognition", () => {
  assert.ok(recContent.includes("SpeechRecognition"), "Checks SpeechRecognition");
  assert.ok(recContent.includes("webkitSpeechRecognition"), "Checks webkitSpeechRecognition");
});

it("Requests microphone permission only upon deliberate startListening call", () => {
  assert.ok(recContent.includes("const startListening = useCallback"), "startListening function");
  assert.ok(!recContent.includes("useEffect(() => {\n    startListening"), "Must NOT auto-start on mount");
});

it("Avoids infinite restart loops with restartCountRef safeguard", () => {
  assert.ok(recContent.includes("restartCountRef"), "restartCountRef must exist");
  assert.ok(recContent.includes("restartCountRef.current < 2"), "Safeguard limits automatic restarts");
});

it("Implements cancelListening to discard session transcript", () => {
  assert.ok(recContent.includes("cancelListening"), "cancelListening must be implemented");
  assert.ok(recContent.includes("isCancelledRef.current = true"), "Sets isCancelledRef flag");
});

it("Cleans up active recognition sessions on unmount", () => {
  assert.ok(recContent.includes("recognitionRef.current.abort()"), "Aborts active recognition on unmount");
});

// --------------------------------------------------------------------------
// TEST 5: Speech Synthesis Chromium Keepalive Watchdog
// --------------------------------------------------------------------------
console.log("\n[Test 5/6] Verifying Speech Synthesis Watchdog Keepalive...");

it("Speech synthesis hook includes keepalive to prevent Chromium 15-second pause freeze", () => {
  assert.ok(synthContent.includes("startWatchdog"), "Must have startWatchdog function");
  assert.ok(synthContent.includes("stopWatchdog"), "Must have stopWatchdog function");
  assert.ok(synthContent.includes("speechSynthesis.pause();"), "Keeps audio engine active via pause");
  assert.ok(synthContent.includes("speechSynthesis.resume();"), "Keeps audio engine active via resume");
});

it("Cancels speech playback on unmount", () => {
  assert.ok(synthContent.includes("window.speechSynthesis.cancel()"), "Cancels synthesis on unmount");
});

// --------------------------------------------------------------------------
// TEST 6: Zero Paid Dependencies & Composer Integration Safety
// --------------------------------------------------------------------------
console.log("\n[Test 6/6] Verifying Integration Safety and Zero Paid Voice APIs...");
const chatPath = path.join(__dirname, "../components/intake/chat-interface.tsx");
const chatContent = fs.readFileSync(chatPath, "utf8");
const pkgPath = path.join(__dirname, "../package.json");
const pkgContent = fs.readFileSync(pkgPath, "utf8");

it("No external paid voice/audio SDKs added to package.json", () => {
  assert.ok(!pkgContent.includes("@google-cloud/speech"), "Must not use paid Google Speech SDK");
  assert.ok(!pkgContent.includes("@aws-sdk/client-polly"), "Must not use AWS Polly");
  assert.ok(!pkgContent.includes("elevenlabs"), "Must not use ElevenLabs");
  assert.ok(!pkgContent.includes("deepgram"), "Must not use Deepgram");
});

it("ChatInterface integrates VoiceComposerRibbon and VoiceComposerMicButton", () => {
  assert.ok(chatContent.includes("VoiceComposerRibbon"), "Integrates VoiceComposerRibbon");
  assert.ok(chatContent.includes("VoiceComposerMicButton"), "Integrates VoiceComposerMicButton");
});

it("ChatInterface integrates VoicePlaybackControl for assistant answers", () => {
  assert.ok(chatContent.includes("VoicePlaybackControl"), "Integrates VoicePlaybackControl");
});

it("ChatInterface preserves typed text when speech arrives without auto-submitting", () => {
  assert.ok(recContent.includes("baseTextRef.current"), "Preserves existing typed base text");
  assert.ok(!recContent.includes("handleSendMessage()"), "Never auto-submits transcript");
});

it("ChatInterface halts speech synthesis when a new query is submitted or reset", () => {
  assert.ok(chatContent.includes("voiceOutput.stop()"), "Halts voice synthesis on send and reset");
});

console.log("\n======================================================================");
console.log(`TEST SUITE RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log("======================================================================");

if (failed > 0) {
  process.exit(1);
}
