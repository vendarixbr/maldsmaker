'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd'
import { useAdmin } from '@/lib/admin-context'
import { MAX_TESTIMONIAL_IMAGE_BYTES, type Testimonial } from '@/lib/data'
import { TestimonialAvatar } from '@/components/site/TestimonialAvatar'
import { ConfirmDialog } from '@/components/admin/admin-ui'
import { ExternalLink, GripVertical, ImagePlus, Loader2, Pencil, Plus, Quote, Trash2, X } from 'lucide-react'

const QUOTE_MAX = 600
const fieldClass =
  'w-full px-3 font-display text-sm text-white outline-none rounded-md bg-[#161616] border border-white/15 focus:border-[#C9A84C] transition-colors'
const labelClass = 'font-mono-mm text-[10px] font-semibold tracking-[0.06em] text-[#CBD5E1]'

function keyFromUrl(url?: string): string | null {
  if (!url) return null
  const idx = url.indexOf('testimonials/')
  if (idx === -1) return null
  const key = url.slice(idx).split('?')[0]
  return key.includes('..') ? null : key
}

function deleteStoredPhotos(itemId: string, keys: string[]) {
  return Promise.all(
    keys.map(key =>
      fetch(`/api/admin/testimonial-images?itemId=${encodeURIComponent(itemId)}&key=${encodeURIComponent(key)}`, { method: 'DELETE' }).catch(() => undefined),
    ),
  )
}

async function uploadPhoto(itemId: string, file: File): Promise<{ url: string; key: string }> {
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

/** Aceita "@usuario", "usuario" ou o link completo e devolve sempre um link válido. */
function normalizeInstagram(raw: string): string | undefined {
  const value = raw.trim()
  if (!value) return undefined
  if (/^https?:\/\//i.test(value)) return value
  const handle = value.replace(/^@/, '').replace(/^(www\.)?instagram\.com\//i, '').replace(/\/+$/, '')
  return handle ? `https://www.instagram.com/${handle}` : undefined
}

/* ------------------------------------------------------------------ */
/* Editor                                                              */
/* ------------------------------------------------------------------ */

function TestimonialEditor({ initial, onClose }: { initial: Testimonial | null; onClose: () => void }) {
  const { state, dispatch } = useAdmin()
  const isNew = !initial
  const itemId = useRef(initial?.id ?? `t-${Date.now()}`)
  const uploadedKeys = useRef<string[]>([])

  const [name, setName] = useState(initial?.name ?? '')
  const [niche, setNiche] = useState(initial?.niche ?? '')
  const [quote, setQuote] = useState(initial?.quote ?? '')
  const [instagram, setInstagram] = useState(initial?.instagram ?? '')
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? '')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [confirmClose, setConfirmClose] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)

  const dirty =
    name !== (initial?.name ?? '') ||
    niche !== (initial?.niche ?? '') ||
    quote !== (initial?.quote ?? '') ||
    instagram !== (initial?.instagram ?? '') ||
    imageUrl !== (initial?.imageUrl ?? '')

  const canSave = name.trim() !== '' && quote.trim() !== '' && !uploading && !saving

  // Fotos enviadas mas nunca salvas ficam órfãs no bucket: limpa ao descartar.
  const discard = () => {
    if (uploadedKeys.current.length) void deleteStoredPhotos(itemId.current, uploadedKeys.current)
    onClose()
  }

  const requestClose = useCallback(() => {
    if (saving) return
    if (dirty) setConfirmClose(true)
    else discard()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dirty, saving])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !confirmClose) requestClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [requestClose, confirmClose])

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setError('')
    setUploading(true)
    try {
      const { url, key } = await uploadPhoto(itemId.current, file)
      uploadedKeys.current.push(key)
      setImageUrl(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao enviar a foto.')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    if (!canSave) return
    setSaving(true)
    setError('')
    const base = initial ?? {
      id: itemId.current,
      imageKey: '',
      sortOrder: Math.max(0, ...state.testimonials.map(t => t.sortOrder ?? 0)) + 1,
    }
    const payload: Testimonial = {
      ...base,
      name: name.trim(),
      niche: niche.trim().toUpperCase() || 'CLIENTE',
      quote: quote.trim(),
      instagram: normalizeInstagram(instagram),
      imageUrl: imageUrl || undefined,
    }
    const ok = await dispatch({ type: isNew ? 'ADD_TESTIMONIAL' : 'UPDATE_TESTIMONIAL', payload })
    if (!ok) {
      setSaving(false)
      setError('Não foi possível salvar. Tente novamente.')
      return
    }
    // Só depois de salvar: apaga a foto antiga (se trocada/removida) e as enviadas e descartadas no meio do caminho.
    const stale = [
      keyFromUrl(initial?.imageUrl) && initial?.imageUrl !== imageUrl ? keyFromUrl(initial?.imageUrl) : null,
      ...uploadedKeys.current.filter(k => k !== keyFromUrl(imageUrl)),
    ].filter((k): k is string => Boolean(k))
    if (stale.length) void deleteStoredPhotos(itemId.current, Array.from(new Set(stale)))
    onClose()
  }

  const preview = useMemo(() => ({ name: name.trim() || 'Nome do cliente', niche: niche.trim().toUpperCase() || 'NICHO', quote: quote.trim() }), [name, niche, quote])

  return (
    <>
      <div className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.75)' }} onClick={requestClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={isNew ? 'Novo depoimento' : 'Editar depoimento'}
        className="fixed top-1/2 left-1/2 z-50 flex flex-col overflow-hidden"
        style={{ width: 'min(680px, 95vw)', maxHeight: '92vh', transform: 'translate(-50%, -50%)', background: '#0F0F0F', border: '1px solid rgba(255,255,255,0.14)', borderRadius: '12px' }}
      >
        <div className="flex items-center justify-between px-6 h-14 shrink-0 border-b border-white/10">
          <p className="font-mono-mm text-[11px] tracking-[0.12em] font-semibold text-[#E5C158]">
            {isNew ? 'NOVO DEPOIMENTO' : 'EDITAR DEPOIMENTO'}
          </p>
          <button onClick={requestClose} aria-label="Fechar" className="text-[#CBD5E1] hover:text-white"><X size={18} /></button>
        </div>

        <div className="flex flex-col gap-5 p-6 overflow-y-auto">
          {/* Foto */}
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0 border border-[rgba(201,168,76,0.4)]">
              <TestimonialAvatar imageUrl={imageUrl || undefined} imageKey={imageUrl ? undefined : initial?.imageKey} name={name || '?'} sizePx={64} />
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                  <Loader2 size={18} className="animate-spin text-[#E5C158]" />
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1.5 min-w-0">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInput.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-1.5 h-9 px-3 font-mono-mm text-[10px] font-semibold rounded-lg text-[#F3F4F6] bg-[#161616] border border-white/15 disabled:opacity-50"
                >
                  <ImagePlus size={13} /> {imageUrl ? 'TROCAR FOTO' : 'ENVIAR FOTO'}
                </button>
                {imageUrl && (
                  <button type="button" onClick={() => setImageUrl('')} className="font-mono-mm text-[10px] text-[#F87171] hover:underline">
                    Remover
                  </button>
                )}
              </div>
              <p className="font-mono-mm text-[10px] text-[#64748B]">JPG, PNG ou WebP até 4MB. Sem foto, usamos as iniciais.</p>
            </div>
            <input ref={fileInput} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="t-name" className={labelClass}>NOME OU EMPRESA *</label>
              <input id="t-name" autoFocus={isNew} value={name} onChange={e => setName(e.target.value)} maxLength={80} placeholder="Ex: SHOWTIME Eventos" className={`${fieldClass} h-10`} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="t-niche" className={labelClass}>NICHO</label>
              <input id="t-niche" value={niche} onChange={e => setNiche(e.target.value)} maxLength={40} placeholder="Ex: EVENTOS" className={`${fieldClass} h-10`} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="t-ig" className={labelClass}>INSTAGRAM</label>
            <input id="t-ig" value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="@usuario ou link do perfil" className={`${fieldClass} h-10`} />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="t-quote" className={labelClass}>DEPOIMENTO *</label>
              <span className="font-mono-mm text-[10px]" style={{ color: quote.length > QUOTE_MAX * 0.9 ? '#FACC15' : '#64748B' }}>
                {quote.length}/{QUOTE_MAX}
              </span>
            </div>
            <textarea
              id="t-quote"
              value={quote}
              onChange={e => setQuote(e.target.value.slice(0, QUOTE_MAX))}
              rows={5}
              placeholder="O que o cliente disse sobre o trabalho."
              className={`${fieldClass} p-3 resize-y`}
            />
          </div>

          {/* Prévia fiel ao que aparece no site */}
          <div className="flex flex-col gap-2">
            <span className={labelClass}>PRÉVIA NO SITE</span>
            <div className="p-5 rounded-lg" style={{ background: '#111111', border: '1px solid rgba(245,245,240,0.07)' }}>
              <p className="font-body italic text-sm line-clamp-4" style={{ color: preview.quote ? '#C8C8C0' : '#5A5A52', lineHeight: 1.7 }}>
                {preview.quote || 'O depoimento aparece aqui.'}
              </p>
              <div className="flex items-center gap-3 mt-4">
                <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0 border border-[rgba(201,168,76,0.4)]">
                  <TestimonialAvatar imageUrl={imageUrl || undefined} imageKey={imageUrl ? undefined : initial?.imageKey} name={preview.name} sizePx={36} />
                </div>
                <div className="min-w-0">
                  <p className="font-display uppercase text-xs truncate text-[#F5F5F0]" style={{ letterSpacing: '0.06em' }}>{preview.name}</p>
                  <p className="font-mono-mm text-[10px] tracking-[0.14em] text-[#C9A84C]">{preview.niche}</p>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <p role="alert" className="px-4 py-3 rounded-lg font-mono-mm text-xs text-[#F87171] bg-[rgba(248,113,113,0.1)] border border-[rgba(248,113,113,0.4)]">
              {error}
            </p>
          )}
        </div>

        <div className="flex gap-3 px-6 py-4 shrink-0 border-t border-white/10">
          <button onClick={requestClose} className="h-11 px-5 font-mono-mm text-[11px] font-semibold rounded-lg text-[#CBD5E1] border border-white/20">
            CANCELAR
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="flex-1 h-11 flex items-center justify-center gap-2 font-mono-mm text-[11px] tracking-[0.1em] font-semibold rounded-lg disabled:opacity-40"
            style={{ background: '#C9A84C', color: '#080808' }}
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {isNew ? 'ADICIONAR DEPOIMENTO' : 'SALVAR ALTERAÇÕES'}
          </button>
        </div>
      </div>

      {confirmClose && (
        <ConfirmDialog message="Descartar as alterações deste depoimento?" onConfirm={discard} onCancel={() => setConfirmClose(false)} />
      )}
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Lista                                                               */
/* ------------------------------------------------------------------ */

export function AdminDepoimentos() {
  const { state, dispatch } = useAdmin()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [toDelete, setToDelete] = useState<Testimonial | null>(null)

  const items = useMemo(
    () => [...state.testimonials].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    [state.testimonials],
  )

  // O editor vive na URL: ?section=depoimentos&edit=novo | &edit=<id>
  const editParam = searchParams.get('edit')
  const editing = editParam && editParam !== 'novo' ? items.find(t => t.id === editParam) ?? null : null
  const editorOpen = editParam === 'novo' || Boolean(editing)

  const setEdit = useCallback(
    (value: string | null) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) params.set('edit', value)
      else params.delete('edit')
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [router, pathname, searchParams],
  )

  const closeEditor = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('edit')
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }, [router, pathname, searchParams])

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || result.destination.index === result.source.index) return
    const ids = items.map(t => t.id)
    const [moved] = ids.splice(result.source.index, 1)
    ids.splice(result.destination.index, 0, moved)
    void dispatch({ type: 'REORDER_TESTIMONIALS', ids })
  }

  const confirmDelete = async () => {
    const item = toDelete
    setToDelete(null)
    if (!item) return
    const ok = await dispatch({ type: 'DELETE_TESTIMONIAL', id: item.id })
    const key = keyFromUrl(item.imageUrl)
    if (ok && key) void deleteStoredPhotos(item.id, [key])
  }

  return (
    <div className="flex flex-col gap-5 max-w-4xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-semibold text-2xl sm:text-3xl text-white">Depoimentos</h1>
          <p className="font-mono-mm text-xs tracking-[0.06em] mt-1 text-[#94A3B8]">
            {items.length} {items.length === 1 ? 'DEPOIMENTO' : 'DEPOIMENTOS'} · SEÇÃO “QUEM FEZ, APROVOU”
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <a
            href="/#depoimentos"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex items-center gap-2 h-11 px-4 font-mono-mm text-[11px] font-semibold rounded-lg text-[#CBD5E1] bg-[#161616] border border-white/15 hover:text-[#E5C158]"
          >
            <ExternalLink size={13} /> VER NO SITE
          </a>
          <button
            onClick={() => setEdit('novo')}
            className="flex items-center gap-2 h-11 px-5 font-mono-mm text-xs tracking-[0.08em] font-semibold rounded-lg"
            style={{ background: '#C9A84C', color: '#080808' }}
          >
            <Plus size={16} />
            <span className="hidden sm:inline">NOVO DEPOIMENTO</span>
            <span className="sm:hidden">NOVO</span>
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="py-16 px-4 text-center bg-[#111111] border border-white/10 rounded-2xl flex flex-col items-center gap-3">
          <Quote size={26} className="text-[#C9A84C]" />
          <p className="font-display font-semibold text-lg text-white">Nenhum depoimento</p>
          <p className="font-mono-mm text-xs text-[#94A3B8] max-w-sm">Sem depoimentos, a seção fica oculta no site.</p>
          <button onClick={() => setEdit('novo')} className="flex items-center gap-2 h-10 px-5 font-mono-mm text-xs font-semibold rounded-lg" style={{ background: '#C9A84C', color: '#080808' }}>
            <Plus size={15} /> ADICIONAR O PRIMEIRO
          </button>
        </div>
      ) : (
        <>
          {items.length > 1 && <p className="font-mono-mm text-[11px] text-[#64748B]">Arraste pelo ícone para mudar a ordem no site.</p>}
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="testimonials">
              {provided => (
                <ul ref={provided.innerRef} {...provided.droppableProps} className="flex flex-col gap-3 list-none p-0 m-0">
                  {items.map((item, idx) => (
                    <Draggable key={item.id} draggableId={item.id} index={idx}>
                      {(drag, snap) => (
                        <li
                          ref={drag.innerRef}
                          {...drag.draggableProps}
                          className="flex items-start gap-3 p-4 rounded-xl border"
                          style={{
                            ...drag.draggableProps.style,
                            background: snap.isDragging ? '#1A1A1A' : '#111111',
                            borderColor: snap.isDragging ? 'rgba(201,168,76,0.5)' : 'rgba(255,255,255,0.12)',
                          }}
                        >
                          <button
                            {...drag.dragHandleProps}
                            aria-label="Arrastar para reordenar"
                            className="mt-1 w-6 shrink-0 flex justify-center text-[#64748B] hover:text-[#E5C158] cursor-grab active:cursor-grabbing"
                          >
                            <GripVertical size={16} />
                          </button>
                          <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 border border-[rgba(201,168,76,0.4)]">
                            <TestimonialAvatar imageUrl={item.imageUrl} imageKey={item.imageKey} name={item.name} sizePx={44} />
                          </div>
                          <button onClick={() => setEdit(item.id)} className="flex-1 min-w-0 text-left">
                            <p className="font-display font-semibold text-sm text-white truncate">{item.name}</p>
                            <p className="font-mono-mm text-[10px] tracking-[0.12em] text-[#E5C158]">{item.niche}</p>
                            <p className="font-body italic text-sm text-[#C8C8C0] mt-2 line-clamp-3" style={{ lineHeight: 1.6 }}>“{item.quote}”</p>
                          </button>
                          <div className="flex items-center gap-1 shrink-0">
                            {item.instagram && (
                              <a href={item.instagram} target="_blank" rel="noreferrer" title="Abrir Instagram" aria-label="Abrir Instagram" className="h-8 w-8 hidden sm:flex items-center justify-center rounded-lg text-[#94A3B8] hover:text-[#5DADE2]">
                                <ExternalLink size={14} />
                              </a>
                            )}
                            <button onClick={() => setEdit(item.id)} title="Editar" aria-label="Editar" className="h-8 w-8 flex items-center justify-center rounded-lg text-[#CBD5E1] hover:text-[#E5C158]">
                              <Pencil size={14} />
                            </button>
                            <button onClick={() => setToDelete(item)} title="Excluir" aria-label="Excluir" className="h-8 w-8 flex items-center justify-center rounded-lg text-[#CBD5E1] hover:text-[#F87171]">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </li>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </DragDropContext>
        </>
      )}

      {editorOpen && <TestimonialEditor key={editParam} initial={editing} onClose={closeEditor} />}

      {toDelete && (
        <ConfirmDialog
          message={`Excluir o depoimento de "${toDelete.name}"? Esta ação não pode ser desfeita.`}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  )
}
