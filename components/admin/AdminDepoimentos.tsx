'use client'

import { useState } from 'react'
import { useAdmin } from '@/lib/admin-context'
import type { Testimonial } from '@/lib/data'
import { Plus, X, Trash2, Edit3 } from 'lucide-react'
import { SiteImage } from '@/components/site/SiteImage'

function TestimonialForm({
  initial,
  onClose,
}: {
  initial?: Testimonial | null
  onClose: () => void
}) {
  const { dispatch, state } = useAdmin()
  const [name, setName] = useState(initial?.name ?? '')
  const [niche, setNiche] = useState(initial?.niche ?? '')
  const [quote, setQuote] = useState(initial?.quote ?? '')
  const [instagram, setInstagram] = useState(initial?.instagram ?? '')

  const isEdit = !!initial
  const nextOrder = (state.testimonials ?? []).length + 1

  const handleSave = () => {
    if (!name.trim() || !quote.trim()) return
    const payload: Testimonial = initial
      ? { ...initial, name: name.trim(), niche: niche.trim(), quote: quote.trim(), instagram: instagram.trim() || undefined }
      : {
          id: `t-${Date.now()}`,
          name: name.trim(),
          niche: niche.trim() || 'CLIENTE',
          quote: quote.trim(),
          instagram: instagram.trim() || undefined,
          imageKey: 'avatar-bianca',
          sortOrder: nextOrder,
        }
    dispatch({ type: isEdit ? 'UPDATE_TESTIMONIAL' : 'ADD_TESTIMONIAL', payload } as any)
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
        style={{ width: 'min(600px, 95vw)', maxHeight: '90vh', transform: 'translate(-50%, -50%)', background: '#0F0F0F', border: '1px solid rgba(255,255,255,0.14)', borderRadius: '12px' }}
      >
        <div className="flex items-center justify-between">
          <p className="font-mono-mm text-[11px] tracking-[0.12em] font-semibold" style={{ color: '#E5C158' }}>
            {isEdit ? 'EDITAR DEPOIMENTO' : 'NOVO DEPOIMENTO'}
          </p>
          <button onClick={onClose} className="text-[#CBD5E1] hover:text-white" aria-label="Fechar"><X size={18} /></button>
        </div>

        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-mono-mm text-[10px] font-semibold text-[#CBD5E1]">NOME / EMPRESA *</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: SHOWTIME | Eventos" className="h-10 px-3 font-display text-sm outline-none" style={inputStyle} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-mono-mm text-[10px] font-semibold text-[#CBD5E1]">NICHO</label>
              <input value={niche} onChange={e => setNiche(e.target.value)} placeholder="Ex: EVENTOS" className="h-10 px-3 font-display text-sm outline-none" style={inputStyle} />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-mono-mm text-[10px] font-semibold text-[#CBD5E1]">INSTAGRAM (link)</label>
            <input value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="https://www.instagram.com/..." className="h-10 px-3 font-display text-sm outline-none" style={inputStyle} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-mono-mm text-[10px] font-semibold text-[#CBD5E1]">DEPOIMENTO *</label>
            <textarea value={quote} onChange={e => setQuote(e.target.value)} rows={6} placeholder="Cole o depoimento do cliente..." className="p-3 font-display text-sm outline-none resize-y" style={inputStyle} />
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={!name.trim() || !quote.trim()}
          className="h-11 font-mono-mm text-[11px] tracking-[0.1em] font-semibold rounded-lg"
          style={{ background: '#C9A84C', color: '#080808', opacity: name.trim() && quote.trim() ? 1 : 0.5 }}
        >
          {isEdit ? 'SALVAR ALTERAÇÕES' : 'ADICIONAR DEPOIMENTO'}
        </button>
      </div>
    </>
  )
}

export function AdminDepoimentos() {
  const { state, dispatch } = useAdmin()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Testimonial | null>(null)
  const items = [...(state.testimonials ?? [])].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-semibold text-2xl text-[#FFFFFF]">Depoimentos do Site</h1>
          <p className="font-mono-mm text-xs tracking-[0.08em] mt-1 text-[#CBD5E1]">
            {items.length} DEPOIMENTOS · SEÇÃO “QUEM FEZ, APROVOU” DO SITE
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center justify-center gap-2 h-11 px-5 font-mono-mm text-xs tracking-[0.08em] font-semibold rounded-lg"
          style={{ background: '#C9A84C', color: '#080808' }}
        >
          <Plus size={16} />
          NOVO DEPOIMENTO
        </button>
      </div>

      {items.length === 0 ? (
        <p className="font-mono-mm text-xs py-12 text-center text-[#CBD5E1] bg-[#111111] border border-[rgba(255,255,255,0.12)] rounded-xl">
          Nenhum depoimento. Clique em “Novo depoimento”.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map(item => (
            <div key={item.id} className="p-5 bg-[#111111] border border-[rgba(255,255,255,0.12)] rounded-xl flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0" style={{ border: '1px solid rgba(201,168,76,0.4)' }}>
                    <SiteImage imageKey={item.imageKey || 'avatar-bianca'} alt={item.name} fill className="object-cover" sizes="40px" />
                  </div>
                  <div>
                    <p className="font-display font-semibold text-sm text-white">{item.name}</p>
                    <p className="font-mono-mm text-[10px] tracking-[0.12em] text-[#E5C158]">{item.niche}</p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => setEditing(item)} className="p-2 text-[#CBD5E1] hover:text-[#E5C158]" title="Editar">
                    <Edit3 size={15} />
                  </button>
                  <button onClick={() => dispatch({ type: 'DELETE_TESTIMONIAL', id: item.id })} className="p-2 text-[#CBD5E1] hover:text-red-400" title="Excluir">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              <p className="font-body italic text-sm text-[#C8C8C0]" style={{ lineHeight: 1.7 }}>“{item.quote}”</p>
              {item.instagram && (
                <a href={item.instagram} target="_blank" rel="noreferrer" className="font-mono-mm text-[10px] text-[#5DADE2] hover:underline truncate">
                  {item.instagram}
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {showForm && <TestimonialForm onClose={() => setShowForm(false)} />}
      {editing && <TestimonialForm initial={editing} onClose={() => setEditing(null)} />}
    </div>
  )
}
