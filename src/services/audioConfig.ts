import * as speechsdk from 'microsoft-cognitiveservices-speech-sdk';

export class AudioConfigService {
  private static audioStream: MediaStream | null = null;
  private static selectedOutputDeviceId: string = 'default';

  static setOutputDevice(deviceId: string) {
    this.selectedOutputDeviceId = deviceId;
  }

  static async createMicrophoneConfig(): Promise<speechsdk.AudioConfig> {
    try {
      await this.cleanup();

      this.audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: 16000
        }
      });
      
      return speechsdk.AudioConfig.fromStreamInput(this.audioStream);
    } catch (error: any) {
      if (error.name === 'NotAllowedError') {
        throw new Error('Microphone access denied. Please allow microphone access in your browser settings.');
      } else if (error.name === 'NotFoundError') {
        throw new Error('No microphone found. Please connect a microphone and try again.');
      }
      throw new Error(`Microphone initialization failed: ${error.message}`);
    }
  }

  static createSpeakerConfig(): speechsdk.AudioConfig {
    try {
      if (this.selectedOutputDeviceId && this.selectedOutputDeviceId !== 'default') {
        return speechsdk.AudioConfig.fromSpeakerOutput(this.selectedOutputDeviceId);
      }
      return speechsdk.AudioConfig.fromDefaultSpeakerOutput();
    } catch (error) {
      console.warn('Failed to create speaker config, using default:', error);
      return speechsdk.AudioConfig.fromDefaultSpeakerOutput();
    }
  }

  static async cleanup(): Promise<void> {
    if (this.audioStream) {
      this.audioStream.getTracks().forEach(track => track.stop());
      this.audioStream = null;
    }
  }
}