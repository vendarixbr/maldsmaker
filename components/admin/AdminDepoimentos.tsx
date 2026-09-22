'use client'

import { useRef, useState } from 'react'
import { useAdmin } from '@/lib/admin-context'
import type { Testimonial } from '@/lib/data'
import { MAX_TESTIMONIAL_IMAGE_BYTES } from '@/lib/data'
import { Plus, X, Trash2, Edit3, Loader2, ImagePlus } from 'lucide-react'
import { TestimonialAvatar } from '@/components/site/TestimonialAvatar'

const inputStyle = {
  background: '#161616',
  border: '1px solid rgba(255,255,255,0.16)',
  borderRadius: '6px',
  color: '#F9FAFB',
} as const

async function uploadTestimonialImage(itemId: string, file: File): Promise<{ url: string; key: string }> {
  if (!file.type.startsWith('image/')) throw new Error('Envie um arquivo de imagem.')
  if (file.size > MAX_TESTIMONIAL_IMAGE_BYTES) throw new Error('A foto deve ter até 4MB.')
  const formData = new FormData()
  formData.append('itemId', itemId)
  formData.append('file', file)
  const response = await fetch('/api/admin/testimonial-images', { method: 'POST', body: formData })
  const payload = await response.json()
  if (!response.ok) throw new Error(payload.error || 'Falha ao enviar a foto.')
  return payload
}

function keyFromUrl(url: string): string | null {
  const marker = 'testimonials/'
  const idx = url.indexOf(marker)
  if (idx === -1) return null
  const key = url.slice(idx).split('?')[0]
  if (!key.startsWith(marker) || key.includes('..')) return null
  return key
}

function TestimonialForm({
  initial,
  onClose,
}: {
  initial?: Testimonial | null
  onClose: () => void
}) {
  const { dispatch, state } = useAdmin()
  const tempId = useRef(initial?.id || `t-${Date.now()}`)
  const [name, setName] = useState(initial?.name ?? '')
  const [niche, setNiche] = useState(initial?.niche ?? '')
  const [quote, setQuote] = useState(initial?.quote ?? '')
  const [instagram, setInstagram] = useState(initial?.instagram ?? '')
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? '')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isEdit = !!initial
  const nextOrder = (state.testimonials ?? []).length + 1

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploadError('')
    setUploading(true)
    try {
      const res = await uploadTestimonialImage(tempId.current, file)
      setImageUrl(res.url)
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Falha ao enviar a foto.')
    } finally {
      setUploading(false)
    }
  }

  const handleRemovePhoto = () => {
    setImageUrl('')
  }

  const handleSave = () => {
    if (!name.trim() || !quote.trim()) return
    const payload: Testimonial = initial
      ? { ...initial, name: name.trim(), niche: niche.trim(), quote: quote.trim(), instagram: instagram.trim() || undefined, imageUrl: imageUrl.trim() || undefined }
      : {
          id: tempId.current,
          name: name.trim(),
          niche: niche.trim() || 'CLIENTE',
          quote: quote.trim(),
          instagram: instagram.trim() || undefined,
          imageKey: '',
          imageUrl: imageUrl.trim() || undefined,
          sortOrder: nextOrder,
        }
    dispatch({ type: isEdit ? 'UPDATE_TESTIMONIAL' : 'ADD_TESTIMONIAL', payload })
    onClose()
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

        <div className="flex flex-col gap-4">
          {/* Foto */}
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0" style={{ border: '1px solid rgba(201,168,76,0.4)' }}>
              <TestimonialAvatar imageUrl={imageUrl} name={name || '?'} sizePx={64} />
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }}>
                  <Loader2 size={18} className="animate-spin text-[#E5C158]" />
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-1.5 h-9 px-3 font-mono-mm text-[10px] font-semibold rounded-lg text-[#F3F4F6] disabled:opacity-50"
                  style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.16)' }}
                >
                  <ImagePlus size={13} />
                  {imageUrl ? 'TROCAR FOTO' : 'ENVIAR FOTO'}
                </button>
                {imageUrl && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="font-mono-mm text-[10px] text-red-400 hover:text-red-300"
                  >
                    Remover
                  </button>
                )}
              </div>
              <p className="font-mono-mm text-[9px] text-[#64748B]">JPG, PNG ou WebP · até 4MB. Sem foto, mostramos as iniciais do nome.</p>
              {uploadError && <p className="font-mono-mm text-[10px] text-red-400">{uploadError}</p>}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          </div>

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
          disabled={!name.trim() || !quote.trim() || uploading}
          className="h-11 font-mono-mm text-[11px] tracking-[0.1em] font-semibold rounded-lg"
          style={{ background: '#C9A84C', color: '#080808', opacity: name.trim() && quote.trim() && !uploading ? 1 : 0.5 }}
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

  const handleDelete = (item: Testimonial) => {
    if (!window.confirm(`Excluir o depoimento de "${item.name}"?`)) return
    dispatch({ type: 'DELETE_TESTIMONIAL', id: item.id })
    if (item.imageUrl) {
      const key = keyFromUrl(item.imageUrl)
      if (key) {
        void fetch(`/api/admin/testimonial-images?itemId=${encodeURIComponent(item.id)}&key=${encodeURIComponent(key)}`, { method: 'DELETE' }).catch(() => undefined)
      }
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-semibold text-2xl text-[#FFFFFF]">Depoimentos do Site</h1>
          <p className="font-mono-mm text-xs tracking-[0.08em] mt-1 text-[#CBD5E1]">
            {items.length} DEPOIMENTOS · SEÇÃO "QUEM FEZ, APROVOU" DO SITE
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
          Nenhum depoimento. Clique em "Novo depoimento".
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map(item => (
            <div key={item.id} className="p-5 bg-[#111111] border border-[rgba(255,255,255,0.12)] rounded-xl flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0" style={{ border: '1px solid rgba(201,168,76,0.4)' }}>
                    <TestimonialAvatar imageUrl={item.imageUrl} imageKey={item.imageKey} name={item.name} sizePx={40} />
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
                  <button onClick={() => handleDelete(item)} className="p-2 text-[#CBD5E1] hover:text-red-400" title="Excluir">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              <p className="font-body italic text-sm text-[#C8C8C0]" style={{ lineHeight: 1.7 }}>"{item.quote}"</p>
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
