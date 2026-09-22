'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { DEFAULT_HOME_CONTENT, DEFAULT_SITE_SETTINGS, type HomeContent, type SiteSettings } from '@/lib/data'

interface SiteContentContextType {
  settings: SiteSettings
  home: HomeContent
}

const SiteContentContext = createContext<SiteContentContextType>({
  settings: DEFAULT_SITE_SETTINGS,
  home: DEFAULT_HOME_CONTENT,
})

export function SiteContentProvider({ children }: { children: ReactNode }) {
  const [value, setValue] = useState<SiteContentContextType>({
    settings: DEFAULT_SITE_SETTINGS,
    home: DEFAULT_HOME_CONTENT,
  })

  useEffect(() => {
    let cancelled = false

    fetch('/api/site-content', { cache: 'no-store' })
      .then(res => (res.ok ? res.json() : null))
      .then((data: SiteContentContextType | null) => {
        if (!cancelled && data) setValue(data)
      })
      .catch(() => {})

    return () => { cancelled = true }
  }, [])

  return <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>
}

export function useSiteContent() {
  return useContext(SiteContentContext)
}

/** Monta um link wa.me a partir do número salvo nas configurações. */
export function whatsappLink(whatsapp: string, message?: string): string {
  const digits = whatsapp.replace(/\D/g, '')
  const withCountry = digits.startsWith('55') ? digits : `55${digits}`
  const base = `https://wa.me/${withCountry}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}
