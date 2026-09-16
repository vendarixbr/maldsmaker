'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAdmin } from '@/lib/admin-context'
import { Users, Film, LayoutGrid, MessageSquareQuote, Search, CornerDownLeft } from 'lucide-react'

interface Hit {
  key: string
  group: string
  title: string
  subtitle: string
  run: () => void
}

export function AdminCommandPalette() {
  const { state, setActiveSection, setSidebarOpen } = useAdmin()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [cursor, setCursor] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen(v => !v)
      } else if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (open) {
      setQuery('')
      setCursor(0)
      setTimeout(() => inputRef.current?.focus(), 30)
    }
  }, [open ])

  const go = (section: string) => {
    setOpen(false)
    setSidebarOpen(false)
    setActiveSection(section)
  }

  const hits = useMemo<Hit[]>(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    const out: Hit[] = []

    for (const c of state.clients) {
      if (!`${c.name} ${c.empresa ?? ''} ${c.niche}`.toLowerCase().includes(q)) continue
      out.push({
        key: `c-${c.id}`,
        group: 'CLIENTES',
        title: c.name,
        subtitle: `${c.status} · ${c.niche}`,
        run: () => go('clientes'),
      })
      if (out.length >= 20) break
    }
    for (const p of state.projects) {
      if (!`${p.title} ${p.clientName} ${p.serviceType}`.toLowerCase().includes(q)) continue
      out.push({
        key: `p-${p.id}`,
        group: 'PROJETOS',
        title: p.title,
        subtitle: `${p.clientName} · ${p.status}`,
        run: () => {
          setOpen(false)
          router.push(`/admin/projetos/${p.id}`)
        },
      })
      if (out.length >= 20) break
    }
    for (const item of state.portfolio ?? []) {
      if (!`${item.title} ${item.category}`.toLowerCase().includes(q)) continue
      out.push({
        key: `pf-${item.id}`,
        group: 'PORTFÓLIO',
        title: item.title,
        subtitle: item.category,
        run: () => {
          setOpen(false)
          router.push(`/admin/portfolio/${item.id}`)
        },
      })
      if (out.length >= 20) break
    }
    for (const t of state.testimonials ?? []) {
      if (!`${t.name} ${t.niche}`.toLowerCase().includes(q)) continue
      out.push({
        key: `t-${t.id}`,
        group: 'DEPOIMENTOS',
        title: t.name,
        subtitle: t.niche,
        run: () => go('depoimentos'),
      })
      if (out.length >= 20) break
    }
    return out.slice(0, 20)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, state.clients, state.projects, state.portfolio, state.testimonials])

  useEffect(() => setCursor(0), [hits.length])

  if (!open) return null

  const groupIcon = (group: string) => {
    if (group === 'CLIENTES') return <Users size={14} className="text-[#5DADE2] shrink-0" />
    if (group === 'PROJETOS') return <Film size={14} className="text-[#E5C158] shrink-0" />
    if (group === 'PORTFÓLIO') return <LayoutGrid size={14} className="text-[#BB8FCE] shrink-0" />
    return <MessageSquareQuote size={14} className="text-[#52BE80] shrink-0" />
  }

  let lastGroup = ''

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center px-4 pt-[12vh]"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={() => setOpen(false)}
      role="dialog"
      aria-label="Busca rápida"
    >
      <div
        className="w-full overflow-hidden"
        style={{ maxWidth: '560px', background: '#0F0F0F', border: '1px solid rgba(201,168,76,0.35)', borderRadius: '12px' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 h-13 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <Search size={17} className="text-[#E5C158] shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'ArrowDown') {
                e.preventDefault()
                setCursor(c => Math.min(c + 1, hits.length - 1))
              } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setCursor(c => Math.max(c - 1, 0))
              } else if (e.key === 'Enter' && hits[cursor]) {
                hits[cursor].run()
              }
            }}
            placeholder="Buscar cliente, projeto, portfólio..."
            className="flex-1 bg-transparent outline-none font-display text-base text-white placeholder:text-[#5A5A52]"
          />
          <kbd className="font-mono-mm text-[10px] px-1.5 py-0.5 rounded text-[#94A3B8]" style={{ border: '1px solid rgba(255,255,255,0.15)' }}>
            ESC
          </kbd>
        </div>
        <div className="max-h-[50vh] overflow-y-auto p-2">
          {query.trim() === '' ? (
            <p className="font-mono-mm text-[11px] text-[#5A5A52] text-center py-6">
              DIGITE PARA BUSCAR EM TODO O ADMIN
            </p>
          ) : hits.length === 0 ? (
            <p className="font-mono-mm text-[11px] text-[#5A5A52] text-center py-6">
              NENHUM RESULTADO PARA “{query.trim().toUpperCase()}”
            </p>
          ) : (
            hits.map((hit, idx) => {
              const showGroup = hit.group !== lastGroup
              lastGroup = hit.group
              return (
                <div key={hit.key}>
                  {showGroup && (
                    <p className="font-mono-mm text-[10px] tracking-[0.12em] text-[#5A5A52] font-semibold px-3 pt-2 pb-1">
                      {hit.group}
                    </p>
                  )}
                  <button
                    onClick={hit.run}
                    onMouseEnter={() => setCursor(idx)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left"
                    style={{ background: cursor === idx ? 'rgba(201,168,76,0.12)' : 'transparent' }}
                  >
                    {groupIcon(hit.group)}
                    <span className="flex-1 min-w-0">
                      <span className="block font-display font-medium text-sm text-white truncate">{hit.title}</span>
                      <span className="block font-mono-mm text-[10px] text-[#94A3B8] truncate">{hit.subtitle}</span>
                    </span>
                    {cursor === idx && <CornerDownLeft size={13} className="text-[#E5C158] shrink-0" />}
                  </button>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
