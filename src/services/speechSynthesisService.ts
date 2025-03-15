import * as speechsdk from 'microsoft-cognitiveservices-speech-sdk';
import { AudioConfigService } from './audioConfig';
import { AZURE_CONFIG } from './azureConfig';
import { getVoiceForLanguage } from './voiceMap';

export class SpeechSynthesisService {
  private synthesizer: speechsdk.SpeechSynthesizer | null = null;
  private isProcessing: boolean = false;

  public async synthesize(text: string, language: string): Promise<void> {
    if (!text.trim() || this.isProcessing) return;

    try {
      this.isProcessing = true;
      await this.cleanup();
      
      const speechConfig = speechsdk.SpeechConfig.fromSubscription(
        AZURE_CONFIG.speechKey,
        AZURE_CONFIG.speechRegion
      );

      // Set voice and language
      const voiceName = getVoiceForLanguage(language);
      speechConfig.speechSynthesisVoiceName = voiceName;
      
      // Create audio config
      const audioConfig = AudioConfigService.createSpeakerConfig();
      
      // Create synthesizer
      this.synthesizer = new speechsdk.SpeechSynthesizer(speechConfig, audioConfig);
      
      // Synthesize speech
      return new Promise((resolve, reject) => {
        if (!this.synthesizer) {
          reject(new Error('Synthesizer not initialized'));
          return;
        }

        this.synthesizer.speakTextAsync(
          text,
          (result) => {
            if (result.reason === speechsdk.ResultReason.SynthesizingAudioCompleted) {
              resolve();
            } else {
              reject(new Error(`Synthesis failed: ${result.errorDetails}`));
            }
            this.cleanup();
          },
          (error) => {
            reject(new Error(`Synthesis failed: ${error}`));
            this.cleanup();
          }
        );
      });
    } catch (error: any) {
      console.error('Speech synthesis error:', error);
      throw error;
    } finally {
      this.isProcessing = false;
    }
  }

  private async cleanup(): Promise<void> {
    if (this.synthesizer) {
      this.synthesizer.close();
      this.synthesizer = null;
    }
  }
}