interface VoiceConfig {
  name: string;
  gender: 'Female' | 'Male';
  isNeural: boolean;
}

export const voiceMap: Record<string, VoiceConfig> = {
  'en-US': { name: 'en-US-JennyMultilingualV2Neural', gender: 'Female', isNeural: true },
  'es-ES': { name: 'es-ES-AlvaroNeural', gender: 'Male', isNeural: true },
  'fr-FR': { name: 'fr-FR-HenriNeural', gender: 'Male', isNeural: true },
  'de-DE': { name: 'de-DE-ConradNeural', gender: 'Male', isNeural: true },
  'it-IT': { name: 'it-IT-DiegoNeural', gender: 'Male', isNeural: true },
  'pt-PT': { name: 'pt-PT-DuarteNeural', gender: 'Male', isNeural: true },
  'ru-RU': { name: 'ru-RU-DmitryNeural', gender: 'Male', isNeural: true },
  'ar-SA': { name: 'ar-SA-HamedNeural', gender: 'Male', isNeural: true },
  'zh-CN': { name: 'zh-CN-XiaoxiaoNeural', gender: 'Female', isNeural: true },
  'ja-JP': { name: 'ja-JP-NanamiNeural', gender: 'Female', isNeural: true },
  'ko-KR': { name: 'ko-KR-InJoonNeural', gender: 'Male', isNeural: true }
};

export function getVoiceConfig(language: string): VoiceConfig {
  return voiceMap[language] || voiceMap['en-US'];
}