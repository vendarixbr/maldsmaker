'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { MapPin } from 'lucide-react'

const artists = [
  {
    name: 'MC Vitão',
    genre: 'RAP / TRAP',
    type: 'VIDEO CLIP',
    city: 'SOROCABA, SP',
    bio: 'Das ruas do centro à cena underground. Visão de cinema, letras reais.',
  },
  {
    name: 'Ana Beatriz Lima',
    genre: 'R&B',
    type: 'EP VISUAL',
    city: 'SOROCABA, SP',
    bio: 'Voz e produção própria. O feminino da cena independente de SP.',
  },
  {
    name: 'Giovane Dias',
    genre: 'HIP HOP',
    type: 'VIDEO CLIP',
    city: 'SOROCABA, SP',
    bio: 'Bars afiados e batidas que contam a história de quem ficou.',
  },
]

const headlineLetters = ['DA', 'RUA', 'PRA', 'RUA']

export function DaRuaPraRua() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -80px 0px' })

  return (
    <section
      id="darua"
      ref={ref}
      className="relative section-spacing overflow-hidden"
      style={{ background: '#111111' }}
    >
      {/* Coarser grain overlay for street feel */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          opacity: 0.05,
        }}
        aria-hidden="true"
      />

      {/* Ghost background text */}
      <div
        className="absolute inset-0 flex items-center pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        <span
          className="font-display uppercase select-none"
          style={{
            fontSize: 'clamp(80px, 14vw, 200px)',
            color: 'rgba(255,255,255,0.025)',
            letterSpacing: '0.02em',
            whiteSpace: 'nowrap',
          }}
        >
          DA RUA PRA RUA
        </span>
      </div>

      <div className="site-container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-[38%_58%] gap-14 lg:gap-20 items-start">

          {/* ── Left ── */}
          <div>
            {/* Label pill */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="mb-7"
            >
              <span
                className="inline-flex items-center font-mono-mm text-[10px] tracking-[0.16em] uppercase px-3 py-1.5"
                style={{
                  border: '1px solid rgba(245,245,240,0.15)',
                  color: '#A8A89A',
                }}
              >
                PROJETO SOCIAL
              </span>
            </motion.div>

            {/* Headline stacked — clip-path reveal */}
            <div className="flex flex-col mb-6" style={{ lineHeight: 0.87 }}>
              {headlineLetters.map((word, i) => (
                <div key={word + i} className="overflow-hidden">
                  <motion.h2
                    initial={{ y: '105%' }}
                    animate={inView ? { y: 0 } : {}}
                    transition={{ delay: 0.08 + i * 0.1, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                    className="font-display uppercase"
                    style={{
                      fontSize: 'clamp(60px, 8.5vw, 120px)',
                      letterSpacing: '0.02em',
                      color: i === 3 ? '#C9A84C' : '#F5F5F0',
                    }}
                  >
                    {word}
                    {i === 3 && <span style={{ color: '#C9A84C' }}>.</span>}
                  </motion.h2>
                </div>
              ))}
            </div>

            {/* Gold line */}
            <motion.div
              initial={{ scaleX: 0, originX: 0 }}
              animate={inView ? { scaleX: 1 } : {}}
              transition={{ delay: 0.48, duration: 0.6 }}
              className="mb-7 h-px"
              style={{ width: '60px', background: '#C9A84C' }}
            />

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.52 }}
              className="flex items-center gap-8 mb-8"
            >
              {[{ val: '15+', lbl: 'Artistas' }, { val: '3', lbl: 'Anos ativo' }].map((s, i) => (
                <div key={s.lbl}>
                  <p className="font-display" style={{ fontSize: '36px', color: '#F5F5F0', lineHeight: 1 }}>{s.val}</p>
                  <p className="font-mono-mm text-[10px] tracking-[0.12em] mt-1" style={{ color: '#C9A84C' }}>{s.lbl}</p>
                </div>
              ))}
            </motion.div>

            <motion.a
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.6 }}
              href="https://wa.me/5515999999999?text=Quero%20saber%20mais%20sobre%20o%20Da%20Rua%20Pra%20Rua!"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-mono-mm text-[11px] tracking-[0.14em] uppercase transition-colors duration-200"
              style={{ color: '#A8A89A', borderBottom: '1px solid rgba(245,245,240,0.2)', paddingBottom: '2px' }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLAnchorElement
                el.style.color = '#C9A84C'
                el.style.borderBottomColor = '#C9A84C'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLAnchorElement
                el.style.color = '#A8A89A'
                el.style.borderBottomColor = 'rgba(245,245,240,0.2)'
              }}
            >
              CONHECER O PROJETO →
            </motion.a>
          </div>

          {/* ── Right — artist cards ── */}
          <div className="flex flex-col lg:flex-row gap-4 items-stretch">
            {artists.map((artist, i) => (
              <motion.div
                key={artist.name}
                initial={{ opacity: 0, y: 28 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.55, delay: 0.15 + i * 0.1 }}
                className="flex-1 flex flex-col gap-4 p-5 transition-all duration-300"
                style={{
                  background: '#161616',
                  border: '1px solid rgba(245,245,240,0.07)',
                  borderRadius: '2px',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLDivElement
                  el.style.borderColor = 'rgba(201,168,76,0.4)'
                  el.style.transform = 'translateY(-4px)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLDivElement
                  el.style.borderColor = 'rgba(245,245,240,0.07)'
                  el.style.transform = 'translateY(0)'
                }}
              >
                {/* Placeholder video thumb */}
                <div
                  className="w-full overflow-hidden stripe-pattern flex items-end p-2.5"
                  style={{
                    aspectRatio: '16/9',
                    background: '#1e1e1e',
                    border: '1px solid rgba(255,255,255,0.04)',
                    borderRadius: '1px',
                  }}
                >
                  <span className="font-mono-mm text-[8px] tracking-[0.1em]" style={{ color: 'rgba(255,255,255,0.18)' }}>
                    {artist.type}
                  </span>
                </div>

                {/* Pills */}
                <div className="flex items-center gap-2">
                  <span
                    className="inline-flex items-center h-5 px-2 font-mono-mm text-[8px] tracking-[0.1em]"
                    style={{ border: '1px solid rgba(201,168,76,0.35)', color: '#C9A84C' }}
                  >
                    {artist.genre}
                  </span>
                </div>

                {/* Name */}
                <p className="font-display uppercase text-xl" style={{ color: '#F5F5F0', letterSpacing: '0.02em', lineHeight: 1.1 }}>
                  {artist.name}
                </p>

                {/* City */}
                <div className="flex items-center gap-1.5">
                  <MapPin size={10} style={{ color: '#5A5A52' }} />
                  <span className="font-mono-mm text-[9px] tracking-[0.1em]" style={{ color: '#5A5A52' }}>
                    {artist.city}
                  </span>
                </div>

                {/* Bio */}
                <p className="font-body italic text-sm leading-relaxed" style={{ color: '#A8A89A', fontWeight: 300 }}>
                  {artist.bio}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
