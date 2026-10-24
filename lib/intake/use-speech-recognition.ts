"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  IWindowSpeechRecognition,
  ISpeechRecognitionEvent,
  ISpeechRecognitionErrorEvent,
  SpeechLanguage,
  SpeechRecognitionStatus,
  SpeechRecognitionError,
} from "./voice-types";
import { getVoiceStrings } from "./voice-localization";

const PRIVACY_DISMISSED_KEY = "nyaylink_voice_privacy_dismissed";

interface UseSpeechRecognitionOptions {
  isHindi: boolean;
  onTranscriptUpdate?: (newCombinedText: string) => void;
  onSessionComplete?: (finalText: string) => void;
}

export function useSpeechRecognition({
  isHindi,
  onTranscriptUpdate,
  onSessionComplete,
}: UseSpeechRecognitionOptions) {
  const [isSupported, setIsSupported] = useState(false);
  const [status, setStatus] = useState<SpeechRecognitionStatus>("idle");
  const [error, setError] = useState<SpeechRecognitionError | null>(null);
  const [speechLanguage, setSpeechLanguage] = useState<SpeechLanguage>(
    isHindi ? "hi-IN" : "en-IN"
  );
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [interimPreview, setInterimPreview] = useState("");
  const [showPrivacyNotice, setShowPrivacyNotice] = useState(false);

  // References to preserve state across recognition events
  const recognitionRef = useRef<IWindowSpeechRecognition | null>(null);
  const isManuallyStoppingRef = useRef(false);
  const isCancelledRef = useRef(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const restartCountRef = useRef(0);
  const baseTextRef = useRef("");
  const sessionTranscriptRef = useRef("");

  const t = getVoiceStrings(isHindi);

  // Sync default speech language with app locale unless user manually toggled it
  const hasUserOverriddenLangRef = useRef(false);
  useEffect(() => {
    if (!hasUserOverriddenLangRef.current) {
      setSpeechLanguage(isHindi ? "hi-IN" : "en-IN");
    }
  }, [isHindi]);

  // Check browser support and privacy banner status on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRec =
      (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;

    setIsSupported(Boolean(SpeechRec));

    try {
      const dismissed = localStorage.getItem(PRIVACY_DISMISSED_KEY);
      setShowPrivacyNotice(!dismissed);
    } catch {
      setShowPrivacyNotice(true);
    }
  }, []);

  // Dismiss privacy notice
  const dismissPrivacyNotice = useCallback(() => {
    setShowPrivacyNotice(false);
    try {
      localStorage.setItem(PRIVACY_DISMISSED_KEY, "true");
    } catch {}
  }, []);

  // Timer helpers
  const startTimer = useCallback(() => {
    setRecordingDuration(0);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = setInterval(() => {
      setRecordingDuration((prev) => prev + 1);
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  // Manual language toggle
  const setLanguageOverride = useCallback((lang: SpeechLanguage) => {
    hasUserOverriddenLangRef.current = true;
    setSpeechLanguage(lang);
    if (recognitionRef.current && status === "listening") {
      recognitionRef.current.lang = lang;
    }
  }, [status]);

  // Clean error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Map browser speech recognition error to user-friendly translated text
  const mapError = useCallback(
    (errEvent: ISpeechRecognitionErrorEvent): SpeechRecognitionError => {
      const code = errEvent.error || "unknown";
      let message = t.errorGeneral;

      switch (code) {
        case "not-allowed":
        case "service-not-allowed":
          message = `${t.errorPermissionDenied} ${t.errorPermissionDeniedHelp}`;
          break;
        case "no-speech":
          message = t.errorNoSpeech;
          break;
        case "network":
          message = t.errorNetwork;
          break;
        case "audio-capture":
          message = t.errorAudioCapture;
          break;
        case "language-not-supported":
          message = `${speechLanguage} is not supported by your browser's speech engine.`;
          break;
        default:
          message = errEvent.message || t.errorGeneral;
          break;
      }

      return { code, message };
    },
    [t, speechLanguage]
  );

  // Initialize SpeechRecognition instance
  const initRecognition = useCallback(
    (lang: SpeechLanguage) => {
      if (typeof window === "undefined") return null;

      const SpeechRec = (
        (window as unknown as { SpeechRecognition?: new () => IWindowSpeechRecognition }).SpeechRecognition ||
        (window as unknown as { webkitSpeechRecognition?: new () => IWindowSpeechRecognition }).webkitSpeechRecognition
      );

      if (!SpeechRec) return null;

      const recognition = new SpeechRec();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = lang;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setStatus("listening");
        setError(null);
        startTimer();
      };

      recognition.onresult = (event: ISpeechRecognitionEvent) => {
        let interimText = "";
        let finalBatch = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptChunk = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalBatch += transcriptChunk + " ";
          } else {
            interimText += transcriptChunk;
          }
        }

        if (finalBatch) {
          sessionTranscriptRef.current += finalBatch;
        }

        const currentSessionText = (sessionTranscriptRef.current + interimText).trim();
        setInterimPreview(interimText.trim());

        // Combine baseText with current session transcript without erasing existing typed words
        const prefix = baseTextRef.current;
        const separator = prefix.length > 0 && !prefix.endsWith(" ") ? " " : "";
        const combined = prefix + (currentSessionText ? separator + currentSessionText : "");

        if (onTranscriptUpdate) {
          onTranscriptUpdate(combined);
        }
      };

      recognition.onerror = (event: ISpeechRecognitionErrorEvent) => {
        // Abort errors during deliberate stop or cancel are expected
        if (isCancelledRef.current || isManuallyStoppingRef.current) {
          return;
        }

        const mapped = mapError(event);
        setError(mapped);
        setStatus("error");
        stopTimer();
      };

      recognition.onend = () => {
        stopTimer();

        // If user cancelled, discard this session's transcripts
        if (isCancelledRef.current) {
          if (onTranscriptUpdate) {
            onTranscriptUpdate(baseTextRef.current);
          }
          setStatus("idle");
          setInterimPreview("");
          sessionTranscriptRef.current = "";
          return;
        }

        // If manually stopped by user, finalize
        if (isManuallyStoppingRef.current) {
          setStatus("idle");
          setInterimPreview("");
          const prefix = baseTextRef.current;
          const separator = prefix.length > 0 && !prefix.endsWith(" ") ? " " : "";
          const finalTotal = (prefix + (sessionTranscriptRef.current ? separator + sessionTranscriptRef.current : "")).trim();
          
          if (onTranscriptUpdate) {
            onTranscriptUpdate(finalTotal);
          }
          if (onSessionComplete) {
            onSessionComplete(finalTotal);
          }
          sessionTranscriptRef.current = "";
          return;
        }

        // Automatic silence restart safeguard (max 2 restarts with backoff)
        if (status === "listening" && restartCountRef.current < 2) {
          restartCountRef.current += 1;
          try {
            recognition.start();
            return;
          } catch {
            // Ignore restart failure and fall through to idle
          }
        }

        setStatus("idle");
        setInterimPreview("");
      };

      return recognition;
    },
    [mapError, onTranscriptUpdate, onSessionComplete, startTimer, stopTimer, status]
  );

  // Start Voice Dictation
  const startListening = useCallback(
    (existingInputText = "") => {
      if (!isSupported) {
        setError({
          code: "not-supported",
          message: t.errorUnsupported,
        });
        setStatus("error");
        return;
      }

      // Prevent starting if already active
      if (status === "listening" || status === "starting") return;

      clearError();
      setStatus("starting");
      isManuallyStoppingRef.current = false;
      isCancelledRef.current = false;
      restartCountRef.current = 0;
      sessionTranscriptRef.current = "";
      setInterimPreview("");

      // Preserve existing typed text
      baseTextRef.current = existingInputText;

      try {
        if (recognitionRef.current) {
          recognitionRef.current.abort();
        }

        const recognition = initRecognition(speechLanguage);
        if (!recognition) {
          throw new Error("Speech recognition initialization failed");
        }

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : t.errorGeneral;
        setError({ code: "start-failed", message: msg });
        setStatus("error");
        stopTimer();
      }
    },
    [isSupported, status, clearError, t, initRecognition, speechLanguage, stopTimer]
  );

  // Finish Recording (Saves transcript and focuses input)
  const finishListening = useCallback(() => {
    isManuallyStoppingRef.current = true;
    isCancelledRef.current = false;
    setStatus("processing");
    stopTimer();

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Recognition already stopped
        setStatus("idle");
      }
    } else {
      setStatus("idle");
    }
  }, [stopTimer]);

  // Cancel Recording (Discards this session's transcript)
  const cancelListening = useCallback(() => {
    isCancelledRef.current = true;
    isManuallyStoppingRef.current = false;
    stopTimer();

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
    }

    // Restore pre-session input text
    if (onTranscriptUpdate) {
      onTranscriptUpdate(baseTextRef.current);
    }

    setInterimPreview("");
    sessionTranscriptRef.current = "";
    setStatus("idle");
    clearError();
  }, [stopTimer, onTranscriptUpdate, clearError]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTimer();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
        recognitionRef.current = null;
      }
    };
  }, [stopTimer]);

  return {
    isSupported,
    status,
    error,
    speechLanguage,
    recordingDuration,
    interimPreview,
    showPrivacyNotice,
    isListening: status === "listening",
    isStarting: status === "starting",
    isProcessing: status === "processing",
    startListening,
    finishListening,
    cancelListening,
    setLanguageOverride,
    clearError,
    dismissPrivacyNotice,
  };
}
