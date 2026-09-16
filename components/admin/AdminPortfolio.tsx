'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAdmin } from '@/lib/admin-context'
import type { PortfolioItem } from '@/lib/data'
import { Plus, X, Trash2, Edit3, Video, Image as ImageIcon, Search, ExternalLink, ImagePlus, ChevronUp, ChevronDown } from 'lucide-react'
import { SiteImage } from '@/components/site/SiteImage'
import { SITE_IMAGE_SLOTS } from '@/lib/site-images'
import { uniqueSlug } from '@/lib/slug'

const CATEGORIES = ['TODOS', 'MÚSICA', 'EMPRESAS', 'EVENTOS', 'ENSAIOS', 'CLIPES', 'INSTITUCIONAL', 'AO VIVO']

const inputStyle = {
  background: '#161616',
  border: '1px solid rgba(255,255,255,0.16)',
  borderRadius: '6px',
  color: '#F9FAFB',
} as const

function PortfolioForm({
  initial,
  onClose,
}: {
  initial?: PortfolioItem | null
  onClose: () => void
}) {
  const { dispatch, state } = useAdmin()
  const router = useRouter()
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [category, setCategory] = useState(initial?.category ?? 'MÚSICA')
  const [imageKey, setImageKey] = useState(initial?.imageKey ?? SITE_IMAGE_SLOTS[8]?.key ?? '')
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? '')
  const [isVideo, setIsVideo] = useState(initial?.isVideo ?? false)

  const isEdit = !!initial
  const nextOrder = (state.portfolio ?? []).length + 1

  const buildPayload = (): PortfolioItem | null => {
    if (!title.trim()) return null
    if (initial) {
      return { ...initial, title: title.trim(), description: description.trim(), category, imageKey, imageUrl: imageUrl.trim() || undefined, isVideo }
    }
    return {
      id: `pf-${Date.now()}`,
      title: title.trim(),
      slug: uniqueSlug(title, (state.portfolio ?? []).map(p => p.slug)),
      description: description.trim(),
      category,
      imageKey,
      imageUrl: imageUrl.trim() || undefined,
      isVideo,
      sortOrder: nextOrder,
      images: [],
    }
  }

  const handleSave = (openPage: boolean) => {
    const payload = buildPayload()
    if (!payload) return
    dispatch({ type: isEdit ? 'UPDATE_PORTFOLIO' : 'ADD_PORTFOLIO', payload })
    onClose()
    if (openPage) router.push(`/admin/portfolio/${payload.id}`)
  }

  return (
    <>
      <div className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.75)' }} onClick={onClose} />
      <div
        className="fixed top-1/2 left-1/2 z-50 flex flex-col gap-5 p-6 overflow-y-auto"
        style={{ width: 'min(560px, 95vw)', maxHeight: '90vh', transform: 'translate(-50%, -50%)', background: '#0F0F0F', border: '1px solid rgba(255,255,255,0.14)', borderRadius: '12px' }}
      >
        <div className="flex items-center justify-between">
          <p className="font-mono-mm text-[11px] tracking-[0.12em] font-semibold" style={{ color: '#E5C158' }}>
            {isEdit ? 'EDITAR ITEM DO PORTFÓLIO' : 'NOVO ITEM NO PORTFÓLIO'}
          </p>
          <button onClick={onClose} className="text-[#CBD5E1] hover:text-white" aria-label="Fechar"><X size={18} /></button>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="font-mono-mm text-[10px] font-semibold text-[#CBD5E1]">TÍTULO *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder='Ex: Clipe "Madrugada" — Artista' className="h-10 px-3 font-display text-sm outline-none focus:border-[#C9A84C]" style={inputStyle} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-mono-mm text-[10px] font-semibold text-[#CBD5E1]">DESCRIÇÃO</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Resumo do trabalho, cliente, ano..." className="p-3 font-display text-sm outline-none resize-y focus:border-[#C9A84C]" style={inputStyle} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-mono-mm text-[10px] font-semibold text-[#CBD5E1]">CATEGORIA</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="h-10 px-3 font-display text-sm outline-none focus:border-[#C9A84C]" style={inputStyle}>
                {CATEGORIES.filter(c => c !== 'TODOS').map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-mono-mm text-[10px] font-semibold text-[#CBD5E1]">TIPO</label>
              <div className="flex gap-2 h-10 items-center">
                <button type="button" onClick={() => setIsVideo(false)} className="flex items-center gap-1.5 h-8 px-3 font-mono-mm text-[10px] font-semibold rounded" style={{ background: !isVideo ? '#C9A84C' : 'transparent', color: !isVideo ? '#080808' : '#CBD5E1', border: '1px solid rgba(255,255,255,0.2)' }}>
                  <ImageIcon size={12} /> FOTO
                </button>
                <button type="button" onClick={() => setIsVideo(true)} className="flex items-center gap-1.5 h-8 px-3 font-mono-mm text-[10px] font-semibold rounded" style={{ background: isVideo ? '#C9A84C' : 'transparent', color: isVideo ? '#080808' : '#CBD5E1', border: '1px solid rgba(255,255,255,0.2)' }}>
                  <Video size={12} /> VÍDEO
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-mono-mm text-[10px] font-semibold text-[#CBD5E1]">IMAGEM (slot do site)</label>
            <select value={imageKey} onChange={e => setImageKey(e.target.value)} className="h-10 px-3 font-display text-sm outline-none focus:border-[#C9A84C]" style={inputStyle}>
              {SITE_IMAGE_SLOTS.filter(s => s.key.startsWith('portfolio')).map(s => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>
            <p className="font-mono-mm text-[10px] text-[#94A3B8]">Para enviar uma capa própria com upload, abra a página do item.</p>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-mono-mm text-[10px] font-semibold text-[#CBD5E1]">URL EXTERNA (opcional)</label>
            <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://... (sobrescreve o slot)" className="h-10 px-3 font-display text-sm outline-none focus:border-[#C9A84C]" style={inputStyle} />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={!title.trim()}
            className="flex-1 h-11 font-mono-mm text-[11px] tracking-[0.1em] font-semibold rounded-lg"
            style={{ background: '#C9A84C', color: '#080808', opacity: title.trim() ? 1 : 0.5 }}
          >
            {isEdit ? 'SALVAR ALTERAÇÕES' : 'ADICIONAR AO PORTFÓLIO'}
          </button>
          {!isEdit && (
            <button
              type="button"
              onClick={() => handleSave(true)}
              disabled={!title.trim()}
              className="flex-1 h-11 font-mono-mm text-[11px] tracking-[0.1em] font-semibold rounded-lg"
              style={{ background: 'transparent', color: '#E5C158', border: '1px solid rgba(201,168,76,0.5)', opacity: title.trim() ? 1 : 0.5 }}
            >
              CRIAR E ABRIR PÁGINA
            </button>
          )}
        </div>
      </div>
    </>
  )
}

export function AdminPortfolio() {
  const { state, dispatch } = useAdmin()
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<PortfolioItem | null>(null)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('TODOS')

  const items = useMemo(() => {
    const q = search.trim().toLowerCase()
    return [...(state.portfolio ?? [])]
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .filter(item => {
        if (categoryFilter !== 'TODOS' && item.category !== categoryFilter) return false
        if (!q) return true
        return (
          item.title.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          (item.description ?? '').toLowerCase().includes(q)
        )
      })
  }, [state.portfolio, search, categoryFilter])

  const moveItem = (id: string, dir: -1 | 1) => {
    const ordered = [...(state.portfolio ?? [])].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    const idx = ordered.findIndex(i => i.id === id)
    const other = ordered[idx + dir]
    if (idx === -1 || !other) return
    const current = ordered[idx]
    dispatch({ type: 'UPDATE_PORTFOLIO', payload: { ...current, sortOrder: other.sortOrder ?? 0 } })
    dispatch({ type: 'UPDATE_PORTFOLIO', payload: { ...other, sortOrder: current.sortOrder ?? 0 } })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-semibold text-2xl text-[#FFFFFF]">Portfólio do Site</h1>
          <p className="font-mono-mm text-xs tracking-[0.08em] mt-1 text-[#CBD5E1]">
            {state.portfolio.length} ITENS PUBLICADOS · APARECE NA SEÇÃO “TRABALHOS” DO SITE
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center justify-center gap-2 h-11 px-5 font-mono-mm text-xs tracking-[0.08em] font-semibold rounded-lg"
          style={{ background: '#C9A84C', color: '#080808' }}
        >
          <Plus size={16} />
          NOVO ITEM
        </button>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por título, categoria ou descrição..."
            className="w-full h-11 pl-10 pr-4 font-display text-sm outline-none focus:border-[#C9A84C]"
            style={inputStyle}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className="h-11 px-4 font-mono-mm text-[10px] tracking-[0.06em] font-semibold rounded-lg transition-all shrink-0"
              style={{
                background: categoryFilter === c ? 'rgba(201,168,76,0.2)' : '#111111',
                color: categoryFilter === c ? '#E5C158' : '#94A3B8',
                border: categoryFilter === c ? '1px solid rgba(201,168,76,0.5)' : '1px solid rgba(255,255,255,0.12)',
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {items.length === 0 ? (
        <p className="font-mono-mm text-xs py-12 text-center text-[#CBD5E1] bg-[#111111] border border-[rgba(255,255,255,0.12)] rounded-xl">
          Nenhum item encontrado. Clique em “Novo item”.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, idx) => (
            <div key={item.id} className="flex flex-col gap-3 p-4 bg-[#111111] border border-[rgba(255,255,255,0.14)] rounded-xl">
              <div
                className="relative w-full overflow-hidden rounded-lg bg-[#161616] cursor-pointer group"
                style={{ aspectRatio: '4/3' }}
                onClick={() => router.push(`/admin/portfolio/${item.id}`)}
              >
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.imageUrl} alt={item.title} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
                ) : (
                  <SiteImage imageKey={item.imageKey} alt={item.title} fill className="object-cover" sizes="320px" />
                )}
                <span className="absolute top-2 left-2 font-mono-mm text-[9px] px-2 py-0.5 rounded" style={{ background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(201,168,76,0.4)', color: '#E5C158' }}>
                  {item.category}
                </span>
                <span className="absolute top-2 right-2 font-mono-mm text-[9px] px-2 py-0.5 rounded font-bold" style={{ background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.25)', color: '#CBD5E1' }}>
                  #{idx + 1}
                </span>
                {item.isVideo && (
                  <span className="absolute bottom-2 right-2 font-mono-mm text-[9px] px-2 py-0.5 rounded bg-[#C9A84C] text-[#080808] font-bold">VÍDEO</span>
                )}
                <span className="absolute bottom-2 left-2 flex items-center gap-1 font-mono-mm text-[9px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'rgba(0,0,0,0.7)', color: '#E5C158', border: '1px solid rgba(201,168,76,0.4)' }}>
                  <ExternalLink size={10} /> ABRIR PÁGINA
                </span>
              </div>
              <div>
                <p className="font-display font-semibold text-sm text-white leading-snug">{item.title}</p>
                {item.description && (
                  <p className="font-display text-xs text-[#94A3B8] mt-1 truncate">{item.description}</p>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 font-mono-mm text-[10px] text-[#64748B]">
                  <ImagePlus size={12} />
                  {(item.images ?? []).length}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => moveItem(item.id, -1)}
                    disabled={idx === 0}
                    className="flex items-center justify-center h-9 w-9 rounded-lg bg-[#161616] border border-[rgba(255,255,255,0.16)] text-[#CBD5E1] hover:text-[#E5C158] disabled:opacity-30"
                    title="Mover para cima (ordem no site)"
                  >
                    <ChevronUp size={14} />
                  </button>
                  <button
                    onClick={() => moveItem(item.id, 1)}
                    disabled={idx === items.length - 1}
                    className="flex items-center justify-center h-9 w-9 rounded-lg bg-[#161616] border border-[rgba(255,255,255,0.16)] text-[#CBD5E1] hover:text-[#E5C158] disabled:opacity-30"
                    title="Mover para baixo (ordem no site)"
                  >
                    <ChevronDown size={14} />
                  </button>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(item)}
                  className="flex-1 flex items-center justify-center gap-2 h-9 font-mono-mm text-[11px] font-semibold rounded-lg bg-[#161616] border border-[rgba(255,255,255,0.16)] text-[#F3F4F6] hover:border-[#C9A84C] hover:text-[#E5C158]"
                >
                  <Edit3 size={13} /> EDITAR
                </button>
                <button
                  onClick={() => router.push(`/admin/portfolio/${item.id}`)}
                  className="flex items-center justify-center gap-2 h-9 px-3 font-mono-mm text-[11px] font-semibold rounded-lg bg-[#161616] border border-[rgba(255,255,255,0.16)] text-[#E5C158] hover:border-[#C9A84C]"
                  title="Abrir página do item"
                >
                  <ExternalLink size={13} />
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`Excluir "${item.title}" do portfólio?`)) {
                      dispatch({ type: 'DELETE_PORTFOLIO', id: item.id })
                    }
                  }}
                  className="flex items-center justify-center h-9 w-10 rounded-lg bg-[#161616] border border-[rgba(255,255,255,0.16)] text-[#CBD5E1] hover:border-[#F87171] hover:text-[#F87171]"
                  title="Excluir"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && <PortfolioForm onClose={() => setShowForm(false)} />}
      {editing && <PortfolioForm initial={editing} onClose={() => setEditing(null)} />}
    </div>
  )
}
