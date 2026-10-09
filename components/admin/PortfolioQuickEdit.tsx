'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useAdmin } from '@/lib/admin-context'
import { MAX_PORTFOLIO_IMAGE_BYTES, type PortfolioItem } from '@/lib/data'
import { SiteImage } from '@/components/site/SiteImage'
import { ConfirmDialog } from '@/components/admin/admin-ui'
import { SITE_IMAGE_SLOTS } from '@/lib/site-images'
import { slugify, uniqueSlug } from '@/lib/slug'
import { ExternalLink, Image as ImageIcon, ImagePlus, Loader2, Star, Trash2, Upload, Video, X } from 'lucide-react'

const DEFAULT_CATEGORIES = ['MÚSICA', 'CLIPES', 'INSTITUCIONAL', 'EVENTOS', 'ENSAIOS', 'EMPRESAS', 'AO VIVO', 'MODA', 'PUBLICIDADE']
const DEFAULT_IMAGE_KEY = SITE_IMAGE_SLOTS.find(s => s.key.startsWith('portfolio'))?.key ?? 'portfolio-territorio-mc-vitao'

const fieldClass =
  'w-full px-3 font-display text-sm text-white outline-none rounded-md bg-[#161616] border border-white/15 focus:border-[#C9A84C] transition-colors'
const labelClass = 'font-mono-mm text-[10px] font-semibold tracking-[0.06em] text-[#CBD5E1]'

function keyFromUrl(url?: string): string | null {
  if (!url) return null
  const idx = url.indexOf('portfolio/')
  if (idx === -1) return null
  const key = url.slice(idx).split('?')[0]
  return key.includes('..') ? null : key
}

function deleteStoredImages(itemId: string, keys: string[]) {
  return Promise.all(
    keys.map(key =>
      fetch(`/api/admin/portfolio-images?itemId=${encodeURIComponent(itemId)}&key=${encodeURIComponent(key)}`, { method: 'DELETE' }).catch(() => undefined),
    ),
  )
}

async function uploadCover(itemId: string, file: File): Promise<{ url: string; key: string }> {
  if (!file.type.startsWith('image/')) throw new Error('Envie um arquivo de imagem.')
  if (file.size > MAX_PORTFOLIO_IMAGE_BYTES) throw new Error('A imagem deve ter até 8MB.')
  const formData = new FormData()
  formData.append('itemId', itemId)
  formData.append('file', file)
  const response = await fetch('/api/admin/portfolio-images', { method: 'POST', body: formData })
  const payload = await response.json()
  if (!response.ok) throw new Error(payload.error || 'Falha ao enviar imagem.')
  return payload
}

function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className="w-11 h-6 rounded-full relative shrink-0 transition-colors"
      style={{ background: on ? '#C9A84C' : 'rgba(255,255,255,0.15)' }}
    >
      <span className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform" style={{ transform: on ? 'translateX(20px)' : 'translateX(0)' }} />
    </button>
  )
}

/**
 * Edição rápida do portfólio sem sair da lista. `initial === null` cria um projeto novo.
 * Galeria de fotos continua na página completa.
 */
export function PortfolioQuickEdit({ initial, onClose }: { initial: PortfolioItem | null; onClose: () => void }) {
  const { state, dispatch } = useAdmin()
  const isNew = !initial
  const itemId = useRef(initial?.id ?? `pf-${Date.now()}`)
  const uploadedKeys = useRef<string[]>([])

  const [draft, setDraft] = useState<PortfolioItem>(
    () =>
      initial ?? {
        id: itemId.current,
        title: '',
        slug: '',
        category: 'CLIPES',
        imageKey: DEFAULT_IMAGE_KEY,
        isVideo: false,
        featured: false,
        sortOrder: Math.max(0, ...state.portfolio.map(p => p.sortOrder ?? 0)) + 1,
        description: '',
        images: [],
      },
  )
  const [slugTouched, setSlugTouched] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [confirmClose, setConfirmClose] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)

  const original = useRef(JSON.stringify(draft)).current
  const dirty = JSON.stringify(draft) !== original
  const canSave = draft.title.trim() !== '' && !uploading && !saving && (dirty || isNew)

  const categories = useMemo(() => {
    const set = new Set(DEFAULT_CATEGORIES)
    state.portfolio.forEach(p => set.add(p.category))
    return Array.from(set)
  }, [state.portfolio])

  const patch = (p: Partial<PortfolioItem>) => setDraft(d => ({ ...d, ...p }))
  const setTitle = (title: string) => patch(slugTouched || !isNew ? { title } : { title, slug: slugify(title) })

  const discard = () => {
    // Capas enviadas e nunca salvas ficam órfãs no bucket.
    if (uploadedKeys.current.length) void deleteStoredImages(itemId.current, uploadedKeys.current)
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

  const handleCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setError('')
    setUploading(true)
    try {
      const { url, key } = await uploadCover(itemId.current, file)
      uploadedKeys.current.push(key)
      patch({ imageUrl: url })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha no upload.')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    if (!canSave) return
    setSaving(true)
    setError('')
    const siblings = state.portfolio.filter(p => p.id !== draft.id).map(p => p.slug)
    const payload: PortfolioItem = {
      ...draft,
      title: draft.title.trim(),
      category: draft.category.trim().toUpperCase() || 'CLIPES',
      slug: uniqueSlug(draft.slug?.trim() || draft.title, siblings),
    }
    const ok = await dispatch({ type: isNew ? 'ADD_PORTFOLIO' : 'UPDATE_PORTFOLIO', payload })
    if (!ok) {
      setSaving(false)
      setError('Não foi possível salvar. Tente novamente.')
      return
    }
    // Só agora limpa o storage: capa antiga trocada/removida (se não está na galeria) e uploads descartados.
    const oldCover = initial?.imageUrl
    const keepKey = keyFromUrl(payload.imageUrl)
    const stale = [
      oldCover && oldCover !== payload.imageUrl && !(initial?.images ?? []).some(i => i.url === oldCover) ? keyFromUrl(oldCover) : null,
      ...uploadedKeys.current.filter(k => k !== keepKey),
    ].filter((k): k is string => Boolean(k))
    if (stale.length) void deleteStoredImages(payload.id, Array.from(new Set(stale)))
    onClose()
  }

  return (
    <>
      <div className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.75)' }} onClick={requestClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={isNew ? 'Novo projeto' : 'Editar projeto'}
        className="fixed top-1/2 left-1/2 z-50 flex flex-col overflow-hidden"
        style={{ width: 'min(720px, 95vw)', maxHeight: '92vh', transform: 'translate(-50%, -50%)', background: '#0F0F0F', border: '1px solid rgba(255,255,255,0.14)', borderRadius: '12px' }}
      >
        <div className="flex items-center justify-between px-6 h-14 shrink-0 border-b border-white/10">
          <p className="font-mono-mm text-[11px] tracking-[0.12em] font-semibold text-[#E5C158]">{isNew ? 'NOVO PROJETO' : 'EDITAR PROJETO'}</p>
          <button onClick={requestClose} aria-label="Fechar" className="text-[#CBD5E1] hover:text-white"><X size={18} /></button>
        </div>

        <div className="flex flex-col gap-5 p-6 overflow-y-auto">
          {/* Capa */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative w-full sm:w-56 shrink-0 overflow-hidden rounded-lg bg-[#161616]" style={{ aspectRatio: '16/10' }}>
              {draft.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={draft.imageUrl} alt="Capa" className="absolute inset-0 h-full w-full object-cover" />
              ) : isNew ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-[#64748B]">
                  <ImagePlus size={22} />
                  <p className="font-display text-xs">Sem capa</p>
                </div>
              ) : (
                <SiteImage imageKey={draft.imageKey} alt="Capa padrão" fill className="object-cover opacity-70" sizes="224px" />
              )}
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60"><Loader2 size={22} className="animate-spin text-[#E5C158]" /></div>
              )}
            </div>
            <div className="flex flex-col justify-center gap-2">
              <input ref={fileInput} type="file" accept="image/*" className="hidden" onChange={handleCover} />
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInput.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2 h-10 px-4 font-mono-mm text-[11px] font-semibold rounded-lg text-[#F3F4F6] bg-[#161616] border border-white/15 disabled:opacity-50"
                >
                  <Upload size={14} /> {draft.imageUrl ? 'TROCAR CAPA' : 'ENVIAR CAPA'}
                </button>
                {draft.imageUrl && (
                  <button type="button" onClick={() => patch({ imageUrl: undefined })} aria-label="Remover capa" className="h-10 w-10 flex items-center justify-center rounded-lg text-[#F87171] bg-[#161616] border border-white/15 hover:border-[#F87171]">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <p className="font-mono-mm text-[10px] text-[#64748B]">JPG, PNG ou WebP até 8MB.</p>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="q-title" className={labelClass}>TÍTULO *</label>
            <input id="q-title" autoFocus={isNew} value={draft.title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Clipe Território — MC Vitão" className={`${fieldClass} h-11 font-semibold`} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="q-cat" className={labelClass}>CATEGORIA</label>
              <input id="q-cat" list="q-categories" value={draft.category} onChange={e => patch({ category: e.target.value.toUpperCase() })} className={`${fieldClass} h-10`} />
              <datalist id="q-categories">{categories.map(c => <option key={c} value={c} />)}</datalist>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="q-client" className={labelClass}>CLIENTE / ARTISTA</label>
              <input id="q-client" value={draft.client ?? ''} onChange={e => patch({ client: e.target.value })} className={`${fieldClass} h-10`} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="q-year" className={labelClass}>ANO</label>
              <input id="q-year" value={draft.year ?? ''} onChange={e => patch({ year: e.target.value })} inputMode="numeric" placeholder="2025" className={`${fieldClass} h-10`} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="q-desc" className={labelClass}>DESCRIÇÃO</label>
            <textarea id="q-desc" value={draft.description ?? ''} onChange={e => patch({ description: e.target.value })} rows={3} placeholder="O que foi feito, para quem e com qual resultado." className={`${fieldClass} p-3 resize-y`} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <span className={labelClass}>TIPO</span>
              <div className="grid grid-cols-2 gap-2">
                {([[false, ImageIcon, 'FOTO'], [true, Video, 'VÍDEO']] as const).map(([value, Icon, label]) => {
                  const active = draft.isVideo === value
                  return (
                    <button
                      key={label}
                      type="button"
                      aria-pressed={active}
                      onClick={() => patch({ isVideo: value })}
                      className="h-10 flex items-center justify-center gap-1.5 font-mono-mm text-[11px] font-semibold rounded-lg transition-colors"
                      style={{ background: active ? '#C9A84C' : 'transparent', color: active ? '#080808' : '#CBD5E1', border: `1px solid ${active ? '#C9A84C' : 'rgba(255,255,255,0.2)'}` }}
                    >
                      <Icon size={13} /> {label}
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 self-end h-10">
              <p className="font-display font-medium text-sm text-white flex items-center gap-1.5">
                <Star size={13} className="text-yellow-400" fill={draft.featured ? 'currentColor' : 'none'} /> Destaque na home
              </p>
              <Toggle on={Boolean(draft.featured)} onChange={v => patch({ featured: v })} label="Destaque na página inicial" />
            </div>
          </div>

          {draft.isVideo && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="q-video" className={labelClass}>LINK DO VÍDEO (YOUTUBE, VIMEO OU MP4)</label>
              <input id="q-video" value={draft.videoUrl ?? ''} onChange={e => patch({ videoUrl: e.target.value.trim() || undefined })} placeholder="https://www.youtube.com/watch?v=..." className={`${fieldClass} h-10`} />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="q-slug" className={labelClass}>ENDEREÇO NO SITE</label>
            <div className="flex items-center rounded-md bg-[#161616] border border-white/15 focus-within:border-[#C9A84C] overflow-hidden">
              <span className="pl-3 font-mono-mm text-xs text-[#64748B] shrink-0">/portfolio/</span>
              <input id="q-slug" value={draft.slug} onChange={e => { setSlugTouched(true); patch({ slug: slugify(e.target.value) }) }} placeholder="gerado-do-titulo" className="flex-1 min-w-0 h-10 pr-3 bg-transparent font-mono-mm text-xs text-white outline-none" />
            </div>
          </div>

          {!isNew && (
            <Link href={`/admin/portfolio/${draft.id}`} className="self-start flex items-center gap-2 font-mono-mm text-[11px] text-[#E5C158] hover:underline">
              <ExternalLink size={12} /> Abrir página completa (galeria de fotos)
            </Link>
          )}

          {error && (
            <p role="alert" className="px-4 py-3 rounded-lg font-mono-mm text-xs text-[#F87171] bg-[rgba(248,113,113,0.1)] border border-[rgba(248,113,113,0.4)]">{error}</p>
          )}
        </div>

        <div className="flex gap-3 px-6 py-4 shrink-0 border-t border-white/10">
          <button onClick={requestClose} className="h-11 px-5 font-mono-mm text-[11px] font-semibold rounded-lg text-[#CBD5E1] border border-white/20">CANCELAR</button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="flex-1 h-11 flex items-center justify-center gap-2 font-mono-mm text-[11px] tracking-[0.1em] font-semibold rounded-lg disabled:opacity-40"
            style={{ background: '#C9A84C', color: '#080808' }}
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {isNew ? 'CRIAR PROJETO' : 'SALVAR ALTERAÇÕES'}
          </button>
        </div>
      </div>

      {confirmClose && <ConfirmDialog message="Descartar as alterações deste projeto?" onConfirm={discard} onCancel={() => setConfirmClose(false)} />}
    </>
  )
}
