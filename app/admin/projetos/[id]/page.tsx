'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AdminProvider, useAdmin } from '@/lib/admin-context'
import type { Project, ProjectStatus, Priority } from '@/lib/data'
import { MAX_PROJECT_IMAGE_BYTES } from '@/lib/data'
import {
  ArrowLeft,
  Check,
  ImagePlus,
  Loader2,
  MessageSquare,
  Save,
  Send,
  Trash2,
  Upload,
  X,
} from 'lucide-react'

/* ------------------------------------------------------------------ */

const STATUSES: { status: ProjectStatus; label: string }[] = [
  { status: 'BRIEFING', label: 'BRIEFING' },
  { status: 'PRÉ-PRODUÇÃO', label: 'PRÉ-PROD.' },
  { status: 'PRODUÇÃO', label: 'PRODUÇÃO' },
  { status: 'ENTREGA', label: 'ENTREGA' },
]

const PRIORITY_CONFIG: Record<Priority, { color: string; bg: string; label: string }> = {
  urgent: { color: '#F87171', bg: 'rgba(248,113,113,0.15)', label: 'URGENTE' },
  normal: { color: '#FACC15', bg: 'rgba(250,204,21,0.15)', label: 'NORMAL' },
  low: { color: '#94A3B8', bg: 'rgba(148,163,184,0.15)', label: 'BAIXA' },
}

const SERVICE_TYPES = ['CLIPE MUSICAL', 'INSTITUCIONAL', 'FOTO/VÍDEO', 'CONTEÚDO', 'ENSAIO FOTOGRÁFICO', 'DRONE', 'EVENTO', 'OUTRO']

const inputStyle = {
  background: '#161616',
  border: '1px solid rgba(255,255,255,0.16)',
  borderRadius: '6px',
  color: '#F9FAFB',
} as const

function toDateInputValue(display?: string): string {
  if (!display) return ''
  const m = display.match(/(\d{2})\/(\d{2})\/(\d{4})/)
  if (!m) return ''
  return `${m[3]}-${m[2]}-${m[1]}`
}

function toDisplayDate(input: string): string {
  if (!input) return '—'
  const [y, m, d] = input.split('-')
  if (!y || !m || !d) return '—'
  return `${d}/${m}/${y}`
}

function todayBr(): string {
  return new Date().toLocaleDateString('pt-BR')
}

/** Extrai a object key (`projects/...`) de uma URL pública do bucket. */
function keyFromUrl(url: string): string | null {
  const marker = 'projects/'
  const idx = url.indexOf(marker)
  if (idx === -1) return null
  const key = url.slice(idx).split('?')[0]
  if (!key.startsWith(marker) || key.includes('..')) return null
  return key
}

async function uploadProjectImage(projectId: string, file: File): Promise<{ id: string; url: string; key: string }> {
  if (!file.type.startsWith('image/')) throw new Error('Envie um arquivo de imagem.')
  if (file.size > MAX_PROJECT_IMAGE_BYTES) throw new Error('A imagem deve ter até 8MB.')
  const formData = new FormData()
  formData.append('projectId', projectId)
  formData.append('file', file)
  const response = await fetch('/api/admin/project-images', { method: 'POST', body: formData })
  const payload = await response.json()
  if (!response.ok) throw new Error(payload.error || 'Falha ao enviar imagem.')
  return payload
}

/* ------------------------------------------------------------------ */

function ProjectDetail() {
  const params = useParams()
  const router = useRouter()
  const { state, dispatch, isLoading } = useAdmin()
  const id = typeof params.id === 'string' ? params.id : ''

  const project = state.projects.find(p => p.id === id)

  const [draft, setDraft] = useState<Project | null>(null)
  const [savedJson, setSavedJson] = useState('')
  const [removedKeys, setRemovedKeys] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<'cover' | 'gallery' | null>(null)
  const [uploadError, setUploadError] = useState('')
  const [checkInput, setCheckInput] = useState('')
  const [commentInput, setCommentInput] = useState('')
  const draftIdRef = useRef<string | null>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (project && draftIdRef.current !== project.id) {
      draftIdRef.current = project.id
      setDraft(project)
      setSavedJson(JSON.stringify(project))
      setRemovedKeys([])
    }
  }, [project])

  const dirty = draft ? JSON.stringify(draft) !== savedJson : false
  const gallery = draft?.images ?? []
  const progress = draft && draft.checklist.length
    ? Math.round((draft.checklist.filter(c => c.done).length / draft.checklist.length) * 100)
    : 0

  const patch = (p: Partial<Project>) => setDraft(d => (d ? { ...d, ...p } : d))

  const handleBack = () => {
    if (dirty && !window.confirm('Há alterações não salvas. Sair mesmo assim?')) return
    router.push('/admin?section=projetos')
  }

  const handleSave = async () => {
    if (!draft || saving) return
    setSaving(true)
    try {
      dispatch({ type: 'UPDATE_PROJECT', payload: draft })
      setSavedJson(JSON.stringify(draft))
      const keys = removedKeys
      setRemovedKeys([])
      // Remove do S3 apenas após salvar a referência no banco
      await Promise.all(
        keys.map(key =>
          fetch(`/api/admin/project-images?projectId=${encodeURIComponent(draft.id)}&key=${encodeURIComponent(key)}`, { method: 'DELETE' })
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
      const { url } = await uploadProjectImage(draft.id, file)
      const oldKey = draft.coverImageUrl ? keyFromUrl(draft.coverImageUrl) : null
      if (oldKey) setRemovedKeys(prev => [...prev, oldKey])
      patch({ coverImageUrl: url })
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Falha no upload.')
    } finally {
      setUploading(null)
    }
  }

  const handleRemoveCover = () => {
    if (!draft?.coverImageUrl) return
    const oldKey = keyFromUrl(draft.coverImageUrl)
    if (oldKey) setRemovedKeys(prev => [...prev, oldKey])
    patch({ coverImageUrl: undefined })
  }

  const handleGalleryFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ''
    if (!files.length || !draft) return
    setUploadError('')
    setUploading('gallery')
    try {
      for (const file of files) {
        const { id: imgId, url, key } = await uploadProjectImage(draft.id, file)
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

  const handleDeleteProject = () => {
    if (!draft) return
    if (!window.confirm(`Excluir "${draft.title}" permanentemente?`)) return
    dispatch({ type: 'DELETE_PROJECT', id: draft.id })
    router.push('/admin?section=projetos')
  }

  if (isLoading || (!draft && project)) {
    return (
      <div className="admin-page min-h-screen flex items-center justify-center" style={{ background: '#080808' }}>
        <p className="font-mono-mm text-xs tracking-[0.12em] text-[#E5C158] flex items-center gap-2">
          <Loader2 size={16} className="animate-spin" />
          CARREGANDO PROJETO...
        </p>
      </div>
    )
  }

  if (!project || !draft) {
    return (
      <div className="admin-page min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: '#080808' }}>
        <p className="font-display font-semibold text-xl text-white">Projeto não encontrado</p>
        <button
          onClick={() => router.push('/admin?section=projetos')}
          className="flex items-center gap-2 h-11 px-5 font-mono-mm text-xs font-semibold rounded-lg"
          style={{ background: '#C9A84C', color: '#080808' }}
        >
          <ArrowLeft size={15} />
          VOLTAR PARA PROJETOS
        </button>
      </div>
    )
  }

  const client = state.clients.find(c => c.id === draft.clientId)

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
            <span className="hidden sm:inline">PROJETOS</span>
          </button>
          <div className="min-w-0">
            <p className="font-mono-mm text-[10px] tracking-[0.12em] text-[#E5C158] font-semibold">PÁGINA DO PROJETO</p>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="font-mono-mm text-[10px] font-semibold text-[#CBD5E1]">CLIENTE</label>
                <select
                  value={draft.clientId}
                  onChange={e => {
                    const c = state.clients.find(x => x.id === e.target.value)
                    patch({ clientId: e.target.value, clientName: c?.name ?? draft.clientName })
                  }}
                  className="h-10 px-3 font-display text-sm outline-none focus:border-[#C9A84C]"
                  style={inputStyle}
                >
                  {state.clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-mono-mm text-[10px] font-semibold text-[#CBD5E1]">TIPO DE SERVIÇO</label>
                <select value={draft.serviceType} onChange={e => patch({ serviceType: e.target.value })} className="h-10 px-3 font-display text-sm outline-none focus:border-[#C9A84C]" style={inputStyle}>
                  {SERVICE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-mono-mm text-[10px] font-semibold text-[#CBD5E1]">DATA DE INÍCIO</label>
                <input type="date" value={toDateInputValue(draft.startDate)} onChange={e => patch({ startDate: toDisplayDate(e.target.value) })} className="h-10 px-3 font-display text-sm outline-none focus:border-[#C9A84C]" style={inputStyle} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-mono-mm text-[10px] font-semibold text-[#CBD5E1]">DATA DE ENTREGA</label>
                <input type="date" value={toDateInputValue(draft.dueDate)} onChange={e => patch({ dueDate: toDisplayDate(e.target.value) })} className="h-10 px-3 font-display text-sm outline-none focus:border-[#C9A84C]" style={inputStyle} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-mono-mm text-[10px] font-semibold text-[#CBD5E1]">VALOR (R$)</label>
                <input type="number" min="0" value={draft.value || ''} onChange={e => patch({ value: parseFloat(e.target.value) || 0 })} placeholder="0" className="h-10 px-3 font-display text-sm outline-none focus:border-[#C9A84C]" style={inputStyle} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-mono-mm text-[10px] font-semibold text-[#CBD5E1]">LOCAL</label>
                <input value={draft.location ?? ''} onChange={e => patch({ location: e.target.value })} placeholder="Ex: Nauta Estúdio" className="h-10 px-3 font-display text-sm outline-none focus:border-[#C9A84C]" style={inputStyle} />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-mono-mm text-[10px] font-semibold text-[#CBD5E1]">DESCRIÇÃO / BRIEFING</label>
              <textarea value={draft.description ?? ''} onChange={e => patch({ description: e.target.value })} rows={5} placeholder="Escopo, conceito, referências, observações do cliente..." className="p-3 font-display text-sm outline-none resize-y focus:border-[#C9A84C]" style={inputStyle} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="font-mono-mm text-[10px] font-semibold text-[#CBD5E1]">ETAPA</label>
                <div className="grid grid-cols-2 gap-2">
                  {STATUSES.map(s => (
                    <button
                      key={s.status}
                      onClick={() => patch({ status: s.status })}
                      className="h-9 px-2 font-mono-mm text-[10px] font-semibold rounded-md"
                      style={{
                        background: draft.status === s.status ? '#C9A84C' : '#161616',
                        color: draft.status === s.status ? '#080808' : '#CBD5E1',
                        border: `1px solid ${draft.status === s.status ? '#C9A84C' : 'rgba(255,255,255,0.12)'}`,
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-mono-mm text-[10px] font-semibold text-[#CBD5E1]">PRIORIDADE</label>
                <div className="flex gap-2">
                  {(Object.keys(PRIORITY_CONFIG) as Priority[]).map(p => {
                    const cfg = PRIORITY_CONFIG[p]
                    return (
                      <button
                        key={p}
                        onClick={() => patch({ priority: p })}
                        className="flex-1 h-9 font-mono-mm text-[10px] font-semibold rounded-md"
                        style={{
                          background: draft.priority === p ? cfg.color : 'transparent',
                          color: draft.priority === p ? '#080808' : cfg.color,
                          border: `1px solid ${cfg.color}`,
                        }}
                      >
                        {cfg.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* Capa */}
          <section className="p-5 sm:p-6 rounded-xl bg-[#111111] border border-[rgba(255,255,255,0.12)] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-mono-mm text-[11px] tracking-[0.12em] font-semibold text-[#E5C158]">IMAGEM DE CAPA</h2>
              {draft.coverImageUrl && (
                <button onClick={handleRemoveCover} className="font-mono-mm text-[10px] font-semibold text-red-400 hover:text-red-300">
                  REMOVER
                </button>
              )}
            </div>
            {draft.coverImageUrl ? (
              <div className="relative w-full overflow-hidden rounded-lg" style={{ aspectRatio: '16/8' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={draft.coverImageUrl} alt="Capa do projeto" className="absolute inset-0 h-full w-full object-cover" />
                {uploading === 'cover' && (
                  <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }}>
                    <Loader2 size={24} className="animate-spin text-[#E5C158]" />
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full py-10 flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-[rgba(255,255,255,0.16)]">
                <ImagePlus size={22} className="text-[#64748B]" />
                <p className="font-display text-sm text-[#64748B]">Nenhuma capa enviada</p>
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
              {draft.coverImageUrl ? 'TROCAR CAPA' : 'ENVIAR CAPA'}
            </button>
          </section>

          {/* Galeria */}
          <section className="p-5 sm:p-6 rounded-xl bg-[#111111] border border-[rgba(255,255,255,0.12)] flex flex-col gap-4">
            <h2 className="font-mono-mm text-[11px] tracking-[0.12em] font-semibold text-[#E5C158]">
              GALERIA ({gallery.length})
            </h2>
            {gallery.length === 0 && uploading !== 'gallery' && (
              <p className="font-display text-sm text-[#64748B]">Nenhuma imagem na galeria</p>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {gallery.map(img => (
                <div key={img.id} className="relative overflow-hidden rounded-lg bg-[#161616] group" style={{ aspectRatio: '4/3' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt="Imagem do projeto" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
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

          {/* Checklist */}
          <section className="p-5 sm:p-6 rounded-xl bg-[#111111] border border-[rgba(255,255,255,0.12)] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-mono-mm text-[11px] tracking-[0.12em] font-semibold text-[#E5C158]">CHECKLIST DE ETAPAS</h2>
              <span className="font-mono-mm text-[11px] font-semibold text-[#E5C158]">{progress}%</span>
            </div>
            <div className="w-full bg-[#222] h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#C9A84C] h-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <div className="flex flex-col gap-2">
              {draft.checklist.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2.5 px-3 py-2 rounded-md" style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <button
                    onClick={() => patch({ checklist: draft.checklist.map((c, i) => (i === idx ? { ...c, done: !c.done } : c)) })}
                    className="w-5 h-5 rounded flex items-center justify-center shrink-0"
                    style={{ background: item.done ? '#C9A84C' : 'transparent', border: item.done ? '1px solid #C9A84C' : '1px solid rgba(255,255,255,0.3)' }}
                    aria-label="Alternar etapa"
                  >
                    {item.done && <Check size={12} color="#080808" />}
                  </button>
                  <input
                    value={item.text}
                    onChange={e => patch({ checklist: draft.checklist.map((c, i) => (i === idx ? { ...c, text: e.target.value } : c)) })}
                    className="flex-1 bg-transparent font-display text-sm outline-none"
                    style={{ color: item.done ? '#94A3B8' : '#F3F4F6', textDecoration: item.done ? 'line-through' : 'none' }}
                  />
                  <button
                    onClick={() => patch({ checklist: draft.checklist.filter((_, i) => i !== idx) })}
                    className="text-[#64748B] hover:text-red-400 shrink-0"
                    aria-label="Excluir etapa"
                  >
                    <X size={15} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={checkInput}
                onChange={e => setCheckInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && checkInput.trim()) {
                    patch({ checklist: [...draft.checklist, { text: checkInput.trim(), done: false }] })
                    setCheckInput('')
                  }
                }}
                placeholder="Nova etapa..."
                className="flex-1 h-10 px-3 font-display text-sm outline-none"
                style={inputStyle}
              />
              <button
                onClick={() => {
                  if (!checkInput.trim()) return
                  patch({ checklist: [...draft.checklist, { text: checkInput.trim(), done: false }] })
                  setCheckInput('')
                }}
                className="h-10 px-4 font-mono-mm text-[10px] font-semibold"
                style={{ background: 'rgba(201,168,76,0.2)', color: '#E5C158', borderRadius: '6px', border: '1px solid rgba(201,168,76,0.4)' }}
              >
                ADD
              </button>
            </div>
          </section>

          {/* Comentários */}
          <section className="p-5 sm:p-6 rounded-xl bg-[#111111] border border-[rgba(255,255,255,0.12)] flex flex-col gap-4">
            <h2 className="font-mono-mm text-[11px] tracking-[0.12em] font-semibold text-[#E5C158] flex items-center gap-2">
              <MessageSquare size={13} />
              COMENTÁRIOS ({draft.comments.length})
            </h2>
            <div className="flex flex-col gap-2">
              {draft.comments.length === 0 && (
                <p className="font-display text-sm text-[#64748B]">Nenhum comentário. Registre atualizações, feedback do cliente, pendências...</p>
              )}
              {draft.comments.map((c, idx) => (
                <div key={idx} className="flex items-start justify-between gap-2 px-3 py-2.5 rounded-md" style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <p className="font-display text-sm text-[#E5E7EB] whitespace-pre-wrap" style={{ lineHeight: 1.6 }}>{c}</p>
                  <button
                    onClick={() => patch({ comments: draft.comments.filter((_, i) => i !== idx) })}
                    className="text-[#64748B] hover:text-red-400 shrink-0 mt-0.5"
                    aria-label="Excluir comentário"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={commentInput}
                onChange={e => setCommentInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && commentInput.trim()) {
                    patch({ comments: [...draft.comments, commentInput.trim()] })
                    setCommentInput('')
                  }
                }}
                placeholder="Escrever atualização..."
                className="flex-1 h-10 px-3 font-display text-sm outline-none"
                style={inputStyle}
              />
              <button
                onClick={() => {
                  if (!commentInput.trim()) return
                  patch({ comments: [...draft.comments, commentInput.trim()] })
                  setCommentInput('')
                }}
                aria-label="Enviar comentário"
                className="h-10 w-11 flex items-center justify-center shrink-0"
                style={{ background: '#C9A84C', color: '#080808', borderRadius: '6px' }}
              >
                <Send size={15} />
              </button>
            </div>
          </section>
        </div>

        {/* Side column */}
        <aside className="flex flex-col gap-6 lg:sticky lg:top-24">
          <section className="p-5 rounded-xl bg-[#111111] border border-[rgba(255,255,255,0.12)] flex flex-col gap-4">
            <h2 className="font-mono-mm text-[11px] tracking-[0.12em] font-semibold text-[#E5C158]">RESUMO</h2>
            <div className="flex flex-col gap-3 font-display text-sm">
              <div className="flex justify-between gap-2">
                <span className="text-[#94A3B8]">Cliente</span>
                <span className="text-white text-right font-semibold">{draft.clientName}</span>
              </div>
              {client && (
                <div className="flex justify-between gap-2">
                  <span className="text-[#94A3B8]">WhatsApp</span>
                  <span className="text-white text-right">{client.whatsapp || '—'}</span>
                </div>
              )}
              <div className="flex justify-between gap-2">
                <span className="text-[#94A3B8]">Valor</span>
                <span className="font-bold text-[#E5C158]">R$ {draft.value.toLocaleString('pt-BR')}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-[#94A3B8]">Início</span>
                <span className="text-white">{draft.startDate || '—'}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-[#94A3B8]">Entrega</span>
                <span className="text-white">{draft.dueDate}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-[#94A3B8]">Local</span>
                <span className="text-white text-right">{draft.location || '—'}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-[#94A3B8]">Progresso</span>
                <span className="text-white font-semibold">{progress}%</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-[#94A3B8]">Imagens</span>
                <span className="text-white">{(draft.images ?? []).length}</span>
              </div>
            </div>
          </section>

          <section className="p-5 rounded-xl bg-[#111111] border border-[rgba(248,113,113,0.25)] flex flex-col gap-3">
            <h2 className="font-mono-mm text-[11px] tracking-[0.12em] font-semibold text-[#F87171]">ZONA DE PERIGO</h2>
            <p className="font-display text-xs text-[#94A3B8]" style={{ lineHeight: 1.6 }}>
              Excluir remove o projeto do banco. As imagens enviadas permanecem no storage.
            </p>
            <button
              onClick={handleDeleteProject}
              className="flex items-center justify-center gap-2 h-10 font-mono-mm text-[11px] font-semibold rounded-lg text-red-400"
              style={{ border: '1px solid rgba(248,113,113,0.4)', background: 'rgba(248,113,113,0.08)' }}
            >
              <Trash2 size={14} />
              EXCLUIR PROJETO
            </button>
          </section>
        </aside>
      </div>
    </div>
  )
}

export default function ProjectPage() {
  return (
    <AdminProvider>
      <Suspense
        fallback={
          <div className="admin-page min-h-screen flex items-center justify-center" style={{ background: '#080808' }}>
            <p className="font-mono-mm text-xs tracking-[0.12em] text-[#E5C158]">CARREGANDO...</p>
          </div>
        }
      >
        <ProjectDetail />
      </Suspense>
    </AdminProvider>
  )
}
