export const AZURE_CONFIG = {
  // Replace these with your actual Azure Cognitive Services credentials
  speechKey: import.meta.env.VITE_AZURE_SPEECH_KEY || "your-key-here",
  speechRegion: import.meta.env.VITE_AZURE_SPEECH_REGION || "eastus",
};