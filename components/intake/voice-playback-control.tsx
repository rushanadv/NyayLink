"use client";

import React, { useState } from "react";
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square,
  Loader2,
  Settings2,
  AlertCircle,
} from "lucide-react";
import { VoicePlaybackState } from "@/lib/intake/voice-types";
import { getVoiceStrings } from "@/lib/intake/voice-localization";

interface VoicePlaybackControlProps {
  messageId: string;
  content: string;
  isHindi: boolean;
  isSupported: boolean;
  playbackState: VoicePlaybackState;
  availableVoices: SpeechSynthesisVoice[];
  selectedVoiceURI: string | null;
  onPlay: (messageId: string, content: string) => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onSelectVoice: (voiceURI: string | null) => void;
}

export function VoicePlaybackControl({
  messageId,
  content,
  isHindi,
  isSupported,
  playbackState,
  availableVoices,
  selectedVoiceURI,
  onPlay,
  onPause,
  onResume,
  onStop,
  onSelectVoice,
}: VoicePlaybackControlProps) {
  const [showVoicePicker, setShowVoicePicker] = useState(false);
  const t = getVoiceStrings(isHindi);

  if (!isSupported) {
    return null;
  }

  const isCurrentMessage = playbackState.currentMessageId === messageId;
  const isPlayingThis = isCurrentMessage && playbackState.isPlaying;
  const isPausedThis = isCurrentMessage && playbackState.isPaused;
  const isLoadingThis = isCurrentMessage && playbackState.isLoading;
  const isActiveThis = isPlayingThis || isPausedThis || isLoadingThis;

  // Filter voices relevant to the current language
  const isTextHindi = isHindi || /[\u0900-\u097F]/.test(content);
  const relevantVoices = availableVoices.filter((v) => {
    if (isTextHindi) {
      return (
        v.lang.toLowerCase().startsWith("hi") ||
        v.name.toLowerCase().includes("hindi")
      );
    } else {
      return (
        v.lang.toLowerCase().startsWith("en")
      );
    }
  });

  const hasMissingNativeHindiVoice = isTextHindi && !playbackState.hasDeviceHindiVoice;

  // When not active for this message: Idle "Listen to answer" button
  if (!isActiveThis) {
    return (
      <button
        type="button"
        onClick={() => onPlay(messageId, content)}
        className="px-2.5 py-1 rounded-md bg-white hover:bg-[#EAF3ED] border border-[#D5E5D9] text-[#205C43] hover:text-[#174530] text-[11px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs group"
        title={t.ttsListenTooltip}
      >
        <Volume2 className="w-3.5 h-3.5 text-[#205C43] group-hover:scale-110 transition-transform" />
        <span>{t.ttsListen}</span>
      </button>
    );
  }

  // When active for this message: Full responsive audio pill
  return (
    <div className="relative inline-flex items-center gap-1.5 p-1 rounded-lg bg-[#F0F7F2] border border-[#205C43]/40 shadow-xs text-xs animate-fadeIn">
      {/* Loading state spinner */}
      {isLoadingThis ? (
        <div className="flex items-center gap-1 px-2 py-0.5 text-[#205C43] font-medium text-[11px]">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>{t.ttsPlaying}</span>
        </div>
      ) : (
        <>
          {/* Audio Wave Indicator */}
          <div className="flex items-center gap-1 px-1.5">
            <span className="relative flex h-2 w-2">
              <span
                className={`inline-flex rounded-full h-2 w-2 ${
                  isPlayingThis ? "bg-[#205C43] animate-ping" : "bg-[#69736D]"
                }`}
              />
            </span>
            <span className="font-semibold text-[#205C43] text-[10.5px]">
              {isPlayingThis ? t.ttsPlaying : t.ttsPaused}
            </span>
          </div>

          {/* Progress Indicator (Chunk count) */}
          {playbackState.totalChunks > 1 && (
            <span className="px-1.5 py-0.5 rounded bg-white text-[#69736D] text-[10px] font-mono border border-[#D5E5D9]">
              {t.ttsPartIndicator(
                playbackState.currentChunk,
                playbackState.totalChunks
              )}
            </span>
          )}

          {/* Missing Hindi Voice Notice Tag */}
          {hasMissingNativeHindiVoice && (
            <span
              className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800 text-[9.5px]"
              title={t.ttsNoHindiVoiceNotice}
            >
              <AlertCircle className="w-2.5 h-2.5" />
              <span>Closest voice</span>
            </span>
          )}

          {/* Play / Pause Toggle Button */}
          {isPlayingThis ? (
            <button
              type="button"
              onClick={onPause}
              className="p-1 rounded hover:bg-white text-[#205C43] transition-colors cursor-pointer"
              title={t.ttsPause}
              aria-label={t.ttsPause}
            >
              <Pause className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onResume}
              className="p-1 rounded hover:bg-white text-[#205C43] transition-colors cursor-pointer"
              title={t.ttsResume}
              aria-label={t.ttsResume}
            >
              <Play className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Stop Button */}
          <button
            type="button"
            onClick={onStop}
            className="p-1 rounded hover:bg-rose-100 text-rose-700 transition-colors cursor-pointer"
            title={t.ttsStop}
            aria-label={t.ttsStop}
          >
            <Square className="w-3.5 h-3.5 fill-current" />
          </button>

          {/* Voice Selector Cog (if multiple voices available) */}
          {relevantVoices.length > 1 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowVoicePicker((prev) => !prev)}
                className="p-1 rounded hover:bg-white text-[#69736D] hover:text-[#202824] transition-colors cursor-pointer"
                title={t.ttsVoiceSelectorAria}
              >
                <Settings2 className="w-3.5 h-3.5" />
              </button>

              {showVoicePicker && (
                <div className="absolute right-0 bottom-full mb-1 w-52 p-2 rounded-xl bg-white border border-[#D5E5D9] shadow-lg z-30 space-y-1">
                  <span className="text-[10px] font-semibold text-[#69736D] uppercase block border-b border-[#D5E5D9] pb-1">
                    {t.ttsVoiceSelectorAria}
                  </span>
                  <div className="max-h-36 overflow-y-auto space-y-0.5">
                    {relevantVoices.map((voice) => (
                      <button
                        key={voice.voiceURI}
                        type="button"
                        onClick={() => {
                          onSelectVoice(voice.voiceURI);
                          setShowVoicePicker(false);
                        }}
                        className={`w-full text-left px-2 py-1 rounded text-[11px] truncate cursor-pointer transition-colors ${
                          selectedVoiceURI === voice.voiceURI ||
                          playbackState.activeVoiceName === voice.name
                            ? "bg-[#EAF3ED] text-[#205C43] font-semibold"
                            : "hover:bg-[#F8FAF9] text-[#202824]"
                        }`}
                      >
                        {voice.name} ({voice.lang})
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
