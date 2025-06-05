// Web Worker for Kokoro TTS to avoid Next.js bundling issues
// This runs in a separate thread and can import kokoro-js without webpack interference

let kokoroTTS = null;
let isInitialized = false;

self.onmessage = async function(e) {
  const { type, data } = e.data;

  try {
    switch (type) {
      case 'INITIALIZE':
        await initializeKokoro(data);
        break;
      case 'GENERATE':
        await generateSpeech(data);
        break;
      default:
        self.postMessage({
          type: 'ERROR',
          error: `Unknown message type: ${type}`
        });
    }
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      error: error.message || 'Unknown error occurred'
    });
  }
};

async function initializeKokoro({ modelId, options }) {
  try {
    if (isInitialized) {
      self.postMessage({
        type: 'INITIALIZED',
        success: true
      });
      return;
    }

    self.postMessage({
      type: 'INITIALIZING',
      message: 'Loading Kokoro TTS module...'
    });

    // Dynamic import of kokoro-js in the worker context
    const kokoroModule = await import('https://cdn.jsdelivr.net/npm/kokoro-js@1.2.1/+esm');
    const { KokoroTTS } = kokoroModule;

    self.postMessage({
      type: 'INITIALIZING',
      message: 'Loading model weights...'
    });

    kokoroTTS = await KokoroTTS.from_pretrained(modelId, options);
    isInitialized = true;

    self.postMessage({
      type: 'INITIALIZED',
      success: true
    });
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      error: `Failed to initialize Kokoro: ${error.message}`
    });
  }
}

async function generateSpeech({ text, voice }) {
  try {
    if (!isInitialized || !kokoroTTS) {
      throw new Error('Kokoro TTS not initialized');
    }

    self.postMessage({
      type: 'GENERATING',
      message: 'Generating speech...'
    });

    const audio = await kokoroTTS.generate(text, { voice });

    // Try different ways to get the audio data
    let audioData;
    if (audio.save && typeof audio.save === 'function') {
      audioData = await audio.save();
    } else if (audio.data) {
      audioData = audio.data;
    } else if (audio.buffer) {
      audioData = audio.buffer;
    } else {
      audioData = audio;
    }

    // Convert to transferable format
    const audioArray = audioData instanceof ArrayBuffer ? new Uint8Array(audioData) : audioData;

    self.postMessage({
      type: 'GENERATED',
      audioData: audioArray.buffer
    }, [audioArray.buffer]);

  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      error: `Failed to generate speech: ${error.message}`
    });
  }
}
