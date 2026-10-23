"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Sparkles,
  Send,
  Square,
  Copy,
  Check,
  RotateCcw,
  ArrowRight,
  AlertCircle,
  MapPin,
  CheckCircle2,
  Lock,
  ThumbsUp,
  ThumbsDown,
  Shield,
  Users,
  Home,
  Briefcase,
  PlusCircle,
  ArrowDown,
} from "lucide-react";
import { MagneticWrapper } from "@/components/ui/magnetic-wrapper";
import { FormattedMarkdown, markdownToPlainText } from "@/components/intake/formatted-markdown";
import { PerimeterGlowContainer, LegalCompassMotif } from "@/components/intake/perimeter-glow";
import { NyayLinkLogo } from "@/components/ui/nyaylink-logo";

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
    prompt: "What are my legal rights and recourse if a police station refuses to register an FIR for a cognizable offence under the BNSS?",
  },
  {
    category: "Family & Matrimonial",
    icon: Users,
    title: "Mutual Consent & Maintenance",
    prompt: "What is the procedure, statutory waiting period, and documentation required for mutual consent divorce and interim maintenance under Indian law?",
  },
  {
    category: "Property & Tenancy",
    icon: Home,
    title: "Security Deposit & Eviction",
    prompt: "My landlord withheld my security deposit for 4 months without justification. What are my legal remedies under the Tenancy Act and Consumer Forum?",
  },
  {
    category: "Consumer & Workplace",
    icon: Briefcase,
    title: "Withheld Salary & Notice",
    prompt: "My employer withheld my full and final settlement and salary without written explanation. How do I proceed under Indian labour and contract laws?",
  },
];

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [selectedState, setSelectedState] = useState("All India (General)");
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [failedPrompt, setFailedPrompt] = useState<string | null>(null);
  const [failedUserMessageId, setFailedUserMessageId] = useState<string | null>(null);
  const [isScrolledUp, setIsScrolledUp] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Monitor scroll position to avoid forcefully snapping user down if they deliberately scrolled up
  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setIsScrolledUp(distanceToBottom > 120);
  };

  // Smart smooth scrolling: automatically tracks bottom if user is already near bottom
  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  useEffect(() => {
    if (!isScrolledUp) {
      scrollToBottom(isLoading ? "auto" : "smooth");
    }
  }, [messages, isLoading, isScrolledUp, scrollToBottom]);

  // Adjust textarea height dynamically to content
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  };

  // Stop Generation Handler
  const handleStopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
    setMessages((prev) =>
      prev.map((msg) =>
        msg.isStreaming ? { ...msg, isStreaming: false, isInterrupted: true } : msg
      )
    );
  }, []);

  // Send Message Handler
  const handleSendMessage = async (textToSend?: string, isRetry = false) => {
    if (isLoading) return;

    let text = "";

    if (isRetry) {
      text = failedPrompt?.trim() || "";
      if (!text) return;
    } else {
      text = (textToSend ?? input).trim();
      if (!text) return;
    }

    if (!isRetry) {
      const userMsgId = `user-${Date.now()}`;
      setFailedUserMessageId(userMsgId);

      const userMsg: ChatMessage = {
        id: userMsgId,
        role: "user",
        content: text,
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }

    setFailedPrompt(text);
    setIsLoading(true);
    setApiError(null);
    setIsScrolledUp(false);

    const assistantPlaceholderId = `assistant-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      {
        id: assistantPlaceholderId,
        role: "assistant",
        content: "",
        isStreaming: true,
      },
    ]);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const currentHistory = messages
        .filter((m) => m.content.trim().length > 0)
        .map((m) => ({ role: m.role, content: m.content }));

      const apiMessages = isRetry
        ? currentHistory
        : [...currentHistory, { role: "user" as const, content: text }];

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

      if (!response.body) throw new Error("No response stream received from intake service.");

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

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantPlaceholderId ? { ...msg, content: liveClean } : msg
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
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantPlaceholderId
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
      setFailedUserMessageId(null);
    } catch (err: unknown) {
      if (abortController.signal.aborted) {
        // Stop generation handled cleanly
        return;
      }
      const msg = err instanceof Error ? err.message : "Failed to connect to NyayLink legal intake.";
      setApiError(msg);

      // Preserve previously received partial text if any
      setMessages((prev) => {
        const existing = prev.find((m) => m.id === assistantPlaceholderId);
        if (existing && existing.content.trim().length > 0) {
          return prev.map((m) =>
            m.id === assistantPlaceholderId
              ? { ...m, isStreaming: false, isInterrupted: true }
              : m
          );
        }
        return prev.filter((m) => m.id !== assistantPlaceholderId);
      });
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  // Continue Answer (when token limit reached)
  const handleContinueAnswer = async (messageId: string) => {
    if (isLoading) return;
    setIsLoading(true);
    setApiError(null);

    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? { ...msg, isStreaming: true, isTruncated: false, isInterrupted: false }
          : msg
      )
    );

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const apiMessages = messages
        .filter((m) => m.content.trim().length > 0)
        .map((m) => ({ role: m.role, content: m.content }));

      const response = await fetch("/api/intake/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          state: selectedState !== "All India (General)" ? selectedState : undefined,
          isContinuation: true,
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        let errMessage = "Server encountered an issue continuing the answer.";
        try {
          const errData = await response.json();
          if (errData?.error) errMessage = errData.error;
        } catch {}
        throw new Error(errMessage);
      }

      if (!response.body) throw new Error("No response stream received.");

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

        const liveCombined = (baseText + "\n\n" + continuationChunk)
          .replace(/__NYAY(A)?LINK_DONE__/g, "")
          .replace(/__NYAY(A)?LINK_TRUNCATED__/g, "")
          .replace(/__NYAY(A)?LINK_FILTERED__/g, "");

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId ? { ...msg, content: liveCombined } : msg
          )
        );
      }

      const isTruncated = continuationChunk.includes("__NYAYLINK_TRUNCATED__");
      const isDone = continuationChunk.includes("__NYAYLINK_DONE__");
      const cleanCombined = (baseText + "\n\n" + continuationChunk)
        .replace(/__NYAY(A)?LINK_DONE__/g, "")
        .replace(/__NYAY(A)?LINK_TRUNCATED__/g, "")
        .replace(/__NYAY(A)?LINK_FILTERED__/g, "")
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
      if (abortController.signal.aborted) return;
      const msg = err instanceof Error ? err.message : "Failed to continue response.";
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
      abortControllerRef.current = null;
    }
  };

  // Copy Answer Action (Strips markdown for clean plain text with execCommand fallback)
  const handleCopyAnswer = async (messageId: string, rawContent: string) => {
    const plainText = markdownToPlainText(rawContent);
    let copied = false;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(plainText);
        copied = true;
      }
    } catch {}

    if (!copied) {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = plainText;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        copied = document.execCommand("copy");
        textArea.remove();
      } catch (err) {
        console.warn("Clipboard copy fallback error:", err);
      }
    }

    setCopiedId(messageId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Feedback Toggle
  const handleFeedback = (messageId: string, rating: "helpful" | "unhelpful") => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId
          ? { ...m, feedback: m.feedback === rating ? null : rating }
          : m
      )
    );
  };

  // Reset Consultation (New Chat)
  const handleResetChat = () => {
    if (isLoading) handleStopGeneration();
    setMessages([]);
    setInput("");
    setApiError(null);
    setFailedPrompt(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.focus();
    }
  };

  // Keyboard Navigation: Enter to send, Shift+Enter for newline
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const hasCompletedExchange =
    messages.filter((m) => m.role === "assistant" && m.content.length > 20).length >= 1;

  return (
    <PerimeterGlowContainer
      isActive={isLoading}
      className="w-full max-w-4xl mx-auto h-[calc(100dvh-12.5rem)] sm:h-[calc(100svh-14rem)] min-h-[500px] sm:min-h-[560px] max-h-[820px] flex flex-col shadow-xl"
    >
      {/* Top Bar: Identity, Jurisdiction, and Actions */}
      <div className="shrink-0 px-4 sm:px-5 py-2.5 sm:py-3 border-b border-[#D5E5D9] bg-[#FFFFFF] flex flex-wrap items-center justify-between gap-2.5 text-xs select-none">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#EAF3ED] border border-[#D5E5D9] flex items-center justify-center text-[#205C43]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-[#202824] font-semibold text-xs flex items-center gap-1.5">
              <span>NyayLink AI Legal Intake</span>
              <span className={`w-1.5 h-1.5 rounded-full ${isLoading ? "bg-amber-500 animate-ping" : "bg-[#205C43]"}`} />
            </h2>
            <p className="text-[10.5px] text-[#69736D] font-mono">
              BNS &amp; Indian Jurisprudence Grounded
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
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

          {/* New Query / Reset Button */}
          {messages.length > 0 && (
            <button
              type="button"
              onClick={handleResetChat}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#EAF3ED] border border-[#D5E5D9] text-[#205C43] text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
              title="Start a new legal inquiry"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Query</span>
            </button>
          )}

          {/* Connect with Advocate CTA Button (appears after first exchange) */}
          {hasCompletedExchange && (
            <MagneticWrapper maxDisplacement={5}>
              <Link
                href="/lawyers"
                className="px-3.5 py-1 rounded-lg bg-[#205C43] hover:bg-[#174530] text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <span>Find Advocates</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </MagneticWrapper>
          )}
        </div>
      </div>

      {/* Escrow & Confidentiality Micro-Banner */}
      <div className="shrink-0 px-4 sm:px-5 py-1.5 bg-[#EAF3ED]/40 border-b border-[#D5E5D9] flex items-center justify-between text-[11px] text-[#69736D]">
        <div className="flex items-center gap-2">
          <Lock className="w-3 h-3 text-[#205C43]" />
          <span>Session is private and non-identifying. No advocate touting.</span>
        </div>
        <span className="font-mono text-[10px] text-[#205C43] font-semibold hidden sm:inline">
          Sec 36 Advocates Act Compliant
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5 bg-[#FFFFFF] scroll-smooth relative"
      >
        {/* Initial Empty State with Refined Suggested Prompts */}
        {messages.length === 0 && !isLoading && (
          <div className="space-y-4 sm:space-y-5 py-2">
            <LegalCompassMotif />

            {/* Suggested Prompt Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {SUGGESTED_INQUIRIES.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(item.prompt)}
                    className="p-3 sm:p-3.5 rounded-xl border border-[#D5E5D9] hover:border-[#205C43]/50 bg-[#FDFEFC] hover:bg-[#F3F8F5] text-left transition-all group flex items-start gap-3 shadow-2xs hover:shadow-xs cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#EAF3ED] border border-[#D5E5D9] flex items-center justify-center text-[#205C43] shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#205C43] font-semibold">
                          {item.category}
                        </span>
                        <span className="text-[10.5px] font-medium text-[#69736D] group-hover:text-[#174530]">
                          {item.title}
                        </span>
                      </div>
                      <p className="text-xs text-[#202824] leading-relaxed line-clamp-2">
                        {item.prompt}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Message Thread */}
        {messages.map((message) => {
          const isUser = message.role === "user";
          return (
            <div
              key={message.id}
              className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
            >
              <div
                className={`w-full transition-all ${
                  isUser
                    ? "ml-auto max-w-xl p-3.5 sm:p-4 rounded-2xl rounded-tr-sm bg-[#205C43] text-white shadow-xs"
                    : "max-w-3xl p-5 sm:p-6 rounded-2xl rounded-tl-sm bg-[#FDFEFC] border border-[#D5E5D9] shadow-xs text-[#202824]"
                }`}
              >
                {!isUser && (
                  <div className="flex items-center justify-between text-xs font-semibold mb-3 select-none border-b border-[#D5E5D9]/60 pb-2">
                    <div className="flex items-center gap-2 text-[#205C43]">
                      <NyayLinkLogo variant="symbol" size={18} href={false} />
                      <span className="font-serif tracking-tight text-sm font-semibold text-[#174530]">
                        Legal Orientation
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-[#69736D] uppercase">
                      Indian Law Grounded
                    </span>
                  </div>
                )}

                {/* Content Rendering */}
                {isUser ? (
                  <p className="text-xs sm:text-[13.5px] text-white leading-relaxed font-sans whitespace-pre-wrap">
                    {message.content}
                  </p>
                ) : (
                  <FormattedMarkdown
                    content={message.content}
                    isStreaming={message.isStreaming}
                  />
                )}

                {/* Assistant Completed Actions Toolbar */}
                {!isUser && !message.isStreaming && message.content.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-[#D5E5D9] flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5">
                      {/* Copy Answer Button */}
                      <button
                        type="button"
                        onClick={() => handleCopyAnswer(message.id, message.content)}
                        className="px-2.5 py-1 rounded-md bg-white hover:bg-[#EAF3ED] border border-[#D5E5D9] text-[#205C43] hover:text-[#174530] text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                        title="Copy plain-text answer to clipboard"
                      >
                        {copiedId === message.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-[#205C43]" />
                            <span>Copy Answer</span>
                          </>
                        )}
                      </button>

                      {/* Regenerate Answer Button */}
                      <button
                        type="button"
                        onClick={() => handleSendMessage(undefined, true)}
                        disabled={isLoading}
                        className="px-2.5 py-1 rounded-md bg-white hover:bg-[#EAF3ED] border border-[#D5E5D9] text-[#69736D] hover:text-[#202824] text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
                        title="Regenerate this response"
                      >
                        <RotateCcw className="w-3 h-3 text-[#69736D]" />
                        <span>Regenerate</span>
                      </button>
                    </div>

                    {/* Helpful Feedback Actions */}
                    <div className="flex items-center gap-1 text-[#69736D]">
                      <span className="text-[10px] mr-1">Was this clear?</span>
                      <button
                        type="button"
                        onClick={() => handleFeedback(message.id, "helpful")}
                        className={`p-1 rounded hover:bg-white transition-colors ${
                          message.feedback === "helpful" ? "text-emerald-700 bg-emerald-50" : ""
                        }`}
                        title="Mark helpful"
                      >
                        <ThumbsUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFeedback(message.id, "unhelpful")}
                        className={`p-1 rounded hover:bg-white transition-colors ${
                          message.feedback === "unhelpful" ? "text-rose-700 bg-rose-50" : ""
                        }`}
                        title="Mark unhelpful"
                      >
                        <ThumbsDown className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Token Limit Truncation Action */}
                {message.isTruncated && !isLoading && (
                  <div className="mt-3 pt-2.5 border-t border-[#D5E5D9] flex items-center justify-between gap-2 text-xs">
                    <span className="text-[#69736D] text-[11px] font-mono">
                      Answer reached token limit.
                    </span>
                    <button
                      type="button"
                      onClick={() => handleContinueAnswer(message.id)}
                      className="px-2.5 py-1 rounded-lg bg-[#EAF3ED] border border-[#D5E5D9] text-[#205C43] hover:bg-[#D5E5D9] text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                    >
                      <ArrowRight className="w-3 h-3" />
                      Continue answer
                    </button>
                  </div>
                )}

                {/* Network Interruption Action */}
                {message.isInterrupted && !isLoading && (
                  <div className="mt-3 pt-2.5 border-t border-rose-200 flex items-center justify-between gap-2 text-xs">
                    <span className="text-rose-700 text-[11px] font-mono">
                      Stream disconnected. Partial response preserved.
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSendMessage(undefined, true)}
                      className="px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 hover:bg-rose-100 text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                    >
                      <RotateCcw className="w-3 h-3 text-rose-700" />
                      Retry from here
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Initial Thinking Indicator */}
        {isLoading && messages[messages.length - 1]?.content === "" && (
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#EAF3ED] border border-[#D5E5D9] text-[#205C43] max-w-sm text-xs font-mono shadow-xs animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-[#205C43] animate-spin" />
            <span>Consulting statutory provisions under Indian law...</span>
          </div>
        )}

        {/* API Error Notification */}
        {apiError && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2.5 shadow-2xs">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              <p className="font-semibold text-rose-950">Intake Connection Notice</p>
              <p className="text-rose-800 leading-relaxed font-mono text-[11px]">
                {apiError}
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => handleSendMessage(undefined, true)}
                  disabled={isLoading}
                  className="text-[11px] text-[#205C43] hover:underline flex items-center gap-1 font-semibold disabled:opacity-50 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" /> Resubmit query
                </button>
                {failedPrompt && (
                  <button
                    type="button"
                    onClick={() => {
                      setInput(failedPrompt);
                      if (failedUserMessageId) {
                        setMessages((prev) => prev.filter((m) => m.id !== failedUserMessageId));
                      }
                      setFailedPrompt(null);
                      setFailedUserMessageId(null);
                      setApiError(null);
                      if (textareaRef.current) textareaRef.current.focus();
                    }}
                    disabled={isLoading}
                    className="text-[11px] text-[#69736D] hover:text-[#202824] hover:underline flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                  >
                    <span>Restore query to input</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Post-Exchange Advocate Handoff Banner */}
        {hasCompletedExchange && !isLoading && (
          <div className="p-4 rounded-xl bg-gradient-to-br from-[#EAF3ED] via-white to-[#F3F8F5] border border-[#D5E5D9] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs mt-4 shadow-xs">
            <div className="space-y-0.5">
              <span className="font-semibold text-[#202824] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#205C43]" />
                Preliminary Legal Analysis Prepared
              </span>
              <p className="text-[#69736D] text-[11px]">
                Would you like a verified Bar Council advocate to formally assess your case documents?
              </p>
            </div>
            <MagneticWrapper maxDisplacement={6}>
              <Link
                href="/lawyers"
                className="px-4 py-2 rounded-lg bg-[#205C43] hover:bg-[#174530] text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs shrink-0"
              >
                <span>Connect with a Verified Advocate</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </MagneticWrapper>
          </div>
        )}

        {/* Floating Scroll to Bottom Button */}
        {isScrolledUp && (
          <button
            type="button"
            onClick={() => scrollToBottom("smooth")}
            className="sticky bottom-2 ml-auto p-2 rounded-full bg-white hover:bg-[#EAF3ED] border border-[#D5E5D9] text-[#205C43] shadow-md transition-all flex items-center gap-1 text-[11px] font-medium z-20 cursor-pointer"
            title="Scroll to latest messages"
          >
            <ArrowDown className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Latest</span>
          </button>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Multiline Modern Message Composer */}
      <div className="shrink-0 p-3 sm:p-4 border-t border-[#D5E5D9] bg-white space-y-2">
        <div className="relative flex items-end gap-2 p-2 rounded-xl bg-[#F8FAF9] border border-[#D5E5D9] focus-within:border-[#205C43] focus-within:ring-2 focus-within:ring-[#205C43]/15 transition-all shadow-xs">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your legal situation or question in plain language (Shift+Enter for newline)..."
            disabled={isLoading}
            className="flex-1 bg-transparent text-xs sm:text-sm text-[#202824] placeholder-[#69736D]/60 resize-none outline-none max-h-40 py-1.5 px-2.5 leading-relaxed"
          />

          {/* Action Button: Send or Stop Generating */}
          {isLoading ? (
            <button
              type="button"
              onClick={handleStopGeneration}
              className="px-3 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs shrink-0"
              title="Stop generating response"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">Stop</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={!input.trim()}
              className={`p-2.5 rounded-lg font-semibold transition-all shrink-0 ${
                input.trim()
                  ? "bg-[#205C43] text-white hover:bg-[#174530] shadow-xs cursor-pointer active:scale-95"
                  : "bg-[#D5E5D9]/40 text-[#69736D]/30 cursor-not-allowed"
              }`}
              aria-label="Send inquiry"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Persistent, Non-Intrusive Legal Disclaimer Bar */}
        <div className="flex items-center justify-between text-[11px] text-[#69736D] select-none pt-0.5">
          <p className="flex items-center gap-1.5 text-[#69736D]">
            <Shield className="w-3.5 h-3.5 text-[#205C43] shrink-0" />
            <span>
              General legal orientation under Indian statutes; not formal legal advice. For actionable court representation, consult an advocate.
            </span>
          </p>
        </div>
      </div>
    </PerimeterGlowContainer>
  );
}
