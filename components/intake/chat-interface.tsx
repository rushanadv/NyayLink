"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Send,
  Scale,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  RotateCcw,
  MapPin,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { MagneticWrapper } from "@/components/ui/magnetic-wrapper";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
  isTruncated?: boolean;
  isInterrupted?: boolean;
}

const INITIAL_INTRO_MESSAGE: ChatMessage = {
  id: "intro-msg",
  role: "assistant",
  content:
    "Welcome to NyayLink's AI Legal Intake. Describe your situation in plain English, Hindi, or any regional language. I'll outline the relevant legal principles under Indian law, standard remedies, and questions to ask counsel.\n\n*Note: I provide general legal orientation, not formal legal advice. No personal records are stored against your identity during this session.*",
};

const SUGGESTED_QUERIES = [
  "My landlord withheld my security deposit for 5 months without explanation.",
  "Builder delayed flat possession by 14 months past RERA agreement date.",
  "A client's cheque for ₹3,40,000 bounced with 'Funds Insufficient'.",
  "Purchased defective machinery, seller is refusing warranty repair.",
];

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

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_INTRO_MESSAGE]);
  const [input, setInput] = useState("");
  const [selectedState, setSelectedState] = useState("All India (General)");
  const [district] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const [failedPrompt, setFailedPrompt] = useState<string | null>(null);
  const [failedUserMessageId, setFailedUserMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Adjust textarea height dynamically
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  };

  const handleSendMessage = async (textToSend?: string, isRetry = false) => {
    if (isLoading) return;

    let text = "";
    let activeUserMessageId = failedUserMessageId;

    if (isRetry) {
      text = failedPrompt?.trim() || "";
      if (!text) return;
    } else {
      text = (textToSend ?? input).trim();
      if (!text) return;
    }

    setApiError(null);

    const assistantPlaceholderId = `assistant-${Date.now()}`;
    const assistantMessage: ChatMessage = {
      id: assistantPlaceholderId,
      role: "assistant",
      content: "",
      isStreaming: true,
    };

    let newHistory: ChatMessage[] = [];

    if (isRetry) {
      // In retry mode, keep the existing user message already in conversation history; do NOT duplicate it
      newHistory = [...messages.filter((m) => m.id !== assistantPlaceholderId)];
      setMessages([...newHistory, assistantMessage]);
    } else {
      // New user inquiry: clear input and add user message
      setInput("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }

      activeUserMessageId = `user-${Date.now()}`;
      const userMessage: ChatMessage = {
        id: activeUserMessageId,
        role: "user",
        content: text,
      };

      newHistory = [...messages, userMessage];
      setMessages([...newHistory, assistantMessage]);
    }

    setIsLoading(true);

    try {
      // Build server payload excluding the initial hardcoded intro message and any empty streaming placeholders
      const apiMessages = newHistory
        .filter((m) => m.id !== "intro-msg" && m.id !== assistantPlaceholderId && m.content.trim().length > 0)
        .map((m) => ({ role: m.role, content: m.content }));

      const response = await fetch("/api/intake/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          state: selectedState !== "All India (General)" ? selectedState : undefined,
          district: district.trim() || undefined,
        }),
      });

      if (!response.ok) {
        let errMessage = "Server encountered an error processing your intake request.";
        try {
          const errData = await response.json();
          if (errData?.error) {
            errMessage = errData.error;
          }
        } catch {
          // Response body was not JSON
        }
        throw new Error(errMessage);
      }

      if (!response.body) {
        throw new Error("No response body received from intake service.");
      }

      // Stream text tokens token-by-token
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;

        // Strip any completion markers from real-time display
        const displayContent = accumulatedText
          .replace(/__NYAY(A)?LINK_DONE__/g, "")
          .replace(/__NYAY(A)?LINK_TRUNCATED__/g, "");

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantPlaceholderId
              ? { ...msg, content: displayContent }
              : msg
          )
        );
      }

      // Detect completion status from markers
      const isTruncated =
        accumulatedText.includes("__NYAYLINK_TRUNCATED__") ||
        accumulatedText.includes("__NYAYALINK_TRUNCATED__");
      const isDone =
        accumulatedText.includes("__NYAYLINK_DONE__") ||
        accumulatedText.includes("__NYAYALINK_DONE__");
      const cleanFinalText = accumulatedText
        .replace(/__NYAY(A)?LINK_DONE__/g, "")
        .replace(/__NYAY(A)?LINK_TRUNCATED__/g, "")
        .trim();

      // If the stream terminated without either marker and produced text, it was an interrupted connection
      const isInterrupted = !isDone && !isTruncated && cleanFinalText.length > 0;

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantPlaceholderId
            ? {
                ...msg,
                content: cleanFinalText,
                isStreaming: false,
                isTruncated,
                isInterrupted,
              }
            : msg
        )
      );

      setFailedPrompt(null);
      setFailedUserMessageId(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to connect to AI intake.";
      setApiError(msg);
      setFailedPrompt(text);
      if (activeUserMessageId) {
        setFailedUserMessageId(activeUserMessageId);
      }

      // Preserve partial text if any content was received before the transport failed
      setMessages((prev) => {
        const existing = prev.find((m) => m.id === assistantPlaceholderId);
        if (existing && existing.content.trim().length > 0) {
          return prev.map((m) =>
            m.id === assistantPlaceholderId
              ? {
                  ...m,
                  content: m.content.replace(/__NYAY(A)?LINK_[A-Z]+__/g, "").trim(),
                  isStreaming: false,
                  isInterrupted: true,
                }
              : m
          );
        }
        // Only remove placeholder if completely empty
        return prev.filter((m) => m.id !== assistantPlaceholderId);
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueAnswer = async (messageId: string) => {
    if (isLoading) return;
    setIsLoading(true);
    setApiError(null);

    // Re-mark target message as streaming and clear prior truncation flag
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? { ...msg, isStreaming: true, isTruncated: false, isInterrupted: false }
          : msg
      )
    );

    try {
      // Build conversation history including the partial assistant message
      const apiMessages = messages
        .filter((m) => m.id !== "intro-msg" && m.content.trim().length > 0)
        .map((m) => ({ role: m.role, content: m.content }));

      const response = await fetch("/api/intake/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          state: selectedState !== "All India (General)" ? selectedState : undefined,
          district: district.trim() || undefined,
          isContinuation: true,
        }),
      });

      if (!response.ok) {
        let errMessage = "Server encountered an error while continuing the response.";
        try {
          const errData = await response.json();
          if (errData?.error) errMessage = errData.error;
        } catch {}
        throw new Error(errMessage);
      }

      if (!response.body) throw new Error("No response body received from intake service.");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let continuationChunk = "";

      const targetMsg = messages.find((m) => m.id === messageId);
      const baseText = targetMsg ? targetMsg.content : "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        continuationChunk += chunk;

        const liveCombined = (baseText + " " + continuationChunk)
          .replace(/__NYAY(A)?LINK_DONE__/g, "")
          .replace(/__NYAY(A)?LINK_TRUNCATED__/g, "");

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId ? { ...msg, content: liveCombined } : msg
          )
        );
      }

      const isTruncated =
        continuationChunk.includes("__NYAYLINK_TRUNCATED__") ||
        continuationChunk.includes("__NYAYALINK_TRUNCATED__");
      const isDone =
        continuationChunk.includes("__NYAYLINK_DONE__") ||
        continuationChunk.includes("__NYAYALINK_DONE__");
      const cleanCombined = (baseText + " " + continuationChunk)
        .replace(/__NYAY(A)?LINK_DONE__/g, "")
        .replace(/__NYAY(A)?LINK_TRUNCATED__/g, "")
        .trim();

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? {
                ...msg,
                content: cleanCombined,
                isStreaming: false,
                isTruncated,
                isInterrupted: !isDone && !isTruncated,
              }
            : msg
        )
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to continue AI response.";
      setApiError(msg);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, isStreaming: false, isInterrupted: true }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetryInterrupted = (messageId: string) => {
    const msgIndex = messages.findIndex((m) => m.id === messageId);
    let promptToRetry = "";
    if (msgIndex > 0 && messages[msgIndex - 1].role === "user") {
      promptToRetry = messages[msgIndex - 1].content;
    } else {
      promptToRetry = failedPrompt || "";
    }

    if (promptToRetry) {
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
      handleSendMessage(promptToRetry, true);
    }
  };

  const handleRestorePrompt = () => {
    if (failedPrompt) {
      setInput(failedPrompt);
      if (failedUserMessageId) {
        setMessages((prev) => prev.filter((m) => m.id !== failedUserMessageId));
      }
      setFailedPrompt(null);
      setFailedUserMessageId(null);
      setApiError(null);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const hasCompletedExchange =
    messages.filter((m) => m.role === "assistant" && m.id !== "intro-msg" && m.content.length > 20)
      .length >= 1;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col min-h-[700px] rounded-2xl bg-[#0C0F17]/95 border border-white/[0.08] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] overflow-hidden">
      {/* Top Bar: Identity & State Selection */}
      <div className="px-5 py-3.5 border-b border-white/[0.06] bg-[#090B10]/80 flex flex-wrap items-center justify-between gap-3 text-xs select-none">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#C5A059]/15 border border-[#C5A059]/30 flex items-center justify-center text-[#DFBE7E]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-white font-medium text-xs flex items-center gap-1.5">
              Nyay AI Legal Intake
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </h2>
            <p className="text-[10px] text-white/50 font-mono">
              BNS & Indian Procedural Jurisprudence Grounded
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Optional State Jurisdiction Picker */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#141824] border border-white/10 text-[11px] text-[#A5A3B2]">
            <MapPin className="w-3.5 h-3.5 text-[#C5A059]" />
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="bg-transparent text-white outline-none cursor-pointer text-xs"
              aria-label="Jurisdiction State"
            >
              {INDIAN_STATES.map((s) => (
                <option key={s} value={s} className="bg-[#0C0F17] text-white">
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Connect with Advocate CTA Button (Appears after 1 exchange) */}
          {hasCompletedExchange && (
            <MagneticWrapper maxDisplacement={5}>
              <Link
                href="/lawyers"
                className="px-3 py-1.5 rounded-lg bg-[#C5A059] hover:bg-[#DFBE7E] text-[#090B10] font-semibold text-xs transition-colors flex items-center gap-1 shadow-md shadow-[#C5A059]/15"
              >
                <span>Find Advocates</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </MagneticWrapper>
          )}
        </div>
      </div>

      {/* Escrow & Confidentiality Micro-Banner */}
      <div className="px-5 py-2 bg-white/[0.015] border-b border-white/[0.04] flex items-center justify-between text-[11px] text-[#A5A3B2]">
        <div className="flex items-center gap-2">
          <Lock className="w-3 h-3 text-[#C5A059]" />
          <span>Session is private & non-identifying. No broker touting.</span>
        </div>
        <span className="font-mono text-[10px] text-white/40 hidden sm:inline">
          Sec 36 Advocates Act Compliant
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-5 sm:p-7 space-y-4 overflow-y-auto max-h-[520px]">
        {messages.map((message) => {
          const isUser = message.role === "user";
          return (
            <div
              key={message.id}
              className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
            >
              <div
                className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                  isUser
                    ? "bg-[#1C2234] border border-white/10 text-white rounded-tr-sm max-w-[85%] shadow-md"
                    : "bg-[#121622] border border-[#C5A059]/25 text-white/90 rounded-tl-sm max-w-[92%] shadow-lg"
                }`}
              >
                {!isUser && (
                  <div className="flex items-center gap-1.5 text-[#DFBE7E] text-xs font-semibold mb-2 select-none">
                    <Scale className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>Legal Clarity & Relevant Provisions</span>
                  </div>
                )}

                <div className="text-white/90 font-sans leading-relaxed">
                  {message.content}
                  {message.isStreaming && (
                    <span className="inline-block w-1.5 h-3.5 bg-[#C5A059] ml-1.5 animate-pulse align-middle" />
                  )}
                </div>

                {/* Token Limit Truncation Indicator & Continue Action */}
                {message.isTruncated && !isLoading && (
                  <div className="mt-3 pt-2.5 border-t border-white/[0.08] flex items-center justify-between gap-2 text-xs">
                    <span className="text-[#A5A3B2] text-[11px] font-mono">
                      Explanation reached token limit.
                    </span>
                    <button
                      type="button"
                      onClick={() => handleContinueAnswer(message.id)}
                      className="px-2.5 py-1 rounded-lg bg-[#C5A059]/15 border border-[#C5A059]/30 text-[#DFBE7E] hover:bg-[#C5A059]/25 text-[11px] font-medium flex items-center gap-1 transition-colors"
                    >
                      <ArrowRight className="w-3 h-3" />
                      Continue answer
                    </button>
                  </div>
                )}

                {/* Network Interruption Indicator & Retry Action */}
                {message.isInterrupted && !isLoading && (
                  <div className="mt-3 pt-2.5 border-t border-red-500/20 flex items-center justify-between gap-2 text-xs">
                    <span className="text-red-300 text-[11px] font-mono">
                      Stream disconnected. Partial response preserved.
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRetryInterrupted(message.id)}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 text-white hover:bg-white/[0.08] text-[11px] font-medium flex items-center gap-1 transition-colors"
                    >
                      <RotateCcw className="w-3 h-3 text-[#C5A059]" />
                      Retry from here
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Thinking Indicator */}
        {isLoading && messages[messages.length - 1]?.content === "" && (
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#121622] border border-white/[0.08] text-[#DFBE7E] max-w-xs text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A059] animate-spin" />
            <span>Consulting statutory provisions...</span>
          </div>
        )}

        {/* API Error Box */}
        {apiError && (
          <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              <p className="font-semibold text-white">Intake Connection Notice</p>
              <p className="text-white/80 leading-relaxed font-mono text-[11px]">
                {apiError}
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => handleSendMessage(undefined, true)}
                  disabled={isLoading}
                  className="text-[11px] text-[#DFBE7E] hover:underline flex items-center gap-1 font-medium disabled:opacity-50"
                >
                  <RotateCcw className="w-3 h-3" /> Resubmit failed question
                </button>
                {failedPrompt && (
                  <button
                    type="button"
                    onClick={handleRestorePrompt}
                    disabled={isLoading}
                    className="text-[11px] text-white/70 hover:text-white hover:underline flex items-center gap-1 disabled:opacity-50"
                  >
                    <span>Restore question to input</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Post-Exchange Escalation Card */}
        {hasCompletedExchange && !isLoading && (
          <div className="p-4 rounded-xl bg-gradient-to-br from-[#181D2A] to-[#0D101A] border border-[#C5A059]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs mt-4">
            <div className="space-y-0.5">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Preliminary Legal Analysis Prepared
              </span>
              <p className="text-[#A5A3B2] text-[11px]">
                Would you like a verified Bar Council advocate to formally assess your documents?
              </p>
            </div>
            <MagneticWrapper maxDisplacement={6}>
              <Link
                href="/lawyers"
                className="px-4 py-2 rounded-lg bg-[#C5A059] hover:bg-[#DFBE7E] text-[#090B10] font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-lg shadow-[#C5A059]/20 shrink-0"
              >
                <span>Connect with a Verified Advocate</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </MagneticWrapper>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Chips (Only shown before user has sent messages) */}
      {messages.length === 1 && !isLoading && (
        <div className="px-5 py-2.5 border-t border-white/[0.04] bg-white/[0.01]">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#C5A059] block mb-1.5">
            Suggested Inquiries:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_QUERIES.map((q) => (
              <button
                key={q}
                onClick={() => handleSendMessage(q)}
                className="px-2.5 py-1 rounded-full bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] hover:border-[#C5A059]/40 text-left text-[11px] text-white/80 transition-all truncate max-w-xs"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Input Bar */}
      <div className="p-4 border-t border-white/[0.06] bg-[#090B10]/95 space-y-2.5">
        <div className="relative flex items-end gap-2 p-2 rounded-xl bg-[#141824] border border-white/10 focus-within:border-[#C5A059]/50 focus-within:ring-1 focus-within:ring-[#C5A059]/50 transition-all">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your legal situation or question in plain language (Shift+Enter for newline)..."
            disabled={isLoading}
            className="flex-1 bg-transparent text-xs sm:text-sm text-white placeholder-white/30 resize-none outline-none max-h-36 py-1 px-2 leading-relaxed"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!input.trim() || isLoading}
            className={`p-2.5 rounded-lg font-semibold transition-all ${
              input.trim() && !isLoading
                ? "bg-[#C5A059] text-[#090B10] hover:bg-[#DFBE7E] shadow-md shadow-[#C5A059]/20 cursor-pointer"
                : "bg-white/5 text-white/20 cursor-not-allowed"
            }`}
            aria-label="Send query"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* Persistent, Non-Intrusive Sticky Disclaimer Bar */}
        <div className="flex items-center justify-between text-[11px] text-[#A5A3B2] select-none pt-0.5">
          <p className="flex items-center gap-1.5 text-white/60">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
            <span>
              This is general legal information, not legal advice. For your specific situation,
              consult a verified advocate.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
