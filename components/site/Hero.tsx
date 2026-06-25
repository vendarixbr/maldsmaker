'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

const MARQUEE_TEXT =
  'PRODUÇÃO AUDIOVISUAL ◆ FOTOGRAFIA PROFISSIONAL ◆ NAUTA ESTÚDIO 480M² ◆ VÍDEOS PARA EMPRESAS ◆ TRÁFEGO PAGO ◆ REBRANDING ◆ EVENTOS AO VIVO ◆ ARTISTAS INDEPENDENTES ◆ DA RUA PRA RUA ◆ '

const thumbnails = [
  { label: 'DIREÇÃO CRIATIVA', img: '/images/portfolio-1.png' },
  { label: 'CAPTAÇÃO',         img: '/images/portfolio-2.png' },
  { label: 'CLIPE MUSICAL',   img: '/images/portfolio-3.png' },
  { label: 'INSTITUCIONAL',   img: '/images/portfolio-4.png' },
  { label: 'ENSAIO',           img: '/images/portfolio-5.png' },
  { label: 'NAUTA ESTÚDIO',   img: '/images/portfolio-6.png' },
]

const headlineWords = [
  { text: 'MALDS',      accent: false },
  { text: 'MA',         accent: false, accentChar: 'K', rest: 'ER' },
  { text: 'LENTES',     accent: false, underline: true },
  { text: 'BRILHANTES', accent: false },
]

export function Hero() {
  return (
    <section
      id="hero"
      className="relative flex flex-col"
      style={{ background: '#0A0A0A', minHeight: '100svh' }}
    >
      {/* Background stripe texture */}
      <div className="absolute inset-0 pointer-events-none z-0 stripe-pattern" style={{ opacity: 0.3 }} />

      {/* Main content */}
      <div className="relative z-10 flex-1 flex items-center" style={{ paddingTop: '88px', paddingBottom: '40px' }}>
        <div className="site-container w-full">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-12 lg:gap-8">

            {/* Left — headline */}
            <div className="lg:max-w-[58%] flex-shrink-0">

              {/* Badge pill */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="inline-flex items-center gap-2 mb-8"
                style={{
                  border: '1px solid rgba(201,168,76,0.4)',
                  padding: '5px 12px',
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: '#C9A84C' }}
                />
                <span className="font-mono-mm text-[10px] tracking-[0.18em] uppercase" style={{ color: '#C9A84C' }}>
                  Produção Audiovisual · Sorocaba, SP
                </span>
              </motion.div>

              {/* Headline — clip-path reveal */}
              <div className="flex flex-col mb-8" style={{ lineHeight: 0.87 }}>
                {[
                  { text: 'MALDS',       render: () => <span>MALDS</span> },
                  { text: 'MAKER',       render: () => <span>M<span style={{ color: '#C9A84C' }}>A</span>KER</span> },
                  { text: 'LENTES',      render: () => (
                    <span className="relative inline-block">
                      LENTES
                      <span
                        className="absolute left-0 bottom-0"
                        style={{ width: '45%', height: '3px', background: '#C9A84C', display: 'block' }}
                      />
                    </span>
                  )},
                  { text: 'BRILHANTES.', render: () => <span>BRILHANTES<span style={{ color: '#C9A84C' }}>.</span></span> },
                ].map((line, i) => (
                  <div key={line.text} className="overflow-hidden">
                    <motion.h1
                      initial={{ y: '110%', opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.12 + i * 0.12, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                      className="font-display uppercase"
                      style={{
                        fontSize: 'clamp(68px, 10.5vw, 150px)',
                        letterSpacing: '0.02em',
                        color: '#F5F5F0',
                        marginBottom: '2px',
                      }}
                    >
                      {line.render()}
                    </motion.h1>
                  </div>
                ))}
              </div>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.72 }}
                className="font-body leading-relaxed mb-8"
                style={{ color: '#A8A89A', fontSize: '16px', fontWeight: 300, maxWidth: '400px', lineHeight: 1.7 }}
              >
                Transformamos visões em imagem. Do clipe ao institucional, do ensaio ao
                evento — cada produção carrega a nossa assinatura.
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.88 }}
                className="flex flex-wrap items-center gap-4"
              >
                <a
                  href="#portfolio"
                  className="inline-flex items-center gap-2 font-mono-mm text-[11px] tracking-[0.12em] uppercase transition-all duration-250"
                  style={{
                    background: '#C9A84C',
                    color: '#0A0A0A',
                    padding: '14px 28px',
                    border: '1px solid #C9A84C',
                    fontWeight: 700,
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLAnchorElement
                    el.style.background = 'transparent'
                    el.style.color = '#C9A84C'
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLAnchorElement
                    el.style.background = '#C9A84C'
                    el.style.color = '#0A0A0A'
                  }}
                >
                  VER PORTFÓLIO
                </a>
                <a
                  href="https://wa.me/5515999999999"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-mono-mm text-[11px] tracking-[0.12em] uppercase transition-all duration-250"
                  style={{
                    color: '#A8A89A',
                    padding: '13px 28px',
                    border: '1px solid rgba(245,245,240,0.15)',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLAnchorElement
                    el.style.borderColor = 'rgba(245,245,240,0.5)'
                    el.style.color = '#F5F5F0'
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLAnchorElement
                    el.style.borderColor = 'rgba(245,245,240,0.15)'
                    el.style.color = '#A8A89A'
                  }}
                >
                  {/* WhatsApp icon inline */}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </a>
              </motion.div>
            </div>

            {/* Right — thumbnail grid 2x3 */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="hidden lg:grid grid-cols-3 gap-1.5 flex-shrink-0"
              style={{ width: '360px' }}
            >
              {thumbnails.map((thumb, i) => (
                <div
                  key={thumb.label}
                  className="relative group overflow-hidden"
                  style={{
                    aspectRatio: '1/1',
                    border: '1px solid rgba(201,168,76,0.12)',
                  }}
                >
                  <Image
                    src={thumb.img}
                    alt={thumb.label}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                    sizes="120px"
                  />
                  {/* Overlay on hover */}
                  <div
                    className="absolute inset-0 flex items-end p-2 transition-opacity duration-300"
                    style={{ background: 'linear-gradient(to top, rgba(10,10,10,0.7) 0%, transparent 60%)', opacity: 0.7 }}
                  />
                  {/* Gold tint on hover */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: 'rgba(201,168,76,0.08)' }}
                  />
                  <div className="absolute bottom-1.5 left-1.5 z-10">
                    <span className="font-mono-mm leading-none" style={{ fontSize: '7px', letterSpacing: '0.08em', color: 'rgba(245,245,240,0.6)' }}>
                      {thumb.label}
                    </span>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="relative z-10 flex items-center gap-3 pb-6 site-container"
      >
        <div className="relative w-px h-10 overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div className="absolute top-0 left-0 w-full h-3 animate-scroll-indicator" style={{ background: '#C9A84C' }} />
        </div>
        <span className="font-mono-mm text-[9px] tracking-[0.2em] uppercase" style={{ color: 'rgba(255,255,255,0.22)' }}>
          SCROLL
        </span>
      </motion.div>

      {/* Marquee ticker — gold on dark */}
      <div
        className="relative z-10 overflow-hidden border-t"
        style={{ borderColor: 'rgba(201,168,76,0.15)', background: 'rgba(201,168,76,0.04)' }}
      >
        <div className="flex py-3">
          <div className="animate-marquee flex shrink-0 whitespace-nowrap">
            {[MARQUEE_TEXT, MARQUEE_TEXT].map((text, i) => (
              <span key={i} className="font-mono-mm text-[11px] tracking-[0.12em]" style={{ color: '#C9A84C', opacity: 0.7 }}>
                {text}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
