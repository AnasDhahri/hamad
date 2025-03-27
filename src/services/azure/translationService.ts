import * as speechsdk from 'microsoft-cognitiveservices-speech-sdk';
import { AZURE_CONFIG, validateAzureConfig } from './config';
import { toast } from 'react-toastify';

type OnRecognizedFn = (text: string) => void;
type OnSpeakerTranslationFn = (translation: string) => void;
type OnLockSpeaker1LangFn = (lang: string) => void;
type SpeakTTSFn = (text: string, lang: string) => Promise<void>;
type OnQuotaExceededFn = () => void;

function shortCode(fullLang: string): string {
  return fullLang.split('-')[0];
}

function normalizeLanguageCode(shortLang: string, fullLang: string): string {
  const langMap: Record<string, string> = {
    'en': 'en-US',
    'es': 'es-ES',
    'fr': 'fr-FR',
    'de': 'de-DE',
    'it': 'it-IT',
    'pt': 'pt-PT',
    'zh': 'zh-CN',
    'ja': 'ja-JP',
    'ko': 'ko-KR',
    'ar': 'ar-SA'
  };
  return langMap[shortLang] || fullLang;
}

export class TranslationService {
  private translator: speechsdk.TranslationRecognizer | null = null;
  private isSessionActive: boolean = false;

  constructor() {
    validateAzureConfig();
  }

  public async toggleMicrophone(
    speaker2Lang: string,
    speaker1LangRef: { current: string | null },
    setSpeaker1Lang: OnLockSpeaker1LangFn,
    onRecognized: OnRecognizedFn,
    onSpeaker1Translation: OnSpeakerTranslationFn,
    onSpeaker2Translation: OnSpeakerTranslationFn,
    speakTTS: SpeakTTSFn,
    onQuotaExceeded: OnQuotaExceededFn
  ): Promise<void> {
    if (this.isSessionActive) {
      await this.stopTranslation();
      this.isSessionActive = false;
      console.log('[SESSION] Session stopped:', { timestamp: new Date().toISOString() });
    } else {
      await this.startTranslation(
        speaker2Lang,
        speaker1LangRef,
        setSpeaker1Lang,
        onRecognized,
        onSpeaker1Translation,
        onSpeaker2Translation,
        speakTTS,
        onQuotaExceeded
      );
      this.isSessionActive = true;
      console.log('[SESSION] Session started:', { timestamp: new Date().toISOString() });
    }
  }

  public async startTranslation(
    speaker2Lang: string,
    speaker1LangRef: { current: string | null },
    setSpeaker1Lang: OnLockSpeaker1LangFn,
    onRecognized: OnRecognizedFn,
    onSpeaker1Translation: OnSpeakerTranslationFn,
    onSpeaker2Translation: OnSpeakerTranslationFn,
    speakTTS: SpeakTTSFn,
    onQuotaExceeded: OnQuotaExceededFn
  ): Promise<void> {
    try {
      console.log('[START] Initializing Translation Service...', { timestamp: new Date().toISOString() });
      const speechConfig = speechsdk.SpeechTranslationConfig.fromSubscription(
        AZURE_CONFIG.speechKey,
        AZURE_CONFIG.speechRegion
      );

      speechConfig.setProperty('SpeechServiceConnection_NoiseSuppression', 'true');
      speechConfig.setProperty('SpeechServiceConnection_EchoCancellation', 'true');
      speechConfig.setProperty('SpeechServiceConnection_InitialSilenceTimeoutMs', '10000');
      speechConfig.setProperty('SpeechServiceConnection_EndSilenceTimeoutMs', '3000');

      speechConfig.speechRecognitionLanguage = 'en-US';
      speechConfig.setProperty('SpeechServiceConnection_LanguageIdMode', 'Continuous');
      speechConfig.setProperty(
        'SpeechServiceConnection_AutoDetectSourceLanguages',
        'en-US,es-ES,fr-FR,de-DE,it-IT,pt-PT,zh-CN,ja-JP,ko-KR,ar-SA'
      );

      const supportedTargetLanguages = [
        'en', 'es', 'fr', 'de', 'it', 'pt', 'zh-Hans', 'ja', 'ko', 'ar'
      ];
      supportedTargetLanguages.forEach(lang => {
        speechConfig.addTargetLanguage(lang);
      });

      const shortSpeaker2 = shortCode(speaker2Lang);
      if (!supportedTargetLanguages.includes(shortSpeaker2)) {
        speechConfig.addTargetLanguage(shortSpeaker2);
      }

      console.log('[INFO] Speech Config:', {
        speechRecognitionLanguage: speechConfig.speechRecognitionLanguage,
        autoDetectSourceLanguages: speechConfig.getProperty('SpeechServiceConnection_AutoDetectSourceLanguages'),
        targetLanguages: speechConfig.targetLanguages,
        noiseSuppression: speechConfig.getProperty('SpeechServiceConnection_NoiseSuppression'),
        echoCancellation: speechConfig.getProperty('SpeechServiceConnection_EchoCancellation'),
        initialSilenceTimeout: speechConfig.getProperty('SpeechServiceConnection_InitialSilenceTimeoutMs'),
        endSilenceTimeout: speechConfig.getProperty('SpeechServiceConnection_EndSilenceTimeoutMs'),
        timestamp: new Date().toISOString()
      });

      const audioConfig = speechsdk.AudioConfig.fromDefaultMicrophoneInput();
      console.log('[INFO] Audio Config: Using default microphone input', { timestamp: new Date().toISOString() });

      this.translator = new speechsdk.TranslationRecognizer(speechConfig, audioConfig);
      console.log('[INFO] Translator Initialized', { timestamp: new Date().toISOString() });

      this.translator.sessionStarted = (_, event) => {
        console.log('[SESSION] Started:', {
          sessionId: event.sessionId,
          timestamp: new Date().toISOString()
        });
      };

      this.translator.sessionStopped = (_, event) => {
        console.log('[SESSION] Stopped:', {
          sessionId: event.sessionId,
          timestamp: new Date().toISOString()
        });
      };

      this.translator.canceled = (_, event) => {
        console.log('[CANCELED] Recognition canceled:', {
          reason: event.reason,
          errorDetails: event.errorDetails,
          sessionId: event.sessionId,
          timestamp: new Date().toISOString()
        });
        if (event.errorDetails?.includes('Quota exceeded')) {
          onRecognized('Quota exceeded. Please check your Azure Speech Service subscription or try again later.');
          onQuotaExceeded();
        }
      };

      this.translator.recognizing = (_, event) => {
        if (event.result.text) {
          console.log('[RECOGNIZING] Interim text:', event.result.text, {
            reason: event.result.reason,
            duration: event.result.duration / 10000,
            offset: event.result.offset / 10000,
            timestamp: new Date().toISOString()
          });
          onRecognized(event.result.text);
        } else {
          console.log('[RECOGNIZING] No interim text detected', {
            reason: event.result.reason,
            duration: event.result.duration / 10000,
            offset: event.result.offset / 10000,
            timestamp: new Date().toISOString()
          });
        }
      };

      this.translator.recognized = async (_, event) => {
        console.log('[RECOGNIZED] Event reason:', event.result.reason, { timestamp: new Date().toISOString() });
        if (event.result.reason === speechsdk.ResultReason.TranslatedSpeech) {
          const detectedLang = event.result.language;
          const text = event.result.text;
          const duration = event.result.duration / 10000;
          console.log('[INFO] Auto-detected Language:', detectedLang, {
            text: text,
            duration: duration,
            wordCount: text ? text.split(/\s+/).length : 0,
            translations: event.result.translations.languages.map(lang => ({
              lang: lang,
              text: event.result.translations.get(lang)
            })),
            timestamp: new Date().toISOString()
          });

          const shortDetected = shortCode(detectedLang);
          const shortSpeaker2 = shortCode(speaker2Lang);

          // Check if the detected language matches Speaker 2's language
          if (!speaker1LangRef.current && text && shortDetected === shortSpeaker2) {
            console.log('[INFO] Detected language matches Speaker 2’s language:', shortSpeaker2, { timestamp: new Date().toISOString() });
            // Display toast notification
            toast.error('No language detected, please try again', {
              position: 'bottom-center',
              toastId: 'language-match-error',
              className: 'speaker1-toast',
              autoClose: 3000,
            });
            return; // Skip further processing
          }

          // Only lock Speaker 1's language if:
          // 1. The detected text is not empty (i.e., actual speech was detected)
          // 2. The detected language is different from Speaker 2's preselected language
          let justLocked = false;
          if (!speaker1LangRef.current && text && shortDetected !== shortSpeaker2) {
            speaker1LangRef.current = detectedLang;
            setSpeaker1Lang(detectedLang);
            justLocked = true;
            console.log('[LOCK] Speaker 1’s language locked as:', detectedLang, { timestamp: new Date().toISOString() });
          } else if (!text) {
            console.log('[INFO] Skipping language lock: No speech detected (empty text)', { timestamp: new Date().toISOString() });
            return; // Skip further processing if no speech was detected
          } else if (shortDetected === shortSpeaker2) {
            console.log('[INFO] Skipping language lock: Detected language matches Speaker 2’s language:', shortSpeaker2, { timestamp: new Date().toISOString() });
          }

          // Compute shortSpeaker1Locked after locking to ensure we have the updated value
          const shortSpeaker1Locked = speaker1LangRef.current ? shortCode(speaker1LangRef.current) : null;

          // If the detected language doesn't match the locked language for Speaker 1 (and isn't Speaker 2's language), prompt the user to repeat
          if (shortSpeaker1Locked && shortDetected !== shortSpeaker1Locked && shortDetected !== shortSpeaker2) {
            console.log('[INFO] Detected language does not match Speaker 1’s locked language:', {
              detectedLang: shortDetected,
              speaker1Lang: shortSpeaker1Locked,
              timestamp: new Date().toISOString()
            });
            onRecognized('Detected language does not match your previously detected language. Please repeat your phrase.');
            return;
          }

          // Translation logic
          if ((justLocked || (shortSpeaker1Locked && shortDetected === shortSpeaker1Locked)) && shortDetected !== shortSpeaker2) {
            const translation = event.result.translations.get(shortSpeaker2);
            if (translation) {
              console.log(`[TRANSLATE] Speaker 1 → Speaker 2: ${translation}`, { timestamp: new Date().toISOString() });
              onSpeaker2Translation(translation);
              const normalizedSpeaker2Lang = normalizeLanguageCode(shortSpeaker2, speaker2Lang);
              await speakTTS(translation, normalizedSpeaker2Lang);
            } else {
              console.log('[TRANSLATE] No translation available for Speaker 2 language:', shortSpeaker2, { timestamp: new Date().toISOString() });
            }
          } else if (shortDetected === shortSpeaker2 && shortSpeaker1Locked && shortSpeaker2 !== shortSpeaker1Locked) {
            const translation = event.result.translations.get(shortSpeaker1Locked);
            if (translation) {
              console.log(`[TRANSLATE] Speaker 2 → Speaker 1: ${translation}`, { timestamp: new Date().toISOString() });
              onSpeaker1Translation(translation);
              const normalizedSpeaker1Lang = normalizeLanguageCode(shortSpeaker1Locked, speaker1LangRef.current!);
              await speakTTS(translation, normalizedSpeaker1Lang);
            } else {
              console.log('[TRANSLATE] No translation available for Speaker 1 language:', shortSpeaker1Locked, { timestamp: new Date().toISOString() });
            }
          } else {
            console.log('[TRANSLATE] Skipped: No translation needed or language mismatch:', {
              detectedLang: shortDetected,
              speaker1Lang: shortSpeaker1Locked,
              speaker2Lang: shortSpeaker2,
              timestamp: new Date().toISOString()
            });
          }
        } else {
          console.log('[RECOGNIZED] No translation result', {
            reason: event.result.reason,
            errorDetails: event.result.errorDetails,
            text: event.result.text,
            duration: event.result.duration / 10000,
            timestamp: new Date().toISOString()
          });
        }
      };

      await this.translator.startContinuousRecognitionAsync();
      console.log('[INFO] Continuous recognition started.', { timestamp: new Date().toISOString() });
    } catch (error) {
      console.error('[ERROR] Translation Service:', error, { timestamp: new Date().toISOString() });
      this.cleanup();
      throw error;
    }
  }

  public async stopTranslation(): Promise<void> {
    if (this.translator) {
      await this.translator.stopContinuousRecognitionAsync();
      console.log('[INFO] Stopped translation.', { timestamp: new Date().toISOString() });
      this.cleanup();
    }
  }

  private cleanup(): void {
    if (this.translator) {
      this.translator.close();
      this.translator = null;
      console.log('[INFO] Translator cleaned up.', { timestamp: new Date().toISOString() });
    }
  }

  public isActive(): boolean {
    return this.isSessionActive;
  }
}