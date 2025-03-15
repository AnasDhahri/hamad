import { VoiceConfig } from '../../types/voice';

export const voiceMap: Record<string, VoiceConfig[]> = {
  'en-US': [
    { name: 'en-US-JennyMultilingualV2Neural', gender: 'Female', styles: ['chat', 'cheerful', 'empathetic'] },
    { name: 'en-US-AriaNeural', gender: 'Female', styles: ['newscast', 'customerservice', 'narration'] },
    { name: 'en-US-GuyNeural', gender: 'Male', styles: ['newscast', 'angry', 'cheerful'] },
    { name: 'en-US-DavisNeural', gender: 'Male', styles: ['chat', 'angry', 'cheerful'] }
  ],
  'es-ES': [
    { name: 'es-ES-ElviraNeural', gender: 'Female', styles: ['chat', 'cheerful'] },
    { name: 'es-ES-AlvaroNeural', gender: 'Male', styles: ['chat', 'cheerful'] },
    { name: 'es-ES-TeresaNeural', gender: 'Female', styles: ['chat', 'cheerful'] }
  ],
  'fr-FR': [
    { name: 'fr-FR-DeniseNeural', gender: 'Female', styles: ['chat', 'cheerful'] },
    { name: 'fr-FR-HenriNeural', gender: 'Male', styles: ['chat', 'cheerful'] },
    { name: 'fr-FR-AlainNeural', gender: 'Male', styles: ['chat', 'cheerful'] }
  ],
  'de-DE': [
    { name: 'de-DE-KatjaNeural', gender: 'Female', styles: ['chat', 'cheerful'] },
    { name: 'de-DE-ConradNeural', gender: 'Male', styles: ['chat', 'cheerful'] },
    { name: 'de-DE-AmalaNeural', gender: 'Female', styles: ['chat', 'cheerful'] }
  ],
  'it-IT': [
    { name: 'it-IT-ElsaNeural', gender: 'Female', styles: ['chat', 'cheerful'] },
    { name: 'it-IT-DiegoNeural', gender: 'Male', styles: ['chat', 'cheerful'] },
    { name: 'it-IT-IsabellaNeural', gender: 'Female', styles: ['chat', 'cheerful'] }
  ],
  'ar-SA': [
    { name: 'ar-SA-HamedNeural', gender: 'Male', styles: ['chat', 'cheerful'] },
    { name: 'ar-SA-FatimaNeural', gender: 'Female', styles: ['chat', 'cheerful'] }
  ]
};

export function getVoicesForLanguage(language: string): VoiceConfig[] {
  return voiceMap[language] || voiceMap['en-US'];
}

export function getVoiceConfig(language: string): VoiceConfig {
  const voices = getVoicesForLanguage(language);
  return voices[0];
}

export function detectEmotion(text: string): string {
  // Simple emotion detection based on keywords
  const emotions = {
    excited: /(!{2,}|wow|amazing|fantastic|awesome)/i,
    sad: /(sad|sorry|unfortunately|regret)/i,
    angry: /(angry|mad|furious|upset)/i,
    cheerful: /(happy|glad|great|wonderful)/i,
    empathetic: /(understand|feel for|care|support)/i
  };

  for (const [emotion, pattern] of Object.entries(emotions)) {
    if (pattern.test(text)) {
      return emotion;
    }
  }

  return 'chat'; // Default style
}