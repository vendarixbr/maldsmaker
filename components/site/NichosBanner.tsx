'use client'

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

  const textY = useTransform(scrollYProgress, [0.1, 0.5], ['40px', '0px'])
  const textOpacity = useTransform(scrollYProgress, [0.1, 0.45], [0, 1])

  return (
    <section
      ref={ref}
      aria-label="Nichos que atendemos"
      className="site-container py-20 lg:py-28"
    >
      <motion.div style={{ y: textY, opacity: textOpacity }}>
        <p
          className="font-mono-mm text-[10px] tracking-[0.18em] uppercase mb-4"
          style={{ color: '#C9A84C' }}
        >
          — do artista ao executivo
        </p>

        <h2
          className="font-display uppercase leading-none mb-6"
          style={{
            fontSize: 'clamp(36px, 5.5vw, 72px)',
            color: '#F5F5F0',
            letterSpacing: '-0.01em',
          }}
        >
          Um formato pra<br />
          <span style={{ color: '#C9A84C' }}>cada história.</span>
        </h2>

        <div className="flex flex-wrap gap-2">
          {NICHOS.map((n) => (
            <span
              key={n}
              className="font-mono-mm text-[9px] tracking-[0.14em] uppercase px-3 py-1.5"
              style={{
                border: '1px solid rgba(201,168,76,0.35)',
                color: 'rgba(245,245,240,0.7)',
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
