'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AdminProvider, useAdmin } from '@/lib/admin-context'
import type { PortfolioItem } from '@/lib/data'
import { MAX_PORTFOLIO_IMAGE_BYTES } from '@/lib/data'
import { SiteImage } from '@/components/site/SiteImage'
import { SITE_IMAGE_SLOTS } from '@/lib/site-images'
import { uniqueSlug } from '@/lib/slug'
import {
  ArrowLeft,
  ExternalLink,
  ImagePlus,
  Loader2,
  RefreshCw,
  Save,
  Trash2,
  Upload,
  Video,
  Image as ImageIcon,
} from 'lucide-react'

/* ------------------------------------------------------------------ */

const CATEGORIES = ['MÚSICA', 'EMPRESAS', 'EVENTOS', 'ENSAIOS', 'CLIPES', 'INSTITUCIONAL', 'AO VIVO']

const inputStyle = {
  background: '#161616',
  border: '1px solid rgba(255,255,255,0.16)',
  borderRadius: '6px',
  color: '#F9FAFB',
} as const

function todayBr(): string {
  return new Date().toLocaleDateString('pt-BR')
}

/** Extrai a object key (`portfolio/...`) de uma URL pública do bucket. */
function keyFromUrl(url: string): string | null {
  const marker = 'portfolio/'
  const idx = url.indexOf(marker)
  if (idx === -1) return null
  const key = url.slice(idx).split('?')[0]
  if (!key.startsWith(marker) || key.includes('..')) return null
  return key
}

async function uploadPortfolioImage(itemId: string, file: File): Promise<{ id: string; url: string; key: string }> {
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

/* ------------------------------------------------------------------ */

function PortfolioDetail() {
  const params = useParams()
  const router = useRouter()
  const { state, dispatch, isLoading } = useAdmin()
  const id = typeof params.id === 'string' ? params.id : ''

  const item = state.portfolio.find(p => p.id === id)

  const [draft, setDraft] = useState<PortfolioItem | null>(null)
  const [savedJson, setSavedJson] = useState('')
  const [removedKeys, setRemovedKeys] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<'cover' | 'gallery' | null>(null)
  const [uploadError, setUploadError] = useState('')
  const draftIdRef = useRef<string | null>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (item && draftIdRef.current !== item.id) {
      draftIdRef.current = item.id
      setDraft(item)
      setSavedJson(JSON.stringify(item))
      setRemovedKeys([])
    }
  }, [item])

  const dirty = draft ? JSON.stringify(draft) !== savedJson : false
  const gallery = draft?.images ?? []

  const patch = (p: Partial<PortfolioItem>) => setDraft(d => (d ? { ...d, ...p } : d))

  const handleBack = () => {
    if (dirty && !window.confirm('Há alterações não salvas. Sair mesmo assim?')) return
    router.push('/admin?section=portfolio')
  }

  const handleSave = async () => {
    if (!draft || saving) return
    setSaving(true)
    try {
      const siblings = (state.portfolio ?? []).filter(p => p.id !== draft.id).map(p => p.slug)
      const payload = { ...draft, slug: uniqueSlug(draft.slug?.trim() || draft.title, siblings) }
      setDraft(payload)
      dispatch({ type: 'UPDATE_PORTFOLIO', payload })
      setSavedJson(JSON.stringify(payload))
      const keys = removedKeys
      setRemovedKeys([])
      // Remove do S3 apenas após salvar a referência no banco
      await Promise.all(
        keys.map(key =>
          fetch(`/api/admin/portfolio-images?itemId=${encodeURIComponent(draft.id)}&key=${encodeURIComponent(key)}`, { method: 'DELETE' })
            .catch(() => undefined)
        )
      )
    } finally {
      setSaving(false)
    }
  }

  const handleCoverFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !draft) return
    setUploadError('')
    setUploading('cover')
    try {
      const { url } = await uploadPortfolioImage(draft.id, file)
      const oldKey = draft.imageUrl ? keyFromUrl(draft.imageUrl) : null
      if (oldKey) setRemovedKeys(prev => [...prev, oldKey])
      patch({ imageUrl: url })
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Falha no upload.')
    } finally {
      setUploading(null)
    }
  }

  const handleRemoveCover = () => {
    if (!draft?.imageUrl) return
    const oldKey = keyFromUrl(draft.imageUrl)
    if (oldKey) setRemovedKeys(prev => [...prev, oldKey])
    patch({ imageUrl: undefined })
  }

  const handleGalleryFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ''
    if (!files.length || !draft) return
    setUploadError('')
    setUploading('gallery')
    try {
      for (const file of files) {
        const { id: imgId, url, key } = await uploadPortfolioImage(draft.id, file)
        setDraft(d => (d ? { ...d, images: [...(d.images ?? []), { id: imgId, url, key, createdAt: todayBr() }] } : d))
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Falha no upload.')
    } finally {
      setUploading(null)
    }
  }

  const handleRemoveGalleryImage = (imgId: string) => {
    if (!draft) return
    const img = (draft.images ?? []).find(i => i.id === imgId)
    if (img) {
      const k = img.key || keyFromUrl(img.url)
      if (k) setRemovedKeys(prev => [...prev, k])
    }
    patch({ images: (draft.images ?? []).filter(i => i.id !== imgId) })
  }

  const handleDeleteItem = () => {
    if (!draft) return
    if (!window.confirm(`Excluir "${draft.title}" do portfólio permanentemente?`)) return
    dispatch({ type: 'DELETE_PORTFOLIO', id: draft.id })
    router.push('/admin?section=portfolio')
  }

  if (isLoading || (!draft && item)) {
    return (
      <div className="admin-page min-h-screen flex items-center justify-center" style={{ background: '#080808' }}>
        <p className="font-mono-mm text-xs tracking-[0.12em] text-[#E5C158] flex items-center gap-2">
          <Loader2 size={16} className="animate-spin" />
          CARREGANDO ITEM...
        </p>
      </div>
    )
  }

  if (!item || !draft) {
    return (
      <div className="admin-page min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: '#080808' }}>
        <p className="font-display font-semibold text-xl text-white">Item não encontrado</p>
        <button
          onClick={() => router.push('/admin?section=portfolio')}
          className="flex items-center gap-2 h-11 px-5 font-mono-mm text-xs font-semibold rounded-lg"
          style={{ background: '#C9A84C', color: '#080808' }}
        >
          <ArrowLeft size={15} />
          VOLTAR PARA PORTFÓLIO
        </button>
      </div>
    )
  }

  return (
    <div className="admin-page min-h-screen" style={{ background: '#080808' }}>
      {/* Topbar */}
      <div
        className="sticky top-0 z-30 flex items-center justify-between gap-3 px-4 sm:px-6 h-16"
        style={{ background: 'rgba(13,13,13,0.95)', backdropFilter: 'blur(8px)', borderBottom: '1px solid rgba(255,255,255,0.12)' }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 h-10 px-3 font-mono-mm text-[11px] font-semibold rounded-lg text-[#CBD5E1] hover:text-white shrink-0"
            style={{ border: '1px solid rgba(255,255,255,0.16)', background: '#161616' }}
          >
            <ArrowLeft size={15} />
            <span className="hidden sm:inline">PORTFÓLIO</span>
          </button>
          <div className="min-w-0">
            <p className="font-mono-mm text-[10px] tracking-[0.12em] text-[#E5C158] font-semibold">PÁGINA DO ITEM</p>
            <p className="font-display font-semibold text-sm text-white truncate">{draft.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {dirty && (
            <span className="hidden sm:inline font-mono-mm text-[10px] font-semibold px-2.5 py-1 rounded" style={{ background: 'rgba(250,204,21,0.15)', color: '#FACC15', border: '1px solid rgba(250,204,21,0.4)' }}>
              NÃO SALVO
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={!dirty || saving}
            className="flex items-center gap-2 h-10 px-4 font-mono-mm text-[11px] font-semibold rounded-lg"
            style={{ background: dirty ? '#C9A84C' : 'rgba(201,168,76,0.25)', color: '#080808', opacity: dirty ? 1 : 0.6 }}
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            SALVAR
          </button>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto p-4 sm:p-6 lg:p-8 pb-16 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
        {/* Main column */}
        <div className="flex flex-col gap-6 min-w-0">
          {/* Informações gerais */}
          <section className="p-5 sm:p-6 rounded-xl bg-[#111111] border border-[rgba(255,255,255,0.12)] flex flex-col gap-4">
            <h2 className="font-mono-mm text-[11px] tracking-[0.12em] font-semibold text-[#E5C158]">INFORMAÇÕES GERAIS</h2>

            <div className="flex flex-col gap-1">
              <label className="font-mono-mm text-[10px] font-semibold text-[#CBD5E1]">TÍTULO *</label>
              <input value={draft.title} onChange={e => patch({ title: e.target.value })} className="h-11 px-3 font-display font-semibold text-base outline-none focus:border-[#C9A84C]" style={inputStyle} />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-mono-mm text-[10px] font-semibold text-[#CBD5E1]">SLUG DA URL PÚBLICA</label>
              <div className="flex gap-2">
                <input value={draft.slug ?? ''} onChange={e => patch({ slug: e.target.value })} placeholder="ex: clipe-territorio-mc-vitao" className="flex-1 h-10 px-3 font-display text-sm outline-none focus:border-[#C9A84C]" style={inputStyle} />
                <button
                  type="button"
                  onClick={() => {
                    const siblings = (state.portfolio ?? []).filter(p => p.id !== draft.id).map(p => p.slug)
                    patch({ slug: uniqueSlug(draft.title, siblings) })
                  }}
                  title="Gerar slug a partir do título"
                  className="h-10 w-11 flex items-center justify-center shrink-0 text-[#E5C158]"
                  style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.16)', borderRadius: '6px' }}
                >
                  <RefreshCw size={15} />
                </button>
              </div>
              <p className="font-mono-mm text-[10px] text-[#64748B]">Página pública: /portfolio/{draft.slug || '...'}</p>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-mono-mm text-[10px] font-semibold text-[#CBD5E1]">DESCRIÇÃO</label>
              <textarea value={draft.description ?? ''} onChange={e => patch({ description: e.target.value })} rows={4} placeholder="Resumo do trabalho, cliente, ano, formato..." className="p-3 font-display text-sm outline-none resize-y focus:border-[#C9A84C]" style={inputStyle} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <label className="font-mono-mm text-[10px] font-semibold text-[#CBD5E1]">CATEGORIA</label>
                <select value={draft.category} onChange={e => patch({ category: e.target.value })} className="h-10 px-3 font-display text-sm outline-none focus:border-[#C9A84C]" style={inputStyle}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-mono-mm text-[10px] font-semibold text-[#CBD5E1]">TIPO</label>
                <div className="flex gap-2 h-10 items-center">
                  <button type="button" onClick={() => patch({ isVideo: false })} className="flex-1 flex items-center justify-center gap-1.5 h-9 font-mono-mm text-[10px] font-semibold rounded" style={{ background: !draft.isVideo ? '#C9A84C' : 'transparent', color: !draft.isVideo ? '#080808' : '#CBD5E1', border: '1px solid rgba(255,255,255,0.2)' }}>
                    <ImageIcon size={12} /> FOTO
                  </button>
                  <button type="button" onClick={() => patch({ isVideo: true })} className="flex-1 flex items-center justify-center gap-1.5 h-9 font-mono-mm text-[10px] font-semibold rounded" style={{ background: draft.isVideo ? '#C9A84C' : 'transparent', color: draft.isVideo ? '#080808' : '#CBD5E1', border: '1px solid rgba(255,255,255,0.2)' }}>
                    <Video size={12} /> VÍDEO
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-mono-mm text-[10px] font-semibold text-[#CBD5E1]">ORDEM NO SITE</label>
                <input type="number" min="0" value={draft.sortOrder ?? 0} onChange={e => patch({ sortOrder: parseInt(e.target.value) || 0 })} className="h-10 px-3 font-display text-sm outline-none focus:border-[#C9A84C]" style={inputStyle} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="font-mono-mm text-[10px] font-semibold text-[#CBD5E1]">IMAGEM (slot do site)</label>
                <select value={draft.imageKey} onChange={e => patch({ imageKey: e.target.value })} className="h-10 px-3 font-display text-sm outline-none focus:border-[#C9A84C]" style={inputStyle}>
                  {SITE_IMAGE_SLOTS.filter(s => s.key.startsWith('portfolio')).map(s => (
                    <option key={s.key} value={s.key}>{s.label}</option>
                  ))}
                </select>
                <p className="font-mono-mm text-[10px] text-[#64748B]">Usado quando não há capa enviada.</p>
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-mono-mm text-[10px] font-semibold text-[#CBD5E1]">URL EXTERNA</label>
                <input value={draft.imageUrl ?? ''} onChange={e => patch({ imageUrl: e.target.value.trim() || undefined })} placeholder="https://... (sobrescreve o slot)" className="h-10 px-3 font-display text-sm outline-none focus:border-[#C9A84C]" style={inputStyle} />
              </div>
            </div>
          </section>

          {/* Capa */}
          <section className="p-5 sm:p-6 rounded-xl bg-[#111111] border border-[rgba(255,255,255,0.12)] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-mono-mm text-[11px] tracking-[0.12em] font-semibold text-[#E5C158]">CAPA DO ITEM</h2>
              {draft.imageUrl && (
                <button onClick={handleRemoveCover} className="font-mono-mm text-[10px] font-semibold text-red-400 hover:text-red-300">
                  REMOVER
                </button>
              )}
            </div>
            {draft.imageUrl ? (
              <div className="relative w-full overflow-hidden rounded-lg" style={{ aspectRatio: '16/8' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={draft.imageUrl} alt="Capa do item" className="absolute inset-0 h-full w-full object-cover" />
                {uploading === 'cover' && (
                  <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }}>
                    <Loader2 size={24} className="animate-spin text-[#E5C158]" />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="w-full py-6 flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-[rgba(255,255,255,0.16)]">
                  <ImagePlus size={22} className="text-[#64748B]" />
                  <p className="font-display text-sm text-[#64748B]">Nenhuma capa enviada — usando o slot abaixo</p>
                </div>
                <div className="relative w-full overflow-hidden rounded-lg opacity-70" style={{ aspectRatio: '16/8' }}>
                  <SiteImage imageKey={draft.imageKey} alt="Slot atual" fill className="object-cover" sizes="800px" />
                </div>
              </div>
            )}
            <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverFile} />
            <button
              onClick={() => coverInputRef.current?.click()}
              disabled={uploading !== null}
              className="flex items-center justify-center gap-2 h-11 font-mono-mm text-[11px] font-semibold rounded-lg text-[#F3F4F6] disabled:opacity-50"
              style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.16)' }}
            >
              {uploading === 'cover' ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
              {draft.imageUrl ? 'TROCAR CAPA' : 'ENVIAR CAPA'}
            </button>
          </section>

          {/* Galeria */}
          <section className="p-5 sm:p-6 rounded-xl bg-[#111111] border border-[rgba(255,255,255,0.12)] flex flex-col gap-4">
            <h2 className="font-mono-mm text-[11px] tracking-[0.12em] font-semibold text-[#E5C158]">
              GALERIA ({gallery.length})
            </h2>
            {gallery.length === 0 && uploading !== 'gallery' && (
              <p className="font-display text-sm text-[#64748B]">Nenhuma imagem na galeria. Envie bastidores, stills e fotos do trabalho.</p>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {gallery.map(img => (
                <div key={img.id} className="relative overflow-hidden rounded-lg bg-[#161616] group" style={{ aspectRatio: '4/3' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt="Imagem do item" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
                  <button
                    onClick={() => handleRemoveGalleryImage(img.id)}
                    aria-label="Excluir imagem"
                    className="absolute top-2 right-2 h-8 w-8 flex items-center justify-center rounded-lg text-white sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                    style={{ background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(248,113,113,0.5)' }}
                  >
                    <Trash2 size={14} className="text-red-400" />
                  </button>
                </div>
              ))}
              {uploading === 'gallery' && (
                <div className="rounded-lg bg-[#161616] border border-[rgba(201,168,76,0.4)] flex items-center justify-center" style={{ aspectRatio: '4/3' }}>
                  <Loader2 size={22} className="animate-spin text-[#E5C158]" />
                </div>
              )}
            </div>
            <input ref={galleryInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryFiles} />
            <button
              onClick={() => galleryInputRef.current?.click()}
              disabled={uploading !== null}
              className="flex items-center justify-center gap-2 h-11 font-mono-mm text-[11px] font-semibold rounded-lg text-[#F3F4F6] disabled:opacity-50"
              style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.16)' }}
            >
              {uploading === 'gallery' ? <Loader2 size={15} className="animate-spin" /> : <ImagePlus size={15} />}
              ADICIONAR IMAGENS
            </button>
            {uploadError && <p className="font-mono-mm text-[11px] text-[#F87171]">{uploadError}</p>}
          </section>
        </div>

        {/* Side column */}
        <aside className="flex flex-col gap-6 lg:sticky lg:top-24">
          <a
            href={`/portfolio/${draft.slug || draft.id}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 h-11 font-mono-mm text-[11px] font-semibold rounded-lg"
            style={{ background: '#C9A84C', color: '#080808' }}
          >
            <ExternalLink size={14} />
            VER PÁGINA PÚBLICA
          </a>
          <section className="p-5 rounded-xl bg-[#111111] border border-[rgba(255,255,255,0.12)] flex flex-col gap-4">
            <h2 className="font-mono-mm text-[11px] tracking-[0.12em] font-semibold text-[#E5C158]">RESUMO</h2>
            <div className="flex flex-col gap-3 font-display text-sm">
              <div className="flex justify-between gap-2">
                <span className="text-[#94A3B8]">Categoria</span>
                <span className="text-white text-right font-semibold">{draft.category}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-[#94A3B8]">Tipo</span>
                <span className="text-white">{draft.isVideo ? 'VÍDEO' : 'FOTO'}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-[#94A3B8]">Ordem</span>
                <span className="text-white">#{draft.sortOrder}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-[#94A3B8]">Capa</span>
                <span className="text-white">{draft.imageUrl ? 'ENVIADA' : 'SLOT'}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-[#94A3B8]">Galeria</span>
                <span className="text-white">{gallery.length} imagens</span>
              </div>
            </div>
          </section>

          <section className="p-5 rounded-xl bg-[#111111] border border-[rgba(248,113,113,0.25)] flex flex-col gap-3">
            <h2 className="font-mono-mm text-[11px] tracking-[0.12em] font-semibold text-[#F87171]">ZONA DE PERIGO</h2>
            <p className="font-display text-xs text-[#94A3B8]" style={{ lineHeight: 1.6 }}>
              Excluir remove o item do site. As imagens enviadas permanecem no storage.
            </p>
            <button
              onClick={handleDeleteItem}
              className="flex items-center justify-center gap-2 h-10 font-mono-mm text-[11px] font-semibold rounded-lg text-red-400"
              style={{ border: '1px solid rgba(248,113,113,0.4)', background: 'rgba(248,113,113,0.08)' }}
            >
              <Trash2 size={14} />
              EXCLUIR ITEM
            </button>
          </section>
        </aside>
      </div>
    </div>
  )
}

export default function PortfolioItemPage() {
  return (
    <AdminProvider>
      <PortfolioDetail />
    </AdminProvider>
  )
}
