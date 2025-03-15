import * as speechsdk from 'microsoft-cognitiveservices-speech-sdk';
import { AZURE_CONFIG, validateAzureConfig } from './config';
import { SSMLGenerator } from './ssmlGenerator';

export class SpeechSynthesisService {
  private synthesizer: speechsdk.SpeechSynthesizer | null = null;

  constructor() {
    validateAzureConfig();
  }

  public async synthesizeSpeech(text: string, language: string): Promise<void> {
    try {
      const speechConfig = speechsdk.SpeechConfig.fromSubscription(
        AZURE_CONFIG.speechKey,
        AZURE_CONFIG.speechRegion
      );

      // Set synthesis language and voice
      const voice = `${language}-Neural`;
      speechConfig.speechSynthesisVoiceName = voice;
      
      // Set output format using the correct property
      speechConfig.speechSynthesisOutputFormat = 
        speechsdk.SpeechSynthesisOutputFormat.Riff24Khz16BitMonoPcm;

      const audioConfig = speechsdk.AudioConfig.fromDefaultSpeakerOutput();
      this.synthesizer = new speechsdk.SpeechSynthesizer(speechConfig, audioConfig);

      // Generate SSML with enhanced voice settings
      const ssml = SSMLGenerator.generate({
        text,
        language,
        style: 'friendly',
        rate: 1.0,
        pitch: 0
      });

      return new Promise((resolve, reject) => {
        if (!this.synthesizer) {
          reject(new Error('Speech synthesizer not initialized'));
          return;
        }

        this.synthesizer.speakSsmlAsync(
          ssml,
          (result) => {
            if (result.reason === speechsdk.ResultReason.SynthesizingAudioCompleted) {
              resolve();
            } else {
              reject(new Error(`Speech synthesis failed: ${result.errorDetails}`));
            }
            this.cleanup();
          },
          (error) => {
            reject(new Error(`Speech synthesis failed: ${error}`));
            this.cleanup();
          }
        );
      });
    } catch (error) {
      this.cleanup();
      throw error;
    }
  }

  private cleanup(): void {
    if (this.synthesizer) {
      this.synthesizer.close();
      this.synthesizer = null;
    }
  }
}