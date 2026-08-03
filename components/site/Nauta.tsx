'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Camera } from 'lucide-react'
import { SiteImage } from '@/components/site/SiteImage'

const specs = [
  { label: 'ÁREA TOTAL',   value: '480 m²'       },
  { label: 'TETO',         value: '6 metros'      },
  { label: 'CHROMAKEY',    value: '14 metros'     },
  { label: 'CAMARINS',     value: '2 unidades'    },
  { label: 'LOCALIZAÇÃO',  value: 'Sorocaba, SP'  },
]

const capabilities = [
  'PRODUÇÕES AUDIOVISUAIS',
  'ENSAIOS FOTOGRÁFICOS',
  'LOCAÇÃO DE ESPAÇO',
  'WORKSHOPS & ENSAIOS',
]

export function Nauta() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -80px 0px' })

  return (
    <section
      id="nauta"
      ref={ref}
      className="relative overflow-hidden section-spacing"
      style={{ background: '#0D0D0D' }}
    >
      <div className="site-container">
        <div className="grid grid-cols-1 lg:grid-cols-[45%_52%] gap-14 lg:gap-20 items-start">

          {/* ── Left ── */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
            >
              <p className="font-mono-mm text-[11px] tracking-[0.14em] mb-5" style={{ color: '#C9A84C' }}>
                NOSSO ESPAÇO
              </p>

              {/* Headline */}
              <div className="overflow-hidden mb-1">
                <motion.h2
                  initial={{ y: '105%' }}
                  animate={inView ? { y: 0 } : {}}
                  transition={{ delay: 0.1, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                  className="font-display uppercase leading-none"
                  style={{ fontSize: 'clamp(52px, 7vw, 88px)', color: '#F5F5F0', letterSpacing: '0.02em' }}
                >
                  NAUTA
                </motion.h2>
              </div>
              <div className="overflow-hidden mb-10">
                <motion.h2
                  initial={{ y: '105%' }}
                  animate={inView ? { y: 0 } : {}}
                  transition={{ delay: 0.18, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                  className="font-display uppercase leading-none"
                  style={{ fontSize: 'clamp(52px, 7vw, 88px)', color: '#C9A84C', letterSpacing: '0.02em' }}
                >
                  ESTÚDIO
                </motion.h2>
              </div>
            </motion.div>

            {/* Spec sheet */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.22 }}
              className="flex flex-col mb-10"
            >
              {specs.map((spec, i) => (
                <motion.div
                  key={spec.label}
                  initial={{ opacity: 0, x: -12 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.28 + i * 0.07 }}
                  className="flex items-center py-3.5"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <span className="font-mono-mm text-[10px] tracking-[0.1em]" style={{ color: '#5A5A52', minWidth: '130px' }}>
                    {spec.label}
                  </span>
                  {/* Dashed leader */}
                  <span
                    className="flex-1 h-px mx-4"
                    style={{
                      backgroundImage: 'repeating-linear-gradient(to right, rgba(201,168,76,0.25) 0, rgba(201,168,76,0.25) 3px, transparent 3px, transparent 8px)',
                    }}
                  />
                  <span className="font-display uppercase text-sm" style={{ color: '#F5F5F0', letterSpacing: '0.04em' }}>
                    {spec.value}
                  </span>
                </motion.div>
              ))}
            </motion.div>

            {/* Capability pills */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap gap-2 mb-8"
            >
              {capabilities.map((cap) => (
                <span
                  key={cap}
                  className="h-7 px-3 flex items-center font-mono-mm text-[9px] tracking-[0.1em]"
                  style={{ border: '1px solid rgba(201,168,76,0.3)', color: '#A8A89A' }}
                >
                  {cap}
                </span>
              ))}
            </motion.div>

            {/* CTA */}
            <motion.a
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.68 }}
              href="https://wa.me/5515997307171?text=Quero%20reservar%20o%20Nauta%20Estúdio!"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 font-mono-mm text-[11px] tracking-[0.14em] uppercase transition-colors duration-200"
              style={{ color: '#C9A84C' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = '0.7' }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = '1' }}
            >
              <Camera size={16} />
              RESERVAR O ESTÚDIO →
            </motion.a>
          </div>

          {/* ── Right — gallery ── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="grid grid-cols-2 gap-2"
          >
            {/* Main image — full width */}
            <div
              className="relative col-span-2 group overflow-hidden"
              style={{ aspectRatio: '16/7', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <SiteImage
                imageKey="nauta-studio"
                alt="Nauta Estúdio — 480m² em Sorocaba"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,10,10,0.55) 0%, transparent 60%)' }} />
              {/* Gold hover border */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ border: '1px solid rgba(201,168,76,0.4)' }}
              />
              <div className="absolute bottom-3 left-3">
                <span className="font-mono-mm text-[10px] tracking-[0.12em]" style={{ color: '#C9A84C' }}>ÁREA PRINCIPAL</span>
              </div>
            </div>

            {/* Sub cells */}
            {[
              { label: 'CHROMA KEY 14M', imageKey: 'portfolio-campanha-kaizen' },
              { label: 'CAMARIM',        imageKey: 'portfolio-adega-sao-roque' },
              { label: 'ILUMINAÇÃO',     imageKey: 'portfolio-lancamento-horizonte' },
            ].map((cell) => (
              <div
                key={cell.label}
                className="relative group overflow-hidden"
                style={{ aspectRatio: '4/3', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <SiteImage
                  imageKey={cell.imageKey}
                  alt={cell.label}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                  sizes="25vw"
                />
                <div className="absolute inset-0" style={{ background: 'rgba(10,10,10,0.3)' }} />
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-250 pointer-events-none"
                  style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.35)' }}
                />
                <div className="absolute bottom-2 left-2.5">
                  <span className="font-mono-mm text-[9px] tracking-[0.1em]" style={{ color: '#C9A84C' }}>{cell.label}</span>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
