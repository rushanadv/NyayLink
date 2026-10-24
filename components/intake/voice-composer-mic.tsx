"use client";

import React from "react";
import {
  Mic,
  MicOff,
  Check,
  X,
  AlertCircle,
  Loader2,
  Globe,
  Info,
  Edit3,
} from "lucide-react";
import {
  SpeechLanguage,
  SpeechRecognitionStatus,
  SpeechRecognitionError,
} from "@/lib/intake/voice-types";
import { getVoiceStrings } from "@/lib/intake/voice-localization";

export interface VoiceComposerRibbonProps {
  isHindi: boolean;
  status: SpeechRecognitionStatus;
  error: SpeechRecognitionError | null;
  speechLanguage: SpeechLanguage;
  recordingDuration: number;
  interimPreview: string;
  showPrivacyNotice: boolean;
  onFinish: () => void;
  onCancel: () => void;
  onToggleLanguage: (lang: SpeechLanguage) => void;
  onClearError: () => void;
  onDismissPrivacy: () => void;
}

export interface VoiceComposerMicButtonProps {
  isHindi: boolean;
  isSupported: boolean;
  status: SpeechRecognitionStatus;
  disabled?: boolean;
  onStart: () => void;
  onFinish: () => void;
}

// Format recording timer: mm:ss
function formatTime(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

/**
 * Top ribbon showing privacy disclosure, errors, and active recording bar with timer & language switcher.
 */
export function VoiceComposerRibbon({
  isHindi,
  status,
  error,
  speechLanguage,
  recordingDuration,
  interimPreview,
  showPrivacyNotice,
  onFinish,
  onCancel,
  onToggleLanguage,
  onClearError,
  onDismissPrivacy,
}: VoiceComposerRibbonProps) {
  const t = getVoiceStrings(isHindi);

  const isListening = status === "listening";
  const isStarting = status === "starting";
  const isProcessing = status === "processing";
  const isRecordingActive = isListening || isStarting || isProcessing;

  if (!showPrivacyNotice && !error && !isRecordingActive) {
    return null;
  }

  return (
    <div className="space-y-2">
      {/* Privacy Notice Tooltip / Banner */}
      {showPrivacyNotice && !isRecordingActive && (
        <div className="p-2.5 rounded-lg bg-[#EAF3ED] border border-[#D5E5D9] text-xs text-[#205C43] flex items-start justify-between gap-2 shadow-2xs animate-fadeIn">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-[#205C43] shrink-0 mt-0.5" />
            <div className="space-y-0.5 text-[11px] leading-relaxed">
              <span className="font-semibold block">{t.privacyNoticeTitle}</span>
              <p className="text-[#3A5243]">{t.privacyNoticeText}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onDismissPrivacy}
            className="text-[10.5px] px-2 py-0.5 rounded bg-white hover:bg-[#D5E5D9] text-[#205C43] font-medium transition-colors border border-[#D5E5D9] shrink-0 cursor-pointer"
          >
            {t.privacyNoticeDismiss}
          </button>
        </div>
      )}

      {/* Voice Recognition Error Notification Bar */}
      {error && !isRecordingActive && (
        <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start justify-between gap-2 shadow-2xs">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5 text-[11px]">
              <span className="font-semibold block text-rose-950">
                {t.errorGeneral}
              </span>
              <p className="text-rose-800 leading-relaxed">{error.message}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={onClearError}
              className="p-1 rounded text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
              title={t.errorDismiss}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Active Recording Ribbon */}
      {isRecordingActive && (
        <div className="p-2.5 rounded-xl bg-gradient-to-r from-[#F0F7F2] via-white to-[#F0F7F2] border border-[#205C43]/30 shadow-xs space-y-2 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            {/* Status & Audio Wave indicator */}
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
              </span>
              <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-[#205C43]">
                <span>{formatTime(recordingDuration)}</span>
                <span className="text-[#69736D]">•</span>
                <span className="font-sans font-medium text-[11px] text-[#202824]">
                  {isStarting
                    ? t.micStarting
                    : isProcessing
                    ? t.micProcessing
                    : t.micListening}
                </span>
              </div>
            </div>

            {/* Speech Language Override Toggle */}
            <div className="flex items-center gap-1 bg-white border border-[#D5E5D9] rounded-lg p-0.5 shadow-2xs">
              <Globe className="w-3 h-3 text-[#205C43] ml-1.5 shrink-0" />
              <button
                type="button"
                onClick={() => onToggleLanguage("hi-IN")}
                className={`px-2 py-0.5 rounded text-[10.5px] font-medium transition-colors cursor-pointer ${
                  speechLanguage === "hi-IN"
                    ? "bg-[#205C43] text-white shadow-2xs font-semibold"
                    : "text-[#69736D] hover:text-[#202824]"
                }`}
                title="हिंदी में बोलें (Hindi speech recognition)"
              >
                हिं (hi-IN)
              </button>
              <button
                type="button"
                onClick={() => onToggleLanguage("en-IN")}
                className={`px-2 py-0.5 rounded text-[10.5px] font-medium transition-colors cursor-pointer ${
                  speechLanguage === "en-IN"
                    ? "bg-[#205C43] text-white shadow-2xs font-semibold"
                    : "text-[#69736D] hover:text-[#202824]"
                }`}
                title="Speak in Indian English (en-IN)"
              >
                EN (en-IN)
              </button>
            </div>

            {/* Action Buttons: Finish & Cancel */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onFinish}
                className="px-2.5 py-1 rounded-lg bg-[#205C43] hover:bg-[#174530] text-white text-[11px] font-semibold flex items-center gap-1 transition-all shadow-xs cursor-pointer active:scale-95"
                title={t.micFinish}
              >
                <Check className="w-3.5 h-3.5" />
                <span>{t.micFinish}</span>
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="px-2 py-1 rounded-lg bg-white hover:bg-rose-50 border border-[#D5E5D9] hover:border-rose-300 text-rose-700 text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                title={t.micCancel}
              >
                <X className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.micCancel}</span>
              </button>
            </div>
          </div>

          {/* Live Interim Speech Preview Snippet */}
          {interimPreview && (
            <div className="pt-1.5 border-t border-[#D5E5D9]/60 text-[11px] text-[#205C43] italic font-sans flex items-center gap-1.5 truncate">
              <span className="text-[#69736D] font-mono text-[9.5px] uppercase not-italic font-semibold">
                Live:
              </span>
              <span className="truncate">&ldquo;{interimPreview}&rdquo;</span>
            </div>
          )}

          {/* Helpful Review & Editing Reminder */}
          <div className="pt-1 border-t border-[#D5E5D9]/40 flex items-center gap-1.5 text-[10px] text-[#69736D]">
            <Edit3 className="w-3 h-3 text-[#205C43] shrink-0" />
            <span>{t.micEditingHint}</span>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Modern accessible microphone button embedded directly beside message composer actions.
 */
export function VoiceComposerMicButton({
  isHindi,
  isSupported,
  status,
  disabled = false,
  onStart,
  onFinish,
}: VoiceComposerMicButtonProps) {
  const t = getVoiceStrings(isHindi);

  const isListening = status === "listening";
  const isStarting = status === "starting";
  const isProcessing = status === "processing";
  const isRecordingActive = isListening || isStarting || isProcessing;

  return (
    <button
      type="button"
      onClick={isRecordingActive ? onFinish : onStart}
      disabled={disabled || !isSupported}
      aria-label={t.micButtonAriaLabel}
      title={!isSupported ? t.errorUnsupported : t.micButtonTooltip}
      className={`p-2.5 rounded-lg transition-all flex items-center justify-center shrink-0 cursor-pointer ${
        !isSupported
          ? "bg-[#F3F5F4] text-[#9AA39E] cursor-not-allowed border border-[#D5E5D9]"
          : isRecordingActive
          ? "bg-rose-50 text-rose-600 border border-rose-300 ring-2 ring-rose-200 animate-pulse active:scale-95 shadow-xs"
          : "bg-white hover:bg-[#EAF3ED] text-[#205C43] hover:text-[#174530] border border-[#D5E5D9] shadow-2xs active:scale-95 focus-visible:ring-2 focus-visible:ring-[#205C43]"
      }`}
    >
      {isStarting || isProcessing ? (
        <Loader2 className="w-4 h-4 animate-spin text-[#205C43]" />
      ) : isListening ? (
        <MicOff className="w-4 h-4 text-rose-600" />
      ) : (
        <Mic className="w-4 h-4 text-[#205C43]" />
      )}
    </button>
  );
}
