interface Language {
  code: string;
  name: string;
  flag: string;
}

export const languages: Language[] = [
  { code: 'en-US', name: 'English', flag: 'us' },
  { code: 'es-ES', name: 'Spanish', flag: 'es' },
  { code: 'fr-FR', name: 'French', flag: 'fr' },
  { code: 'de-DE', name: 'German', flag: 'de' },
  { code: 'it-IT', name: 'Italian', flag: 'it' },
  { code: 'pt-PT', name: 'Portuguese', flag: 'pt' },
  { code: 'zh-CN', name: 'Chinese', flag: 'cn' },
  { code: 'ja-JP', name: 'Japanese', flag: 'jp' },
  { code: 'ko-KR', name: 'Korean', flag: 'kr' },
  { code: 'ar-SA', name: 'Arabic', flag: 'qa' }
];