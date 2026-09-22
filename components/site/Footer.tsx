'use client'

import { AtSign, Phone, Play } from 'lucide-react'
import { SiteImage } from '@/components/site/SiteImage'
import { useSiteContent, whatsappLink } from '@/lib/site-content-context'

const linkStyle = {
  color: '#5A5A52' as const,
  transition: 'color 0.2s, transform 0.2s',
  display: 'inline-block' as const,
}

export function Footer() {
  const { home, settings } = useSiteContent()

  const navLinks = [
    { label: 'Sobre',          href: '#sobre'     },
    { label: 'Serviços',       href: '#servicos'  },
    { label: 'Nauta Estúdio',  href: '#nauta'     },
    { label: 'Portfólio',      href: '#portfolio' },
    { label: 'Contato',        href: '#contato'   },
    { label: 'Reservar Horário', href: whatsappLink(settings.whatsapp) },
  ]

  const serviceLinks = home.servicos.items.map(s => s.name)

  const socials = [
    { Icon: AtSign, href: `https://instagram.com/${settings.instagram.replace('@', '')}`, label: 'Instagram' },
    { Icon: Phone,  href: whatsappLink(settings.whatsapp),                                label: 'WhatsApp'  },
    { Icon: Play,   href: settings.youtube,                                               label: 'YouTube'   },
  ]

  return (
    <footer style={{ background: '#050505', borderTop: '1px solid rgba(201,168,76,0.1)' }}>
      <div className="site-container py-16 lg:py-20">

        {/* 4-column grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-14">

          {/* Col 1 — Brand */}
          <div className="flex flex-col gap-4">
            <a href="#hero" className="block self-start" style={{ lineHeight: 0 }}>
              <SiteImage
                imageKey="logo"
                alt="Malds Maker"
                width={240}
                height={80}
                className="w-auto"
                style={{
                  height: '80px',
                  mixBlendMode: 'screen',
                  objectFit: 'contain',
                }}
              />
            </a>
            <p className="font-body italic text-sm leading-relaxed" style={{ color: '#5A5A52', fontWeight: 300 }}>
              {home.footer.tagline}
            </p>
            <p className="font-mono-mm text-[10px] tracking-[0.1em]" style={{ color: '#2e2e2e' }}>
              © {new Date().getFullYear()} Malds Maker.<br />Todos os direitos reservados.
            </p>
          </div>

          {/* Col 2 — Navigation */}
          <div>
            <p className="font-mono-mm text-[10px] tracking-[0.14em] mb-5" style={{ color: '#C9A84C' }}>
              NAVEGAÇÃO
            </p>
            <div className="flex flex-col gap-2.5">
              {navLinks.map(link => (
                <a
                  key={link.label}
                  href={link.href}
                  target={link.href.startsWith('http') ? '_blank' : undefined}
                  rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="font-mono-mm text-[11px] tracking-[0.08em]"
                  style={linkStyle}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLAnchorElement
                    el.style.color = '#C9A84C'
                    el.style.transform = 'translateX(4px)'
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLAnchorElement
                    el.style.color = '#5A5A52'
                    el.style.transform = 'translateX(0)'
                  }}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Col 3 — Services */}
          <div>
            <p className="font-mono-mm text-[10px] tracking-[0.14em] mb-5" style={{ color: '#C9A84C' }}>
              SERVIÇOS
            </p>
            <div className="flex flex-col gap-2.5">
              {serviceLinks.map(svc => (
                <a
                  key={svc}
                  href="#servicos"
                  className="font-mono-mm text-[11px] tracking-[0.08em]"
                  style={linkStyle}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLAnchorElement
                    el.style.color = '#C9A84C'
                    el.style.transform = 'translateX(4px)'
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLAnchorElement
                    el.style.color = '#5A5A52'
                    el.style.transform = 'translateX(0)'
                  }}
                >
                  {svc}
                </a>
              ))}
            </div>
          </div>

          {/* Col 4 — Social + Contact */}
          <div>
            <p className="font-mono-mm text-[10px] tracking-[0.14em] mb-5" style={{ color: '#C9A84C' }}>
              REDES SOCIAIS
            </p>
            <div className="flex items-center gap-3 mb-6">
              {socials.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-10 h-10 flex items-center justify-center transition-all duration-200"
                  style={{ border: '1px solid rgba(255,255,255,0.1)', color: '#5A5A52', borderRadius: '50%' }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLAnchorElement
                    el.style.borderColor = '#C9A84C'
                    el.style.color = '#C9A84C'
                    el.style.background = 'rgba(201,168,76,0.08)'
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLAnchorElement
                    el.style.borderColor = 'rgba(255,255,255,0.1)'
                    el.style.color = '#5A5A52'
                    el.style.background = 'transparent'
                  }}
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
            <p className="font-mono-mm text-[10px] tracking-[0.1em] leading-relaxed" style={{ color: '#3a3a3a' }}>
              Nauta Estúdio<br />{settings.cidade} — Brasil
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="h-px mb-6" style={{ background: 'rgba(255,255,255,0.04)' }} />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="font-mono-mm text-[10px] tracking-[0.1em]" style={{ color: '#2e2e2e' }}>
            PRODUÇÃO AUDIOVISUAL · FOTOGRAFIA · {settings.cidade.toUpperCase()}
          </p>
          <div className="flex items-center gap-4">
            <a
              href={`mailto:${settings.email}`}
              className="font-mono-mm text-[10px] tracking-[0.1em] transition-colors duration-200"
              style={{ color: '#3a3a3a' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#C9A84C')}
              onMouseLeave={e => (e.currentTarget.style.color = '#3a3a3a')}
            >
              {settings.email}
            </a>
            <a
              href={whatsappLink(settings.whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono-mm text-[10px] tracking-[0.1em] transition-colors duration-200"
              style={{ color: '#3a3a3a' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#C9A84C')}
              onMouseLeave={e => (e.currentTarget.style.color = '#3a3a3a')}
            >
              {settings.whatsapp}
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
