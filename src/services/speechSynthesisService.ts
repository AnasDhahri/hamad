import * as speechsdk from 'microsoft-cognitiveservices-speech-sdk';
import { AudioConfigService } from './audioConfig';
import { AZURE_CONFIG } from './azureConfig';
import { getVoiceConfig } from './voiceMap';

export class SpeechSynthesisService {
  private synthesizer: speechsdk.SpeechSynthesizer | null = null;
  private isProcessing: boolean = false;

  public async synthesizeSpeech(text: string, language: string): Promise<void> {
    if (!text.trim() || this.isProcessing) {
      console.log('Skipping synthesis: No text or already processing');
      return;
    }

    try {
      this.isProcessing = true;
      await this.cleanup();

      const speechConfig = speechsdk.SpeechConfig.fromSubscription(
        AZURE_CONFIG.speechKey,
        AZURE_CONFIG.speechRegion
      );

      // Set output format to MP3 for better browser compatibility
      speechConfig.speechSynthesisOutputFormat = speechsdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3;

      // Normalize language code to match voiceMap
      const normalizedLanguage = language.split('-')[0] === 'ar' ? 'ar-SA' :
        language.split('-')[0] === 'zh' ? 'zh-CN' :
          language;
      const voiceConfig = getVoiceConfig(normalizedLanguage);
      speechConfig.speechSynthesisVoiceName = voiceConfig.name;
      console.log('Using voice:', voiceConfig.name, 'for language:', normalizedLanguage);

      const audioConfig = AudioConfigService.createSpeakerConfig();
      console.log('Audio config created:', audioConfig);

      this.synthesizer = new speechsdk.SpeechSynthesizer(speechConfig, audioConfig);
      console.log('Synthesizer initialized');

      return new Promise((resolve, reject) => {
        if (!this.synthesizer) {
          reject(new Error('Synthesizer not initialized'));
          return;
        }

        this.synthesizer.speakTextAsync(
          text,
          (result) => {
            if (result.reason === speechsdk.ResultReason.SynthesizingAudioCompleted) {
              console.log('Audio synthesis completed');
              resolve();
            } else {
              console.error('Synthesis failed:', result.errorDetails);
              reject(new Error(`Synthesis failed: ${result.errorDetails}`));
            }
            this.cleanup();
          },
          (error) => {
            console.error('Synthesis error:', error);
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
      console.log('Synthesizer cleaned up');
    }
  }
}