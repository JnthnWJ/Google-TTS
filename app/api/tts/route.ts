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
    const {
      text,
      provider = 'google',
      languageCode,
      voiceName,
      ssmlGender,
      speakingRate,
      pitch,
      volumeGainDb
    } = body;

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Only handle Google TTS on the server side
    // Kokoro will be handled client-side
    if (provider !== 'google') {
      return NextResponse.json({ error: 'Only Google TTS is supported server-side' }, { status: 400 });
    }

    const result = await synthesizeSpeech({
      text,
      languageCode,
      voiceName,
      ssmlGender,
      speakingRate,
      pitch,
      volumeGainDb,
    });

    // Save the audio file to the public directory
    const filePath = path.join(audioDir, result.fileName);
    await writeFile(filePath, result.audioContent);

    // Return the URL to the audio file
    const audioUrl = `/audio/${result.fileName}`;

    return NextResponse.json({
      success: true,
      audioUrl,
      fileName: result.fileName,
      provider: 'google'
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
    const provider = searchParams.get('provider') || 'google';

    if (provider === 'kokoro') {
      // Return Kokoro voices
      const kokoroVoices = getKokoroVoices(languageCode);
      return NextResponse.json({ voices: kokoroVoices, provider: 'kokoro' });
    } else {
      // Return Google voices
      const voices = await getAvailableVoices(languageCode);
      return NextResponse.json({ voices, provider: 'google' });
    }
  } catch (error: any) {
    console.error('Error fetching voices:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function getKokoroVoices(languageCode?: string) {
  const allVoices = [
    // American English - Female
    { name: 'af_heart', languageCode: 'en-US', ssmlGender: 'FEMALE', quality: 'A', traits: '🚺❤️' },
    { name: 'af_bella', languageCode: 'en-US', ssmlGender: 'FEMALE', quality: 'A-', traits: '🚺🔥' },
    { name: 'af_nicole', languageCode: 'en-US', ssmlGender: 'FEMALE', quality: 'B-', traits: '🚺🎧' },
    { name: 'af_alloy', languageCode: 'en-US', ssmlGender: 'FEMALE', quality: 'C', traits: '🚺' },
    { name: 'af_aoede', languageCode: 'en-US', ssmlGender: 'FEMALE', quality: 'C+', traits: '🚺' },
    { name: 'af_jessica', languageCode: 'en-US', ssmlGender: 'FEMALE', quality: 'D', traits: '🚺' },
    { name: 'af_kore', languageCode: 'en-US', ssmlGender: 'FEMALE', quality: 'C+', traits: '🚺' },
    { name: 'af_nova', languageCode: 'en-US', ssmlGender: 'FEMALE', quality: 'C', traits: '🚺' },
    { name: 'af_river', languageCode: 'en-US', ssmlGender: 'FEMALE', quality: 'D', traits: '🚺' },
    { name: 'af_sarah', languageCode: 'en-US', ssmlGender: 'FEMALE', quality: 'C+', traits: '🚺' },
    { name: 'af_sky', languageCode: 'en-US', ssmlGender: 'FEMALE', quality: 'C-', traits: '🚺' },

    // American English - Male
    { name: 'am_michael', languageCode: 'en-US', ssmlGender: 'MALE', quality: 'C+', traits: '🚹' },
    { name: 'am_fenrir', languageCode: 'en-US', ssmlGender: 'MALE', quality: 'C+', traits: '🚹' },
    { name: 'am_puck', languageCode: 'en-US', ssmlGender: 'MALE', quality: 'C+', traits: '🚹' },
    { name: 'am_adam', languageCode: 'en-US', ssmlGender: 'MALE', quality: 'F+', traits: '🚹' },
    { name: 'am_echo', languageCode: 'en-US', ssmlGender: 'MALE', quality: 'D', traits: '🚹' },
    { name: 'am_eric', languageCode: 'en-US', ssmlGender: 'MALE', quality: 'D', traits: '🚹' },
    { name: 'am_liam', languageCode: 'en-US', ssmlGender: 'MALE', quality: 'D', traits: '🚹' },
    { name: 'am_onyx', languageCode: 'en-US', ssmlGender: 'MALE', quality: 'D', traits: '🚹' },
    { name: 'am_santa', languageCode: 'en-US', ssmlGender: 'MALE', quality: 'D-', traits: '🚹' },

    // British English - Female
    { name: 'bf_emma', languageCode: 'en-GB', ssmlGender: 'FEMALE', quality: 'B-', traits: '🚺' },
    { name: 'bf_isabella', languageCode: 'en-GB', ssmlGender: 'FEMALE', quality: 'C', traits: '🚺' },
    { name: 'bf_alice', languageCode: 'en-GB', ssmlGender: 'FEMALE', quality: 'D', traits: '🚺' },
    { name: 'bf_lily', languageCode: 'en-GB', ssmlGender: 'FEMALE', quality: 'D', traits: '🚺' },

    // British English - Male
    { name: 'bm_fable', languageCode: 'en-GB', ssmlGender: 'MALE', quality: 'C', traits: '🚹' },
    { name: 'bm_george', languageCode: 'en-GB', ssmlGender: 'MALE', quality: 'C', traits: '🚹' },
    { name: 'bm_daniel', languageCode: 'en-GB', ssmlGender: 'MALE', quality: 'D', traits: '🚹' },
    { name: 'bm_lewis', languageCode: 'en-GB', ssmlGender: 'MALE', quality: 'D+', traits: '🚹' },
  ];

  if (languageCode) {
    return allVoices.filter(voice => voice.languageCode === languageCode);
  }
  return allVoices;
}
