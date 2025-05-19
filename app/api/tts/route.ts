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
