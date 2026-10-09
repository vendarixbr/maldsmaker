'use client'

import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AdminProvider, useAdmin } from '@/lib/admin-context'
import type { PortfolioItem } from '@/lib/data'
import { MAX_PORTFOLIO_IMAGE_BYTES } from '@/lib/data'
import { SiteImage } from '@/components/site/SiteImage'
import { ConfirmDialog } from '@/components/admin/admin-ui'
import { SITE_IMAGE_SLOTS } from '@/lib/site-images'
import { slugify, uniqueSlug } from '@/lib/slug'
import {
  ArrowLeft,
  Check,
  ExternalLink,
  Image as ImageIcon,
  ImagePlus,
  Loader2,
  Save,
  Star,
  Trash2,
  Upload,
  Video,
} from 'lucide-react'

const BACK_HREF = '/admin?section=portfolio'
const DEFAULT_CATEGORIES = ['MÚSICA', 'CLIPES', 'INSTITUCIONAL', 'EVENTOS', 'ENSAIOS', 'EMPRESAS', 'AO VIVO', 'MODA', 'PUBLICIDADE']
const DEFAULT_IMAGE_KEY = SITE_IMAGE_SLOTS.find(s => s.key.startsWith('portfolio'))?.key ?? 'portfolio-territorio-mc-vitao'

const fieldClass =
  'w-full px-3 font-display text-sm text-white outline-none rounded-md bg-[#161616] border border-white/15 focus:border-[#C9A84C] transition-colors'
const labelClass = 'font-mono-mm text-[10px] font-semibold tracking-[0.06em] text-[#CBD5E1]'
const cardClass = 'p-5 rounded-xl bg-[#111111] border border-white/[0.12] flex flex-col gap-4'
const cardTitle = 'font-mono-mm text-[11px] tracking-[0.12em] font-semibold text-[#E5C158]'

/** Extrai a object key (`portfolio/...`) de uma URL pública do bucket. */
function keyFromUrl(url: string): string | null {
  const idx = url.indexOf('portfolio/')
  if (idx === -1) return null
  const key = url.slice(idx).split('?')[0]
  return key.includes('..') ? null : key
}

async function uploadImage(itemId: string, file: File): Promise<{ id: string; url: string; key: string }> {
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

function deleteStoredImages(itemId: string, keys: string[]) {
  return Promise.all(
    keys.map(key =>
      fetch(`/api/admin/portfolio-images?itemId=${encodeURIComponent(itemId)}&key=${encodeURIComponent(key)}`, { method: 'DELETE' }).catch(() => undefined),
    ),
  )
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
      <span
        className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform"
        style={{ transform: on ? 'translateX(20px)' : 'translateX(0)' }}
      />
    </button>
  )
}

function Screen({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-page min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center" style={{ background: '#080808' }}>
      {children}
    </div>
  )
}

function PortfolioEditor() {
  const params = useParams()
  const router = useRouter()
  const { state, dispatch, isLoading } = useAdmin()
  const routeId = typeof params.id === 'string' ? params.id : ''
  const isNew = routeId === 'novo'

  const existing = isNew ? undefined : state.portfolio.find(p => p.id === routeId)
  const newId = useRef(`pf-${Date.now()}`)

  const [draft, setDraft] = useState<PortfolioItem | null>(null)
  const [savedJson, setSavedJson] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [removedKeys, setRemovedKeys] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<'cover' | 'gallery' | null>(null)
  const [error, setError] = useState('')
  const [confirm, setConfirm] = useState<'delete' | 'leave' | null>(null)
  const draftIdRef = useRef<string | null>(null)
  const coverInput = useRef<HTMLInputElement>(null)
  const galleryInput = useRef<HTMLInputElement>(null)

  // Inicializa o rascunho: item novo (vazio) ou o item existente.
  useEffect(() => {
    if (isLoading) return
    if (isNew && draftIdRef.current !== newId.current) {
      draftIdRef.current = newId.current
      const maxOrder = Math.max(0, ...state.portfolio.map(p => p.sortOrder ?? 0))
      const blank: PortfolioItem = {
        id: newId.current,
        title: '',
        slug: '',
        category: 'CLIPES',
        imageKey: DEFAULT_IMAGE_KEY,
        isVideo: false,
        featured: false,
        sortOrder: maxOrder + 1,
        description: '',
        images: [],
      }
      setDraft(blank)
      setSavedJson(JSON.stringify(blank))
    } else if (existing && draftIdRef.current !== existing.id) {
      draftIdRef.current = existing.id
      setDraft(existing)
      setSavedJson(JSON.stringify(existing))
      setRemovedKeys([])
    }
  }, [isLoading, isNew, existing, state.portfolio])

  const dirty = draft ? JSON.stringify(draft) !== savedJson : false
  const gallery = draft?.images ?? []

  // Avisa ao fechar a aba com alterações pendentes.
  useEffect(() => {
    if (!dirty) return
    const handler = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [dirty])

  const categories = useMemo(() => {
    const set = new Set(DEFAULT_CATEGORIES)
    state.portfolio.forEach(p => set.add(p.category))
    return Array.from(set)
  }, [state.portfolio])

  const siblingSlugs = useMemo(
    () => state.portfolio.filter(p => p.id !== draft?.id).map(p => p.slug),
    [state.portfolio, draft?.id],
  )

  const patch = (p: Partial<PortfolioItem>) => setDraft(d => (d ? { ...d, ...p } : d))

  const setTitle = (title: string) => {
    patch(slugTouched || !isNew ? { title } : { title, slug: slugify(title) })
  }

  // Imagens enviadas para um item novo que nunca foi salvo ficam órfãs no bucket: limpamos ao sair.
  const discardUnsavedUploads = () => {
    if (!isNew || !draft) return
    const keys = [draft.imageUrl, ...gallery.map(i => i.url)].map(u => (u ? keyFromUrl(u) : null)).filter((k): k is string => Boolean(k))
    if (keys.length) void deleteStoredImages(draft.id, Array.from(new Set(keys)))
  }

  const leave = () => {
    discardUnsavedUploads()
    router.push(BACK_HREF)
  }

  const handleBack = () => {
    if (dirty) setConfirm('leave')
    else router.push(BACK_HREF)
  }

  const handleSave = async () => {
    if (!draft || saving) return
    if (!draft.title.trim()) {
      setError('Dê um título ao projeto.')
      return
    }
    setError('')
    setSaving(true)
    const payload: PortfolioItem = {
      ...draft,
      title: draft.title.trim(),
      slug: uniqueSlug(draft.slug?.trim() || draft.title, siblingSlugs),
    }
    const ok = await dispatch({ type: isNew ? 'ADD_PORTFOLIO' : 'UPDATE_PORTFOLIO', payload })
    if (!ok) {
      setSaving(false)
      setError('Não foi possível salvar. Tente novamente.')
      return
    }
    setDraft(payload)
    setSavedJson(JSON.stringify(payload))
    const keys = removedKeys
    setRemovedKeys([])
    if (keys.length) await deleteStoredImages(payload.id, keys)
    setSaving(false)
    // Só navega depois do banco confirmar — a nova URL carrega o item direto do servidor.
    if (isNew) {
      draftIdRef.current = payload.id
      router.replace(`/admin/portfolio/${payload.id}`)
    }
  }

  const queueRemoval = (url?: string, key?: string) => {
    const k = key || (url ? keyFromUrl(url) : null)
    if (k) setRemovedKeys(prev => [...prev, k])
  }

  const handleCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !draft) return
    setError('')
    setUploading('cover')
    try {
      const { url } = await uploadImage(draft.id, file)
      // Se a capa antiga não está na galeria, ela deixa de ser usada.
      if (draft.imageUrl && !gallery.some(i => i.url === draft.imageUrl)) queueRemoval(draft.imageUrl)
      patch({ imageUrl: url })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha no upload.')
    } finally {
      setUploading(null)
    }
  }

  const handleRemoveCover = () => {
    if (!draft?.imageUrl) return
    if (!gallery.some(i => i.url === draft.imageUrl)) queueRemoval(draft.imageUrl)
    patch({ imageUrl: undefined })
  }

  const handleGallery = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ''
    if (!files.length || !draft) return
    setError('')
    setUploading('gallery')
    try {
      for (const file of files) {
        const { id, url, key } = await uploadImage(draft.id, file)
        const createdAt = new Date().toLocaleDateString('pt-BR')
        setDraft(d => (d ? { ...d, imageUrl: d.imageUrl ?? url, images: [...(d.images ?? []), { id, url, key, createdAt }] } : d))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha no upload.')
    } finally {
      setUploading(null)
    }
  }

  const handleRemoveGallery = (imgId: string) => {
    const img = gallery.find(i => i.id === imgId)
    if (!img || !draft) return
    queueRemoval(img.url, img.key)
    patch({
      images: gallery.filter(i => i.id !== imgId),
      imageUrl: draft.imageUrl === img.url ? undefined : draft.imageUrl,
    })
  }

  const handleDelete = async () => {
    if (!draft) return
    setConfirm(null)
    if (await dispatch({ type: 'DELETE_PORTFOLIO', id: draft.id })) {
      setSavedJson(JSON.stringify(draft))
      router.push(BACK_HREF)
    }
  }

  if (isLoading || (!draft && (isNew || existing))) {
    return (
      <Screen>
        <p className="font-mono-mm text-xs tracking-[0.12em] text-[#E5C158] flex items-center gap-2">
          <Loader2 size={16} className="animate-spin" /> CARREGANDO...
        </p>
      </Screen>
    )
  }

  if (!draft) {
    return (
      <Screen>
        <p className="font-display font-semibold text-xl text-white">Projeto não encontrado</p>
        <button
          onClick={() => router.push(BACK_HREF)}
          className="flex items-center gap-2 h-11 px-5 font-mono-mm text-xs font-semibold rounded-lg"
          style={{ background: '#C9A84C', color: '#080808' }}
        >
          <ArrowLeft size={15} /> VOLTAR AO PORTFÓLIO
        </button>
      </Screen>
    )
  }

  const canSave = (dirty || isNew) && !saving && Boolean(draft.title.trim())

  return (
    <div className="admin-page min-h-screen" style={{ background: '#080808' }}>
      <header
        className="sticky top-0 z-30 flex items-center justify-between gap-3 px-4 sm:px-6 h-16"
        style={{ background: 'rgba(13,13,13,0.95)', backdropFilter: 'blur(8px)', borderBottom: '1px solid rgba(255,255,255,0.12)' }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={handleBack}
            aria-label="Voltar ao portfólio"
            className="flex items-center gap-2 h-10 px-3 font-mono-mm text-[11px] font-semibold rounded-lg text-[#CBD5E1] hover:text-white shrink-0 bg-[#161616] border border-white/15"
          >
            <ArrowLeft size={15} />
            <span className="hidden sm:inline">PORTFÓLIO</span>
          </button>
          <p className="font-display font-semibold text-sm text-white truncate">
            {draft.title.trim() || (isNew ? 'Novo projeto' : 'Sem título')}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {dirty && !isNew && <span className="hidden sm:inline font-mono-mm text-[10px] font-semibold text-[#FACC15]">ALTERAÇÕES NÃO SALVAS</span>}
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="flex items-center gap-2 h-10 px-5 font-mono-mm text-[11px] font-semibold rounded-lg transition-opacity disabled:opacity-40"
            style={{ background: '#C9A84C', color: '#080808' }}
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {isNew ? 'CRIAR PROJETO' : 'SALVAR'}
          </button>
        </div>
      </header>

      <div className="max-w-[1100px] mx-auto p-4 sm:p-6 lg:p-8 pb-16 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
        <div className="flex flex-col gap-6 min-w-0">
          {error && (
            <p role="alert" className="px-4 py-3 rounded-lg font-mono-mm text-xs text-[#F87171] bg-[rgba(248,113,113,0.1)] border border-[rgba(248,113,113,0.4)]">
              {error}
            </p>
          )}

          {/* Detalhes */}
          <section className={cardClass}>
            <h2 className={cardTitle}>DETALHES</h2>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="pf-title" className={labelClass}>TÍTULO *</label>
              <input
                id="pf-title"
                autoFocus={isNew}
                value={draft.title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Ex: Clipe Território — MC Vitão"
                className={`${fieldClass} h-11 font-semibold text-base`}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5 sm:col-span-1">
                <label htmlFor="pf-cat" className={labelClass}>CATEGORIA</label>
                <input
                  id="pf-cat"
                  list="pf-categories"
                  value={draft.category}
                  onChange={e => patch({ category: e.target.value.toUpperCase() })}
                  className={`${fieldClass} h-10`}
                />
                <datalist id="pf-categories">
                  {categories.map(c => <option key={c} value={c} />)}
                </datalist>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="pf-client" className={labelClass}>CLIENTE / ARTISTA</label>
                <input id="pf-client" value={draft.client ?? ''} onChange={e => patch({ client: e.target.value })} className={`${fieldClass} h-10`} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="pf-year" className={labelClass}>ANO</label>
                <input id="pf-year" value={draft.year ?? ''} onChange={e => patch({ year: e.target.value })} placeholder="2025" inputMode="numeric" className={`${fieldClass} h-10`} />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="pf-desc" className={labelClass}>DESCRIÇÃO</label>
              <textarea
                id="pf-desc"
                value={draft.description ?? ''}
                onChange={e => patch({ description: e.target.value })}
                rows={4}
                placeholder="O que foi feito, para quem e com qual resultado."
                className={`${fieldClass} p-3 resize-y`}
              />
            </div>

            {draft.isVideo && (
              <div className="flex flex-col gap-1.5">
                <label htmlFor="pf-video" className={labelClass}>LINK DO VÍDEO (YOUTUBE, VIMEO OU MP4)</label>
                <input
                  id="pf-video"
                  value={draft.videoUrl ?? ''}
                  onChange={e => patch({ videoUrl: e.target.value.trim() || undefined })}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className={`${fieldClass} h-10`}
                />
              </div>
            )}
          </section>

          {/* Mídia */}
          <section className={cardClass}>
            <h2 className={cardTitle}>CAPA</h2>
            <div className="relative w-full overflow-hidden rounded-lg bg-[#161616]" style={{ aspectRatio: '16/8' }}>
              {draft.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={draft.imageUrl} alt="Capa do projeto" className="absolute inset-0 h-full w-full object-cover" />
              ) : isNew ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-[#64748B]">
                  <ImagePlus size={24} />
                  <p className="font-display text-sm">Envie uma capa para o projeto</p>
                </div>
              ) : (
                <SiteImage imageKey={draft.imageKey} alt="Capa padrão" fill className="object-cover opacity-70" sizes="800px" />
              )}
              {uploading === 'cover' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                  <Loader2 size={24} className="animate-spin text-[#E5C158]" />
                </div>
              )}
            </div>
            <input ref={coverInput} type="file" accept="image/*" className="hidden" onChange={handleCover} />
            <div className="flex gap-2">
              <button
                onClick={() => coverInput.current?.click()}
                disabled={uploading !== null}
                className="flex-1 flex items-center justify-center gap-2 h-11 font-mono-mm text-[11px] font-semibold rounded-lg text-[#F3F4F6] bg-[#161616] border border-white/15 disabled:opacity-50"
              >
                <Upload size={15} /> {draft.imageUrl ? 'TROCAR CAPA' : 'ENVIAR CAPA'}
              </button>
              {draft.imageUrl && (
                <button
                  onClick={handleRemoveCover}
                  aria-label="Remover capa"
                  className="h-11 w-11 flex items-center justify-center rounded-lg text-[#F87171] bg-[#161616] border border-white/15 hover:border-[#F87171]"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          </section>

          <section className={cardClass}>
            <div className="flex items-center justify-between">
              <h2 className={cardTitle}>GALERIA {gallery.length > 0 && `(${gallery.length})`}</h2>
              <input ref={galleryInput} type="file" accept="image/*" multiple className="hidden" onChange={handleGallery} />
              <button
                onClick={() => galleryInput.current?.click()}
                disabled={uploading !== null}
                className="flex items-center gap-2 h-9 px-3 font-mono-mm text-[11px] font-semibold rounded-lg text-[#F3F4F6] bg-[#161616] border border-white/15 disabled:opacity-50"
              >
                {uploading === 'gallery' ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />}
                ADICIONAR FOTOS
              </button>
            </div>

            {gallery.length === 0 && uploading !== 'gallery' ? (
              <p className="font-display text-sm text-[#64748B]">Opcional. Bastidores, stills e outras fotos do trabalho aparecem na página do projeto.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {gallery.map(img => {
                  const isCover = draft.imageUrl === img.url
                  return (
                    <div key={img.id} className="group relative overflow-hidden rounded-lg bg-[#161616]" style={{ aspectRatio: '4/3', outline: isCover ? '2px solid #C9A84C' : 'none' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.url} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                      <div className="absolute inset-x-0 bottom-0 p-2 flex items-center justify-between gap-2 bg-gradient-to-t from-black/80 to-transparent sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 transition-opacity">
                        <button
                          onClick={() => patch({ imageUrl: img.url })}
                          disabled={isCover}
                          className="h-7 px-2 flex items-center gap-1 font-mono-mm text-[10px] font-semibold rounded bg-black/70 border border-white/20 text-white disabled:text-[#E5C158]"
                        >
                          {isCover ? <><Check size={11} /> CAPA</> : 'USAR COMO CAPA'}
                        </button>
                        <button
                          onClick={() => handleRemoveGallery(img.id)}
                          aria-label="Excluir foto"
                          className="h-7 w-7 flex items-center justify-center rounded bg-black/70 border border-[rgba(248,113,113,0.5)] text-[#F87171]"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  )
                })}
                {uploading === 'gallery' && (
                  <div className="rounded-lg bg-[#161616] border border-[rgba(201,168,76,0.4)] flex items-center justify-center" style={{ aspectRatio: '4/3' }}>
                    <Loader2 size={22} className="animate-spin text-[#E5C158]" />
                  </div>
                )}
              </div>
            )}
          </section>
        </div>

        {/* Lateral */}
        <aside className="flex flex-col gap-6 lg:sticky lg:top-24">
          <section className={cardClass}>
            <h2 className={cardTitle}>PUBLICAÇÃO</h2>

            <div className="flex flex-col gap-1.5">
              <span className={labelClass}>TIPO</span>
              <div className="grid grid-cols-2 gap-2">
                {([[false, ImageIcon, 'FOTO'], [true, Video, 'VÍDEO']] as const).map(([value, Icon, label]) => {
                  const active = draft.isVideo === value
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => patch({ isVideo: value })}
                      aria-pressed={active}
                      className="h-10 flex items-center justify-center gap-1.5 font-mono-mm text-[11px] font-semibold rounded-lg transition-colors"
                      style={{
                        background: active ? '#C9A84C' : 'transparent',
                        color: active ? '#080808' : '#CBD5E1',
                        border: `1px solid ${active ? '#C9A84C' : 'rgba(255,255,255,0.2)'}`,
                      }}
                    >
                      <Icon size={13} /> {label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-display font-medium text-sm text-white flex items-center gap-1.5">
                  <Star size={13} className="text-yellow-400" fill={draft.featured ? 'currentColor' : 'none'} /> Destaque
                </p>
                <p className="font-mono-mm text-[10px] text-[#94A3B8] mt-0.5">Aparece em evidência na home.</p>
              </div>
              <Toggle on={Boolean(draft.featured)} onChange={v => patch({ featured: v })} label="Destaque na página inicial" />
            </div>

            <div className="flex flex-col gap-1.5 pt-4 border-t border-white/[0.08]">
              <label htmlFor="pf-slug" className={labelClass}>ENDEREÇO NO SITE</label>
              <div className="flex items-center rounded-md bg-[#161616] border border-white/15 focus-within:border-[#C9A84C] overflow-hidden">
                <span className="pl-3 font-mono-mm text-xs text-[#64748B] shrink-0">/portfolio/</span>
                <input
                  id="pf-slug"
                  value={draft.slug}
                  onChange={e => { setSlugTouched(true); patch({ slug: slugify(e.target.value) }) }}
                  placeholder="gerado-do-titulo"
                  className="flex-1 min-w-0 h-10 pr-3 bg-transparent font-mono-mm text-xs text-white outline-none"
                />
              </div>
            </div>

            {!isNew && (
              <a
                href={`/portfolio/${draft.slug || draft.id}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 h-10 font-mono-mm text-[11px] font-semibold rounded-lg text-[#E5C158] border border-[rgba(201,168,76,0.4)] hover:bg-[rgba(201,168,76,0.08)]"
              >
                <ExternalLink size={13} /> VER NO SITE
              </a>
            )}
          </section>

          {!isNew && (
            <button
              onClick={() => setConfirm('delete')}
              className="flex items-center justify-center gap-2 h-10 font-mono-mm text-[11px] font-semibold rounded-lg text-[#F87171] border border-[rgba(248,113,113,0.35)] hover:bg-[rgba(248,113,113,0.08)]"
            >
              <Trash2 size={14} /> EXCLUIR PROJETO
            </button>
          )}
        </aside>
      </div>

      {confirm === 'delete' && (
        <ConfirmDialog
          message={`Excluir "${draft.title}" do portfólio? Esta ação não pode ser desfeita.`}
          onConfirm={handleDelete}
          onCancel={() => setConfirm(null)}
        />
      )}
      {confirm === 'leave' && (
        <ConfirmDialog
          message="Há alterações não salvas. Sair mesmo assim?"
          onConfirm={() => { setConfirm(null); leave() }}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  )
}

export default function PortfolioItemPage() {
  return (
    <Suspense fallback={null}>
      <AdminProvider>
        <PortfolioEditor />
      </AdminProvider>
    </Suspense>
  )
}
