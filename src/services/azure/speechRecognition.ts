import * as speechsdk from 'microsoft-cognitiveservices-speech-sdk';
import { AZURE_CONFIG, validateAzureConfig } from './config';

export class SpeechRecognitionService {
  private recognizer: speechsdk.SpeechRecognizer | null = null;
  private isListening: boolean = false;
  private isTtsPlaying: boolean = false; // Flag to indicate if TTS is active

  constructor() {
    validateAzureConfig();
  }

  /**
   * Call this from your TTS logic to inform the recognizer that TTS is playing.
   * When TTS is active, auto-restart will be suppressed.
   * When TTS finishes (set active to false), the recognizer will resume.
   */
  public setTtsActive(active: boolean): void {
    this.isTtsPlaying = active;
    // If TTS just finished and we're still listening, restart recognition.
    if (!active && this.isListening && this.recognizer) {
      this.recognizer.startContinuousRecognitionAsync();
    }
  }

  /**
   * Start continuous speech recognition.
   * @param language BCP-47 language code (e.g. 'en-US', 'ar-QA', etc.)
   * @param onRecognized Callback for final recognized speech text.
   * @param onInterim Callback for interim (partial) recognized text.
   */
  public async startRecognition(
    language: string,
    onRecognized: (text: string) => void,
    onInterim: (text: string) => void
  ): Promise<void> {
    try {
      const speechConfig = speechsdk.SpeechConfig.fromSubscription(
        AZURE_CONFIG.speechKey,
        AZURE_CONFIG.speechRegion
      );
      speechConfig.speechRecognitionLanguage = language;

      const audioConfig = speechsdk.AudioConfig.fromDefaultMicrophoneInput();
      this.recognizer = new speechsdk.SpeechRecognizer(speechConfig, audioConfig);

      // Interim results callback
      this.recognizer.recognizing = (_sender, event) => {
        onInterim(event.result.text);
      };

      // Final result callback
      this.recognizer.recognized = (_sender, event) => {
        if (event.result.reason === speechsdk.ResultReason.RecognizedSpeech) {
          onRecognized(event.result.text);
          // Restart recognition after a final result if TTS is not playing.
          if (!this.isTtsPlaying) {
            setTimeout(() => {
              const localRecognizer = this.recognizer;
              if (this.isListening && localRecognizer) {
                localRecognizer.startContinuousRecognitionAsync();
              }
            }, 500);
          }
        }
      };

      // When speech ends, restart if not in TTS mode.
      this.recognizer.speechEndDetected = () => {
        setTimeout(() => {
          const localRecognizer = this.recognizer;
          if (this.isListening && localRecognizer && !this.isTtsPlaying) {
            localRecognizer.startContinuousRecognitionAsync();
          }
        }, 500);
      };

      // Restart if the session stops.
      this.recognizer.sessionStopped = () => {
        setTimeout(() => {
          const localRecognizer = this.recognizer;
          if (this.isListening && localRecognizer && !this.isTtsPlaying) {
            localRecognizer.startContinuousRecognitionAsync();
          }
        }, 500);
      };

      // Restart on cancellation.
      this.recognizer.canceled = (_sender, event) => {
        console.log('Recognition canceled:', event.errorDetails);
        setTimeout(() => {
          const localRecognizer = this.recognizer;
          if (this.isListening && localRecognizer && !this.isTtsPlaying) {
            localRecognizer.startContinuousRecognitionAsync();
          }
        }, 500);
      };

      this.isListening = true;
      await this.recognizer.startContinuousRecognitionAsync();
    } catch (error) {
      this.cleanup();
      throw error;
    }
  }

  /**
   * Stop continuous speech recognition and clean up.
   */
  public async stopRecognition(): Promise<void> {
    this.isListening = false;
    if (this.recognizer) {
      await this.recognizer.stopContinuousRecognitionAsync();
      this.cleanup();
    }
  }

  /**
   * Clean up the recognizer.
   */
  private cleanup(): void {
    if (this.recognizer) {
      this.recognizer.close();
      this.recognizer = null;
    }
  }
}
