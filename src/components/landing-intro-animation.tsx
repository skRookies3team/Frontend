"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Heart, Sparkles } from 'lucide-react'

export function LandingIntroAnimation({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0)
  const [windowSize, setWindowSize] = useState({ width: 800, height: 600 })

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight })
  }, [])

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 500),
      setTimeout(() => setStep(2), 1500),
      setTimeout(() => setStep(3), 2500),
      setTimeout(() => setStep(4), 3500),
      setTimeout(() => onComplete(), 4500),
    ]

    return () => timers.forEach(clearTimeout)
  }, [onComplete])

  return (
    <AnimatePresence>
      {step < 4 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-pink-500 via-rose-500 to-pink-600"
        >
          <div className="relative">
            {/* Background particles */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute h-2 w-2 rounded-full bg-white/30"
                  initial={{
                    x: Math.random() * windowSize.width,
                    y: Math.random() * windowSize.height,
                    scale: 0,
                  }}
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </div>

            {/* Main content */}
            <div className="relative space-y-8 text-center">
              {/* Logo animation */}
              {step >= 0 && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", duration: 1 }}
                  className="flex justify-center"
                >
                  <div className="relative">
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                      className="flex h-32 w-32 items-center justify-center rounded-full bg-white shadow-2xl"
                    >
                      <Heart className="h-16 w-16 fill-pink-500 text-pink-500" />
                    </motion.div>
                    <motion.div
                      animate={{
                        rotate: 360,
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="absolute -right-2 -top-2"
                    >
                      <Sparkles className="h-8 w-8 text-yellow-300" />
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {/* Brand name */}
              {step >= 1 && (
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="text-6xl font-bold text-white md:text-8xl"
                >
                  PetLog
                </motion.h1>
              )}

              {/* Tagline */}
              {step >= 2 && (
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="text-2xl text-white/90 md:text-3xl"
                >
                  우리 아이의 특별한 이야기
                </motion.p>
              )}

              {/* Description */}
              {step >= 3 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8 }}
                  className="space-y-2"
                >
                  <p className="text-lg text-white/80">AI가 기록하는 반려동물 일기</p>
                  <div className="flex items-center justify-center gap-2">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="h-2 w-2 rounded-full bg-white"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                      className="h-2 w-2 rounded-full bg-white"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                      className="h-2 w-2 rounded-full bg-white"
                    />
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
