'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type SiteImageManifest = Record<string, string>

interface SiteImageContextType {
  overrides: SiteImageManifest
  setOverride: (key: string, url: string) => void
  clearOverride: (key: string) => void
}

const SiteImageContext = createContext<SiteImageContextType>({
  overrides: {},
  setOverride: () => {},
  clearOverride: () => {},
})

export function SiteImageProvider({ children }: { children: ReactNode }) {
  const [overrides, setOverrides] = useState<SiteImageManifest>({})

  useEffect(() => {
    let cancelled = false

    fetch('/api/site-image', { cache: 'no-store' })
      .then(res => (res.ok ? res.json() : {}))
      .then((data: SiteImageManifest) => {
        if (!cancelled) setOverrides(data)
      })
      .catch(() => {})

    return () => { cancelled = true }
  }, [])

  const setOverride = (key: string, url: string) => {
    setOverrides(prev => ({ ...prev, [key]: url }))
  }

  const clearOverride = (key: string) => {
    setOverrides(prev => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  return (
    <SiteImageContext.Provider value={{ overrides, setOverride, clearOverride }}>
      {children}
    </SiteImageContext.Provider>
  )
}

export function useSiteImageOverrides() {
  return useContext(SiteImageContext)
}
