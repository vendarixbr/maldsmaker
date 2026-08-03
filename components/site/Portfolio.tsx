'use client'

import { useState, useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { Play } from 'lucide-react'
import { SiteImage } from '@/components/site/SiteImage'

const FILTERS = ['TODOS', 'MÚSICA', 'EMPRESAS', 'EVENTOS', 'ENSAIOS', 'CLIPES', 'INSTITUCIONAL', 'AO VIVO']

const ITEMS = [
  { id: 1,  title: 'Território — MC Vitão',           category: 'CLIPES',       height: 'tall',   imageKey: 'portfolio-territorio-mc-vitao',    isVideo: true  },
  { id: 2,  title: 'Adega São Roque Institucional',   category: 'INSTITUCIONAL', height: 'normal', imageKey: 'portfolio-adega-sao-roque',        isVideo: false },
  { id: 3,  title: 'Ensaio Rafael Moreno',            category: 'ENSAIOS',      height: 'short',  imageKey: 'portfolio-ensaio-rafael',           isVideo: false },
  { id: 4,  title: 'Show Kaizen Music Festival',      category: 'AO VIVO',      height: 'tall',   imageKey: 'portfolio-show-kaizen',             isVideo: true  },
  { id: 5,  title: 'Campanha Verão Kaizen',           category: 'EMPRESAS',     height: 'normal', imageKey: 'portfolio-campanha-kaizen',         isVideo: false },
  { id: 6,  title: 'EP Visual Ana Beatriz Lima',      category: 'MÚSICA',       height: 'short',  imageKey: 'portfolio-ep-ana-beatriz',          isVideo: true  },
  { id: 7,  title: 'Lançamento Horizonte',            category: 'INSTITUCIONAL', height: 'normal', imageKey: 'portfolio-lancamento-horizonte',   isVideo: false },
  { id: 8,  title: 'Madrugada — Rafael Moreno',       category: 'CLIPES',       height: 'tall',   imageKey: 'portfolio-madrugada-rafael',        isVideo: true  },
  { id: 9,  title: 'Workshop Fotografia',             category: 'EVENTOS',      height: 'short',  imageKey: 'portfolio-territorio-mc-vitao',     isVideo: false },
  { id: 10, title: 'Bianca Ferreira — Pack Dez',      category: 'ENSAIOS',      height: 'normal', imageKey: 'portfolio-ensaio-rafael',           isVideo: false },
  { id: 11, title: 'Conference Advocacia Pereira',    category: 'AO VIVO',      height: 'short',  imageKey: 'portfolio-show-kaizen',             isVideo: true  },
  { id: 12, title: 'Giovane Dias — Amanhã',           category: 'MÚSICA',       height: 'normal', imageKey: 'portfolio-ep-ana-beatriz',          isVideo: true  },
]

const HEIGHTS: Record<string, string> = {
  tall:   '340px',
  normal: '260px',
  short:  '200px',
}

export function Portfolio() {
  const [activeFilter, setActiveFilter] = useState('TODOS')
  const [visible, setVisible] = useState(8)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -80px 0px' })

  const filtered = activeFilter === 'TODOS' ? ITEMS : ITEMS.filter(item => item.category === activeFilter)
  const displayed = filtered.slice(0, visible)

  return (
    <section
      id="portfolio"
      ref={ref}
      className="section-spacing"
      style={{ background: '#111111' }}
    >
      <div className="site-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <p className="font-mono-mm text-[11px] tracking-[0.14em] mb-4" style={{ color: '#C9A84C' }}>
            TRABALHOS
          </p>
          <h2 className="font-display uppercase" style={{ fontSize: 'clamp(36px, 5.5vw, 64px)', color: '#F5F5F0', letterSpacing: '0.02em' }}>
            A história em imagens.
          </h2>
        </motion.div>

        {/* Filter bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.15 }}
          className="flex gap-1 overflow-x-auto scrollbar-hide pb-2 mb-10 flex-wrap"
        >
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => { setActiveFilter(f); setVisible(8) }}
              className="shrink-0 font-mono-mm text-[10px] tracking-[0.12em] px-3 py-1.5 transition-all duration-200"
              style={{
                background: activeFilter === f ? '#C9A84C' : 'transparent',
                color: activeFilter === f ? '#0A0A0A' : '#5A5A52',
                border: activeFilter === f ? '1px solid #C9A84C' : '1px solid rgba(255,255,255,0.08)',
                borderRadius: '1px',
              }}
              onMouseEnter={e => {
                if (activeFilter !== f) {
                  const el = e.currentTarget
                  el.style.borderColor = 'rgba(201,168,76,0.4)'
                  el.style.color = '#A8A89A'
                }
              }}
              onMouseLeave={e => {
                if (activeFilter !== f) {
                  const el = e.currentTarget
                  el.style.borderColor = 'rgba(255,255,255,0.08)'
                  el.style.color = '#5A5A52'
                }
              }}
            >
              {f}
            </button>
          ))}
        </motion.div>

        {/* Masonry grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFilter}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="columns-1 sm:columns-2 lg:columns-3 gap-3"
          >
            {displayed.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
                className="relative group break-inside-avoid mb-3 overflow-hidden"
                style={{
                  height: HEIGHTS[item.height],
                  background: '#1a1a1a',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '2px',
                  cursor: 'none',
                }}
              >
                <SiteImage
                  imageKey={item.imageKey}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />

                {/* Category badge */}
                <div className="absolute top-3 left-3 z-10">
                  <span
                    className="font-mono-mm text-[9px] tracking-[0.1em] px-2 py-0.5 block"
                    style={{
                      background: 'rgba(10,10,10,0.7)',
                      border: '1px solid rgba(201,168,76,0.3)',
                      color: '#C9A84C',
                      backdropFilter: 'blur(4px)',
                    }}
                  >
                    {item.category}
                  </span>
                </div>

                {/* Bottom gradient + title */}
                <div
                  className="absolute inset-x-0 bottom-0 p-4 pt-14"
                  style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)' }}
                >
                  <p className="font-display uppercase text-sm" style={{ color: '#F5F5F0', letterSpacing: '0.04em', lineHeight: 1.2 }}>
                    {item.title}
                  </p>
                </div>

                {/* Hover overlay */}
                <div
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
                  style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.3)' }}
                >
                  {item.isVideo && (
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(201,168,76,0.9)', color: '#0A0A0A' }}
                    >
                      <Play size={20} fill="currentColor" />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Load more */}
        {visible < filtered.length && (
          <div className="flex justify-center mt-10">
            <button
              onClick={() => setVisible(v => v + 4)}
              className="font-mono-mm text-[11px] tracking-[0.14em] h-11 px-10 transition-all duration-200"
              style={{ border: '1px solid rgba(245,245,240,0.15)', color: '#A8A89A' }}
              onMouseEnter={e => {
                const el = e.currentTarget
                el.style.background = '#F5F5F0'
                el.style.color = '#0A0A0A'
                el.style.borderColor = '#F5F5F0'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget
                el.style.background = 'transparent'
                el.style.color = '#A8A89A'
                el.style.borderColor = 'rgba(245,245,240,0.15)'
              }}
            >
              CARREGAR MAIS
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
