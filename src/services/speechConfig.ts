import * as speechsdk from 'microsoft-cognitiveservices-speech-sdk';
import { AZURE_CONFIG } from './azureConfig';

export class SpeechConfigService {
  static create(): speechsdk.SpeechConfig {
    this.validateConfig();
    const config = speechsdk.SpeechConfig.fromSubscription(
      AZURE_CONFIG.speechKey,
      AZURE_CONFIG.speechRegion
    );
    
    // Configure speech service
    config.setProperty('SpeechServiceResponse_Synthesis_WordBoundary', 'true');
    config.setProperty('SpeechServiceConnection_InitialSilenceTimeoutMs', '5000');
    config.setProperty('SpeechServiceConnection_EndSilenceTimeoutMs', '1000');
    
    // Enable detailed logging for troubleshooting
    config.setProperty('Speech_LogFilename', 'speech.log');
    
    return config;
  }

  private static validateConfig() {
    if (!AZURE_CONFIG.speechKey || AZURE_CONFIG.speechKey === 'your-azure-speech-key-here') {
      throw new Error('Azure Speech Key is not configured. Please check your environment variables.');
    }
    if (!AZURE_CONFIG.speechRegion || AZURE_CONFIG.speechRegion === 'your-azure-region-here') {
      throw new Error('Azure Speech Region is not configured. Please check your environment variables.');
    }
  }
}