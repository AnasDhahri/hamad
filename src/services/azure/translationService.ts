import * as speechsdk from 'microsoft-cognitiveservices-speech-sdk';
import { AZURE_CONFIG, validateAzureConfig } from './config';
import { toast } from 'react-toastify';


type OnRecognizedFn = (text: string) => void;
type OnSpeakerTranslationFn = (translation: string) => void;
type OnLockSpeaker1LangFn = (lang: string) => void;
type SpeakTTSFn = (text: string, lang: string) => Promise<void>;
type OnQuotaExceededFn = () => void;

function shortCode(fullLang: string | undefined): string {
  if (!fullLang || typeof fullLang !== 'string') {
    console.warn(`[WARN] Invalid language code in shortCode: ${fullLang}`, { timestamp: new Date().toISOString() });
    return '';
  }
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
  private currentSpeaker: 'speaker1' | 'speaker2' | null = null;
  private recognitionLanguage: string | null = null;

  constructor() {
    validateAzureConfig();
  }
  public async initRecognition(): Promise<void> {
    try {
      const audioConfig = speechsdk.AudioConfig.fromDefaultMicrophoneInput();
      const dummyRecognizer = new speechsdk.SpeechRecognizer(
        speechsdk.SpeechConfig.fromSubscription(AZURE_CONFIG.speechKey, AZURE_CONFIG.speechRegion),
        audioConfig
      );
      dummyRecognizer.recognizeOnceAsync(() => {
        dummyRecognizer.close();
      });
    } catch (error) {
      console.warn('initRecognition failed:', error);
    }
  }

  private showNoLanguageDetectedToast(): void {
    toast.error('No language detected, please try again', {
      position: 'bottom-center',
      toastId: 'language-match-error',
      className: 'speaker1-toast',
      autoClose: 3000,
    });
  }

  private showLanguageMismatchToast(): void {
    toast.error('Please speak in your selected language', {
      position: 'bottom-center',
      toastId: 'language-mismatch-error',
      className: 'speaker1-toast',
      autoClose: 3000,
    });
  }

  public async toggleMicrophone(
    speaker: 'speaker1' | 'speaker2',
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
    }
    this.currentSpeaker = speaker;
    console.log('[DEBUG] Before starting translation:', {
      currentSpeaker: this.currentSpeaker,
      speaker1Lang: speaker1LangRef.current,
      speaker2Lang: speaker2Lang,
      timestamp: new Date().toISOString()
    });
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
    console.log('[SESSION] Session started for', speaker, { timestamp: new Date().toISOString() });
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

      // Enable automatic language detection with only 4 languages
      const autoDetectLanguages = ['en-US', 'ar-SA', 'es-ES', 'fr-FR'];
      speechConfig.setProperty(
        speechsdk.PropertyId.SpeechServiceConnection_AutoDetectSourceLanguages,
        autoDetectLanguages.join(',')
      );

      const speaker1Lang = speaker1LangRef.current;
      if (!speaker1Lang) {
        throw new Error('Speaker 1 language not selected');
      }
      speechConfig.speechRecognitionLanguage = this.currentSpeaker === 'speaker1' ? speaker1Lang : speaker2Lang;
      this.recognitionLanguage = speechConfig.speechRecognitionLanguage;

      const supportedTargetLanguages = [
        'en-US', 'es-ES', 'fr-FR', 'de-DE', 'it-IT', 'pt-PT', 'zh-Hans', 'ja-JP', 'ko-KR', 'ar-SA'
      ];
      supportedTargetLanguages.forEach(lang => {
        speechConfig.addTargetLanguage(shortCode(lang));
      });

      const shortSpeaker2 = shortCode(speaker2Lang);
      const fullSpeaker2 = normalizeLanguageCode(shortSpeaker2, speaker2Lang);
      if (!supportedTargetLanguages.includes(fullSpeaker2)) {
        speechConfig.addTargetLanguage(shortSpeaker2);
      }

      console.log('[INFO] Speech Config:', {
        speechRecognitionLanguage: speechConfig.speechRecognitionLanguage,
        autoDetectSourceLanguages: speechConfig.getProperty(speechsdk.PropertyId.SpeechServiceConnection_AutoDetectSourceLanguages),
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

      // Capture the current speaker at the time of starting translation
      const speakerAtStart = this.currentSpeaker;

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
            detectedLanguage: event.result.properties?.getProperty(speechsdk.PropertyId.SpeechServiceConnection_AutoDetectSourceLanguageResult),
            timestamp: new Date().toISOString()
          });
          onRecognized(event.result.text);
        } else {
          console.log('[RECOGNIZING] No interim text detected', {
            reason: event.result.reason,
            duration: event.result.duration / 10000,
            offset: event.result.offset / 10000,
            detectedLanguage: event.result.properties?.getProperty(speechsdk.PropertyId.SpeechServiceConnection_AutoDetectSourceLanguageResult),
            timestamp: new Date().toISOString()
          });
        }
      };

      this.translator.recognized = async (_, event) => {
        console.log('[RECOGNIZED] Event reason:', event.result.reason, { timestamp: new Date().toISOString() });
        if (event.result.reason === speechsdk.ResultReason.TranslatedSpeech) {
          let detectedLang = event.result.language;
          const autoDetectedLang = event.result.properties?.getProperty(
            speechsdk.PropertyId.SpeechServiceConnection_AutoDetectSourceLanguageResult
          );
          if (autoDetectedLang) {
            detectedLang = autoDetectedLang;
            console.log('[INFO] Auto-detected language:', detectedLang, { timestamp: new Date().toISOString() });
          } else if (!detectedLang) {
            console.warn('[WARN] Detected language is undefined, falling back to recognition language:', this.recognitionLanguage, { timestamp: new Date().toISOString() });
            detectedLang = this.recognitionLanguage || (speakerAtStart === 'speaker1' ? speaker1LangRef.current : speaker2Lang) || 'en-US';
          }

          const text = event.result.text;
          const duration = event.result.duration / 10000;

          console.log('[INFO] Recognized Language:', detectedLang, {
            text: text,
            duration: duration,
            wordCount: text ? text.split(/\s+/).length : 0,
            translations: Array.from(event.result.translations).map(([lang, text]) => ({
              lang,
              text
            })),
            timestamp: new Date().toISOString()
          });

          const shortDetected = shortCode(detectedLang);
          const shortSpeaker1 = shortCode(speaker1LangRef.current!);
          const shortSpeaker2 = shortCode(speaker2Lang);

          console.log('[DEBUG] Language Values:', {
            detectedLang: detectedLang,
            shortDetected: shortDetected,
            speaker1Lang: speaker1LangRef.current,
            shortSpeaker1: shortSpeaker1,
            speaker2Lang: speaker2Lang,
            shortSpeaker2: shortSpeaker2,
            currentSpeaker: speakerAtStart,
            timestamp: new Date().toISOString()
          });

          const expectedLang = speakerAtStart === 'speaker1' ? shortSpeaker1 : shortSpeaker2;
          if (text && shortDetected && shortDetected !== expectedLang) {
            console.log('[INFO] Detected language does not match selected language:', {
              detectedLang: shortDetected,
              expectedLang: expectedLang,
              timestamp: new Date().toISOString()
            });
            this.showLanguageMismatchToast();
            return;
          }

          if (speakerAtStart === 'speaker1' && text && shortDetected && shortDetected === shortSpeaker2) {
            console.log('[INFO] Detected language matches Speaker 2’s language:', shortSpeaker2, { timestamp: new Date().toISOString() });
            this.showNoLanguageDetectedToast();
            return;
          } else if (speakerAtStart === 'speaker2' && text && shortDetected && shortDetected === shortSpeaker1) {
            console.log('[INFO] Detected language matches Speaker 1’s language:', shortSpeaker1, { timestamp: new Date().toISOString() });
            this.showNoLanguageDetectedToast();
            return;
          }

          if (!text) {
            console.log('[INFO] Skipping processing: No speech detected (empty text)', { timestamp: new Date().toISOString() });
            this.showNoLanguageDetectedToast();
            return;
          }

          if (speakerAtStart === 'speaker1' && shortDetected === shortSpeaker1 && shortDetected !== shortSpeaker2) {
            const translation = event.result.translations.get(shortSpeaker2);
            console.log('[DEBUG] Translation for Speaker 2:', {
              targetLang: shortSpeaker2,
              translation: translation,
              availableTranslations: Array.from(event.result.translations),
              timestamp: new Date().toISOString()
            });
            if (translation) {
              console.log(`[TRANSLATE] Speaker 1 → Speaker 2: ${translation}`, { timestamp: new Date().toISOString() });
              onSpeaker2Translation(translation);
              const normalizedSpeaker2Lang = normalizeLanguageCode(shortSpeaker2, speaker2Lang);
              await speakTTS(translation, normalizedSpeaker2Lang);
            } else {
              console.log('[TRANSLATE] No translation available for Speaker 2 language:', shortSpeaker2, { timestamp: new Date().toISOString() });
            }
          } else if (speakerAtStart === 'speaker2' && shortDetected === shortSpeaker2 && shortSpeaker2 !== shortSpeaker1) {
            const translation = event.result.translations.get(shortSpeaker1);
            console.log('[DEBUG] Translation for Speaker 1:', {
              targetLang: shortSpeaker1,
              translation: translation,
              availableTranslations: Array.from(event.result.translations),
              timestamp: new Date().toISOString()
            });
            if (translation) {
              console.log(`[TRANSLATE] Speaker 2 → Speaker 1: ${translation}`, { timestamp: new Date().toISOString() });
              onSpeaker1Translation(translation);
              const normalizedSpeaker1Lang = normalizeLanguageCode(shortSpeaker1, speaker1LangRef.current!);
              await speakTTS(translation, normalizedSpeaker1Lang);
            } else {
              console.log('[TRANSLATE] No translation available for Speaker 1 language:', shortSpeaker1, { timestamp: new Date().toISOString() });
            }
          } else {
            console.log('[TRANSLATE] Skipped: No translation needed or language mismatch:', {
              detectedLang: shortDetected,
              speaker1Lang: shortSpeaker1,
              speaker2Lang: shortSpeaker2,
              currentSpeaker: speakerAtStart,
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
      this.isSessionActive = false;
      this.currentSpeaker = null;
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
