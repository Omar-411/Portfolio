"use client"

import { useEffect, useState } from "react"
import MatrixRain from "./matrix-rain"

interface LoadingScreenProps {
  onLoadingComplete: () => void
}

const FULL_NAME = "omar ajimi"

const LoadingScreen = ({ onLoadingComplete }: LoadingScreenProps) => {
  const [progress, setProgress] = useState(0)
  const [typedText, setTypedText] = useState("")
  const [showWipe, setShowWipe] = useState(false)

  // Progress timer — 0→100 over 2500ms (50ms tick)
  useEffect(() => {
    const duration = 2500
    const interval = 50
    const increment = (interval / duration) * 100

    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        const next = Math.min(prev + increment, 100)
        return next
      })
    }, interval)

    return () => clearInterval(progressTimer)
  }, [])

  // Sync typed text to progress
  useEffect(() => {
    const charCount = Math.round((progress / 100) * FULL_NAME.length)
    setTypedText(FULL_NAME.substring(0, charCount))
  }, [progress])

  // Trigger wipe when progress hits 100
  useEffect(() => {
    if (progress < 100) return

    const wipeTimer = setTimeout(() => {
      setShowWipe(true)
      // Call onLoadingComplete after the wipe animation finishes (600ms)
      setTimeout(onLoadingComplete, 600)
    }, 300)

    return () => clearTimeout(wipeTimer)
  }, [progress, onLoadingComplete])

  return (
    <div className="fixed inset-0 z-[9999] bg-[#020b06] flex items-center justify-center overflow-hidden">
      {/* Matrix rain background */}
      <div className="absolute inset-0">
        <MatrixRain opacity={0.04} />
      </div>

      {/* Center content */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* OA Monogram */}
        <div
          className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600
            flex items-center justify-center text-white font-bold text-2xl
            animate-scale-in shadow-[0_0_40px_rgba(0,255,106,0.35)]"
          style={{ fontFamily: "var(--font-syne)" }}
        >
          OA
        </div>

        {/* Typed name + blinking cursor */}
        <div
          className="text-[#00ff6a] text-xl tracking-[0.3em] uppercase min-h-[1.75rem]"
          style={{ fontFamily: "var(--font-jetbrains)" }}
        >
          {typedText}
          <span className="animate-blink-cursor">|</span>
        </div>

        {/* Progress bar */}
        <div className="w-64 h-[2px] bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-100 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Progress percentage */}
        <span className="text-xs text-white/30 font-mono">
          {Math.round(progress)}%
        </span>
      </div>

      {/* Split-wipe exit panels */}
      {showWipe && (
        <>
          <div className="fixed top-0 left-0 right-0 h-1/2 bg-[#020b06] z-[10000] animate-wipe-up" />
          <div className="fixed bottom-0 left-0 right-0 h-1/2 bg-[#020b06] z-[10000] animate-wipe-down" />
        </>
      )}
    </div>
  )
}

export default LoadingScreen
