// src/services/azure/translationService.ts
import * as speechsdk from 'microsoft-cognitiveservices-speech-sdk';
import { AZURE_CONFIG, validateAzureConfig } from './config';

type OnRecognizedFn = (text: string) => void;
type OnSpeakerTranslationFn = (translation: string) => void;
type OnLockSpeaker1LangFn = (lang: string) => void;
type SpeakTTSFn = (text: string, lang: string) => Promise<void>;

/**
 * Helper function to extract short language codes.
 * e.g., "en-US" → "en"
 */
function shortCode(fullLang: string): string {
  return fullLang.split('-')[0];
}

/**
 * Handles translation for two-speaker mode with auto-detection.
 * - **Speaker 1:** Auto-detected and locked on first utterance.
 * - **Speaker 2:** User-selected language.
 */
export class TranslationService {
  private translator: speechsdk.TranslationRecognizer | null = null;

  constructor() {
    validateAzureConfig();
  }

  /**
   * Starts the translation service.
   */
  public async startTranslation(
    speaker2Lang: string,
    speaker1LangRef: { current: string | null },
    setSpeaker1Lang: OnLockSpeaker1LangFn,
    onRecognized: OnRecognizedFn,
    onSpeaker1Translation: OnSpeakerTranslationFn,
    onSpeaker2Translation: OnSpeakerTranslationFn,
    speakTTS: SpeakTTSFn
  ): Promise<void> {
    try {
      console.log('[START] Initializing Translation Service...');
      const speechConfig = speechsdk.SpeechTranslationConfig.fromSubscription(
        AZURE_CONFIG.speechKey,
        AZURE_CONFIG.speechRegion
      );

      // Enable auto-detection (but lock Speaker 1's first language)
      speechConfig.speechRecognitionLanguage = 'en-US'; // Default fallback
      speechConfig.setProperty(
        speechsdk.PropertyId.SpeechServiceConnection_LanguageIdMode,
        'Continuous'
      );
      speechConfig.setProperty(
        speechsdk.PropertyId.SpeechServiceConnection_AutoDetectSourceLanguages,
        'en-US,es-ES,fr-FR,de-DE,it-IT,pt-PT,zh-CN,ja-JP,ko-KR,ar-SA'
      );

      // Always add Speaker 2's selected language as a target
      const shortSpeaker2 = shortCode(speaker2Lang);
      speechConfig.addTargetLanguage(shortSpeaker2);

      // If Speaker 1 is locked, add their language too
      let shortSpeaker1 = '';
      if (speaker1LangRef.current) {
        shortSpeaker1 = shortCode(speaker1LangRef.current);
        if (shortSpeaker1 !== shortSpeaker2) {
          speechConfig.addTargetLanguage(shortSpeaker1);
        }
      }

      console.log('[INFO] Speech Config:', speechConfig);
      const audioConfig = speechsdk.AudioConfig.fromDefaultMicrophoneInput();
      console.log('[INFO] Translator Initialized');

      this.translator = new speechsdk.TranslationRecognizer(speechConfig, audioConfig);

      // **Recognizing (Interim results)**
      this.translator.recognizing = (_, event) => {
        if (event.result.text) {
          onRecognized(event.result.text);
        }
      };

      // **Recognized (Final results)**
      this.translator.recognized = async (_, event) => {
        if (event.result.reason === speechsdk.ResultReason.TranslatedSpeech) {
          const detectedLang = event.result.language;
          console.log('[INFO] Auto-detected Language:', detectedLang);

          // **First utterance: Lock Speaker 1**
          if (!speaker1LangRef.current) {
            speaker1LangRef.current = detectedLang;
            setSpeaker1Lang(detectedLang);
            console.log('[LOCK] Speaker 1’s language locked as:', detectedLang);
          }

          const shortDetected = shortCode(detectedLang);
          const shortSpeaker1Locked = speaker1LangRef.current ? shortCode(speaker1LangRef.current) : null;

          // **Determine Speaker Identity**
          if (shortSpeaker1Locked && shortDetected === shortSpeaker1Locked) {
            // **Speaker 1 is talking → Translate to Speaker 2**
            if (shortSpeaker1Locked !== shortSpeaker2) {
              const translation = event.result.translations.get(shortSpeaker2);
              if (translation) {
                console.log(`[TRANSLATE] Speaker 1 → Speaker 2: ${translation}`);
                onSpeaker2Translation(translation);
                await speakTTS(translation, speaker2Lang);
              }
            }
          } else if (shortDetected === shortSpeaker2) {
            // **Speaker 2 is talking → Translate to Speaker 1**
            if (shortSpeaker1Locked && shortSpeaker2 !== shortSpeaker1Locked) {
              const translation = event.result.translations.get(shortSpeaker1Locked);
              if (translation) {
                console.log(`[TRANSLATE] Speaker 2 → Speaker 1: ${translation}`);
                onSpeaker1Translation(translation);
                await speakTTS(translation, speaker1LangRef.current!);
              }
            }
          }

          // **RESET AUTO-DETECTION after every translation**
          await this.restartAutoDetect(speaker2Lang, speaker1LangRef, setSpeaker1Lang, onRecognized, onSpeaker1Translation, onSpeaker2Translation, speakTTS);
        }
      };

      await this.translator.startContinuousRecognitionAsync();
      console.log('[INFO] Continuous recognition started.');
    } catch (error) {
      console.error('[ERROR] Translation Service:', error);
      this.cleanup();
      throw error;
    }
  }

  /**
   * Restarts auto-detection after each translation.
   */
  private async restartAutoDetect(
    speaker2Lang: string,
    speaker1LangRef: { current: string | null },
    setSpeaker1Lang: OnLockSpeaker1LangFn,
    onRecognized: OnRecognizedFn,
    onSpeaker1Translation: OnSpeakerTranslationFn,
    onSpeaker2Translation: OnSpeakerTranslationFn,
    speakTTS: SpeakTTSFn
  ): Promise<void> {
    console.log('[INFO] Resetting auto-detection for next utterance...');
    await this.stopTranslation();
    await this.startTranslation(
      speaker2Lang,
      speaker1LangRef,
      setSpeaker1Lang,
      onRecognized,
      onSpeaker1Translation,
      onSpeaker2Translation,
      speakTTS
    );
  }

  /**
   * Stops translation.
   */
  public async stopTranslation(): Promise<void> {
    if (this.translator) {
      await this.translator.stopContinuousRecognitionAsync();
      console.log('[INFO] Stopped translation.');
      this.cleanup();
    }
  }

  /**
   * Cleans up translator instance.
   */
  private cleanup(): void {
    if (this.translator) {
      this.translator.close();
      this.translator = null;
      console.log('[INFO] Translator cleaned up.');
    }
  }
}
