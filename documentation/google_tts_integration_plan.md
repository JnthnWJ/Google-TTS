# Google Cloud Text-to-Speech Integration Plan

This document outlines a comprehensive implementation plan for integrating Google Cloud Text-to-Speech API into our existing text-to-speech application.

## Table of Contents
1. [Introduction](#introduction)
2. [Prerequisites](#prerequisites)
3. [Setting Up Google Cloud Project](#setting-up-google-cloud-project)
4. [Authentication Setup](#authentication-setup)
5. [Installing Dependencies](#installing-dependencies)
6. [API Integration](#api-integration)
7. [Audio File Handling](#audio-file-handling)
8. [User Interface Modifications](#user-interface-modifications)
9. [Performance Optimization](#performance-optimization)
10. [Cost Management](#cost-management)
11. [Offline Fallback](#offline-fallback)
12. [Testing Procedures](#testing-procedures)
13. [Security Considerations](#security-considerations)
14. [Deployment Checklist](#deployment-checklist)

## Introduction

Google Cloud Text-to-Speech API provides high-quality speech synthesis with a wide range of voices and languages. This integration will enhance our application by providing more natural-sounding voices, additional language options, and improved audio quality.

## Prerequisites

Before beginning the integration, ensure you have:

- A Google Cloud account with billing enabled
- Node.js 14.x or later installed
- Basic familiarity with Google Cloud services
- Access to the existing text-to-speech application codebase

## Setting Up Google Cloud Project

1. **Create a new Google Cloud Project**:
   - Go to the [Google Cloud Console](https://console.cloud.google.com/)
   - Click "New Project" and provide a name (e.g., "tts-application")
   - Click "Create"

2. **Enable the Text-to-Speech API**:
   - In the Google Cloud Console, navigate to "APIs & Services" > "Library"
   - Search for "Text-to-Speech API"
   - Click on the API and then click "Enable"

3. **Set up billing**:
   - Ensure billing is enabled for your project
   - Consider setting up budget alerts to monitor costs

## Authentication Setup

1. **Create a service account**:
   ```bash
   gcloud iam service-accounts create tts-service-account \
     --display-name="Text-to-Speech Service Account"
   ```

2. **Grant the service account the necessary permissions**:
   ```bash
   gcloud projects add-iam-policy-binding j-reader \
     --member="serviceAccount:tts-service-account@j-reader.iam.gserviceaccount.com" \
     --role="roles/cloudtexttospeech.user"
   ```

3. **Generate and download a service account key**:
   ```bash
   gcloud iam service-accounts keys create ./google-credentials.json \
     --iam-account=tts-service-account@j-reader.iam.gserviceaccount.com
   ```

4. **Secure the credentials file**:
   - Add `google-credentials.json` to `.gitignore`
   - Store the file securely and restrict access
   - For production, consider using environment variables or a secret management service

## Installing Dependencies

1. **Install the Google Cloud Text-to-Speech client library**:
   ```bash
   npm install --save @google-cloud/text-to-speech
   ```

2. **Install additional dependencies for audio handling**:
   ```bash
   npm install --save howler
   ```

## API Integration

1. **Create a service file for Google TTS integration**:

Create a new file at `lib/google-tts-service.ts`:

```typescript
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
```

2. **Create an API route handler for the TTS service**:

Create a new file at `app/api/tts/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { synthesizeSpeech, getAvailableVoices } from '@/lib/google-tts-service';
import fs from 'fs';
import path from 'path';
import { writeFile } from 'fs/promises';

// Create a directory for audio files if it doesn't exist
const audioDir = path.join(process.cwd(), 'public', 'audio');
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, languageCode, voiceName, ssmlGender, speakingRate, pitch } = body;
    
    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }
    
    const result = await synthesizeSpeech({
      text,
      languageCode,
      voiceName,
      ssmlGender,
      speakingRate,
      pitch,
    });
    
    // Save the audio file to the public directory
    const filePath = path.join(audioDir, result.fileName);
    await writeFile(filePath, result.audioContent);
    
    // Return the URL to the audio file
    const audioUrl = `/audio/${result.fileName}`;
    
    return NextResponse.json({ 
      success: true, 
      audioUrl,
      fileName: result.fileName
    });
  } catch (error: any) {
    console.error('Error in TTS API route:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const languageCode = searchParams.get('languageCode') || undefined;
    
    const voices = await getAvailableVoices(languageCode);
    
    return NextResponse.json({ voices });
  } catch (error: any) {
    console.error('Error fetching voices:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

## Audio File Handling

1. **Create an audio player service**:

Create a new file at `lib/audio-player-service.ts`:

```typescript
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
```

## User Interface Modifications

1. **Update the TextToSpeechApp component**:

Modify the existing `components/text-to-speech-app.tsx` file to integrate with Google TTS:

```typescript
// Add imports for the TTS service and audio player
import { useEffect, useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import AudioPlayerService from "@/lib/audio-player-service";

// Add state variables for Google TTS
const [voices, setVoices] = useState([]);
const [selectedVoice, setSelectedVoice] = useState("");
const [languageCode, setLanguageCode] = useState("en-US");
const [isLoading, setIsLoading] = useState(false);
const [audioUrl, setAudioUrl] = useState("");
const audioPlayer = useRef(AudioPlayerService.getInstance());
const { toast } = useToast();

// Add function to fetch available voices
useEffect(() => {
  async function fetchVoices() {
    try {
      const response = await fetch(`/api/tts?languageCode=${languageCode}`);
      const data = await response.json();
      if (data.voices) {
        setVoices(data.voices);
        // Set default voice if available
        if (data.voices.length > 0) {
          setSelectedVoice(data.voices[0].name);
        }
      }
    } catch (error) {
      console.error("Error fetching voices:", error);
      toast({
        title: "Error",
        description: "Failed to load available voices",
        variant: "destructive",
      });
    }
  }
  
  fetchVoices();
}, [languageCode]);

// Add function to generate speech
async function generateSpeech() {
  if (!text.trim()) {
    toast({
      title: "Error",
      description: "Please enter some text to convert to speech",
      variant: "destructive",
    });
    return;
  }
  
  setIsLoading(true);
  
  try {
    const response = await fetch("/api/tts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        languageCode,
        voiceName: selectedVoice,
        speakingRate: speed,
        pitch: pitch - 1, // Adjust pitch to match Google's scale (-10 to 10)
      }),
    });
    
    const data = await response.json();
    
    if (data.audioUrl) {
      setAudioUrl(data.audioUrl);
      await audioPlayer.current.loadAudio(data.audioUrl);
      setDuration(audioPlayer.current.getDuration());
      setIsPlaying(true);
      audioPlayer.current.play();
    } else {
      throw new Error(data.error || "Failed to generate speech");
    }
  } catch (error) {
    console.error("Error generating speech:", error);
    toast({
      title: "Error",
      description: "Failed to generate speech",
      variant: "destructive",
    });
  } finally {
    setIsLoading(false);
  }
}

// Update the togglePlay function
const togglePlay = () => {
  if (!audioUrl) {
    generateSpeech();
    return;
  }
  
  if (isPlaying) {
    audioPlayer.current.pause();
  } else {
    audioPlayer.current.play();
  }
  
  setIsPlaying(!isPlaying);
};

// Add audio player event listeners
useEffect(() => {
  if (audioPlayer.current) {
    audioPlayer.current.onEnd(() => {
      setIsPlaying(false);
      setCurrentTime(0);
    });
    
    // Update current time during playback
    const interval = setInterval(() => {
      if (isPlaying) {
        setCurrentTime(audioPlayer.current.getCurrentTime());
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }
}, [isPlaying]);

// Update the UI to include language selection and voice selection
// Replace the existing voice selection with:
<div>
  <label className="block text-sm font-medium mb-2">Language</label>
  <Select value={languageCode} onValueChange={setLanguageCode}>
    <SelectTrigger className="bg-white/10 border-white/20 backdrop-blur-sm rounded-xl text-white">
      <SelectValue placeholder="Select a language" />
    </SelectTrigger>
    <SelectContent className="bg-white/80 backdrop-blur-xl border-white/30">
      <SelectItem value="en-US">English (US)</SelectItem>
      <SelectItem value="en-GB">English (UK)</SelectItem>
      <SelectItem value="es-ES">Spanish</SelectItem>
      <SelectItem value="fr-FR">French</SelectItem>
      <SelectItem value="de-DE">German</SelectItem>
      <SelectItem value="ja-JP">Japanese</SelectItem>
      <SelectItem value="ko-KR">Korean</SelectItem>
      <SelectItem value="zh-CN">Chinese (Simplified)</SelectItem>
    </SelectContent>
  </Select>
</div>

<div>
  <label className="block text-sm font-medium mb-2">Voice</label>
  <Select value={selectedVoice} onValueChange={setSelectedVoice}>
    <SelectTrigger className="bg-white/10 border-white/20 backdrop-blur-sm rounded-xl text-white">
      <SelectValue placeholder="Select a voice" />
    </SelectTrigger>
    <SelectContent className="bg-white/80 backdrop-blur-xl border-white/30">
      {voices.map((voice) => (
        <SelectItem key={voice.name} value={voice.name}>
          {voice.name} ({voice.ssmlGender})
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>

// Add a Generate button
<Button 
  onClick={generateSpeech}
  disabled={isLoading || !text.trim()}
  className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
>
  {isLoading ? "Generating..." : "Generate Speech"}
</Button>
```

## Performance Optimization
//Don't start on this until explicity prompted!!
1. **Implement caching for generated audio files**:
   - Store generated audio files with unique identifiers
   - Check cache before generating new audio for identical requests
   - Implement a cleanup mechanism for old cached files

2. **Optimize API requests**:
   - Implement debouncing for text input to avoid excessive API calls
   - Use streaming for long text when possible
   - Consider batch processing for large documents

3. **Implement progressive loading**:
   - Show loading indicators during API calls
   - Enable playback as soon as enough audio is buffered

## Cost Management

1. **Monitor API usage**:
   - Set up Google Cloud budget alerts
   - Implement usage tracking in the application
   - Consider implementing quotas for users

2. **Optimize request volume**:
   - Cache frequently used phrases
   - Implement rate limiting
   - Consider batching multiple short requests

3. **Choose appropriate voice models**:
   - Standard voices are less expensive than WaveNet or Neural2 voices
   - Select the appropriate quality based on use case


2. **Integration Testing**:
   - Test the API routes with actual requests
   - Verify audio file generation and storage
   - Test the UI components with the TTS service

3. **End-to-End Testing**:
   - Test the complete flow from text input to audio playback
   - Test with various languages and voice options
   - Test performance with long text inputs

4. **Manual Testing Checklist**:
   - Verify audio quality across different voices
   - Test playback controls (play, pause, seek)
   - Test download functionality
   - Verify proper error messages for failed requests

## Security Considerations

1. **API Key Protection**:
   - Never expose API keys in client-side code
   - Use environment variables for storing credentials
   - Implement API key rotation

2. **Input Validation**:
   - Sanitize and validate all user inputs
   - Implement rate limiting to prevent abuse
   - Set maximum text length limits

3. 
## Deployment Checklist

1. **Environment Configuration**:
   - Set up environment variables for API credentials
   - Configure proper CORS settings
   - Set up proper logging

2. **Performance Monitoring**:
   - Implement application monitoring
   - Set up alerts for API errors or quota limits
   - Monitor audio file storage usage

3. **Documentation**:
   - Update user documentation with new features
   - Document API endpoints and parameters
   - Create troubleshooting guides

4. **Rollout Strategy**:
   - Consider a phased rollout to detect issues early
   - Implement feature flags for easy rollback
   - Plan for backward compatibility
