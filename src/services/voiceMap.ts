interface VoiceConfig {
  name: string;
  gender: 'Female' | 'Male';
  isNeural: boolean;
}

export const voiceMap: Record<string, VoiceConfig> = {
  'en-US': { name: 'en-US-JennyMultilingualNeural', gender: 'Female', isNeural: true },
  'es-ES': { name: 'es-ES-ElviraNeural', gender: 'Female', isNeural: true },
  'fr-FR': { name: 'fr-FR-DeniseNeural', gender: 'Female', isNeural: true },
  'de-DE': { name: 'de-DE-KatjaNeural', gender: 'Female', isNeural: true },
  'it-IT': { name: 'it-IT-ElsaNeural', gender: 'Female', isNeural: true },
  'pt-PT': { name: 'pt-PT-RaquelNeural', gender: 'Female', isNeural: true },
  'zh-CN': { name: 'zh-CN-XiaoxiaoNeural', gender: 'Female', isNeural: true },
  'ja-JP': { name: 'ja-JP-NanamiNeural', gender: 'Female', isNeural: true },
  'ko-KR': { name: 'ko-KR-SunHiNeural', gender: 'Female', isNeural: true },
  'ar-SA': { name: 'ar-SA-HamadNeural', gender: 'Male', isNeural: true }
};

export function getVoiceConfig(language: string): VoiceConfig {
  return voiceMap[language] || voiceMap['en-US'];
}