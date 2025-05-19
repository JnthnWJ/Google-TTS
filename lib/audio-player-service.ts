import { Howl } from 'howler';

class AudioPlayerService {
  private static instance: AudioPlayerService;
  private sound: Howl | null = null;
  private currentAudioUrl: string | null = null;

  private constructor() {}

  public static getInstance(): AudioPlayerService {
    if (!AudioPlayerService.instance) {
      AudioPlayerService.instance = new AudioPlayerService();
    }
    return AudioPlayerService.instance;
  }

  public loadAudio(audioUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.sound) {
        this.sound.stop();
        this.sound.unload();
      }

      this.currentAudioUrl = audioUrl;
      this.sound = new Howl({
        src: [audioUrl],
        html5: true,
        onload: () => resolve(),
        onloaderror: (id, error) => reject(error),
      });
    });
  }

  public play(): void {
    if (this.sound) {
      this.sound.play();
    }
  }

  public pause(): void {
    if (this.sound) {
      this.sound.pause();
    }
  }

  public stop(): void {
    if (this.sound) {
      this.sound.stop();
    }
  }

  public setVolume(volume: number): void {
    if (this.sound) {
      this.sound.volume(volume);
    }
  }

  public setRate(rate: number): void {
    if (this.sound) {
      this.sound.rate(rate);
    }
  }

  public getDuration(): number {
    return this.sound ? this.sound.duration() : 0;
  }

  public getCurrentTime(): number {
    return this.sound ? this.sound.seek() as number : 0;
  }

  public seek(position: number): void {
    if (this.sound) {
      this.sound.seek(position);
    }
  }

  public onEnd(callback: () => void): void {
    if (this.sound) {
      this.sound.on('end', callback);
    }
  }

  public getCurrentAudioUrl(): string | null {
    return this.currentAudioUrl;
  }
}

export default AudioPlayerService;
