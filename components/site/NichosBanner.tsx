'use client'

import Image from 'next/image'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

const NICHOS = [
  'MÚSICA',
  'GASTRONOMIA',
  'MODA',
  'CORPORATIVO',
  'EVENTOS',
  'IMÓVEIS',
  'FITNESS',
  'ADVOCACIA',
]

export function NichosBanner() {
  const ref = useRef<HTMLElement>(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  // Slow parallax on the image
  const imageY = useTransform(scrollYProgress, [0, 1], ['-8%', '8%'])

  // Fade + slide up on text
  const textY = useTransform(scrollYProgress, [0.1, 0.5], ['40px', '0px'])
  const textOpacity = useTransform(scrollYProgress, [0.1, 0.45], [0, 1])

  return (
    <section
      ref={ref}
      aria-label="Nichos que atendemos"
      className="relative overflow-hidden"
      style={{ height: 'clamp(480px, 60vw, 780px)' }}
    >
      {/* Parallax image */}
      <motion.div
        className="absolute inset-0 w-full"
        style={{ y: imageY, height: '116%', top: '-8%' }}
      >
        <Image
          src="/images/nichos-wallpaper.png"
          alt="Variedade de nichos atendidos pela Malds Maker — artista, floricultura, gastronomia, moda e corporativo"
          fill
          priority={false}
          className="object-cover"
          style={{ objectPosition: 'center 30%' }}
          sizes="100vw"
        />
      </motion.div>

      {/* Dark overlay — gradient from bottom */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, rgba(10,10,10,0.55) 0%, rgba(10,10,10,0.15) 35%, rgba(10,10,10,0.15) 55%, rgba(10,10,10,0.92) 100%)',
        }}
        aria-hidden="true"
      />

      {/* Content anchored to bottom */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 site-container pb-12 lg:pb-16"
        style={{ y: textY, opacity: textOpacity }}
      >
        {/* Overline */}
        <p
          className="font-mono-mm text-[10px] tracking-[0.18em] uppercase mb-4"
          style={{ color: '#C9A84C' }}
        >
          — do artista ao executivo
        </p>

        {/* Headline */}
        <h2
          className="font-display uppercase leading-none mb-6"
          style={{
            fontSize: 'clamp(36px, 5.5vw, 72px)',
            color: '#F5F5F0',
            letterSpacing: '-0.01em',
            textShadow: '0 2px 24px rgba(0,0,0,0.6)',
          }}
        >
          Um formato pra<br />
          <span style={{ color: '#C9A84C' }}>cada história.</span>
        </h2>

        {/* Nicho pills */}
        <div className="flex flex-wrap gap-2">
          {NICHOS.map((n) => (
            <span
              key={n}
              className="font-mono-mm text-[9px] tracking-[0.14em] uppercase px-3 py-1.5"
              style={{
                border: '1px solid rgba(201,168,76,0.35)',
                color: 'rgba(245,245,240,0.7)',
                background: 'rgba(10,10,10,0.45)',
                backdropFilter: 'blur(4px)',
              }}
            >
              {n}
            </span>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
