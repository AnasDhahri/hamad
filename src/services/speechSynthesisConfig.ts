import * as speechsdk from 'microsoft-cognitiveservices-speech-sdk';
import { AZURE_CONFIG } from './azureConfig';

export class SpeechSynthesisConfig {
  static create(): speechsdk.SpeechConfig {
    const config = speechsdk.SpeechConfig.fromSubscription(
      AZURE_CONFIG.speechKey,
      AZURE_CONFIG.speechRegion
    );

    // Configure synthesis-specific settings
    config.speechSynthesisVoiceName = 'en-US-JennyNeural';
    config.speechSynthesisLanguage = 'en-US';
    config.speechSynthesisOutputFormat = speechsdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3;

    // Set additional properties
    config.setProperty('SpeechServiceResponse_Synthesis_WordBoundary', 'true');
    config.setProperty('SpeechServiceConnection_SynthesisTimeout', '10000');
    config.setProperty('SpeechServiceConnection_ReconnectOnError', 'true');
    config.setProperty('SpeechServiceConnection_EndSilenceTimeoutMs', '1000');
    config.setProperty('SpeechServiceConnection_InitialSilenceTimeoutMs', '5000');

    return config;
  }

  static updateVoiceSettings(config: speechsdk.SpeechConfig, language: string, voiceName: string): void {
    config.speechSynthesisLanguage = language;
    config.speechSynthesisVoiceName = voiceName;
  }
}