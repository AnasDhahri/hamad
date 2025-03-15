export interface VoiceStyle {
  style: string;
  description: string;
}

export const voiceStyles: Record<string, VoiceStyle[]> = {
  'en-US': [
    { style: 'chat', description: 'Casual and friendly' },
    { style: 'newscast', description: 'Professional and clear' },
    { style: 'conversational', description: 'Natural dialogue' }
  ],
  'es-ES': [
    { style: 'chat', description: 'Casual and friendly' },
    { style: 'conversational', description: 'Natural dialogue' }
  ],
  'fr-FR': [
    { style: 'chat', description: 'Casual and friendly' },
    { style: 'conversational', description: 'Natural dialogue' }
  ],
  'de-DE': [
    { style: 'chat', description: 'Casual and friendly' },
    { style: 'conversational', description: 'Natural dialogue' }
  ],
  'it-IT': [
    { style: 'chat', description: 'Casual and friendly' },
    { style: 'conversational', description: 'Natural dialogue' }
  ],
  'ja-JP': [
    { style: 'chat', description: 'Casual and friendly' },
    { style: 'calm', description: 'Soft and gentle' }
  ],
  'zh-CN': [
    { style: 'chat', description: 'Casual and friendly' },
    { style: 'calm', description: 'Soft and gentle' }
  ],
  'ar-SA': [
    { style: 'chat', description: 'Casual and friendly' },
    { style: 'calm', description: 'Soft and gentle' }
  ]
};