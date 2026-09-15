import React, { useState, useEffect, useRef } from 'react'
import { Volume2, Sliders } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'

/**
 * AmbientSoundPlayer:
 * Generative Web Audio API soundscape providing calm, dynamic, and relaxing ambient harmony.
 * Produces soft, warm low-pass filtered pads, subtle ocean-like air texture, and gentle generative chimes.
 * Extremely lightweight (0 audio assets to download, infinite seamless loop, zero latency).
 * Designed to be subtle and thin ("tipis saja") with intuitive floating controls.
 */
export const AmbientSoundPlayer: React.FC = () => {
  const { language } = useLanguage()
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.12) // Subtle & thin by default
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)

  // Audio Context & Nodes Reference
  const audioCtxRef = useRef<AudioContext | null>(null)
  const masterGainRef = useRef<GainNode | null>(null)
  const oscillatorsRef = useRef<OscillatorNode[]>([])
  const intervalsRef = useRef<ReturnType<typeof setInterval>[]>([])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAudio()
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {})
      }
    }
  }, [])

  // Update volume smoothly
  useEffect(() => {
    if (masterGainRef.current && audioCtxRef.current) {
      const currTime = audioCtxRef.current.currentTime
      masterGainRef.current.gain.setTargetAtTime(isPlaying ? volume : 0, currTime, 0.2)
    }
  }, [volume, isPlaying])

  const startAudio = () => {
    try {
      // Initialize or resume AudioContext
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        audioCtxRef.current = new AudioCtx()
      }

      const ctx = audioCtxRef.current
      if (ctx.state === 'suspended') {
        ctx.resume()
      }

      // Master Gain for smooth volume control & fading
      const masterGain = ctx.createGain()
      masterGain.gain.setValueAtTime(0, ctx.currentTime)
      masterGain.gain.setTargetAtTime(volume, ctx.currentTime, 1.2) // Gentle 1.2s fade-in
      masterGain.connect(ctx.destination)
      masterGainRef.current = masterGain

      // Main Filter for warm, peaceful tone
      const masterFilter = ctx.createBiquadFilter()
      masterFilter.type = 'lowpass'
      masterFilter.frequency.setValueAtTime(360, ctx.currentTime)
      masterFilter.connect(masterGain)

      // LFO for breathing filter movement (dynamic and soothing)
      const lfo = ctx.createOscillator()
      const lfoGain = ctx.createGain()
      lfo.frequency.setValueAtTime(0.08, ctx.currentTime) // Very slow 12-second wave
      lfoGain.gain.setValueAtTime(140, ctx.currentTime)
      lfo.connect(lfoGain)
      lfoGain.connect(masterFilter.frequency)
      lfo.start()
      oscillatorsRef.current.push(lfo)

      // Warm Relaxing Chord Frequencies (Cmaj9 / Fmaj7 peaceful harmony: C3, G3, B3, E4, D4)
      const baseNotes = [130.81, 196.0, 246.94, 329.63, 293.66]

      baseNotes.forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const oscGain = ctx.createGain()

        // Sine & warm triangle blend
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle'
        osc.frequency.setValueAtTime(freq, ctx.currentTime)

        // Subtle micro-detuning for lush organic warmth
        const detuneAmount = (idx - 2) * 3.5
        osc.detune.setValueAtTime(detuneAmount, ctx.currentTime)

        // Soft individual levels
        const noteLevel = 0.16 / baseNotes.length
        oscGain.gain.setValueAtTime(noteLevel, ctx.currentTime)

        osc.connect(oscGain)
        oscGain.connect(masterFilter)
        osc.start()
        oscillatorsRef.current.push(osc)
      })

      // Soft ambient noise generator (whispering breeze texture)
      try {
        const bufferSize = ctx.sampleRate * 3
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
        const output = noiseBuffer.getChannelData(0)
        let b0 = 0, b1 = 0, b2 = 0
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1
          b0 = 0.99765 * b0 + white * 0.05
          b1 = 0.963 * b1 + white * 0.11
          b2 = 0.57 * b2 + white * 0.25
          output[i] = (b0 + b1 + b2) * 0.04
        }

        const whiteNoise = ctx.createBufferSource()
        whiteNoise.buffer = noiseBuffer
        whiteNoise.loop = true

        const noiseFilter = ctx.createBiquadFilter()
        noiseFilter.type = 'bandpass'
        noiseFilter.frequency.setValueAtTime(450, ctx.currentTime)
        noiseFilter.Q.setValueAtTime(0.5, ctx.currentTime)

        const noiseGain = ctx.createGain()
        noiseGain.gain.setValueAtTime(0.015, ctx.currentTime) // Extremely thin & subtle breeze

        whiteNoise.connect(noiseFilter)
        noiseFilter.connect(noiseGain)
        noiseGain.connect(masterGain)
        whiteNoise.start()
      } catch (_) {
        // Fallback gracefully if buffer generation is restricted
      }

      // Subtle dynamic chime drops every 8-14 seconds (zen drop)
      const playGentleChime = () => {
        if (!audioCtxRef.current || audioCtxRef.current.state !== 'running') return
        const chimeCtx = audioCtxRef.current
        const chimeOsc = chimeCtx.createOscillator()
        const chimeGain = chimeCtx.createGain()

        const pentatonicChimes = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5]
        const randomPitch = pentatonicChimes[Math.floor(Math.random() * pentatonicChimes.length)]

        chimeOsc.type = 'sine'
        chimeOsc.frequency.setValueAtTime(randomPitch, chimeCtx.currentTime)

        chimeGain.gain.setValueAtTime(0, chimeCtx.currentTime)
        chimeGain.gain.linearRampToValueAtTime(0.025, chimeCtx.currentTime + 0.1)
        chimeGain.gain.exponentialRampToValueAtTime(0.0001, chimeCtx.currentTime + 4.5)

        chimeOsc.connect(chimeGain)
        chimeGain.connect(masterGain)

        chimeOsc.start()
        chimeOsc.stop(chimeCtx.currentTime + 4.6)
      }

      const chimeInterval = setInterval(playGentleChime, 9500)
      intervalsRef.current.push(chimeInterval)

      setIsPlaying(true)
    } catch (err) {
      console.warn('Unable to initialize Web Audio:', err)
      setIsPlaying(false)
    }
  }

  const stopAudio = () => {
    if (masterGainRef.current && audioCtxRef.current) {
      // Gentle fade out
      const currTime = audioCtxRef.current.currentTime
      masterGainRef.current.gain.setTargetAtTime(0, currTime, 0.4)
    }

    setTimeout(() => {
      oscillatorsRef.current.forEach((osc) => {
        try {
          osc.stop()
          osc.disconnect()
        } catch (_) {}
      })
      oscillatorsRef.current = []

      intervalsRef.current.forEach(clearInterval)
      intervalsRef.current = []

      setIsPlaying(false)
    }, 450)
  }

  const toggleSound = () => {
    if (isPlaying) {
      stopAudio()
    } else {
      startAudio()
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-40 flex items-center gap-2 select-none pointer-events-auto">
      {/* Mini Popover Volume Slider */}
      {showVolumeSlider && isPlaying && (
        <div className="bg-white/95 backdrop-blur-md px-3 py-2 rounded-2xl border border-slate-200/90 shadow-xl flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
          <span className="text-[10px] font-bold text-slate-400 font-mono">
            {Math.round(volume * 100 * 4)}%
          </span>
          <input
            type="range"
            min="0.02"
            max="0.25"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-20 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#6c4df6]"
            aria-label="Ambient volume"
          />
        </div>
      )}

      {/* Main Floating Toggle Pill */}
      <div className="flex items-center bg-white/90 hover:bg-white backdrop-blur-md p-1.5 rounded-full border border-slate-200/90 shadow-lg hover:shadow-xl transition-all duration-300">
        <button
          type="button"
          onClick={toggleSound}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer ${
            isPlaying
              ? 'bg-gradient-to-r from-[#6c4df6] to-[#ec4899] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 bg-slate-100/80 hover:bg-slate-200/70'
          }`}
          title={isPlaying ? 'Pause peaceful ambient' : 'Play peaceful ambient'}
          aria-label={isPlaying ? 'Pause peaceful ambient' : 'Play peaceful ambient'}
        >
          {isPlaying ? (
            <>
              {/* Animated Equalizer Wave Bars */}
              <div className="flex items-end gap-[2px] h-3.5 w-3.5">
                <span className="w-[2.5px] bg-white rounded-full animate-[pulse_0.8s_ease-in-out_infinite] h-2.5" />
                <span className="w-[2.5px] bg-white rounded-full animate-[pulse_1.1s_ease-in-out_infinite_0.2s] h-3.5" />
                <span className="w-[2.5px] bg-white rounded-full animate-[pulse_0.9s_ease-in-out_infinite_0.4s] h-2" />
              </div>
              <span className="text-[11px] tracking-tight">
                {language === 'id' ? 'Suara Tenang' : 'Zen Ambient'}
              </span>
            </>
          ) : (
            <>
              <Volume2 className="w-3.5 h-3.5 text-[#6c4df6]" />
              <span className="text-[11px] tracking-tight">
                {language === 'id' ? 'Musik Rileks' : 'Relax Sound'}
              </span>
            </>
          )}
        </button>

        {/* Volume Slider Toggle Button (visible when playing) */}
        {isPlaying && (
          <button
            type="button"
            onClick={() => setShowVolumeSlider((prev) => !prev)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors ml-1"
            title="Adjust volume"
            aria-label="Adjust volume"
          >
            <Sliders className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  )
}

export default AmbientSoundPlayer
