/**
 * Voice Input & Voice Output Localization Strings (Bilingual: English & Hindi)
 * 
 * Accurately phrased for Indian legal contexts, respectful tone, and clear
 * user privacy disclosures under Bar Council of India guidelines.
 */

export interface VoiceStrings {
  // Microphone / Speech Input
  micButtonTooltip: string;
  micButtonAriaLabel: string;
  micListening: string;
  micStarting: string;
  micProcessing: string;
  micFinish: string;
  micCancel: string;
  micTimer: string;
  micLanguageToggleAria: string;
  micLangHindi: string;
  micLangEnglish: string;
  micEditingHint: string;
  
  // Privacy notice
  privacyNoticeTitle: string;
  privacyNoticeText: string;
  privacyNoticeDismiss: string;
  
  // Errors
  errorUnsupported: string;
  errorPermissionDenied: string;
  errorPermissionDeniedHelp: string;
  errorNoSpeech: string;
  errorNetwork: string;
  errorAudioCapture: string;
  errorGeneral: string;
  errorDismiss: string;
  errorRetry: string;

  // Voice Output / Speech Synthesis
  ttsListen: string;
  ttsListenTooltip: string;
  ttsPlaying: string;
  ttsPaused: string;
  ttsPause: string;
  ttsResume: string;
  ttsStop: string;
  ttsPartIndicator: (current: number, total: number) => string;
  ttsVoiceSelectorAria: string;
  ttsDefaultVoice: string;
  ttsNoHindiVoiceNotice: string;
  ttsNoEnglishVoiceNotice: string;
  ttsPlaybackError: string;
}

export const VOICE_STRINGS_EN: VoiceStrings = {
  micButtonTooltip: "Voice input (Dictate in Hindi or English)",
  micButtonAriaLabel: "Start microphone voice dictation",
  micListening: "Listening...",
  micStarting: "Activating microphone...",
  micProcessing: "Transcribing speech...",
  micFinish: "Finish dictation",
  micCancel: "Cancel recording",
  micTimer: "Duration",
  micLanguageToggleAria: "Switch voice recognition language",
  micLangHindi: "Hindi (hi-IN)",
  micLangEnglish: "English (en-IN)",
  micEditingHint: "Review and edit legal sections, names, and case citations before sending.",

  privacyNoticeTitle: "Voice Processing & Privacy",
  privacyNoticeText: "Your browser's built-in speech recognition service (e.g. Google or Apple) processes your speech. To safeguard client privilege, avoid dictating strictly confidential client secrets or passwords.",
  privacyNoticeDismiss: "Got it",

  errorUnsupported: "Voice recognition is not supported in this browser. Please use Chrome, Edge, or Safari.",
  errorPermissionDenied: "Microphone permission was denied.",
  errorPermissionDeniedHelp: "Please click the lock/tune icon in your browser address bar and set Microphone to 'Allow'.",
  errorNoSpeech: "No speech was detected. Please check your microphone and speak clearly.",
  errorNetwork: "Network issue occurred while connecting to the browser speech recognition service.",
  errorAudioCapture: "No microphone detected or audio hardware is currently unavailable.",
  errorGeneral: "Speech recognition encountered an unexpected issue.",
  errorDismiss: "Dismiss",
  errorRetry: "Try again",

  ttsListen: "Listen to answer",
  ttsListenTooltip: "Listen to this legal orientation via voice read-aloud",
  ttsPlaying: "Reading answer aloud...",
  ttsPaused: "Audio paused",
  ttsPause: "Pause audio",
  ttsResume: "Resume audio",
  ttsStop: "Stop audio",
  ttsPartIndicator: (current: number, total: number) => `Part ${current} of ${total}`,
  ttsVoiceSelectorAria: "Select read-aloud voice",
  ttsDefaultVoice: "Browser Default Voice",
  ttsNoHindiVoiceNotice: "No Hindi voice pack found on this device. Using the closest available voice.",
  ttsNoEnglishVoiceNotice: "No Indian English voice found on this device. Using default English voice.",
  ttsPlaybackError: "Speech playback encountered an error. Please try again.",
};

export const VOICE_STRINGS_HI: VoiceStrings = {
  micButtonTooltip: "वाक् इनपुट (हिंदी या अंग्रेज़ी में बोलें)",
  micButtonAriaLabel: "माइक्रोफ़ोन से बोलकर लिखें",
  micListening: "सुन रहे हैं...",
  micStarting: "माइक्रोफ़ोन चालू हो रहा है...",
  micProcessing: "आवाज़ को शब्दों में बदल रहे हैं...",
  micFinish: "बोलना पूरा करें",
  micCancel: "रद्द करें",
  micTimer: "समय",
  micLanguageToggleAria: "वाक् पहचान भाषा बदलें",
  micLangHindi: "हिंदी (hi-IN)",
  micLangEnglish: "English (en-IN)",
  micEditingHint: "भेजने से पहले कानूनी धाराओं, नामों और तिथियों की जांच करें व सुधारें।",

  privacyNoticeTitle: "वाक् प्रसंस्करण और गोपनीयता",
  privacyNoticeText: "आपके ब्राउज़र की वाक् पहचान सेवा (जैसे Google या Apple) ऑडियो को दूरस्थ रूप से संसाधित कर सकती है। गोपनीयता बनाए रखने के लिए अत्यधिक गोपनीय जानकारी या पासवर्ड बोलने से बचें।",
  privacyNoticeDismiss: "समझ गया",

  errorUnsupported: "इस ब्राउज़र में वाक् पहचान उपलब्ध नहीं है। कृपया Chrome, Edge, या Safari का उपयोग करें।",
  errorPermissionDenied: "माइक्रोफ़ोन की अनुमति अस्वीकार कर दी गई थी।",
  errorPermissionDeniedHelp: "कृपया ब्राउज़र एड्रेस बार में ताला (Lock) आइकन पर क्लिक करें और Microphone को 'Allow' करें।",
  errorNoSpeech: "कोई आवाज़ नहीं पहचानी गई। कृपया साफ़ और स्पष्ट आवाज़ में बोलें।",
  errorNetwork: "ब्राउज़र वाक् सेवा से संपर्क करने में नेटवर्क त्रुटि हुई।",
  errorAudioCapture: "माइक्रोफ़ोन नहीं मिला या ऑडियो उपकरण व्यस्त है।",
  errorGeneral: "वाक् पहचान में अप्रत्याशित समस्या आई।",
  errorDismiss: "हटाएं",
  errorRetry: "पुनः प्रयास करें",

  ttsListen: "उत्तर सुनें",
  ttsListenTooltip: "इस कानूनी उत्तर को बोलकर सुनें",
  ttsPlaying: "उत्तर पढ़ा जा रहा है...",
  ttsPaused: "आवाज़ रुकी हुई है",
  ttsPause: "रोकें",
  ttsResume: "जारी रखें",
  ttsStop: "समाप्त करें",
  ttsPartIndicator: (current: number, total: number) => `भाग ${current} / ${total}`,
  ttsVoiceSelectorAria: "पढ़ने वाली आवाज़ चुनें",
  ttsDefaultVoice: "ब्राउज़र डिफ़ॉल्ट आवाज़",
  ttsNoHindiVoiceNotice: "इस उपकरण पर हिंदी आवाज़ स्थापित नहीं है। उपलब्ध निकटतम आवाज़ का उपयोग किया जा रहा है।",
  ttsNoEnglishVoiceNotice: "इस उपकरण पर भारतीय अंग्रेज़ी आवाज़ नहीं मिली। मानक अंग्रेज़ी का उपयोग किया जा रहा है।",
  ttsPlaybackError: "ऑडियो प्लेबैक में समस्या आई। कृपया पुनः प्रयास करें।",
};

export function getVoiceStrings(isHindi: boolean): VoiceStrings {
  return isHindi ? VOICE_STRINGS_HI : VOICE_STRINGS_EN;
}
