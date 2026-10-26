"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Sparkles,
  MapPin,
  Shield,
  ShieldCheck,
  Users,
  Home,
  Briefcase,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import { MagneticWrapper } from "@/components/ui/magnetic-wrapper";
import { PerimeterGlowContainer } from "@/components/intake/perimeter-glow";
import { useLanguage } from "@/lib/i18n/context";
import { useSpeechRecognition } from "@/lib/intake/use-speech-recognition";
import { useSpeechSynthesis } from "@/lib/intake/use-speech-synthesis";
import {
  VoiceComposerRibbon,
  VoiceComposerMicButton,
} from "@/components/intake/voice-composer-mic";
import { VoicePlaybackControl } from "@/components/intake/voice-playback-control";
import { AIThinkingOrbAndInput } from "@/components/ui/ai-thinking-orb-and-input";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
  isTruncated?: boolean;
  isInterrupted?: boolean;
  feedback?: "helpful" | "unhelpful" | null;
}

const INDIAN_STATES = [
  "All India (General)",
  "Delhi (NCT)",
  "Maharashtra",
  "Karnataka",
  "Tamil Nadu",
  "Uttar Pradesh",
  "West Bengal",
  "Telangana",
  "Gujarat",
  "Kerala",
  "Rajasthan",
  "Punjab & Haryana",
  "Madhya Pradesh",
  "Bihar",
  "Odisha",
  "Andhra Pradesh",
];

// Curated suggested inquiries covering core Indian legal domains
const SUGGESTED_INQUIRIES = [
  {
    category: "Police & Criminal",
    icon: Shield,
    title: "FIR & Police Cognizance",
    prompt:
      "What are my legal rights and recourse if a police station refuses to register an FIR for a cognizable offence under the BNSS?",
  },
  {
    category: "Family & Matrimonial",
    icon: Users,
    title: "Mutual Consent & Maintenance",
    prompt:
      "What is the procedure, statutory waiting period, and documentation required for mutual consent divorce and interim maintenance under Indian law?",
  },
  {
    category: "Property & Tenancy",
    icon: Home,
    title: "Security Deposit & Eviction",
    prompt:
      "My landlord withheld my security deposit for 4 months without justification. What are my legal remedies under the Tenancy Act and Consumer Forum?",
  },
  {
    category: "Consumer & Workplace",
    icon: Briefcase,
    title: "Withheld Salary & Notice",
    prompt:
      "My employer withheld my full and final settlement and salary without written explanation. How do I proceed under Indian labour and contract laws?",
  },
];

export function ChatInterface() {
  const { isHindi } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [selectedState, setSelectedState] = useState("All India (General)");
  const [isLoading, setIsLoading] = useState(false);
  const [liveStreamText, setLiveStreamText] = useState("");
  const [apiError, setApiError] = useState<string | null>(null);
  const [failedPrompt, setFailedPrompt] = useState<string | null>(null);
  const [showFullDisclaimer, setShowFullDisclaimer] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Browser-native Voice Speech Recognition (Speech-to-Text)
  const voiceInput = useSpeechRecognition({
    isHindi,
    onTranscriptUpdate: (newCombinedText) => {
      setInput(newCombinedText);
    },
    onSessionComplete: () => {},
  });

  // Browser-native Voice Speech Synthesis (Text-to-Speech)
  const voiceOutput = useSpeechSynthesis({ isHindi });

  // Keep reference to voiceOutput.stop for unmount cleanup without re-triggering effect
  const stopVoiceOutputRef = useRef(voiceOutput.stop);
  stopVoiceOutputRef.current = voiceOutput.stop;

  // Stop Generation Handler
  const handleStopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    stopVoiceOutputRef.current();
    setIsLoading(false);
    setMessages((prev) =>
      prev.map((msg) =>
        msg.isStreaming ? { ...msg, isStreaming: false, isInterrupted: true } : msg
      )
    );
  }, []);

  // Clean up on unmount ONLY
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      stopVoiceOutputRef.current();
    };
  }, []);

  // Reset Conversation
  const handleReset = useCallback(() => {
    if (isLoading) handleStopGeneration();
    voiceOutput.stop();
    voiceInput.cancelListening();
    setMessages([]);
    setInput("");
    setLiveStreamText("");
    setApiError(null);
    setFailedPrompt(null);
  }, [isLoading, handleStopGeneration, voiceOutput, voiceInput]);

  // --------------------------------------------------------------------------
  // Core AI Stream Consumer
  // --------------------------------------------------------------------------
  const executeInquiry = async (
    queryText: string,
    existingHistory: ChatMessage[]
  ): Promise<string> => {
    const trimmed = queryText.trim();
    if (!trimmed) {
      throw new Error("Query text cannot be empty.");
    }

    if (voiceInput.isListening) {
      voiceInput.finishListening();
    }
    voiceOutput.stop();

    setIsLoading(true);
    setApiError(null);
    setLiveStreamText("");
    setFailedPrompt(trimmed);

    const userMsgId = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      role: "user",
      content: trimmed,
    };

    const newHistory = [...existingHistory, userMsg];
    setMessages(newHistory);
    setInput("");

    const assistantMsgId = `assistant-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      {
        id: assistantMsgId,
        role: "assistant",
        content: "",
        isStreaming: true,
      },
    ]);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const apiMessages = newHistory
        .filter((m) => m.content.trim().length > 0)
        .map((m) => ({ role: m.role, content: m.content }));

      const response = await fetch("/api/intake/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          state: selectedState !== "All India (General)" ? selectedState : undefined,
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        let errMessage = "Server encountered an issue connecting to the legal intake assistant.";
        try {
          const errData = await response.json();
          if (errData?.error) errMessage = errData.error;
        } catch {}
        throw new Error(errMessage);
      }

      if (!response.body) {
        throw new Error("No response stream received from intake service.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;

        const liveClean = accumulated
          .replace(/__NYAY(A)?LINK_DONE__/g, "")
          .replace(/__NYAY(A)?LINK_TRUNCATED__/g, "")
          .replace(/__NYAY(A)?LINK_FILTERED__/g, "")
          .replace(/__NYAY(A)?LINK_ERROR__:.*/g, "");

        setLiveStreamText(liveClean);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId ? { ...msg, content: liveClean } : msg
          )
        );
      }

      const isTruncated = accumulated.includes("__NYAYLINK_TRUNCATED__");
      const isFiltered = accumulated.includes("__NYAYLINK_FILTERED__");
      const isDone = accumulated.includes("__NYAYLINK_DONE__");
      const hasErrorChunk = accumulated.includes("__NYAYLINK_ERROR__:");

      const cleanFinal = accumulated
        .replace(/__NYAY(A)?LINK_DONE__/g, "")
        .replace(/__NYAY(A)?LINK_TRUNCATED__/g, "")
        .replace(/__NYAY(A)?LINK_FILTERED__/g, "")
        .replace(/__NYAY(A)?LINK_ERROR__:.*/g, "")
        .trim();

      if (hasErrorChunk) {
        const errMatch = accumulated.match(/__NYAYLINK_ERROR__:\s*([^\n]+)/);
        const errMsg = errMatch ? errMatch[1] : "Stream terminated with an upstream service notice.";
        setApiError(errMsg);
        throw new Error(errMsg);
      }

      if (!cleanFinal) {
        throw new Error("The legal assistant returned an empty response. Please retry.");
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? {
                ...msg,
                content: cleanFinal,
                isStreaming: false,
                isTruncated,
                isInterrupted: !isDone && !isTruncated && !isFiltered,
              }
            : msg
        )
      );

      setFailedPrompt(null);
      return cleanFinal;
    } catch (err: unknown) {
      if (abortController.signal.aborted) {
        return "";
      }
      const msg = err instanceof Error ? err.message : "Failed to connect to NyayLink legal intake.";
      setApiError(msg);

      // Preserve previously received partial text if any
      setMessages((prev) => {
        const existing = prev.find((m) => m.id === assistantMsgId);
        if (existing && existing.content.trim().length > 0) {
          return prev.map((m) =>
            m.id === assistantMsgId
              ? { ...m, isStreaming: false, isInterrupted: true }
              : m
          );
        }
        return prev.filter((m) => m.id !== assistantMsgId);
      });

      throw err;
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleSubmit = async (queryText: string): Promise<string> => {
    return executeInquiry(queryText, messages);
  };

  const handleFollowUpSubmit = async (followUpText: string): Promise<string> => {
    return executeInquiry(followUpText, messages);
  };

  const handleRetry = () => {
    if (failedPrompt) {
      executeInquiry(failedPrompt, messages);
    }
  };

  const hasCompletedExchange =
    messages.filter((m) => m.role === "assistant" && m.content.length > 20).length >= 1;

  return (
    <PerimeterGlowContainer
      isActive={isLoading}
      className="w-full max-w-4xl mx-auto min-h-[580px] flex flex-col shadow-xl bg-white rounded-2xl overflow-hidden border border-[#D5E5D9]"
    >
      {/* Top Header: Identity, Jurisdiction, and Trust Status */}
      <div className="shrink-0 px-4 sm:px-6 py-3 border-b border-[#D5E5D9] bg-white flex flex-wrap items-center justify-between gap-3 text-xs select-none">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#EAF3ED] border border-[#D5E5D9] flex items-center justify-center text-[#205C43]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-[#202824] font-semibold text-xs sm:text-sm flex items-center gap-1.5">
              <span>{isHindi ? "न्यायलिंक एआई पूर्व-परामर्श" : "NyayLink AI Preconsultation"}</span>
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isLoading ? "bg-amber-500 animate-ping" : "bg-[#205C43]"
                }`}
              />
            </h2>
            <p className="text-[10.5px] text-[#69736D] font-mono">
              BNS &amp; Indian Jurisprudence Grounded
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Jurisdiction State Selector */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F8FAF9] hover:bg-[#EAF3ED]/60 border border-[#D5E5D9] text-[11px] text-[#69736D] shadow-2xs transition-colors">
            <MapPin className="w-3.5 h-3.5 text-[#205C43] shrink-0" />
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="bg-transparent text-[#202824] outline-none cursor-pointer text-xs font-medium"
              aria-label="Jurisdiction State"
            >
              {INDIAN_STATES.map((s) => (
                <option key={s} value={s} className="bg-white text-[#202824]">
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* New Query / Reset Action */}
          {messages.length > 0 && (
            <button
              type="button"
              onClick={handleReset}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#EAF3ED] border border-[#D5E5D9] text-[#205C43] text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
              title="Start a new legal inquiry"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {isHindi ? "नया प्रश्न" : "New Question"}
              </span>
            </button>
          )}

          {/* Connect with Advocate CTA Button (appears after completion) */}
          {hasCompletedExchange && (
            <MagneticWrapper maxDisplacement={5}>
              <Link
                href="/lawyers"
                className="px-3.5 py-1 rounded-lg bg-[#205C43] hover:bg-[#174530] text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <span>{isHindi ? "वकील खोजें" : "Find Advocates"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </MagneticWrapper>
          )}
        </div>
      </div>

      {/* AI Preconsultation Legal Disclaimer & Transparency Banner */}
      <div className="shrink-0 px-4 sm:px-6 py-2 bg-[#FFFDF7] border-b border-[#E8DCC0] text-[11px] text-[#7A5E1A]">
        <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
            <span className="font-medium">
              {isHindi
                ? "सूचनात्मक पूर्व-परामर्श: एआई उत्तर केवल सामान्य कानूनी समझ के लिए हैं, किसी वकील की कानूनी सलाह का विकल्प नहीं।"
                : "Informational Preconsultation: AI responses are automated informational guidance, not formal legal advice from an advocate."}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowFullDisclaimer(!showFullDisclaimer)}
            className="text-[10px] font-mono font-semibold text-[#205C43] hover:underline shrink-0 cursor-pointer"
          >
            {showFullDisclaimer
              ? (isHindi ? "संक्षिप्त विवरण" : "Hide Details")
              : (isHindi ? "विधिक प्रकटीकरण देखें" : "View Legal Disclaimer")}
          </button>
        </div>

        {showFullDisclaimer && (
          <div className="mt-2.5 pt-2 border-t border-[#E8DCC0] text-[10.5px] text-[#665220] space-y-1.5 animate-in fade-in duration-200">
            <p>
              {isHindi
                ? "• यह सहायक किसी नामांकित अधिवक्ता के परामर्श का स्थान नहीं ले सकता। वैधानिक प्रक्रियाओं और समय-सीमाओं का स्वतंत्र सत्यापन आवश्यक है।"
                : "• AI-generated responses are informational assistance, not a substitute for advice from a qualified advocate admitted under the Advocates Act, 1961."}
            </p>
            <p>
              {isHindi
                ? "• उत्तर अपूर्ण या पुराने हो सकते हैं। महत्वपूर्ण धाराओं, समय-सीमाओं और अदालती आवश्यकताओं का स्वतंत्र सत्यापन करें।"
                : "• Responses can be incomplete or inaccurate. Independently verify important statutes, limitation periods, and procedural deadlines."}
            </p>
            <p>
              {isHindi
                ? "• अत्यधिक गोपनीय व्यक्तिगत विवरण या संवेदनशील वित्तीय जानकारी चैट में साझा न करें।"
                : "• Avoid sharing sensitive personal identifiers or private secrets you are not comfortable sending to cloud AI providers."}
            </p>
            <p>
              {isHindi
                ? "• आप स्वयं तय करते हैं कि इस पूर्व-परामर्श सारांश को किसी वकील के साथ साझा करना है या नहीं।"
                : "• You maintain complete control over whether to export or share your preconsultation summary with an advocate."}
            </p>
          </div>
        )}
      </div>

      {/* Main Interactive AI Thinking Orb & Morphing Input Experience */}
      <div className="flex-1 p-4 sm:p-8 flex flex-col justify-center items-center">
        <AIThinkingOrbAndInput
          onSubmit={handleSubmit}
          onFollowUpSubmit={handleFollowUpSubmit}
          onStop={handleStopGeneration}
          onReset={handleReset}
          isStreaming={isLoading}
          currentStreamText={liveStreamText}
          error={apiError}
          onRetry={handleRetry}
          isHindi={isHindi}
          value={input}
          onChangeText={setInput}
          jurisdictionLabel={selectedState}
          suggestedInquiries={SUGGESTED_INQUIRIES}
          conversationHistory={messages}
          voiceMicSlot={
            <VoiceComposerMicButton
              isHindi={isHindi}
              isSupported={voiceInput.isSupported}
              status={voiceInput.status}
              disabled={isLoading}
              onStart={() => voiceInput.startListening(input)}
              onFinish={voiceInput.finishListening}
            />
          }
          voiceRibbonSlot={
            <VoiceComposerRibbon
              isHindi={isHindi}
              status={voiceInput.status}
              error={voiceInput.error}
              speechLanguage={voiceInput.speechLanguage}
              recordingDuration={voiceInput.recordingDuration}
              interimPreview={voiceInput.interimPreview}
              showPrivacyNotice={voiceInput.showPrivacyNotice}
              onFinish={voiceInput.finishListening}
              onCancel={voiceInput.cancelListening}
              onToggleLanguage={voiceInput.setLanguageOverride}
              onClearError={voiceInput.clearError}
              onDismissPrivacy={voiceInput.dismissPrivacyNotice}
            />
          }
          voicePlaybackSlot={(answerText) => (
            <VoicePlaybackControl
              messageId="assessment-answer"
              content={answerText}
              isHindi={isHindi}
              isSupported={voiceOutput.isSupported}
              playbackState={voiceOutput.playbackState}
              availableVoices={voiceOutput.availableVoices}
              selectedVoiceURI={voiceOutput.selectedVoiceURI}
              onPlay={voiceOutput.play}
              onPause={voiceOutput.pause}
              onResume={voiceOutput.resume}
              onStop={voiceOutput.stop}
              onSelectVoice={voiceOutput.setVoiceURI}
            />
          )}
        />
      </div>

      {/* Persistent Legal Caveat Footer */}
      <div className="shrink-0 p-3 sm:px-6 border-t border-[#D5E5D9] bg-[#F8FAF9] flex items-center justify-between text-[11px] text-[#69736D]">
        <p className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-[#205C43] shrink-0" />
          <span>
            {isHindi
              ? "भारतीय संविधिक कानूनों के अंतर्गत सामान्य सूचनात्मक विश्लेषण; औपचारिक वकालत सलाह नहीं।"
              : "General legal orientation under Indian statutes; not formal legal representation."}
          </span>
        </p>
        <span className="font-mono text-[10px] text-[#205C43] font-semibold hidden md:inline">
          NyayLink AI Triage Engine v2.4
        </span>
      </div>
    </PerimeterGlowContainer>
  );
}
