"use client"

import React, { useCallback, useEffect, useMemo, useState } from "react"

export interface Logo {
  name: string
  src: string
}

interface LogoColumnProps {
  logos: Logo[]
  index: number
  currentTime: number
}

interface LogoCarouselProps {
  columnCount?: number
  logos: readonly Logo[]
  className?: string
}

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

const distributeLogos = (allLogos: readonly Logo[], columnCount: number): Logo[][] => {
  if (allLogos.length === 0 || columnCount < 1) return []
  const shuffled = shuffleArray([...allLogos])
  const columns: Logo[][] = Array.from({ length: Math.min(columnCount, shuffled.length) }, () => [])

  shuffled.forEach((logo, index) => {
    columns[index % columns.length].push(logo)
  })

  const maxLength = Math.max(...columns.map((column) => column.length))
  columns.forEach((column) => {
    while (column.length < maxLength) {
      column.push(shuffled[Math.floor(Math.random() * shuffled.length)])
    }
  })

  return columns
}

const LogoColumn = React.memo(({ logos, index, currentTime }: LogoColumnProps) => {
  const cycleInterval = 2000
  const columnDelay = index * 200
  const adjustedTime = (currentTime + columnDelay) % (cycleInterval * logos.length)
  const currentIndex = Math.floor(adjustedTime / cycleInterval)
  const currentLogo = useMemo(() => logos[currentIndex], [logos, currentIndex])

  return (
    <div
      className="logo-carousel-column relative h-10 w-11 overflow-hidden sm:h-12 sm:w-14"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div key={currentLogo.src} className="logo-carousel-enter absolute inset-0 flex items-center justify-center">
        <img
          src={currentLogo.src}
          alt={currentLogo.name}
          loading="lazy"
          className="max-h-[65%] max-w-[82%] object-contain opacity-85"
        />
      </div>
    </div>
  )
})

export function LogoCarousel({ columnCount = 2, logos, className = "" }: LogoCarouselProps) {
  const [logoSets, setLogoSets] = useState<Logo[][]>([])
  const [currentTime, setCurrentTime] = useState(0)

  const updateTime = useCallback(() => {
    setCurrentTime((previousTime) => previousTime + 100)
  }, [])

  useEffect(() => {
    const intervalId = window.setInterval(updateTime, 100)
    return () => window.clearInterval(intervalId)
  }, [updateTime])

  useEffect(() => {
    setLogoSets(distributeLogos(logos, columnCount))
  }, [logos, columnCount])

  return (
    <div
      className={`flex items-center gap-1 sm:gap-2 ${className}`}
      aria-label="Parceiros da Agência Africa"
    >
      <style>{`
        @keyframes logo-carousel-enter {
          from { opacity: 0; transform: translateY(10%); filter: blur(5px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        .logo-carousel-enter {
          animation: logo-carousel-enter 450ms cubic-bezier(.2,.8,.2,1) both;
        }
        .logo-carousel-column {
          animation: logo-carousel-enter 500ms ease-out both;
        }
        @media (prefers-reduced-motion: reduce) {
          .logo-carousel-enter, .logo-carousel-column { animation: none; }
        }
      `}</style>
      {logoSets.map((column, index) => (
        <LogoColumn key={index} logos={column} index={index} currentTime={currentTime} />
      ))}
    </div>
  )
}

export { LogoColumn }
