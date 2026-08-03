'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { SiteImage } from '@/components/site/SiteImage'

const navLinks = [
  { label: 'Sobre', href: '#sobre' },
  { label: 'Serviços', href: '#servicos' },
  { label: 'Nauta Estúdio', href: '#nauta' },
  { label: 'Portfólio', href: '#portfolio' },
  { label: 'Contato', href: '#contato' },
]

export function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background: scrolled ? 'rgba(10,10,10,0.88)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(201,168,76,0.12)' : '1px solid transparent',
        }}
      >
        <div className="site-container">
          <div className="flex items-center justify-between h-16 lg:h-20">

            {/* Logo */}
            <a href="#hero" className="flex-shrink-0 block" style={{ lineHeight: 0 }}>
              <SiteImage
                imageKey="logo"
                alt="Malds Maker"
                width={200}
                height={64}
                priority
                className="w-auto"
                style={{
                  height: 'clamp(48px, 5.5vw, 64px)',
                  mixBlendMode: 'screen',
                  objectFit: 'contain',
                }}
              />
            </a>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="relative font-mono-mm text-[11px] tracking-[0.15em] uppercase pb-1 transition-colors duration-200"
                  style={{ color: active === link.href ? '#C9A84C' : '#A8A89A' }}
                  onMouseEnter={() => setActive(link.href)}
                  onMouseLeave={() => setActive(null)}
                >
                  {link.label}
                  <span
                    className="absolute bottom-0 left-0 h-px transition-all duration-300 ease-out"
                    style={{
                      background: '#C9A84C',
                      width: active === link.href ? '100%' : '0%',
                    }}
                  />
                </a>
              ))}
            </nav>

            {/* Desktop CTA */}
            <div className="flex items-center gap-4">
              <div className="hidden lg:block">
                <a href="#contato" className="cta-primary">
                  Reservar Horário
                </a>
              </div>

              {/* Hamburger */}
              <button
                onClick={() => setOpen(true)}
                className="lg:hidden p-2 -mr-2"
                aria-label="Abrir menu"
                style={{ color: '#F5F5F0' }}
              >
                <Menu size={22} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[100] flex flex-col"
            style={{ background: '#0A0A0A' }}
          >
            {/* Top bar */}
            <div className="site-container flex items-center justify-between h-16 flex-shrink-0">
              <a href="#hero" onClick={() => setOpen(false)} className="block" style={{ lineHeight: 0 }}>
                <SiteImage
                  imageKey="logo"
                  alt="Malds Maker"
                  width={160}
                  height={52}
                  className="w-auto"
                  style={{
                    height: '52px',
                    mixBlendMode: 'screen',
                    objectFit: 'contain',
                  }}
                />
              </a>
              <button onClick={() => setOpen(false)} aria-label="Fechar menu" style={{ color: '#F5F5F0' }}>
                <X size={22} />
              </button>
            </div>

            {/* Links — stagger */}
            <nav className="flex-1 flex flex-col justify-center site-container gap-2">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07, ease: 'easeOut' }}
                  className="font-display uppercase py-2 border-b transition-colors duration-200"
                  style={{
                    fontSize: 'clamp(32px, 7vw, 52px)',
                    color: '#F5F5F0',
                    borderColor: 'rgba(255,255,255,0.05)',
                    letterSpacing: '0.04em',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#C9A84C')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#F5F5F0')}
                >
                  {link.label}
                </motion.a>
              ))}
              <motion.a
                href="#contato"
                onClick={() => setOpen(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.48 }}
                className="cta-primary self-start mt-6"
              >
                Reservar Horário
              </motion.a>
            </nav>

            {/* Footer */}
            <div className="site-container pb-8 flex-shrink-0">
              <p className="font-mono-mm text-[10px] tracking-[0.12em]" style={{ color: '#5A5A52' }}>
                @maldsmaker · Sorocaba, SP
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
