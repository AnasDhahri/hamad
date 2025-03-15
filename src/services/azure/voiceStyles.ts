import { VoiceStyle } from '../../types/voice';

export const voiceStyles: Record<string, VoiceStyle[]> = {
  'en-US': [
    { name: 'friendly', style: 'friendly', description: 'Warm and welcoming' },
    { name: 'chat', style: 'chat', description: 'Casual and relaxed' },
    { name: 'newscast', style: 'newscast', description: 'Professional news anchor' },
    { name: 'customerservice', style: 'customerservice', description: 'Professional and helpful' }
  ],
  'es-ES': [
    { name: 'friendly', style: 'friendly', description: 'Warm and welcoming' },
    { name: 'chat', style: 'chat', description: 'Casual and relaxed' }
  ],
  'fr-FR': [
    { name: 'friendly', style: 'friendly', description: 'Warm and welcoming' },
    { name: 'chat', style: 'chat', description: 'Casual and relaxed' }
  ],
  'de-DE': [
    { name: 'friendly', style: 'friendly', description: 'Warm and welcoming' },
    { name: 'chat', style: 'chat', description: 'Casual and relaxed' }
  ],
  'it-IT': [
    { name: 'friendly', style: 'friendly', description: 'Warm and welcoming' },
    { name: 'chat', style: 'chat', description: 'Casual and relaxed' }
  ],
  'ar-SA': [
    { name: 'friendly', style: 'friendly', description: 'Warm and welcoming' },
    { name: 'chat', style: 'chat', description: 'Casual and relaxed' }
  ]
};