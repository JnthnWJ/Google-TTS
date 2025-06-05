"use client"

import { useState, useEffect, useRef } from "react"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Download, Pause, Play, Volume2, VolumeX } from "lucide-react"
import AudioPlayerService from "@/lib/audio-player-service"
import { useToast } from "@/hooks/use-toast"
import ProviderToggle, { TTSProvider } from "@/components/ui/provider-toggle"
import { getKokoroService } from "@/lib/kokoro-worker-service"

export default function TextToSpeechApp() {
  const [text, setText] = useState("")
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [pitch, setPitch] = useState(1)
  const [duration, setDuration] = useState(0)
  const [voices, setVoices] = useState<any[]>([])
  const [selectedVoice, setSelectedVoice] = useState("")
  const [languageCode, setLanguageCode] = useState("en-US")
  const [isLoading, setIsLoading] = useState(false)
  const [audioUrl, setAudioUrl] = useState("")
  const [selectedProvider, setSelectedProvider] = useState<TTSProvider>('google')
  const [kokoroInitialized, setKokoroInitialized] = useState(false)
  const audioPlayer = useRef(AudioPlayerService.getInstance())
  const { toast } = useToast()

  // Initialize provider from localStorage
  useEffect(() => {
    const savedProvider = localStorage.getItem('tts-provider') as TTSProvider
    if (savedProvider && (savedProvider === 'google' || savedProvider === 'kokoro')) {
      setSelectedProvider(savedProvider)
    }
  }, [])

  // Fetch available voices when language or provider changes
  useEffect(() => {
    async function fetchVoices() {
      try {
        const response = await fetch(`/api/tts?languageCode=${languageCode}&provider=${selectedProvider}`);
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
  }, [languageCode, selectedProvider, toast]);

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

  // Update playback rate when it changes
  useEffect(() => {
    if (audioPlayer.current && audioUrl) {
      audioPlayer.current.setRate(playbackRate);
    }
  }, [playbackRate, audioUrl]);

  // Generate speech from text
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
      if (selectedProvider === 'kokoro') {
        await generateSpeechWithKokoro();
      } else {
        await generateSpeechWithGoogle();
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

  async function generateSpeechWithGoogle() {
    const response = await fetch("/api/tts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        provider: 'google',
        languageCode,
        voiceName: selectedVoice,
        speakingRate: 1.0,
        pitch: pitch - 1, // Adjust pitch for Google's scale (-10 to 10)
      }),
    });

    const data = await response.json();

    if (data.audioUrl) {
      setAudioUrl(data.audioUrl);
      await audioPlayer.current.loadAudio(data.audioUrl);
      setDuration(audioPlayer.current.getDuration());
      audioPlayer.current.setRate(playbackRate);
      setIsPlaying(true);
      audioPlayer.current.play();
    } else {
      throw new Error(data.error || "Failed to generate speech");
    }
  }

  async function generateSpeechWithKokoro() {
    try {
      const kokoroService = getKokoroService();

      if (!kokoroInitialized) {
        // Show loading message for Kokoro
        toast({
          title: "Initializing Kokoro TTS",
          description: "Loading model... This may take a moment on first use.",
        });

        // Initialize Kokoro using Web Worker
        await kokoroService.initialize();
        setKokoroInitialized(true);
      }

      toast({
        title: "Generating Speech",
        description: "Creating audio with Kokoro TTS...",
      });

      // Generate audio using Web Worker
      const audioData = await kokoroService.generateSpeech(text, selectedVoice || 'af_heart');

      // Convert ArrayBuffer to Uint8Array and create blob
      const audioArray = new Uint8Array(audioData);
      const audioBlob = new Blob([audioArray], { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(audioBlob);

      setAudioUrl(audioUrl);
      await audioPlayer.current.loadAudio(audioUrl);
      setDuration(audioPlayer.current.getDuration());
      audioPlayer.current.setRate(playbackRate);
      setIsPlaying(true);
      audioPlayer.current.play();

      toast({
        title: "Success",
        description: "Audio generated successfully with Kokoro TTS!",
      });
    } catch (error) {
      console.error('Kokoro TTS Error:', error);
      toast({
        title: "Kokoro TTS Error",
        description: `Failed to generate speech with Kokoro: ${error.message}. Trying Google TTS as fallback...`,
        variant: "destructive",
      });

      // Fallback to Google TTS
      await generateSpeechWithGoogle();
    }
  }

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
  }

  const toggleMute = () => {
    audioPlayer.current.setVolume(isMuted ? 1 : 0);
    setIsMuted(!isMuted);
  }

  const handleSeek = (value: number[]) => {
    const newPosition = value[0];
    setCurrentTime(newPosition);
    audioPlayer.current.seek(newPosition);
  }

  const handleDownload = () => {
    if (audioUrl) {
      const link = document.createElement('a');
      link.href = audioUrl;
      link.download = audioUrl.split('/').pop() || 'speech.mp3';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      toast({
        title: "Error",
        description: "No audio available to download",
        variant: "destructive",
      });
    }
  }

  const handleReset = () => {
    setText("");
    setIsPlaying(false);
    setCurrentTime(0);
    setPlaybackRate(1);
    setPitch(1);
    setAudioUrl("");
    if (audioPlayer.current) {
      audioPlayer.current.stop();
    }
  }

  return (
    <div className="w-full max-w-4xl">
      <div className="backdrop-blur-xl bg-white/20 rounded-3xl border border-white/30 shadow-lg p-8 text-white">
        <h1 className="text-3xl font-light mb-8 text-center">Text to Speech</h1>

        <div className="space-y-6">
          {/* Provider Toggle */}
          <ProviderToggle
            selectedProvider={selectedProvider}
            onProviderChange={setSelectedProvider}
          />

          {/* Text Input */}
          <div>
            <label className="block text-sm font-medium mb-2">Enter Text</label>
            <Textarea
              placeholder="Type or paste text here..."
              className="w-full h-32 bg-white/10 border-white/20 backdrop-blur-sm rounded-xl text-white placeholder:text-white/50"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          {/* Voice Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Language</label>
              <Select value={languageCode} onValueChange={setLanguageCode}>
                <SelectTrigger className="bg-white/10 border-white/20 backdrop-blur-sm rounded-xl text-white">
                  <SelectValue placeholder="Select a language" />
                </SelectTrigger>
                <SelectContent className="bg-white/80 backdrop-blur-xl border-white/30">
                  <SelectItem value="en-US">English (US)</SelectItem>
                  <SelectItem value="en-GB">English (UK)</SelectItem>
                  {selectedProvider === 'google' && (
                    <>
                      <SelectItem value="es-ES">Spanish</SelectItem>
                      <SelectItem value="fr-FR">French</SelectItem>
                      <SelectItem value="de-DE">German</SelectItem>
                      <SelectItem value="ja-JP">Japanese</SelectItem>
                      <SelectItem value="ko-KR">Korean</SelectItem>
                      <SelectItem value="zh-CN">Chinese (Simplified)</SelectItem>
                    </>
                  )}
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
                      {selectedProvider === 'kokoro' ? (
                        <>
                          {voice.name} ({voice.ssmlGender})
                          {voice.quality && <span className="text-xs opacity-70"> - {voice.quality}</span>}
                          {voice.traits && <span className="ml-1">{voice.traits}</span>}
                        </>
                      ) : (
                        `${voice.name} (${voice.ssmlGender})`
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Playback Speed</label>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <Slider
                    defaultValue={[1]}
                    value={[playbackRate]}
                    max={2}
                    min={0.25}
                    step={0.05}
                    className="py-2"
                    onValueChange={(value) => setPlaybackRate(value[0])}
                  />
                  <div className="flex justify-between text-xs mt-1">
                    <span>0.25x</span>
                    <span>1x</span>
                    <span>2x</span>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm px-3 py-1 rounded-lg min-w-[60px] text-center">
                  {playbackRate.toFixed(2)}x
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Pitch</label>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <Slider
                    defaultValue={[1]}
                    value={[pitch]}
                    max={2}
                    min={0.5}
                    step={0.1}
                    className="py-2"
                    onValueChange={(value) => setPitch(value[0])}
                  />
                  <div className="flex justify-between text-xs mt-1">
                    <span>Low</span>
                    <span>Normal</span>
                    <span>High</span>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm px-3 py-1 rounded-lg min-w-[60px] text-center">
                  {pitch.toFixed(1)}
                </div>
              </div>
            </div>
          </div>

          {/* Audio Player */}
          <div className="mt-8 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
            <div className="flex items-center gap-4 mb-4">
              <Button
                onClick={togglePlay}
                variant="ghost"
                size="icon"
                className="h-12 w-12 rounded-full bg-white/20 hover:bg-white/30 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : isPlaying ? (
                  <Pause className="h-6 w-6" />
                ) : (
                  <Play className="h-6 w-6" />
                )}
              </Button>

              <div className="flex-1">
                <Slider
                  value={[currentTime]}
                  max={duration || 100}
                  step={0.1}
                  className="py-1"
                  onValueChange={handleSeek}
                  disabled={!audioUrl || isLoading}
                />
                <div className="flex justify-between text-xs mt-1">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              <Button
                onClick={toggleMute}
                variant="ghost"
                size="icon"
                className="rounded-full bg-white/10 hover:bg-white/20 text-white"
                disabled={!audioUrl || isLoading}
              >
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 mt-6">
            <Button
              variant="outline"
              className="border-white/30 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
              onClick={handleReset}
              disabled={isLoading}
            >
              Reset
            </Button>
            <Button
              className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm flex gap-2 items-center"
              onClick={handleDownload}
              disabled={!audioUrl || isLoading}
            >
              <Download className="h-4 w-4" />
              Download Audio
            </Button>
            <Button
              onClick={generateSpeech}
              disabled={isLoading || !text.trim()}
              className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
            >
              {isLoading ? (
                selectedProvider === 'kokoro' && !kokoroInitialized ?
                  "Initializing Kokoro..." :
                  "Generating..."
              ) : (
                `Generate Speech (${selectedProvider === 'kokoro' ? 'Kokoro Local' : 'Google Cloud'})`
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`
}
