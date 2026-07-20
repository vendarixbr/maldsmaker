'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import Image from 'next/image'

const niches = [
  'ARTISTAS', 'EMPRESAS', 'ADVOGADOS', 'EVENTOS',
  'INFLUENCERS', 'MUSICAIS', 'INSTITUCIONAIS', 'BARES', 'RESTAURANTES',
]

const stats = [
  { target: 300, suffix: '+', label: 'Projetos' },
  { target: 100, suffix: '+', label: 'Clientes' },
  { target: 15, suffix: '', label: 'Nichos' },
  { target: 30, suffix: 'M+', label: 'Streams' },
]

function CountUp({ target, suffix, active }: { target: number; suffix: string; active: boolean }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!active) return
    let start = 0
    const duration = 1400
    const step = 16
    const increment = target / (duration / step)
    const timer = setInterval(() => {
      start += increment
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, step)
    return () => clearInterval(timer)
  }, [active, target])

  return (
    <span>
      {count}
      {suffix}
    </span>
  )
}

const manifLines = [
  'Viemos da rua.',
  'Chegamos ao estúdio.',
  'Nunca esquecemos de onde',
  'a história começa.',
]

export function Manifesto() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -80px 0px' })

  return (
    <section
      id="sobre"
      ref={ref}
      className="relative overflow-hidden section-spacing"
      style={{ background: '#0A0A0A' }}
    >
      {/* Ghost watermark */}
      <span
        className="absolute right-0 top-1/2 -translate-y-1/2 font-display uppercase select-none pointer-events-none"
        style={{
          fontSize: 'clamp(120px, 18vw, 260px)',
          lineHeight: 1,
          color: 'rgba(255,255,255,0.02)',
          letterSpacing: '0.02em',
          right: '-2vw',
        }}
      >
        MALDS
      </span>

      <div className="site-container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-[42%_58%] gap-16 lg:gap-24 items-start">

          {/* ── Left ── */}
          <div>
            {/* Label */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55 }}
              className="mb-8"
            >
              <div className="tape-label">NOSSA ESSÊNCIA</div>
            </motion.div>

            {/* Headline lines — clip-path reveal */}
            <div className="flex flex-col mb-10" style={{ lineHeight: 0.9 }}>
              {manifLines.map((line, i) => (
                <div key={line} className="overflow-hidden">
                  <motion.p
                    initial={{ y: '110%' }}
                    animate={inView ? { y: 0 } : {}}
                    transition={{ delay: 0.1 + i * 0.1, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                    className="font-display uppercase"
                    style={{
                      fontSize: 'clamp(28px, 3.6vw, 44px)',
                      color: i < 2 ? '#F5F5F0' : '#A8A89A',
                      letterSpacing: '0.02em',
                      marginBottom: '2px',
                    }}
                  >
                    {line}
                  </motion.p>
                </div>
              ))}
            </div>

            {/* Photo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.75, delay: 0.5 }}
              className="relative w-full max-w-[300px] overflow-hidden"
              style={{
                aspectRatio: '3/4',
                border: '1px solid rgba(201,168,76,0.2)',
              }}
            >
              <Image
                src="/images/leonardo-claquete.png"
                alt="Leonardo Maldonado — Diretor Criativo da Malds Maker"
                fill
                className="object-cover"
                style={{ objectPosition: 'center 15%', filter: 'contrast(1.05)' }}
              />
              {/* Gradient overlay */}
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(to top, rgba(10,10,10,0.75) 0%, transparent 55%)' }}
              />
              {/* Name tag */}
              <div className="absolute bottom-4 left-4">
                <p className="font-display uppercase text-base" style={{ color: '#F5F5F0', letterSpacing: '0.04em' }}>
                  Leonardo Maldonado
                </p>
                <p className="font-mono-mm text-[10px] tracking-[0.16em]" style={{ color: '#C9A84C' }}>
                  DIRETOR CRIATIVO
                </p>
              </div>
              {/* Gold corner accent */}
              <div className="absolute top-0 right-0 w-8 h-8" style={{ borderTop: '2px solid #C9A84C', borderRight: '2px solid #C9A84C' }} />
              <div className="absolute bottom-0 left-0 w-8 h-8" style={{ borderBottom: '2px solid #C9A84C', borderLeft: '2px solid #C9A84C' }} />
            </motion.div>
          </div>

          {/* ── Right ── */}
          <div className="flex flex-col gap-8">

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.12 }}
              className="font-body leading-relaxed"
              style={{ color: '#A8A89A', fontSize: '17px', fontWeight: 300, lineHeight: 1.8 }}
            >
              A Malds Maker nasceu da necessidade de contar histórias com qualidade real —
              não apenas a qualidade que cabe no orçamento, mas a que o projeto merece. Atuamos com
              artistas, empresas, advogados, influencers, bares e restaurantes. O nicho muda.
              O nível não.
            </motion.p>

            {/* Gold divider */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.28 }}
              className="gold-divider"
            />

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.34 }}
              className="font-body leading-relaxed"
              style={{ color: '#A8A89A', fontSize: '17px', fontWeight: 300, lineHeight: 1.8 }}
            >
              Leonardo Maldonado lidera a direção criativa com um olhar formado na cena
              independente e aprimorado em produções de alto impacto. Roteiro, câmera,
              edição — a visão percorre todo o processo.
            </motion.p>

            {/* Countup stats */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.44 }}
              className="grid grid-cols-2 gap-x-7 gap-y-6 pt-4"
            >
              {stats.map((stat, i) => (
                <div
                  key={stat.label}
                  className="flex flex-col gap-1.5"
                  style={{
                    paddingLeft: i % 2 === 1 ? '28px' : '0',
                    borderLeft: i % 2 === 1 ? '1px solid rgba(255,255,255,0.08)' : 'none',
                    paddingTop: i >= 2 ? '20px' : '0',
                    borderTop: i >= 2 ? '1px solid rgba(255,255,255,0.08)' : 'none',
                  }}
                >
                  <span
                    className="font-display"
                    style={{ fontSize: '64px', lineHeight: 1, color: '#C9A84C', letterSpacing: '0.01em' }}
                  >
                    <CountUp target={stat.target} suffix={stat.suffix} active={inView} />
                  </span>
                  <span className="font-mono-mm text-[11px] tracking-[0.16em] uppercase" style={{ color: '#5A5A52' }}>
                    {stat.label}
                  </span>
                </div>
              ))}
            </motion.div>

            {/* Niche pills */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.56 }}
              className="flex flex-wrap gap-2"
            >
              {niches.map((niche) => (
                <span
                  key={niche}
                  className="h-7 px-3 flex items-center font-mono-mm text-[10px] tracking-[0.1em] transition-all duration-200"
                  style={{
                    border: '1px solid rgba(201,168,76,0.25)',
                    color: '#A8A89A',
                    background: 'transparent',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLSpanElement
                    el.style.borderColor = '#C9A84C'
                    el.style.color = '#C9A84C'
                    el.style.background = 'rgba(201,168,76,0.06)'
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLSpanElement
                    el.style.borderColor = 'rgba(201,168,76,0.25)'
                    el.style.color = '#A8A89A'
                    el.style.background = 'transparent'
                  }}
                >
                  {niche}
                </span>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
