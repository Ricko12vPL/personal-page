'use client'

import { useState, useEffect, useCallback } from 'react'

const roles = [
  'ML Engineer',
  'Backend Developer',
  'Quantitative Developer',
  'AI Engineer',
]

export function Typewriter() {
  const [roleIndex, setRoleIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  const currentRole = roles[roleIndex]

  const tick = useCallback(() => {
    if (isDeleting) {
      if (charIndex === 0) {
        setIsDeleting(false)
        setRoleIndex((prev) => (prev + 1) % roles.length)
        return
      }
      setCharIndex((prev) => prev - 1)
    } else {
      if (charIndex === currentRole.length) {
        setTimeout(() => setIsDeleting(true), 2000)
        return
      }
      setCharIndex((prev) => prev + 1)
    }
  }, [charIndex, isDeleting, currentRole])

  useEffect(() => {
    const speed = isDeleting ? 40 : 80
    const timer = setTimeout(tick, speed)
    return () => clearTimeout(timer)
  }, [tick, isDeleting])

  return (
    <p className="text-lg text-neutral-400 mt-6">
      <span className="text-accent">
        {currentRole.slice(0, charIndex)}
      </span>
      <span className="text-accent animate-blink">_</span>
    </p>
  )
}
