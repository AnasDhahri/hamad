import * as speechsdk from 'microsoft-cognitiveservices-speech-sdk';
import { AZURE_CONFIG } from './azureConfig';

export class TranslationConfig {
  static create(fromLanguage: string, toLanguage: string): speechsdk.SpeechTranslationConfig {
    const config = speechsdk.SpeechTranslationConfig.fromSubscription(
      AZURE_CONFIG.speechKey,
      AZURE_CONFIG.speechRegion
    );

    // Set recognition language
    config.speechRecognitionLanguage = fromLanguage;
    
    // Add target language (remove region code)
    const targetLang = toLanguage.split('-')[0];
    config.addTargetLanguage(targetLang);

    // Configure translation service
    config.setProperty('SpeechServiceConnection_InitialSilenceTimeoutMs', '5000');
    config.setProperty('SpeechServiceConnection_EndSilenceTimeoutMs', '1000');
    config.setProperty('SpeechServiceConnection_TranslationVerbosity', 'Detailed');
    
    return config;
  }
}