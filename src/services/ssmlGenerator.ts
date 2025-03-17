import { getVoiceConfig } from './voiceMap';
import { voiceStyles } from './voiceStyles';

interface SSMLOptions {
  text: string;
  language: string;
  rate?: number;
  pitch?: number;
  style?: string;
  emphasis?: 'reduced' | 'moderate' | 'strong';
}

export class SSMLGenerator {
  static generate({
    text,
    language,
    rate = 1,
    pitch = 0,
    style = 'conversational',
    emphasis = 'moderate'
  }: SSMLOptions): string {
    const voice = getVoiceConfig(language);
    const hasStyle = voiceStyles[language]?.some(s => s.style === style);

    // Clean and escape the input text
    const cleanText = this.escapeXml(text);

    // **🔹 Adjust for Arabic, Chinese, Japanese**
    const isSpecialLang = ['ar-SA', 'zh-CN', 'ja-JP'].includes(language);

    if (isSpecialLang) {
      return `
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${language}">
  <voice name="${voice.name}">
    ${cleanText}
  </voice>
</speak>`.trim();
    }

    // **🔹 Standard SSML for other languages**
    return `
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" 
       xmlns:mstts="http://www.w3.org/2001/mstts" 
       xml:lang="${language}">
  <voice name="${voice.name}">
    ${hasStyle ? `<mstts:express-as style="${style}" styledegree="2">` : ''}
    <prosody rate="${rate}" pitch="${pitch}Hz">
      <emphasis level="${emphasis}">
        ${cleanText}
      </emphasis>
    </prosody>
    ${hasStyle ? '</mstts:express-as>' : ''}
  </voice>
</speak>`.trim();
  }

  private static escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}
