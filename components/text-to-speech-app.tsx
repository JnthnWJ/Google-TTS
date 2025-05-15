"use client"

import { useState } from "react"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Download, Pause, Play, Volume2, VolumeX } from "lucide-react"

export default function TextToSpeechApp() {
  const [text, setText] = useState("")
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [speed, setSpeed] = useState(1)
  const [pitch, setPitch] = useState(1)
  const duration = 100 // Mock duration

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
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
              <label className="block text-sm font-medium mb-2">Voice</label>
              <Select>
                <SelectTrigger className="bg-white/10 border-white/20 backdrop-blur-sm rounded-xl text-white">
                  <SelectValue placeholder="Select a voice" />
                </SelectTrigger>
                <SelectContent className="bg-white/80 backdrop-blur-xl border-white/30">
                  <SelectItem value="alloy">Alloy</SelectItem>
                  <SelectItem value="echo">Echo</SelectItem>
                  <SelectItem value="fable">Fable</SelectItem>
                  <SelectItem value="onyx">Onyx</SelectItem>
                  <SelectItem value="nova">Nova</SelectItem>
                  <SelectItem value="shimmer">Shimmer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Model</label>
              <Select>
                <SelectTrigger className="bg-white/10 border-white/20 backdrop-blur-sm rounded-xl text-white">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent className="bg-white/80 backdrop-blur-xl border-white/30">
                  <SelectItem value="tts-1">TTS-1</SelectItem>
                  <SelectItem value="tts-1-hd">TTS-1-HD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Speed</label>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <Slider
                    defaultValue={[1]}
                    value={[speed]}
                    max={2}
                    min={0.25}
                    step={0.05}
                    className="py-2"
                    onValueChange={(value) => setSpeed(value[0])}
                  />
                  <div className="flex justify-between text-xs mt-1">
                    <span>0.25x</span>
                    <span>1x</span>
                    <span>2x</span>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm px-3 py-1 rounded-lg min-w-[60px] text-center">
                  {speed.toFixed(2)}x
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
              >
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
              </Button>

              <div className="flex-1">
                <Slider
                  value={[currentTime]}
                  max={duration}
                  step={1}
                  className="py-1"
                  onValueChange={(value) => setCurrentTime(value[0])}
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
            >
              Reset
            </Button>
            <Button className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm flex gap-2 items-center">
              <Download className="h-4 w-4" />
              Download Audio
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
