"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  Sparkles,
  Send,
  Square,
  Copy,
  Check,
  RotateCcw,
  ArrowRight,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Shield,
  Layers,
  BookOpen,
  ExternalLink,
} from "lucide-react";
import { FormattedMarkdown } from "@/components/intake/formatted-markdown";
import { WhatIUnderstoodCard } from "@/components/intake/what-i-understood-card";
import { IntakeFacts } from "@/lib/intake/fact-types";

export type AnimationPhase =
  | "idle"
  | "launch"
  | "assemble"
  | "think"
  | "resolve"
  | "condense"
  | "unfold"
  | "answered";

export interface AIThinkingOrbAndInputProps {
  /**
   * Primary inquiry submission handler connected to real AI backend.
   * Resolves when the answer generation completes with the full answer string.
   */
  onSubmit: (question: string) => Promise<string | void>;
  /** Optional handler to abort/stop ongoing generation */
  onStop?: () => void;
  /** Optional handler when resetting to a fresh idle state */
  onReset?: () => void;
  /** Whether the backend is actively streaming */
  isStreaming?: boolean;
  /** Live streaming text as it arrives from the server */
  currentStreamText?: string;
  /** External API error message if submission failed */
  error?: string | null;
  /** Retry callback */
  onRetry?: () => void;
  /** Placeholder text for input */
  placeholder?: string;
  /** Whether Hindi locale is active */
  isHindi?: boolean;
  /** Initial question if prepopulating */
  initialQuestion?: string;
  /** State / jurisdiction tag (e.g., 'Delhi', 'Maharashtra') */
  jurisdictionLabel?: string;
  /** Jurisdiction selector slot */
  jurisdictionSelector?: React.ReactNode;
  /** Integrated microphone button slot */
  voiceMicSlot?: React.ReactNode;
  /** Integrated read-aloud TTS control slot for completed answer */
  voicePlaybackSlot?: (answerText: string) => React.ReactNode;
  /** Curated legal inquiry suggestions */
  suggestedInquiries?: Array<{
    title: string;
    category: string;
    prompt: string;
    icon?: React.ComponentType<{ className?: string }>;
  }>;
  /** Multi-turn conversation messages */
  conversationHistory?: Array<{
    id: string;
    role: "user" | "assistant";
    content: string;
  }>;
  /** Follow-up submission handler */
  onFollowUpSubmit?: (question: string) => Promise<string | void>;
  /** Optional controlled input value (e.g. from speech recognition) */
  value?: string;
  /** Optional controlled text change handler */
  onChangeText?: (text: string) => void;
  /** Voice recognition status ribbon slot */
  voiceRibbonSlot?: React.ReactNode;
  /** Structured facts data if available */
  factsData?: IntakeFacts | null;
  /** Callback when user confirms edited facts */
  onConfirmFacts?: (facts: IntakeFacts) => void;
  /** Verified statutory sources retrieved from India Code registry */
  retrievedSources?: Array<{
    id: string;
    actName: string;
    actShortName: string;
    section: string;
    provisionTitle: string;
    officialSourceUrl: string;
    sourcePublisher?: string;
    lastCheckedDate?: string;
    verificationStatus: string;
    category?: string;
    plainSummary?: string;
  }>;
  /** Entry component slot for guided 3-choice initiation */
  entrySlot?:
    | React.ReactNode
    | ((props: {
        onSubmit: (query: string) => Promise<string | void>;
        isLoading: boolean;
      }) => React.ReactNode);
}

// Bounded uniform Fibonacci sphere point distribution
interface Point3D {
  x: number;
  y: number;
  z: number;
  baseRadius: number;
  disperseX: number;
  disperseY: number;
  disperseZ: number;
  phaseOffset: number;
  size: number;
}

function generateSpherePoints(count: number): Point3D[] {
  const points: Point3D[] = [];
  const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle ~2.39996

  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2; // -1 to 1
    const radiusAtY = Math.sqrt(1 - y * y);
    const theta = phi * i;

    const x = Math.cos(theta) * radiusAtY;
    const z = Math.sin(theta) * radiusAtY;

    // Dispersed start offsets for the 'assemble' phase
    const angle = Math.random() * Math.PI * 2;
    const dist = 1.8 + Math.random() * 2.2;

    points.push({
      x,
      y,
      z,
      baseRadius: 1,
      disperseX: Math.cos(angle) * dist,
      disperseY: Math.sin(angle) * dist,
      disperseZ: (Math.random() - 0.5) * dist,
      phaseOffset: Math.random() * Math.PI * 2,
      size: 1.2 + Math.random() * 1.6,
    });
  }
  return points;
}

export function AIThinkingOrbAndInput({
  onSubmit,
  onStop,
  onReset,
  isStreaming = false,
  currentStreamText = "",
  error = null,
  onRetry,
  placeholder,
  isHindi = false,
  initialQuestion = "",
  jurisdictionLabel,
  jurisdictionSelector,
  voiceMicSlot,
  voicePlaybackSlot,
  suggestedInquiries = [],
  conversationHistory = [],
  onFollowUpSubmit,
  value,
  onChangeText,
  voiceRibbonSlot,
  factsData,
  onConfirmFacts,
  retrievedSources = [],
  entrySlot,
}: AIThinkingOrbAndInputProps) {
  // Input text state
  const [inputText, setInputText] = useState(initialQuestion);
  const [followUpText, setFollowUpText] = useState("");
  const [activeQuestion, setActiveQuestion] = useState(initialQuestion);
  const [finalAnswer, setFinalAnswer] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // 8-Phase Animation State Machine
  const [phase, setPhase] = useState<AnimationPhase>("idle");
  const [thinkingStep, setThinkingStep] = useState(0);

  // DOM and Canvas Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const followUpInputRef = useRef<HTMLTextAreaElement | null>(null);

  // Animation Frame and Timer references for clean unmount
  const animFrameRef = useRef<number | null>(null);
  const phaseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const statusCycleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // Sphere Geometry
  const spherePoints = useMemo(() => generateSpherePoints(380), []);

  // Visual text copies for Hindi / English
  const textStrings = useMemo(() => {
    return isHindi
      ? {
          defaultPlaceholder:
            "अपनी कानूनी स्थिति या प्रश्न यहाँ लिखें (उदा. नोटिस, संपत्ति विवाद, वेतन रोके जाना)...",
          sendAria: "प्रश्न भेजें",
          stopAria: "प्रक्रिया रोकें",
          thinkingSteps: [
            "तथ्यों और अधिकार क्षेत्र का विश्लेषण...",
            "संबंधित संविधिक धाराओं (BNS, BNSS, CPC) की समीक्षा...",
            "कानूनी विकल्पों और व्यावहारिक चरणों का निर्माण...",
            "अंतिम संविधिक निष्कर्ष तैयार किया जा रहा है...",
          ],
          phaseBadge: "संविधिक विश्लेषण",
          assessmentTitle: "प्रारंभिक कानूनी विश्लेषण",
          assessmentSubtitle:
            "भारतीय संविधिक प्रावधानों के अंतर्गत सूचनात्मक सारांश",
          yourInquiry: "आपका प्रश्न",
          copyAnswer: "उत्तर कॉपी करें",
          copied: "कॉपी हो गया",
          newQuestion: "नया प्रश्न",
          followUpPlaceholder: "इस विश्लेषण पर कोई अनुवर्ती प्रश्न पूछें...",
          historyToggle: (count: number) => `पिछली बातचीत (${count})`,
          errorTitle: "सहायक संपर्क सूचना",
          retry: "पुनः प्रयास करें",
          restore: "प्रश्न पुनर्स्थापित करें",
          disclaimer:
            "भारतीय कानूनों के अंतर्गत सामान्य कानूनी मार्गदर्शन; औपचारिक वकालत सलाह नहीं।",
        }
      : {
          defaultPlaceholder:
            "Type your legal question in plain language (e.g., notice received, property tenancy, withheld salary)...",
          sendAria: "Send question",
          stopAria: "Stop generating",
          thinkingSteps: [
            "Analyzing factual core & jurisdiction...",
            "Scanning statutory provisions (BNS, BNSS, CPC)...",
            "Synthesizing legal options & procedural roadmap...",
            "Finalizing statutory orientation summary...",
          ],
          phaseBadge: "STATUTORY INTAKE",
          assessmentTitle: "Preliminary Legal Assessment",
          assessmentSubtitle:
            "Informational orientation grounded strictly in Indian statutory frameworks",
          yourInquiry: "Your Legal Inquiry",
          copyAnswer: "Copy Answer",
          copied: "Copied to clipboard",
          newQuestion: "New Question",
          followUpPlaceholder:
            "Ask a follow-up question regarding this assessment...",
          historyToggle: (count: number) => `Conversation History (${count})`,
          errorTitle: "Intake Connection Notice",
          retry: "Retry query",
          restore: "Restore to input",
          disclaimer:
            "General legal orientation under Indian statutes; not formal legal advice. For court representation, consult an advocate.",
        };
  }, [isHindi]);

  // Keep track of mounted state
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
      if (statusCycleTimerRef.current) clearInterval(statusCycleTimerRef.current);
    };
  }, []);

  // Update input text if initialQuestion changes
  useEffect(() => {
    if (initialQuestion && phase === "idle") {
      setInputText(initialQuestion);
    }
  }, [initialQuestion, phase]);

  // Handle external errors
  useEffect(() => {
    if (error && (phase === "launch" || phase === "assemble" || phase === "think")) {
      // Revert from thinking to error state cleanly
      if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
      if (statusCycleTimerRef.current) clearInterval(statusCycleTimerRef.current);
      setPhase("idle");
    }
  }, [error, phase]);

  // Sync streaming text to final answer when resolved
  useEffect(() => {
    if (currentStreamText && (phase === "think" || phase === "resolve" || phase === "condense" || phase === "unfold")) {
      setFinalAnswer(currentStreamText);
    }
  }, [currentStreamText, phase]);

  // Handle streaming lifecycle transitions from external submission
  useEffect(() => {
    if (isStreaming && phase === "idle") {
      setPhase("think");
    } else if (!isStreaming && phase === "think" && (currentStreamText || finalAnswer)) {
      setPhase("resolve");
      phaseTimerRef.current = setTimeout(() => {
        if (!isMountedRef.current) return;
        setPhase("condense");
        phaseTimerRef.current = setTimeout(() => {
          if (!isMountedRef.current) return;
          setPhase("unfold");
          phaseTimerRef.current = setTimeout(() => {
            if (!isMountedRef.current) return;
            setPhase("answered");
          }, 350);
        }, 400);
      }, 500);
    }
  }, [isStreaming, phase, currentStreamText, finalAnswer]);

  // Dynamic Textarea Auto-height
  const adjustHeight = useCallback((el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }, []);

  const effectiveInputText = value !== undefined ? value : inputText;

  useEffect(() => {
    if (value !== undefined) {
      adjustHeight(inputRef.current);
    }
  }, [value, adjustHeight]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onChangeText) onChangeText(e.target.value);
    setInputText(e.target.value);
    adjustHeight(inputRef.current);
  };

  const handleFollowUpChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFollowUpText(e.target.value);
    adjustHeight(followUpInputRef.current);
  };

  // Status step cycling during 'think'
  useEffect(() => {
    if (phase === "think") {
      setThinkingStep(0);
      statusCycleTimerRef.current = setInterval(() => {
        setThinkingStep((prev) => (prev + 1) % textStrings.thinkingSteps.length);
      }, 2600);
    } else {
      if (statusCycleTimerRef.current) {
        clearInterval(statusCycleTimerRef.current);
        statusCycleTimerRef.current = null;
      }
    }
    return () => {
      if (statusCycleTimerRef.current) clearInterval(statusCycleTimerRef.current);
    };
  }, [phase, textStrings.thinkingSteps.length]);

  // --------------------------------------------------------------------------
  // Core Submission Flow: idle -> launch -> assemble -> think -> resolve -> condense -> unfold -> answered
  // --------------------------------------------------------------------------
  const initiateSubmission = useCallback(
    async (queryText: string, isFollowUpTurn = false) => {
      const trimmed = queryText.trim();
      if (!trimmed) return;

      setActiveQuestion(trimmed);
      setFinalAnswer("");
      setIsCopied(false);

      // Phase 1: Launch
      setPhase("launch");

      // Phase 2: Assemble after flight lift-off (600ms)
      phaseTimerRef.current = setTimeout(() => {
        if (!isMountedRef.current) return;
        setPhase("assemble");

        // Phase 3: Transition to steady Think (800ms)
        phaseTimerRef.current = setTimeout(() => {
          if (!isMountedRef.current) return;
          setPhase("think");
        }, 800);
      }, 600);

      try {
        const resultPromise = isFollowUpTurn && onFollowUpSubmit
          ? onFollowUpSubmit(trimmed)
          : onSubmit(trimmed);

        // Submit query to backend
        const result = await resultPromise;
        const resolvedText = typeof result === "string" ? result : currentStreamText;

        if (resolvedText && resolvedText.trim()) {
          setFinalAnswer(resolvedText.trim());
        }

        // When backend finishes, transition: resolve -> condense -> unfold -> answered
        if (isMountedRef.current) {
          setPhase("resolve");

          phaseTimerRef.current = setTimeout(() => {
            if (!isMountedRef.current) return;
            setPhase("condense");

            phaseTimerRef.current = setTimeout(() => {
              if (!isMountedRef.current) return;
              setPhase("unfold");

              phaseTimerRef.current = setTimeout(() => {
                if (!isMountedRef.current) return;
                setPhase("answered");
              }, 450);
            }, 400);
          }, 350);
        }
      } catch (err: unknown) {
        if (!isMountedRef.current) return;
        console.error("[AI Thinking Orb] Submission error:", err);
        // Cleanly restore to idle so user can retry or adjust query
        setPhase("idle");
      }
    },
    [onSubmit, onFollowUpSubmit, currentStreamText]
  );

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (phase !== "idle") return;
    initiateSubmission(effectiveInputText);
  };

  const handleFollowUpSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!followUpText.trim()) return;
    initiateSubmission(followUpText, true);
    setFollowUpText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "Escape" && phase === "think") {
      handleStop();
    }
  };

  const handleFollowUpKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleFollowUpSubmit();
    }
  };

  // Stop ongoing thinking
  const handleStop = useCallback(() => {
    if (onStop) onStop();
    if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
    if (statusCycleTimerRef.current) clearInterval(statusCycleTimerRef.current);

    // If partial answer arrived, show answered; otherwise revert to idle
    if (finalAnswer || currentStreamText) {
      setPhase("answered");
    } else {
      setPhase("idle");
    }
  }, [onStop, finalAnswer, currentStreamText]);

  // Reset to fresh idle question
  const handleReset = useCallback(() => {
    if (onReset) onReset();
    if (onChangeText) onChangeText("");
    if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
    if (statusCycleTimerRef.current) clearInterval(statusCycleTimerRef.current);
    setPhase("idle");
    setInputText("");
    setFollowUpText("");
    setActiveQuestion("");
    setFinalAnswer("");
    setIsCopied(false);
  }, [onReset, onChangeText]);

  // Copy Answer
  const handleCopy = useCallback(async () => {
    if (!finalAnswer) return;
    try {
      await navigator.clipboard.writeText(finalAnswer);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2200);
    } catch {}
  }, [finalAnswer]);

  // --------------------------------------------------------------------------
  // Canvas Dotted Sphere Render Loop
  // --------------------------------------------------------------------------
  useEffect(() => {
    // Only render canvas in active orb phases: assemble, think, resolve, condense
    const shouldRenderCanvas =
      phase === "assemble" ||
      phase === "think" ||
      phase === "resolve" ||
      phase === "condense";

    if (!shouldRenderCanvas) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rotY = 0;
    let assembleProgress = phase === "assemble" ? 0 : 1;
    let condenseScale = 1;
    const startTime = performance.now();

    const render = () => {
      const now = performance.now();
      const elapsed = now - startTime;

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const width = rect.width || 320;
      const height = rect.height || 320;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // Base radius with subtle breathing pulse
      const breathe = Math.sin(now * 0.0022) * 3;
      let radius = (width < 300 ? 75 : 95) + breathe;

      // Handle Assemble transition (0 -> 1)
      if (phase === "assemble") {
        assembleProgress = Math.min(assembleProgress + 0.035, 1);
      } else {
        assembleProgress = 1;
      }

      // Handle Condense transition (1 -> 0.15)
      if (phase === "condense") {
        condenseScale = Math.max(condenseScale - 0.065, 0.1);
        radius *= condenseScale;
      }

      // Dynamic rotation speed based on phase
      const rotSpeed =
        phase === "resolve" ? 0.035 : phase === "assemble" ? 0.015 : 0.018;
      rotY += rotSpeed;

      const rotX = Math.sin(now * 0.0009) * 0.35;
      const rotZ = Math.cos(now * 0.0007) * 0.15;

      // Camera focal distance
      const cameraDist = 320;

      // Ambient radial gradient glow inside canvas
      const glowGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        radius * 0.1,
        centerX,
        centerY,
        radius * 1.5
      );
      glowGrad.addColorStop(0, "rgba(32, 92, 67, 0.18)");
      glowGrad.addColorStop(0.5, "rgba(234, 243, 237, 0.25)");
      glowGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Transform & Project points
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const cosZ = Math.cos(rotZ);
      const sinZ = Math.sin(rotZ);

      // Sort points back-to-front for proper depth painting
      const projectedList: Array<{
        px: number;
        py: number;
        pz: number;
        r: number;
        alpha: number;
        isFront: boolean;
      }> = [];

      for (let i = 0; i < spherePoints.length; i++) {
        const pt = spherePoints[i];

        // Interpolate between dispersed start and sphere surface
        const curX =
          pt.x * assembleProgress + pt.disperseX * (1 - assembleProgress);
        const curY =
          pt.y * assembleProgress + pt.disperseY * (1 - assembleProgress);
        const curZ =
          pt.z * assembleProgress + pt.disperseZ * (1 - assembleProgress);

        // 3D Rotation Matrix
        // 1. Y-axis
        const x1 = curX * cosY + curZ * sinY;
        const y1 = curY;
        const z1 = -curX * sinY + curZ * cosY;

        // 2. X-axis
        const x2 = x1;
        const y2 = y1 * cosX - z1 * sinX;
        const z2 = y1 * sinX + z1 * cosX;

        // 3. Z-axis
        const x3 = x2 * cosZ - y2 * sinZ;
        const y3 = x2 * sinZ + y2 * cosZ;
        const z3 = z2;

        // Perspective Projection
        const zDist = cameraDist + z3 * radius;
        const scale = cameraDist / Math.max(zDist, 1);

        const px = centerX + x3 * radius * scale;
        const py = centerY + y3 * radius * scale;

        // Depth factor [-1, 1] -> [0, 1]
        const depth = (z3 + 1) / 2;
        const dotRadius = Math.max(pt.size * scale * (0.8 + depth * 0.7), 0.6);
        const alpha = Math.max(0.18 + depth * 0.78, 0.12);

        projectedList.push({
          px,
          py,
          pz: z3,
          r: dotRadius,
          alpha,
          isFront: z3 > 0,
        });
      }

      projectedList.sort((a, b) => a.pz - b.pz);

      // Render dots
      for (let j = 0; j < projectedList.length; j++) {
        const p = projectedList[j];

        ctx.beginPath();
        ctx.arc(p.px, p.py, p.r, 0, Math.PI * 2);

        if (p.isFront) {
          // Front dots: Forest green `#205C43` and radiant emerald `#2A7556`
          ctx.fillStyle = `rgba(32, 92, 67, ${p.alpha})`;
          ctx.fill();

          // Subtle core highlight on closest dots
          if (p.pz > 0.45) {
            ctx.beginPath();
            ctx.arc(p.px, p.py, p.r * 0.45, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(163, 201, 180, ${p.alpha * 0.9})`;
            ctx.fill();
          }
        } else {
          // Back dots: Soft pale mint `#9BC4AE` / `#B8D8C7`
          ctx.fillStyle = `rgba(155, 196, 174, ${p.alpha * 0.65})`;
          ctx.fill();
        }
      }

      ctx.restore();
      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [phase, spherePoints]);

  // Is the orb currently in flight / thinking
  const isOrbActive =
    phase === "assemble" ||
    phase === "think" ||
    phase === "resolve" ||
    phase === "condense";

  return (
    <div ref={containerRef} className="mo-wrapper">
      <div className="mo-container">
        {/* Optional Voice Recognition Status Ribbon */}
        {voiceRibbonSlot && phase === "idle" && (
          <div className="w-full max-w-[720px] mb-2 z-20">
            {voiceRibbonSlot}
          </div>
        )}

        {/* Guided Entry View (Phase 4: 3 Entry choices & Guided Form) */}
        {entrySlot && phase === "idle" && (
          <div className="w-full max-w-[760px] bg-white p-5 sm:p-7 rounded-2xl border border-[#D5E5D9] shadow-md mb-3 z-10">
            {typeof entrySlot === "function"
              ? entrySlot({
                  onSubmit: (q: string) => initiateSubmission(q),
                  isLoading: isStreaming,
                })
              : entrySlot}
          </div>
        )}

        {/* ====================================================================
            PHASE 1: IDLE MORPHING INPUT PILL
            ==================================================================== */}
        <div
          className={`mo-input-pill ${
            phase === "launch" ? "mo-launching" : ""
          } ${phase !== "idle" && phase !== "launch" ? "mo-hidden" : ""} ${entrySlot ? "hidden" : ""}`}
        >
          {/* Subtle top jurisdiction / state status banner if present */}
          {(jurisdictionLabel || jurisdictionSelector) && (
            <div className="px-4 py-2 border-b border-[#D5E5D9]/70 bg-[#F8FAF9] flex items-center justify-between text-xs text-[#205C43]">
              <div className="flex items-center gap-1.5 font-medium">
                <Shield className="w-3.5 h-3.5 text-[#205C43]" />
                <span>{jurisdictionLabel || "All India (General Jurisdiction)"}</span>
              </div>
              {jurisdictionSelector && (
                <div className="shrink-0">{jurisdictionSelector}</div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-2 sm:p-2.5">
            <div className="relative flex items-center gap-2">
              {/* Left Legal Sparkle Icon */}
              <div className="pl-2 sm:pl-3 text-[#205C43] shrink-0">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#205C43]" />
              </div>

              {/* Text Input */}
              <textarea
                ref={inputRef}
                id="intake-query-input"
                name="query"
                rows={1}
                value={effectiveInputText}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder || textStrings.defaultPlaceholder}
                aria-label={placeholder || textStrings.defaultPlaceholder}
                disabled={phase !== "idle"}
                className="mo-input-field flex-1 bg-transparent text-xs sm:text-sm text-[#202824] placeholder-[#69736D]/70 resize-none outline-none py-2 px-1 max-h-40 leading-relaxed font-sans"
              />

              {/* Action Buttons: Voice Mic & Launch Send */}
              <div className="flex items-center gap-1.5 pr-1 shrink-0">
                {/* Voice Mic Slot (Browser-native Web Speech STT) */}
                {voiceMicSlot}

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={!effectiveInputText.trim() || phase !== "idle"}
                  aria-label={textStrings.sendAria}
                  className={`p-2.5 rounded-full font-semibold transition-all shrink-0 ${
                    effectiveInputText.trim() && phase === "idle"
                      ? "bg-[#205C43] text-white hover:bg-[#174530] shadow-sm cursor-pointer active:scale-95"
                      : "bg-[#D5E5D9]/40 text-[#69736D]/40 cursor-not-allowed"
                  }`}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </form>

          {/* Curated Suggested Inquiries inside Idle Pill */}
          {suggestedInquiries.length > 0 && phase === "idle" && (
            <div className="px-3 sm:px-4 pb-3 pt-1 border-t border-[#D5E5D9]/60 bg-gradient-to-b from-[#F8FAF9]/50 to-white">
              <p className="text-[10.5px] font-mono font-semibold text-[#69736D] mb-2 flex items-center gap-1">
                <HelpCircle className="w-3 h-3 text-[#205C43]" />
                <span>FREQUENT LEGAL TOPICS</span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {suggestedInquiries.slice(0, 4).map((sug, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (onChangeText) onChangeText(sug.prompt);
                      setInputText(sug.prompt);
                      if (inputRef.current) {
                        inputRef.current.focus();
                        setTimeout(() => adjustHeight(inputRef.current), 50);
                      }
                    }}
                    className="p-2 rounded-lg text-left bg-white hover:bg-[#EAF3ED] border border-[#D5E5D9] hover:border-[#205C43]/40 text-xs transition-colors group cursor-pointer shadow-2xs"
                  >
                    <div className="font-medium text-[#202824] group-hover:text-[#205C43] flex items-center justify-between">
                      <span className="truncate">{sug.title}</span>
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#205C43]" />
                    </div>
                    <p className="text-[11px] text-[#69736D] line-clamp-1 mt-0.5">
                      {sug.category}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ====================================================================
            PHASE 2: FLIGHT TRAIL
            ==================================================================== */}
        {phase === "launch" && (
          <div className="mo-flight-stage">
            {[...Array(12)].map((_, i) => (
              <span
                key={i}
                className="mo-trail-particle"
                style={{
                  width: `${6 + (i % 4) * 3}px`,
                  height: `${6 + (i % 4) * 3}px`,
                  left: `${46 + (Math.sin(i * 1.5) * 16)}%`,
                  top: `${140 - i * 10}px`,
                  animationDelay: `${i * 0.05}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* ====================================================================
            PHASE 3, 4, 5: 3D DOTTED CANVAS ORB & THINKING STATUS
            ==================================================================== */}
        {isOrbActive && (
          <div
            className={`mo-orb-stage ${
              phase === "condense" ? "mo-condensing" : ""
            }`}
          >
            {/* Ambient Radial Halo */}
            <div className="mo-orb-halo" />

            {/* Canvas 3D Dotted Rotating Sphere */}
            <canvas ref={canvasRef} className="mo-orb-canvas" />

            {/* Cycling Thinking Status Labels */}
            <div className="mo-status-container">
              <span className="mo-status-badge">
                <span className="w-1.5 h-1.5 rounded-full bg-[#205C43] animate-pulse" />
                <span>{textStrings.phaseBadge}</span>
              </span>

              <p className="mo-status-label mo-status-shimmer">
                {textStrings.thinkingSteps[thinkingStep]}
              </p>

              {/* Stop Generation Button */}
              {phase === "think" && (
                <button
                  type="button"
                  onClick={handleStop}
                  className="mt-2 px-3 py-1.5 rounded-full bg-white hover:bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  aria-label={textStrings.stopAria}
                >
                  <Square className="w-3 h-3 fill-current text-rose-600" />
                  <span>{isHindi ? "रोकें" : "Stop"}</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* ====================================================================
            PHASE 6, 7: UNFOLDING ANSWER CARD
            ==================================================================== */}
        {(phase === "unfold" || phase === "answered") && (
          <div className="mo-answer-card">
            {/* Header */}
            <div className="mo-card-header">
              <div className="space-y-0.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EAF3ED] border border-[#D5E5D9] text-[10.5px] font-mono font-semibold text-[#205C43]">
                  <Check className="w-3 h-3 text-[#205C43]" />
                  <span>{textStrings.phaseBadge}</span>
                </div>
                <h2 className="text-base sm:text-lg font-serif font-semibold text-[#174530]">
                  {textStrings.assessmentTitle}
                </h2>
                <p className="text-xs text-[#69736D]">
                  {textStrings.assessmentSubtitle}
                </p>
              </div>

              {/* Actions Header Toolbar */}
              <div className="flex items-center gap-2">
                {/* Voice Read-Aloud Slot */}
                {voicePlaybackSlot && finalAnswer && (
                  <div className="shrink-0">{voicePlaybackSlot(finalAnswer)}</div>
                )}

                {/* Copy Answer */}
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-2.5 py-1 rounded-md bg-white hover:bg-[#EAF3ED] border border-[#D5E5D9] text-[#205C43] text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                  title={textStrings.copyAnswer}
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>{textStrings.copied}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-[#205C43]" />
                      <span>{textStrings.copyAnswer}</span>
                    </>
                  )}
                </button>

                {/* New Question / Reset */}
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-2.5 py-1 rounded-md bg-[#205C43] hover:bg-[#174530] text-white text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{textStrings.newQuestion}</span>
                </button>
              </div>
            </div>

            {/* User Inquiry Banner */}
            {activeQuestion && (
              <div className="px-6 py-2.5 bg-[#F8FAF9] border-b border-[#EAF3ED] flex items-start gap-2 text-xs">
                <span className="font-semibold text-[#205C43] shrink-0 font-mono">
                  {textStrings.yourInquiry}:
                </span>
                <p className="text-[#202824] italic font-medium leading-relaxed">
                  &ldquo;{activeQuestion}&rdquo;
                </p>
              </div>
            )}

            {/* Grounded Statutory Source Registry References */}
            {retrievedSources && retrievedSources.length > 0 ? (
              <div className="px-6 py-3 bg-[#F8FAF9] border-b border-[#D5E5D9] space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-[#205C43]">
                  <BookOpen className="w-3.5 h-3.5 text-[#205C43]" />
                  <span>
                    {isHindi
                      ? "सत्यापित संविधिक स्रोत (आधिकारिक India Code संदर्भ):"
                      : "Verified Statutory References (Official India Code):"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 pt-0.5">
                  {retrievedSources.map((src) => (
                    <a
                      key={src.id}
                      href={src.officialSourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-[#D5E5D9] text-[#205C43] hover:border-[#205C43] hover:bg-[#EAF3ED] font-medium transition-colors shadow-2xs"
                      title={`${src.provisionTitle} — ${src.sourcePublisher || "Government of India"}`}
                    >
                      <span className="font-semibold">{src.actShortName}</span>
                      <span className="text-[#69736D]">• {src.section}</span>
                      <ExternalLink className="w-3 h-3 text-[#205C43]/70" />
                    </a>
                  ))}
                </div>
              </div>
            ) : (
              <div className="px-6 py-2 bg-[#FFFDF7] border-b border-[#E8DCC0] flex items-center gap-2 text-xs text-[#7A5E1A]">
                <HelpCircle className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
                <span>
                  {isHindi
                    ? "सामान्य भारतीय विधिक मार्गदर्शन। महत्वपूर्ण विवरणों का किसी योग्य अधिवक्ता से सत्यापन अवश्य करें।"
                    : "General Indian legal orientation. Verify important details with a qualified advocate."}
                </span>
              </div>
            )}

            {/* Answer Content Body with Formatted Markdown */}
            <div className="mo-card-body">
              {finalAnswer ? (
                <div className="mo-word-reveal space-y-3">
                  <FormattedMarkdown content={finalAnswer} />
                </div>
              ) : (
                <div className="py-6 text-center text-[#69736D] text-xs font-mono animate-pulse">
                  {textStrings.thinkingSteps[0]}
                </div>
              )}
            </div>

            {/* Structured Facts Extraction & Confirmation: What I Understood */}
            {finalAnswer && activeQuestion && (
              <div className="px-5 sm:px-6 py-4 border-t border-[#D5E5D9]/60 bg-[#FDFEFC]">
                <WhatIUnderstoodCard
                  inquiryText={activeQuestion}
                  answerText={finalAnswer}
                  jurisdiction={jurisdictionLabel || "All India"}
                  isHindi={isHindi ?? false}
                  factsData={factsData}
                  onConfirmFacts={onConfirmFacts}
                />
              </div>
            )}

            {/* Conversation History Drawer (Multi-turn) */}
            {conversationHistory.length > 2 && (
              <div className="px-6 py-2 border-t border-[#D5E5D9]/60 bg-[#F8FAF9]/80">
                <button
                  type="button"
                  onClick={() => setShowHistory((prev) => !prev)}
                  className="w-full flex items-center justify-between text-xs text-[#205C43] font-medium py-1 hover:underline cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#205C43]" />
                    <span>{textStrings.historyToggle(conversationHistory.length)}</span>
                  </span>
                  {showHistory ? (
                    <ChevronUp className="w-4 h-4 text-[#205C43]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#205C43]" />
                  )}
                </button>

                {showHistory && (
                  <div className="mt-2 space-y-2 pb-2 max-h-60 overflow-y-auto pr-1">
                    {conversationHistory.map((msg, i) => (
                      <div
                        key={msg.id || i}
                        className={`p-2.5 rounded-lg text-xs leading-relaxed ${
                          msg.role === "user"
                            ? "bg-[#EAF3ED] text-[#174530] font-medium"
                            : "bg-white border border-[#D5E5D9] text-[#202824]"
                        }`}
                      >
                        <span className="font-mono text-[10.5px] uppercase block text-[#69736D] mb-1">
                          {msg.role === "user" ? "Inquiry" : "Orientation"}
                        </span>
                        <div className="line-clamp-3">{msg.content}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Follow-up Question Input Composer */}
            <div className="p-4 bg-gradient-to-t from-[#F8FAF9] to-white border-t border-[#D5E5D9]">
              <form onSubmit={handleFollowUpSubmit} className="flex items-end gap-2">
                <textarea
                  ref={followUpInputRef}
                  id="intake-followup-input"
                  name="followup"
                  rows={1}
                  value={followUpText}
                  onChange={handleFollowUpChange}
                  onKeyDown={handleFollowUpKeyDown}
                  placeholder={textStrings.followUpPlaceholder}
                  aria-label={textStrings.followUpPlaceholder}
                  className="flex-1 bg-white border border-[#D5E5D9] focus:border-[#205C43] rounded-xl text-xs sm:text-sm text-[#202824] placeholder-[#69736D]/70 py-2 px-3 resize-none outline-none shadow-2xs leading-relaxed"
                />
                <button
                  type="submit"
                  disabled={!followUpText.trim()}
                  className={`p-2.5 rounded-xl font-semibold transition-all shrink-0 ${
                    followUpText.trim()
                      ? "bg-[#205C43] text-white hover:bg-[#174530] shadow-xs cursor-pointer active:scale-95"
                      : "bg-[#D5E5D9]/40 text-[#69736D]/40 cursor-not-allowed"
                  }`}
                  aria-label={textStrings.sendAria}
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

              {/* Disclaimer */}
              <p className="mt-2 text-[10.5px] text-[#69736D] text-center select-none">
                {textStrings.disclaimer}
              </p>
            </div>
          </div>
        )}

        {/* ====================================================================
            ERROR CARD & RETRY ACTION
            ==================================================================== */}
        {error && phase === "idle" && (
          <div className="w-full max-w-2xl mt-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-3 shadow-2xs mo-shake">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              <p className="font-semibold text-rose-950">
                {textStrings.errorTitle}
              </p>
              <p className="text-rose-800 font-mono text-[11px] leading-relaxed">
                {error}
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1.5">
                {onRetry && (
                  <button
                    type="button"
                    onClick={onRetry}
                    className="text-xs text-[#205C43] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{textStrings.retry}</span>
                  </button>
                )}
                {activeQuestion && (
                  <button
                    type="button"
                    onClick={() => {
                      setInputText(activeQuestion);
                      if (inputRef.current) inputRef.current.focus();
                    }}
                    className="text-xs text-[#69736D] hover:text-[#202824] hover:underline cursor-pointer"
                  >
                    {textStrings.restore}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
