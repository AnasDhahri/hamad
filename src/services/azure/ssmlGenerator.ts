import { getVoiceConfig, detectEmotion } from './voiceMap';

interface SSMLOptions {
  text: string;
  language: string;
  style?: string;
  rate?: number;
  pitch?: number;
}

export class SSMLGenerator {
  static generate({
    text,
    language,
    style = 'chat',
    rate = 1.0,
    pitch = 0
  }: SSMLOptions): string {
    const voice = getVoiceConfig(language);
    const detectedStyle = style || detectEmotion(text);
    const hasStyle = voice.styles.includes(detectedStyle);
    
    // Clean and escape the input text
    const cleanText = this.escapeXml(text);

    // Add prosody and breaks for more natural speech
    const prosodyText = this.addProsodyBreaks(cleanText);

    // Adjust rate and pitch based on emotion
    const emotionSettings = this.getEmotionSettings(detectedStyle);
    const finalRate = rate * emotionSettings.rate;
    const finalPitch = pitch + emotionSettings.pitch;

    return `
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" 
       xmlns:mstts="http://www.w3.org/2001/mstts" 
       xml:lang="${language}">
  <voice name="${voice.name}">
    ${hasStyle ? `<mstts:express-as style="${detectedStyle}" styledegree="1.5">` : ''}
      <prosody rate="${finalRate}" pitch="${finalPitch}Hz" volume="+20%">
        ${this.addEmphasis(prosodyText, detectedStyle)}
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

  private static addProsodyBreaks(text: string): string {
    return text
      .replace(/([.!?]+)/g, '$1<break time="300ms"/>')
      .replace(/([,;:])/g, '$1<break time="200ms"/>')
      .replace(/(\n|[-—])/g, '<break time="150ms"/>')
      .replace(/([.!?]) ([A-Z])/g, '$1<break time="400ms"/>$2');
  }

  private static getEmotionSettings(emotion: string): { rate: number; pitch: number } {
    const settings = {
      excited: { rate: 1.1, pitch: 2 },
      friendly: { rate: 1.0, pitch: 1 },
      hopeful: { rate: 1.0, pitch: 1 },
      sad: { rate: 0.95, pitch: -1 },
      empathetic: { rate: 0.95, pitch: 0 },
      chat: { rate: 1.0, pitch: 0 },
      cheerful: { rate: 1.1, pitch: 2 },
      angry: { rate: 1.2, pitch: 3 }
    };

    return settings[emotion as keyof typeof settings] || settings.chat;
  }

  private static addEmphasis(text: string, emotion: string): string {
    if (['excited', 'angry'].includes(emotion)) {
      return `<emphasis level="strong">${text}</emphasis>`;
    }
    if (emotion === 'sad') {
      return `<emphasis level="reduced">${text}</emphasis>`;
    }
    return `<emphasis level="moderate">${text}</emphasis>`;
  }
}