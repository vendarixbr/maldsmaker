'use client'

import { useState, useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { useSiteContent, whatsappLink } from '@/lib/site-content-context'

export function Servicos() {
  const { home, settings } = useSiteContent()
  const { eyebrow, heading, items, ctaTitle, ctaSubtitle, ctaButtonLabel, ctaWhatsappMessage } = home.servicos
  const services = items.map((item, i) => ({ ...item, num: String(i + 1).padStart(2, '0') }))
  const [expanded, setExpanded] = useState<number | null>(null)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '0px -100px -100px 0px' })

  return (
    <section
      id="servicos"
      ref={ref}
      className="section-spacing"
      style={{ background: '#0D0D0D' }}
    >
      <div className="site-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <p className="font-mono-mm text-[11px] tracking-[0.12em] mb-4" style={{ color: '#C9A84C' }}>
            {eyebrow}
          </p>
          <h2 className="font-display font-bold" style={{ fontSize: 'clamp(32px, 5vw, 56px)', color: '#F2F2F2' }}>
            {heading}
          </h2>
        </motion.div>

        {/* Service list */}
        <div>
          {services.map((service, i) => {
            const isOpen = expanded === i
            return (
              <motion.div
                key={service.num}
                initial={{ opacity: 0, y: 12 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <button
                  className="w-full text-left group"
                  onClick={() => setExpanded(isOpen ? null : i)}
                >
                  <div
                    className="flex items-center gap-4 lg:gap-8 py-5 px-4 transition-colors duration-200 relative"
                    style={{
                      background: isOpen ? '#191919' : 'transparent',
                      borderLeft: isOpen ? '2px solid #C9A84C' : '2px solid transparent',
                    }}
                  >
                    {/* Number */}
                    <span className="font-mono-mm text-[11px] tracking-[0.1em] shrink-0 w-8"
                      style={{ color: 'rgba(201,168,76,0.5)' }}>
                      {service.num}
                    </span>

                    {/* Name */}
                    <span
                      className="font-display font-semibold flex-1 transition-colors duration-200"
                      style={{
                        fontSize: 'clamp(16px, 2vw, 22px)',
                        color: isOpen ? '#F2F2F2' : '#D4D4D4',
                      }}
                    >
                      {service.name}
                    </span>

                    {/* Tag — hidden on mobile */}
                    <span
                      className="hidden lg:block font-mono-mm text-[10px] tracking-[0.1em]"
                      style={{ color: '#555' }}
                    >
                      {service.tag}
                    </span>

                    {/* Arrow */}
                    <span style={{ color: '#C9A84C' }}>
                      {isOpen ? <ArrowUpRight size={18} /> : <ArrowRight size={18} />}
                    </span>
                  </div>

                  {/* Expandable panel */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: 'easeInOut' }}
                        className="overflow-hidden"
                        style={{ background: '#191919', borderLeft: '2px solid #C9A84C' }}
                      >
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 px-6 lg:px-10 py-8 lg:py-10">
                          {/* Left — description */}
                          <div className="flex flex-col gap-6">
                            <p
                              className="font-body leading-relaxed"
                              style={{ fontSize: '16px', color: '#C8C8C8', fontWeight: 300, lineHeight: 1.75 }}
                            >
                              {service.description}
                            </p>
                            <a
                              href="#contato"
                              className="self-start flex items-center gap-3 font-mono-mm text-[10px] tracking-[0.14em] uppercase transition-colors duration-200"
                              style={{ color: '#C9A84C' }}
                              onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
                              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                            >
                              <span
                                className="inline-flex items-center justify-center w-7 h-7 border"
                                style={{ borderColor: 'rgba(201,168,76,0.4)' }}
                              >
                                <ArrowRight size={13} />
                              </span>
                              Solicitar orçamento
                            </a>
                          </div>

                          {/* Right — bullets */}
                          <div className="flex flex-col gap-3">
                            <p className="font-mono-mm text-[9px] tracking-[0.18em] uppercase mb-1" style={{ color: 'rgba(201,168,76,0.5)' }}>
                              O que está incluído
                            </p>
                            {service.bullets.map((item, idx) => (
                              <div key={idx} className="flex items-start gap-3">
                                <span
                                  className="mt-[7px] shrink-0 w-4 h-[1px]"
                                  style={{ background: '#C9A84C' }}
                                />
                                <span
                                  className="font-body"
                                  style={{ fontSize: '14px', color: '#A0A0A0', lineHeight: 1.6, fontWeight: 300 }}
                                >
                                  {item}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>

                {/* Separator */}
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', marginLeft: '2rem' }} />
              </motion.div>
            )
          })}
        </div>

        {/* Bottom CTA strip */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 px-6 py-8"
          style={{
            background: '#191919',
            borderLeft: '3px solid #C9A84C',
          }}
        >
          <div>
            <p className="font-display font-medium text-lg" style={{ color: '#F2F2F2' }}>
              {ctaTitle}
            </p>
            <p className="font-body text-sm mt-1" style={{ color: '#888', fontWeight: 300 }}>
              {ctaSubtitle}
            </p>
          </div>
          <a
            href={whatsappLink(settings.whatsapp, ctaWhatsappMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 flex items-center gap-2 font-mono-mm text-[11px] tracking-[0.12em] px-5 h-10 border transition-all duration-200"
            style={{ borderColor: '#C9A84C', color: '#C9A84C' }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.background = '#C9A84C'
              el.style.color = '#080808'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.background = 'transparent'
              el.style.color = '#C9A84C'
            }}
          >
            {ctaButtonLabel}
          </a>
        </motion.div>
      </div>
    </section>
  )
}
