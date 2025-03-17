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

      const voiceConfig = getVoiceConfig(language);
      speechConfig.speechSynthesisVoiceName = voiceConfig.name;
      console.log('Using voice:', voiceConfig.name, 'for language:', language);

      const audioConfig = AudioConfigService.createSpeakerConfig();
      console.log('Audio config created:', audioConfig);

      this.synthesizer = new speechsdk.SpeechSynthesizer(speechConfig, audioConfig);

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

              // ✅ Manually enforce correct voice selection on mobile
              if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                const availableVoices = window.speechSynthesis.getVoices();
                const matchingVoice = availableVoices.find(v => v.lang === language);
              
                if (matchingVoice) {
                  const utterance = new SpeechSynthesisUtterance(text);
                  utterance.voice = matchingVoice;
                  utterance.lang = language;
                  window.speechSynthesis.speak(utterance);
                }
              }

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
      console.log('Synthesizer cleaned up');
    }
  }
}
