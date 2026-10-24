"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { VoicePlaybackState } from "./voice-types";
import { markdownToPlainText } from "@/components/intake/formatted-markdown";

interface UseSpeechSynthesisOptions {
  isHindi: boolean;
}

/**
 * Splits plain text into digestible speech chunks (~120-180 chars)
 * aligned to sentence and paragraph boundaries (including Hindi Purna Viram '।').
 */
export function chunkTextForSpeech(text: string): string[] {
  if (!text || !text.trim()) return [];

  // Normalize newlines and whitespace
  const normalized = text.replace(/\r\n/g, "\n").trim();
  const paragraphs = normalized.split(/\n\s*\n/);
  const chunks: string[] = [];

  for (const para of paragraphs) {
    const cleanPara = para.trim();
    if (!cleanPara) continue;

    // If paragraph is short, keep as single chunk
    if (cleanPara.length <= 160) {
      chunks.push(cleanPara);
      continue;
    }

    // Split paragraph by sentence boundaries: . ! ? or Hindi । followed by space or end
    const sentences = cleanPara.split(/([.!?।]\s+)/);
    let currentChunk = "";

    for (let i = 0; i < sentences.length; i++) {
      const part = sentences[i];
      if (!part) continue;

      if ((currentChunk + part).length <= 180) {
        currentChunk += part;
      } else {
        if (currentChunk.trim()) {
          chunks.push(currentChunk.trim());
        }
        // If single sentence is very long, break by comma or space
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

    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }
  }

  return chunks.filter((c) => c.length > 0);
}

export function useSpeechSynthesis({ isHindi }: UseSpeechSynthesisOptions) {
  const [isSupported, setIsSupported] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string | null>(null);

  const [playbackState, setPlaybackState] = useState<VoicePlaybackState>({
    isPlaying: false,
    isPaused: false,
    isLoading: false,
    currentMessageId: null,
    currentChunk: 0,
    totalChunks: 0,
    hasDeviceHindiVoice: false,
    hasDeviceEnglishVoice: false,
    activeVoiceName: null,
  });

  // Internal playback management references
  const chunksRef = useRef<string[]>([]);
  const currentChunkIndexRef = useRef(0);
  const currentMessageIdRef = useRef<string | null>(null);
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const watchdogIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isStoppingRef = useRef(false);

  // Check support and load voices asynchronously
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        setAvailableVoices(voices);

        const hasHindi = voices.some(
          (v) =>
            v.lang.toLowerCase().startsWith("hi") ||
            v.name.toLowerCase().includes("hindi")
        );
        const hasIndianEn = voices.some(
          (v) =>
            v.lang.toLowerCase() === "en-in" ||
            v.name.toLowerCase().includes("india")
        );

        setPlaybackState((prev) => ({
          ...prev,
          hasDeviceHindiVoice: hasHindi,
          hasDeviceEnglishVoice: hasIndianEn,
        }));
      }
    };

    loadVoices();

    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Stop Chromium watchdog keepalive
  const stopWatchdog = useCallback(() => {
    if (watchdogIntervalRef.current) {
      clearInterval(watchdogIntervalRef.current);
      watchdogIntervalRef.current = null;
    }
  }, []);

  // Start Chromium keepalive (avoids 15-second speech synthesis engine freeze)
  const startWatchdog = useCallback(() => {
    stopWatchdog();
    watchdogIntervalRef.current = setInterval(() => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }
      }
    }, 12000);
  }, [stopWatchdog]);

  // Determine language of the text (Devanagari vs English)
  const detectLanguageOfText = useCallback(
    (text: string): "hi-IN" | "en-IN" => {
      const hasDevanagari = /[\u0900-\u097F]/.test(text);
      if (hasDevanagari) return "hi-IN";
      if (isHindi) return "hi-IN";
      return "en-IN";
    },
    [isHindi]
  );

  // Pick best voice for target language
  const getBestVoiceForLanguage = useCallback(
    (targetLang: "hi-IN" | "en-IN") => {
      if (availableVoices.length === 0) return null;

      // 1. If user explicitly selected a voice in dropdown, respect it
      if (selectedVoiceURI) {
        const custom = availableVoices.find((v) => v.voiceURI === selectedVoiceURI);
        if (custom) return custom;
      }

      if (targetLang === "hi-IN") {
        // Look for exact hi-IN match first (e.g. Lekha or Google हिन्दी)
        const exact = availableVoices.find((v) => v.lang.toLowerCase() === "hi-in");
        if (exact) return exact;

        // Look for any Hindi dialect
        const anyHi = availableVoices.find(
          (v) =>
            v.lang.toLowerCase().startsWith("hi") ||
            v.name.toLowerCase().includes("hindi")
        );
        if (anyHi) return anyHi;
      } else {
        // Look for Indian English (e.g. Rishi or Google Indian English)
        const exactEnIn = availableVoices.find((v) => v.lang.toLowerCase() === "en-in");
        if (exactEnIn) return exactEnIn;

        const anyEnIn = availableVoices.find(
          (v) =>
            v.lang.toLowerCase().startsWith("en") &&
            (v.lang.toLowerCase().includes("in") || v.name.toLowerCase().includes("india"))
        );
        if (anyEnIn) return anyEnIn;

        // Fallback to default or any English
        const anyEn = availableVoices.find((v) => v.lang.toLowerCase().startsWith("en"));
        if (anyEn) return anyEn;
      }

      // Default fallback
      return availableVoices.find((v) => v.default) || availableVoices[0] || null;
    },
    [availableVoices, selectedVoiceURI]
  );

  // Stop playback cleanly
  const stop = useCallback(() => {
    isStoppingRef.current = true;
    stopWatchdog();

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    chunksRef.current = [];
    currentChunkIndexRef.current = 0;
    currentMessageIdRef.current = null;
    activeUtteranceRef.current = null;

    setPlaybackState((prev) => ({
      ...prev,
      isPlaying: false,
      isPaused: false,
      isLoading: false,
      currentMessageId: null,
      currentChunk: 0,
      totalChunks: 0,
      activeVoiceName: null,
    }));
  }, [stopWatchdog]);

  // Play next chunk in sequence
  const speakNextChunk = useCallback(() => {
    if (isStoppingRef.current) return;
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const chunks = chunksRef.current;
    const index = currentChunkIndexRef.current;

    if (index >= chunks.length) {
      // Completed all chunks cleanly
      stop();
      return;
    }

    const chunkText = chunks[index];
    const targetLang = detectLanguageOfText(chunkText);
    const chosenVoice = getBestVoiceForLanguage(targetLang);

    const utterance = new SpeechSynthesisUtterance(chunkText);
    utterance.lang = targetLang;
    if (chosenVoice) {
      utterance.voice = chosenVoice;
    }

    // Set voice rate and pitch for calm legal read-aloud
    utterance.rate = targetLang === "hi-IN" ? 0.95 : 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setPlaybackState((prev) => ({
        ...prev,
        isPlaying: true,
        isPaused: false,
        isLoading: false,
        currentChunk: index + 1,
        totalChunks: chunks.length,
        activeVoiceName: chosenVoice?.name || null,
      }));
      startWatchdog();
    };

    utterance.onend = () => {
      if (isStoppingRef.current) return;
      currentChunkIndexRef.current += 1;
      // Continue to next chunk
      speakNextChunk();
    };

    utterance.onerror = (e) => {
      // Ignore user-initiated cancellation aborts
      if (e.error === "canceled" || e.error === "interrupted") {
        return;
      }
      console.warn("Speech synthesis chunk error:", e);
      // Try advancing to next chunk rather than crashing
      currentChunkIndexRef.current += 1;
      speakNextChunk();
    };

    activeUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [detectLanguageOfText, getBestVoiceForLanguage, startWatchdog, stop]);

  // Start Playing Message
  const play = useCallback(
    (messageId: string, rawMarkdown: string) => {
      if (!isSupported) return;

      // If already playing this message, ignore or toggle
      if (playbackState.isPlaying && playbackState.currentMessageId === messageId) {
        return;
      }

      // Stop any existing playback first
      stop();
      isStoppingRef.current = false;

      setPlaybackState((prev) => ({
        ...prev,
        isLoading: true,
        currentMessageId: messageId,
      }));

      // Strip markdown for clean voice output
      const plainText = markdownToPlainText(rawMarkdown);
      const chunks = chunkTextForSpeech(plainText);

      if (chunks.length === 0) {
        setPlaybackState((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      chunksRef.current = chunks;
      currentChunkIndexRef.current = 0;
      currentMessageIdRef.current = messageId;

      // Small tick to ensure previous cancellation settled
      setTimeout(() => {
        speakNextChunk();
      }, 50);
    },
    [isSupported, playbackState.isPlaying, playbackState.currentMessageId, stop, speakNextChunk]
  );

  // Pause Playback
  const pause = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        window.speechSynthesis.pause();
        stopWatchdog();
        setPlaybackState((prev) => ({
          ...prev,
          isPlaying: false,
          isPaused: true,
        }));
      }
    }
  }, [stopWatchdog]);

  // Resume Playback
  const resume = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        startWatchdog();
        setPlaybackState((prev) => ({
          ...prev,
          isPlaying: true,
          isPaused: false,
        }));
      }
    }
  }, [startWatchdog]);

  // Voice override picker
  const setVoiceURI = useCallback((uri: string | null) => {
    setSelectedVoiceURI(uri);
  }, []);

  return {
    isSupported,
    playbackState,
    availableVoices,
    selectedVoiceURI,
    play,
    pause,
    resume,
    stop,
    setVoiceURI,
    detectLanguageOfText,
  };
}
