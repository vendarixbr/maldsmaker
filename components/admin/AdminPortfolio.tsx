'use client'

import { useState } from 'react'
import { useAdmin } from '@/lib/admin-context'
import type { PortfolioItem } from '@/lib/data'
import { Plus, X, Trash2, Edit3, Video, Image as ImageIcon } from 'lucide-react'
import { SiteImage } from '@/components/site/SiteImage'
import { SITE_IMAGE_SLOTS } from '@/lib/site-images'

const CATEGORIES = ['TODOS', 'MÚSICA', 'EMPRESAS', 'EVENTOS', 'ENSAIOS', 'CLIPES', 'INSTITUCIONAL', 'AO VIVO']

function PortfolioForm({
  initial,
  onClose,
}: {
  initial?: PortfolioItem | null
  onClose: () => void
}) {
  const { dispatch, state } = useAdmin()
  const [title, setTitle] = useState(initial?.title ?? '')
  const [category, setCategory] = useState(initial?.category ?? 'MÚSICA')
  const [imageKey, setImageKey] = useState(initial?.imageKey ?? SITE_IMAGE_SLOTS[8]?.key ?? '')
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? '')
  const [isVideo, setIsVideo] = useState(initial?.isVideo ?? false)

  const isEdit = !!initial
  const nextOrder = (state.portfolio ?? []).length + 1

  const handleSave = () => {
    if (!title.trim()) return
    const payload: PortfolioItem = initial
      ? { ...initial, title: title.trim(), category, imageKey, imageUrl: imageUrl.trim() || undefined, isVideo }
      : {
          id: `pf-${Date.now()}`,
          title: title.trim(),
          category,
          imageKey,
          imageUrl: imageUrl.trim() || undefined,
          isVideo,
          sortOrder: nextOrder,
        }
    dispatch({ type: isEdit ? 'UPDATE_PORTFOLIO' : 'ADD_PORTFOLIO', payload } as any)
    onClose()
  }

  const inputStyle = {
    background: '#161616',
    border: '1px solid rgba(255,255,255,0.16)',
    borderRadius: '6px',
    color: '#F9FAFB',
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
            {isEdit ? 'EDITAR PROJETO DO PORTFÓLIO' : 'NOVO PROJETO NO PORTFÓLIO'}
          </p>
          <button onClick={onClose} className="text-[#CBD5E1] hover:text-white" aria-label="Fechar"><X size={18} /></button>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="font-mono-mm text-[10px] font-semibold text-[#CBD5E1]">TÍTULO *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder='Ex: Clipe "Madrugada" — Artista' className="h-10 px-3 font-display text-sm outline-none" style={inputStyle} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-mono-mm text-[10px] font-semibold text-[#CBD5E1]">CATEGORIA</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="h-10 px-3 font-display text-sm outline-none" style={inputStyle}>
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
            <select value={imageKey} onChange={e => setImageKey(e.target.value)} className="h-10 px-3 font-display text-sm outline-none" style={inputStyle}>
              {SITE_IMAGE_SLOTS.filter(s => s.key.startsWith('portfolio')).map(s => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>
            <p className="font-mono-mm text-[10px] text-[#94A3B8]">Para trocar a foto em si, use a aba “Imagens do Site”.</p>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-mono-mm text-[10px] font-semibold text-[#CBD5E1]">URL EXTERNA (opcional)</label>
            <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://... (sobrescreve o slot)" className="h-10 px-3 font-display text-sm outline-none" style={inputStyle} />
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={!title.trim()}
          className="h-11 font-mono-mm text-[11px] tracking-[0.1em] font-semibold rounded-lg"
          style={{ background: '#C9A84C', color: '#080808', opacity: title.trim() ? 1 : 0.5 }}
        >
          {isEdit ? 'SALVAR ALTERAÇÕES' : 'ADICIONAR AO PORTFÓLIO'}
        </button>
      </div>
    </>
  )
}

export function AdminPortfolio() {
  const { state, dispatch } = useAdmin()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<PortfolioItem | null>(null)
  const items = [...(state.portfolio ?? [])].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-semibold text-2xl text-[#FFFFFF]">Portfólio do Site</h1>
          <p className="font-mono-mm text-xs tracking-[0.08em] mt-1 text-[#CBD5E1]">
            {items.length} ITENS PUBLICADOS · APARECE NA SEÇÃO “TRABALHOS” DO SITE
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center justify-center gap-2 h-11 px-5 font-mono-mm text-xs tracking-[0.08em] font-semibold rounded-lg"
          style={{ background: '#C9A84C', color: '#080808' }}
        >
          <Plus size={16} />
          NOVO PROJETO
        </button>
      </div>

      {items.length === 0 ? (
        <p className="font-mono-mm text-xs py-12 text-center text-[#CBD5E1] bg-[#111111] border border-[rgba(255,255,255,0.12)] rounded-xl">
          Nenhum item no portfólio. Clique em “Novo projeto”.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => (
            <div key={item.id} className="flex flex-col gap-3 p-4 bg-[#111111] border border-[rgba(255,255,255,0.14)] rounded-xl">
              <div className="relative w-full overflow-hidden rounded-lg bg-[#161616]" style={{ aspectRatio: '4/3' }}>
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.imageUrl} alt={item.title} className="absolute inset-0 h-full w-full object-cover" />
                ) : (
                  <SiteImage imageKey={item.imageKey} alt={item.title} fill className="object-cover" sizes="320px" />
                )}
                <span className="absolute top-2 left-2 font-mono-mm text-[9px] px-2 py-0.5 rounded" style={{ background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(201,168,76,0.4)', color: '#E5C158' }}>
                  {item.category}
                </span>
                {item.isVideo && (
                  <span className="absolute bottom-2 right-2 font-mono-mm text-[9px] px-2 py-0.5 rounded bg-[#C9A84C] text-[#080808] font-bold">VÍDEO</span>
                )}
              </div>
              <p className="font-display font-semibold text-sm text-white leading-snug">{item.title}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(item)}
                  className="flex-1 flex items-center justify-center gap-2 h-9 font-mono-mm text-[11px] font-semibold rounded-lg bg-[#161616] border border-[rgba(255,255,255,0.16)] text-[#F3F4F6] hover:border-[#C9A84C] hover:text-[#E5C158]"
                >
                  <Edit3 size={13} /> EDITAR
                </button>
                <button
                  onClick={() => dispatch({ type: 'DELETE_PORTFOLIO', id: item.id })}
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
