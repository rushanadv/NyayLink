/**
 * Web Speech API and NyayLink Voice Feature Type Definitions
 */

// Web Speech API interfaces for environments where DOM lib lacks speech types
export interface IWindowSpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onaudioend: ((this: IWindowSpeechRecognition, ev: Event) => void) | null;
  onaudiostart: ((this: IWindowSpeechRecognition, ev: Event) => void) | null;
  onend: ((this: IWindowSpeechRecognition, ev: Event) => void) | null;
  onerror: ((this: IWindowSpeechRecognition, ev: ISpeechRecognitionErrorEvent) => void) | null;
  onnomatch: ((this: IWindowSpeechRecognition, ev: Event) => void) | null;
  onresult: ((this: IWindowSpeechRecognition, ev: ISpeechRecognitionEvent) => void) | null;
  onsoundend: ((this: IWindowSpeechRecognition, ev: Event) => void) | null;
  onsoundstart: ((this: IWindowSpeechRecognition, ev: Event) => void) | null;
  onspeechend: ((this: IWindowSpeechRecognition, ev: Event) => void) | null;
  onspeechstart: ((this: IWindowSpeechRecognition, ev: Event) => void) | null;
  onstart: ((this: IWindowSpeechRecognition, ev: Event) => void) | null;
  abort(): void;
  start(): void;
  stop(): void;
}

export interface ISpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

export interface ISpeechRecognitionErrorEvent extends Event {
  readonly error:
    | "no-speech"
    | "aborted"
    | "audio-capture"
    | "network"
    | "not-allowed"
    | "service-not-allowed"
    | "bad-grammar"
    | "language-not-supported"
    | string;
  readonly message?: string;
}

export type SpeechLanguage = "hi-IN" | "en-IN";

export type SpeechRecognitionStatus =
  | "idle"
  | "starting"
  | "listening"
  | "processing"
  | "error";

export interface SpeechRecognitionError {
  code: string;
  message: string;
}

export interface VoicePlaybackState {
  isPlaying: boolean;
  isPaused: boolean;
  isLoading: boolean;
  currentMessageId: string | null;
  currentChunk: number;
  totalChunks: number;
  hasDeviceHindiVoice: boolean;
  hasDeviceEnglishVoice: boolean;
  activeVoiceName: string | null;
}
