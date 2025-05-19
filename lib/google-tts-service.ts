import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import util from 'util';
import path from 'path';

// Create a client with explicit credentials
const client = new TextToSpeechClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS || './google-credentials.json',
});

export interface TTSRequest {
  text: string;
  languageCode?: string;
  voiceName?: string;
  ssmlGender?: 'NEUTRAL' | 'MALE' | 'FEMALE' | 'SSML_VOICE_GENDER_UNSPECIFIED';
  audioEncoding?: 'MP3' | 'LINEAR16' | 'OGG_OPUS' | 'MULAW' | 'ALAW';
  speakingRate?: number;
  pitch?: number;
  volumeGainDb?: number;
}

export interface TTSResponse {
  audioContent: Uint8Array;
  audioUrl?: string;
  fileName: string;
}

export async function synthesizeSpeech({
  text,
  languageCode = 'en-US',
  voiceName = 'en-US-Neural2-F',
  ssmlGender = 'FEMALE',
  audioEncoding = 'MP3',
  speakingRate = 1.0,
  pitch = 0.0,
  volumeGainDb = 0.0,
}: TTSRequest): Promise<TTSResponse> {
  try {
    // Construct the request
    const request = {
      input: { text },
      voice: {
        languageCode,
        name: voiceName,
        ssmlGender,
      },
      audioConfig: {
        audioEncoding,
        speakingRate,
        pitch,
        volumeGainDb,
      },
    };

    // Perform the text-to-speech request
    const [response] = await client.synthesizeSpeech(request);
    
    // Generate a unique filename
    const fileName = `tts-${uuidv4()}.mp3`;
    
    return {
      audioContent: response.audioContent as Uint8Array,
      fileName,
    };
  } catch (error) {
    console.error('Error synthesizing speech:', error);
    throw error;
  }
}

export async function getAvailableVoices(languageCode?: string) {
  try {
    const [result] = await client.listVoices({ languageCode });
    return result.voices || [];
  } catch (error) {
    console.error('Error fetching voices:', error);
    throw error;
  }
}
