"use client"

import { useState, useEffect, useRef } from "react"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Download, Pause, Play, Volume2, VolumeX } from "lucide-react"
import AudioPlayerService from "@/lib/audio-player-service"
import { useToast } from "@/hooks/use-toast"

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
  const audioPlayer = useRef(AudioPlayerService.getInstance())
  const { toast } = useToast()

  // Fetch available voices when language changes
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
  }, [languageCode, toast]);

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
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          languageCode,
          voiceName: selectedVoice,
          speakingRate: 1.0, // Use fixed normal speed for TTS generation
          pitch: pitch - 1, // Adjust pitch to match Google's scale (-10 to 10)
        }),
      });

      const data = await response.json();

      if (data.audioUrl) {
        setAudioUrl(data.audioUrl);
        await audioPlayer.current.loadAudio(data.audioUrl);
        setDuration(audioPlayer.current.getDuration());
        // Apply current playback rate to the audio
        audioPlayer.current.setRate(playbackRate);
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
              {isLoading ? "Generating..." : "Generate Speech"}
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
