import * as speechsdk from 'microsoft-cognitiveservices-speech-sdk';
import { AudioConfigService } from './audioConfig';
import { SpeechConfigService } from './speechConfig';
import { TranslationConfig } from './translationConfig';
import { SSMLGenerator } from './ssmlGenerator';

export class TranslationService {
  private translator: speechsdk.TranslationRecognizer | null = null;
  private synthesizer: speechsdk.SpeechSynthesizer | null = null;
  private speechConfig: speechsdk.SpeechConfig;

  constructor() {
    this.speechConfig = SpeechConfigService.create();
  }

  public async startTranslation(
    fromLanguage: string,
    toLanguage: string,
    onInterimResult: (text: string) => void,
    onTranslation: (translation: string) => void
  ): Promise<void> {
    try {
      await this.stopTranslation();

      // Create translation config with languages
      const translationConfig = TranslationConfig.create(fromLanguage, toLanguage);
      const audioConfig = await AudioConfigService.createMicrophoneConfig();
      
      // Create translator with proper config
      this.translator = new speechsdk.TranslationRecognizer(
        translationConfig,
        audioConfig
      );

      const targetLang = toLanguage.split('-')[0];
      this.setupRecognitionHandlers(this.translator, targetLang, onInterimResult, onTranslation);

      await this.startContinuousRecognition();
    } catch (error: any) {
      await this.cleanup();
      throw this.createDetailedError('Failed to start translation', error);
    }
  }

  private setupRecognitionHandlers(
    translator: speechsdk.TranslationRecognizer,
    targetLang: string,
    onInterimResult: (text: string) => void,
    onTranslation: (translation: string) => void
  ): void {
    translator.recognized = (_, e) => {
      if (e.result.reason === speechsdk.ResultReason.TranslatedSpeech) {
        const translation = e.result.translations.get(targetLang);
        if (translation) {
          onTranslation(translation);
        }
      }
    };

    translator.recognizing = (_, e) => {
      if (e.result.reason === speechsdk.ResultReason.TranslatingSpeech) {
        onInterimResult(e.result.text);
      }
    };

    translator.canceled = async (_, e) => {
      if (e.reason === speechsdk.CancellationReason.Error) {
        console.error('Translation error:', e.errorDetails);
        await this.cleanup();
      }
    };
  }

  private async startContinuousRecognition(): Promise<void> {
    if (!this.translator) {
      throw new Error('Translator not initialized');
    }

    return new Promise((resolve, reject) => {
      this.translator!.startContinuousRecognitionAsync(
        () => resolve(),
        (error) => reject(this.createDetailedError('Failed to start speech recognition', error))
      );
    });
  }

  public async stopTranslation(): Promise<void> {
    if (!this.translator) return;

    return new Promise((resolve, reject) => {
      this.translator!.stopContinuousRecognitionAsync(
        async () => {
          await this.cleanup();
          resolve();
        },
        async (error) => {
          await this.cleanup();
          reject(this.createDetailedError('Failed to stop translation', error));
        }
      );
    });
  }

  public async synthesizeSpeech(text: string, language: string): Promise<void> {
    try {
      const audioConfig = AudioConfigService.createSpeakerConfig();
      this.synthesizer = new speechsdk.SpeechSynthesizer(this.speechConfig, audioConfig);

      const ssml = SSMLGenerator.generate({
        text,
        language,
        rate: 1.1,
        pitch: 0,
        style: 'conversational',
        emphasis: 'moderate'
      });

      await this.performSpeechSynthesis(ssml);
    } catch (error: any) {
      throw this.createDetailedError('Speech synthesis failed', error);
    }
  }

  private async performSpeechSynthesis(ssml: string): Promise<void> {
    if (!this.synthesizer) {
      throw new Error('Speech synthesizer not initialized');
    }

    return new Promise((resolve, reject) => {
      this.synthesizer!.speakSsmlAsync(
        ssml,
        (result) => {
          if (result.reason === speechsdk.ResultReason.SynthesizingAudioCompleted) {
            resolve();
          } else {
            reject(new Error(`Speech synthesis failed: ${result.errorDetails}`));
          }
          this.cleanupSynthesizer();
        },
        (error) => {
          this.cleanupSynthesizer();
          reject(this.createDetailedError('Speech synthesis failed', error));
        }
      );
    });
  }

  private async cleanup(): Promise<void> {
    if (this.translator) {
      this.translator.close();
      this.translator = null;
    }
    await AudioConfigService.cleanup();
  }

  private cleanupSynthesizer(): void {
    if (this.synthesizer) {
      this.synthesizer.close();
      this.synthesizer = null;
    }
  }

  private createDetailedError(message: string, error: any): Error {
    const errorMessage = error.message || error.toString();
    return new Error(`${message}: ${errorMessage}`);
  }
}