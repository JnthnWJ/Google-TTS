// Service to manage Kokoro TTS Web Worker
export class KokoroWorkerService {
  private worker: Worker | null = null;
  private isInitialized = false;
  private initializationPromise: Promise<void> | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.worker = new Worker('/kokoro-worker.js');
    }
  }

  async initialize(
    modelId: string = "onnx-community/Kokoro-82M-v1.0-ONNX",
    options: any = { dtype: "q8", device: "wasm" }
  ): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    if (!this.worker) {
      throw new Error('Web Worker not available');
    }

    this.initializationPromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Kokoro initialization timeout'));
      }, 60000); // 60 second timeout

      const handleMessage = (e: MessageEvent) => {
        const { type, error } = e.data;

        switch (type) {
          case 'INITIALIZED':
            clearTimeout(timeout);
            this.worker!.removeEventListener('message', handleMessage);
            this.isInitialized = true;
            resolve();
            break;
          case 'ERROR':
            clearTimeout(timeout);
            this.worker!.removeEventListener('message', handleMessage);
            reject(new Error(error));
            break;
          case 'INITIALIZING':
            // Progress update - could be used for UI feedback
            console.log('Kokoro initialization:', e.data.message);
            break;
        }
      };

      this.worker!.addEventListener('message', handleMessage);
      this.worker!.postMessage({
        type: 'INITIALIZE',
        data: { modelId, options }
      });
    });

    return this.initializationPromise;
  }

  async generateSpeech(text: string, voice: string = 'af_heart'): Promise<ArrayBuffer> {
    if (!this.isInitialized) {
      throw new Error('Kokoro TTS not initialized. Call initialize() first.');
    }

    if (!this.worker) {
      throw new Error('Web Worker not available');
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Speech generation timeout'));
      }, 30000); // 30 second timeout

      const handleMessage = (e: MessageEvent) => {
        const { type, audioData, error } = e.data;

        switch (type) {
          case 'GENERATED':
            clearTimeout(timeout);
            this.worker!.removeEventListener('message', handleMessage);
            resolve(audioData);
            break;
          case 'ERROR':
            clearTimeout(timeout);
            this.worker!.removeEventListener('message', handleMessage);
            reject(new Error(error));
            break;
          case 'GENERATING':
            // Progress update
            console.log('Kokoro generation:', e.data.message);
            break;
        }
      };

      this.worker!.addEventListener('message', handleMessage);
      this.worker!.postMessage({
        type: 'GENERATE',
        data: { text, voice }
      });
    });
  }

  destroy(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.isInitialized = false;
    this.initializationPromise = null;
  }
}

// Singleton instance
let kokoroService: KokoroWorkerService | null = null;

export function getKokoroService(): KokoroWorkerService {
  if (!kokoroService) {
    kokoroService = new KokoroWorkerService();
  }
  return kokoroService;
}
