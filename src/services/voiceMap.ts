interface VoiceConfig {
  name: string;
  gender: 'Female' | 'Male';
  isNeural: boolean;
}

export const voiceMap: Record<string, { name: string; gender: 'Female' | 'Male'; isNeural: boolean }> = {
  'en-US': { name: 'en-US-JennyMultilingualNeural', gender: 'Female', isNeural: true },
  'es-ES': { name: 'es-ES-ElviraNeural', gender: 'Female', isNeural: true },
  'fr-FR': { name: 'fr-FR-DeniseNeural', gender: 'Female', isNeural: true },
  'de-DE': { name: 'de-DE-KatjaNeural', gender: 'Female', isNeural: true },
  'it-IT': { name: 'it-IT-ElsaNeural', gender: 'Female', isNeural: true },
  'pt-PT': { name: 'pt-PT-RaquelNeural', gender: 'Female', isNeural: true },
  'ru-RU': { name: 'ru-RU-SvetlanaNeural', gender: 'Female', isNeural: true },

  // ✅ Fix Arabic (ar-SA) for Mobile
  'ar-SA': { name: 'ar-SA-NaeemNeural', gender: 'Male', isNeural: true },

  // ✅ Fix Chinese (zh-CN) for Mobile
  'zh-CN': { name: 'zh-CN-YunjianNeural', gender: 'Male', isNeural: true },

  // ✅ Fix Japanese (ja-JP) for Mobile
  'ja-JP': { name: 'ja-JP-KeitaNeural', gender: 'Male', isNeural: true },

  'ko-KR': { name: 'ko-KR-SunHiNeural', gender: 'Female', isNeural: true }
};

export function getVoiceConfig(language: string) {
  return voiceMap[language] || voiceMap['en-US'];
}

