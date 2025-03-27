export const AZURE_CONFIG = {
  endpoint: 'https://qatarcentral.api.cognitive.microsoft.com/',
  speechKey: import.meta.env.VITE_AZURE_SPEECH_KEY || '',
 speechRegion: import.meta.env.VITE_AZURE_SPEECH_REGION || 'qatarcentral'
};

export function validateAzureConfig() {
  if (!AZURE_CONFIG.speechKey) {
    throw new Error('Azure Speech Key is not configured. Please check your environment variables.');
  }
  if (!AZURE_CONFIG.speechRegion) {
    throw new Error('Azure Speech Region is not configured. Please check your environment variables.');
  }
}