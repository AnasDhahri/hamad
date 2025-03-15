export interface VoiceConfig {
  name: string;
  gender: 'Female' | 'Male';
  styles: string[];
}

export interface VoiceStyle {
  name: string;
  style: string;
  description: string;
}