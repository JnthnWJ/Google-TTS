"use client"

import React, { useState, useEffect } from 'react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Loader2, CheckCircle, AlertCircle, Cloud, Cpu } from 'lucide-react'

// Define types locally to avoid importing server-side code
export type TTSProvider = 'google' | 'kokoro'

export interface TTSProviderStatus {
  provider: TTSProvider
  isAvailable: boolean
  isInitialized: boolean
  isInitializing: boolean
  error?: string
}

interface ProviderToggleProps {
  selectedProvider: TTSProvider
  onProviderChange: (provider: TTSProvider) => void
  className?: string
}

export function ProviderToggle({ selectedProvider, onProviderChange, className }: ProviderToggleProps) {
  const [kokoroStatus, setKokoroStatus] = useState<TTSProviderStatus | null>(null)
  const [googleStatus, setGoogleStatus] = useState<TTSProviderStatus | null>(null)
  const [isInitializing, setIsInitializing] = useState(false)

  useEffect(() => {
    updateProviderStatuses()
  }, [])

  useEffect(() => {
    // Save provider preference to localStorage
    localStorage.setItem('tts-provider', selectedProvider)
  }, [selectedProvider])

  const updateProviderStatuses = async () => {
    // Set Google as always available (server-side)
    setGoogleStatus({
      provider: 'google',
      isAvailable: true,
      isInitialized: true,
      isInitializing: false,
    })

    // Check Kokoro availability (client-side)
    setKokoroStatus({
      provider: 'kokoro',
      isAvailable: typeof window !== 'undefined',
      isInitialized: false,
      isInitializing: false,
    })
  }

  const handleProviderChange = async (useKokoro: boolean) => {
    const newProvider: TTSProvider = useKokoro ? 'kokoro' : 'google'
    onProviderChange(newProvider)
  }

  const getStatusIcon = (status: TTSProviderStatus | null) => {
    if (!status) return <Loader2 className="h-3 w-3 animate-spin" />
    
    if (status.isInitializing || isInitializing) {
      return <Loader2 className="h-3 w-3 animate-spin" />
    }
    
    if (status.isInitialized && status.isAvailable) {
      return <CheckCircle className="h-3 w-3 text-green-500" />
    }
    
    if (status.error) {
      return <AlertCircle className="h-3 w-3 text-red-500" />
    }
    
    return <AlertCircle className="h-3 w-3 text-yellow-500" />
  }

  const getStatusText = (status: TTSProviderStatus | null) => {
    if (!status) return 'Loading...'
    
    if (status.isInitializing || isInitializing) {
      return 'Initializing...'
    }
    
    if (status.isInitialized && status.isAvailable) {
      return 'Ready'
    }
    
    if (status.error) {
      return 'Error'
    }
    
    return 'Not Ready'
  }

  const getStatusColor = (status: TTSProviderStatus | null) => {
    if (!status || status.isInitializing || isInitializing) return 'default'
    if (status.isInitialized && status.isAvailable) return 'default'
    if (status.error) return 'destructive'
    return 'secondary'
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <Label htmlFor="provider-toggle" className="text-sm font-medium">
          TTS Provider
        </Label>
      </div>
      
      <div className="flex items-center space-x-4 p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
        {/* Google TTS Option */}
        <div className="flex items-center space-x-2 flex-1">
          <Cloud className="h-4 w-4 text-blue-400" />
          <span className="text-sm">Google Cloud</span>
          <Badge variant={getStatusColor(googleStatus)} className="text-xs">
            {getStatusIcon(googleStatus)}
            <span className="ml-1">{getStatusText(googleStatus)}</span>
          </Badge>
        </div>

        {/* Toggle Switch */}
        <Switch
          id="provider-toggle"
          checked={selectedProvider === 'kokoro'}
          onCheckedChange={handleProviderChange}
          disabled={isInitializing}
          className="data-[state=checked]:bg-green-600"
        />

        {/* Kokoro Option */}
        <div className="flex items-center space-x-2 flex-1 justify-end">
          <Badge variant={getStatusColor(kokoroStatus)} className="text-xs">
            {getStatusIcon(kokoroStatus)}
            <span className="ml-1">{getStatusText(kokoroStatus)}</span>
          </Badge>
          <span className="text-sm">Kokoro Local</span>
          <Cpu className="h-4 w-4 text-green-400" />
        </div>
      </div>

      {/* Provider Info */}
      <div className="text-xs text-white/70 space-y-1">
        {selectedProvider === 'google' && (
          <p>• Using Google Cloud TTS - High quality, cloud-based synthesis</p>
        )}
        {selectedProvider === 'kokoro' && (
          <p>• Using Kokoro Local TTS - Privacy-focused, runs entirely in your browser</p>
        )}
        {kokoroStatus?.error && (
          <p className="text-red-400">• Kokoro Error: {kokoroStatus.error}</p>
        )}
      </div>
    </div>
  )
}

export default ProviderToggle
