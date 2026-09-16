'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAdmin } from '@/lib/admin-context'
import type { Project, ProjectStatus, Priority } from '@/lib/data'
import { Plus, X, Check, Trash2, Search, ExternalLink, MessageSquare, ImagePlus, Send } from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Config                                                              */
/* ------------------------------------------------------------------ */

const COLUMNS: { status: ProjectStatus; label: string }[] = [
  { status: 'BRIEFING',       label: 'BRIEFING' },
  { status: 'PRÉ-PRODUÇÃO',   label: 'PRÉ-PROD.' },
  { status: 'PRODUÇÃO',       label: 'PRODUÇÃO' },
  { status: 'ENTREGA',        label: 'ENTREGA' },
]

const PRIORITY_CONFIG: Record<Priority, { color: string; bg: string; label: string }> = {
  urgent: { color: '#F87171', bg: 'rgba(248,113,113,0.15)', label: 'URGENTE' },
  normal: { color: '#FACC15', bg: 'rgba(250,204,21,0.15)',  label: 'NORMAL' },
  low:    { color: '#94A3B8', bg: 'rgba(148,163,184,0.15)', label: 'BAIXA' },
}

const SERVICE_TYPES = ['CLIPE MUSICAL', 'INSTITUCIONAL', 'FOTO/VÍDEO', 'CONTEÚDO', 'ENSAIO FOTOGRÁFICO', 'DRONE', 'EVENTO', 'OUTRO']

function toDateInputValue(display: string): string {
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

function projectProgress(p: Project): number {
  if (!p.checklist.length) return 0
  return Math.round((p.checklist.filter(c => c.done).length / p.checklist.length) * 100)
}

const inputStyle = {
  background: '#161616',
  border: '1px solid rgba(255,255,255,0.16)',
  borderRadius: '6px',
  color: '#F9FAFB',
} as const

/* ------------------------------------------------------------------ */
/*  New Project Form                                                    */
/* ------------------------------------------------------------------ */

function NewProjectForm({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useAdmin()
  const router = useRouter()
  const [clientId, setClientId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [serviceType, setServiceType] = useState('CLIPE MUSICAL')
  const [startDate, setStartDate] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [location, setLocation] = useState('')
  const [priority, setPriority] = useState<Priority>('normal')
  const [value, setValue] = useState('')
  const [status, setStatus] = useState<ProjectStatus>('BRIEFING')
  const [checklistInput, setChecklistInput] = useState('')
  const [checklist, setChecklist] = useState<{ text: string; done: boolean }[]>([])

  const selectedClient = state.clients.find(c => c.id === clientId)

  const addCheckItem = () => {
    if (!checklistInput.trim()) return
    setChecklist(prev => [...prev, { text: checklistInput.trim(), done: false }])
    setChecklistInput('')
  }

  const removeCheckItem = (i: number) => setChecklist(prev => prev.filter((_, idx) => idx !== i))

  const handleSave = (openPage: boolean) => {
    if (!title.trim() || !clientId) return
    const newProject: Project = {
      id: `p${Date.now()}`,
      clientId,
      clientName: selectedClient?.name ?? '',
      title: title.trim(),
      description: description.trim(),
      serviceType,
      startDate: toDisplayDate(startDate),
      dueDate: toDisplayDate(dueDate),
      location: location.trim(),
      priority,
      value: parseFloat(value.replace(/\D/g, '')) || 0,
      status,
      checklist,
      comments: [],
      images: [],
    }
    dispatch({ type: 'ADD_PROJECT', payload: newProject })
    onClose()
    if (openPage) router.push(`/admin/projetos/${newProject.id}`)
  }

  return (
    <>
      <div className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.75)' }} onClick={onClose} />
      <div
        className="fixed top-1/2 left-1/2 z-50 flex flex-col gap-5 p-6 overflow-y-auto"
        style={{
          width: 'min(620px, 95vw)',
          maxHeight: '90vh',
          transform: 'translate(-50%, -50%)',
          background: '#0F0F0F',
          border: '1px solid rgba(255,255,255,0.14)',
          borderRadius: '12px',
        }}
      >
        <div className="flex items-center justify-between">
          <p className="font-mono-mm text-[11px] tracking-[0.12em] font-semibold" style={{ color: '#E5C158' }}>NOVO PROJETO</p>
          <button onClick={onClose} className="text-[#CBD5E1] hover:text-white transition-colors" aria-label="Fechar"><X size={18} /></button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Cliente */}
          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="font-mono-mm text-[10px] tracking-[0.08em] font-semibold" style={{ color: '#CBD5E1' }}>CLIENTE *</label>
            <select
              value={clientId}
              onChange={e => setClientId(e.target.value)}
              className="h-10 px-3 font-display text-sm outline-none focus:border-[#C9A84C]"
              style={inputStyle}
            >
              <option value="">Selecionar cliente...</option>
              {state.clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Título */}
          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="font-mono-mm text-[10px] tracking-[0.08em] font-semibold" style={{ color: '#CBD5E1' }}>TÍTULO DO PROJETO *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder='Ex: Clipe "Madrugada"' className="h-10 px-3 font-display text-sm outline-none focus:border-[#C9A84C]" style={inputStyle} />
          </div>

          {/* Descrição */}
          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="font-mono-mm text-[10px] tracking-[0.08em] font-semibold" style={{ color: '#CBD5E1' }}>DESCRIÇÃO / BRIEFING</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Resumo do escopo, referências, conceito..." className="p-3 font-display text-sm outline-none resize-y focus:border-[#C9A84C]" style={inputStyle} />
          </div>

          {/* Tipo de serviço */}
          <div className="flex flex-col gap-1">
            <label className="font-mono-mm text-[10px] tracking-[0.08em] font-semibold" style={{ color: '#CBD5E1' }}>TIPO DE SERVIÇO</label>
            <select value={serviceType} onChange={e => setServiceType(e.target.value)} className="h-10 px-3 font-display text-sm outline-none focus:border-[#C9A84C]" style={inputStyle}>
              {SERVICE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Local */}
          <div className="flex flex-col gap-1">
            <label className="font-mono-mm text-[10px] tracking-[0.08em] font-semibold" style={{ color: '#CBD5E1' }}>LOCAL</label>
            <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Ex: Nauta Estúdio" className="h-10 px-3 font-display text-sm outline-none focus:border-[#C9A84C]" style={inputStyle} />
          </div>

          {/* Início */}
          <div className="flex flex-col gap-1">
            <label className="font-mono-mm text-[10px] tracking-[0.08em] font-semibold" style={{ color: '#CBD5E1' }}>DATA DE INÍCIO</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="h-10 px-3 font-display text-sm outline-none focus:border-[#C9A84C]" style={inputStyle} />
          </div>

          {/* Data de entrega */}
          <div className="flex flex-col gap-1">
            <label className="font-mono-mm text-[10px] tracking-[0.08em] font-semibold" style={{ color: '#CBD5E1' }}>DATA DE ENTREGA</label>
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="h-10 px-3 font-display text-sm outline-none focus:border-[#C9A84C]" style={inputStyle} />
          </div>

          {/* Valor */}
          <div className="flex flex-col gap-1">
            <label className="font-mono-mm text-[10px] tracking-[0.08em] font-semibold" style={{ color: '#CBD5E1' }}>VALOR (R$)</label>
            <input type="number" value={value} onChange={e => setValue(e.target.value)} placeholder="0,00" min="0" className="h-10 px-3 font-display text-sm outline-none focus:border-[#C9A84C]" style={inputStyle} />
          </div>

          {/* Etapa inicial */}
          <div className="flex flex-col gap-1">
            <label className="font-mono-mm text-[10px] tracking-[0.08em] font-semibold" style={{ color: '#CBD5E1' }}>ETAPA INICIAL</label>
            <select value={status} onChange={e => setStatus(e.target.value as ProjectStatus)} className="h-10 px-3 font-display text-sm outline-none focus:border-[#C9A84C]" style={inputStyle}>
              {COLUMNS.map(col => <option key={col.status} value={col.status}>{col.label}</option>)}
            </select>
          </div>

          {/* Prioridade */}
          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="font-mono-mm text-[10px] tracking-[0.08em] font-semibold" style={{ color: '#CBD5E1' }}>PRIORIDADE</label>
            <div className="flex gap-2">
              {(Object.keys(PRIORITY_CONFIG) as Priority[]).map(p => {
                const cfg = PRIORITY_CONFIG[p]
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className="h-8 px-3 font-mono-mm text-[10px] tracking-[0.06em] font-semibold transition-all"
                    style={{
                      background: priority === p ? cfg.color : 'transparent',
                      color: priority === p ? '#080808' : cfg.color,
                      border: `1px solid ${cfg.color}`,
                      borderRadius: '4px',
                      opacity: priority === p ? 1 : 0.7,
                    }}
                  >
                    {cfg.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Checklist */}
          <div className="flex flex-col gap-2 sm:col-span-2">
            <label className="font-mono-mm text-[10px] tracking-[0.08em] font-semibold" style={{ color: '#CBD5E1' }}>CHECKLIST</label>
            <div className="flex gap-2">
              <input
                value={checklistInput}
                onChange={e => setChecklistInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCheckItem()}
                placeholder="Adicionar item ao checklist..."
                className="flex-1 h-9 px-3 font-display text-sm outline-none"
                style={inputStyle}
              />
              <button onClick={addCheckItem} type="button" className="h-9 px-4 font-mono-mm text-[10px] font-semibold" style={{ background: 'rgba(201,168,76,0.2)', color: '#E5C158', borderRadius: '6px', border: '1px solid rgba(201,168,76,0.4)' }}>
                ADD
              </button>
            </div>
            {checklist.length > 0 && (
              <div className="flex flex-col gap-1.5 mt-1">
                {checklist.map((item, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2" style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px' }}>
                    <span className="font-display text-sm text-[#F3F4F6]">{item.text}</span>
                    <button onClick={() => removeCheckItem(i)} className="text-[#CBD5E1] hover:text-red-400">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 mt-2">
          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={!title.trim() || !clientId}
            className="flex-1 h-11 font-mono-mm text-[11px] tracking-[0.1em] font-semibold transition-opacity"
            style={{
              background: title.trim() && clientId ? '#C9A84C' : 'rgba(201,168,76,0.3)',
              color: '#080808',
              borderRadius: '6px',
              opacity: title.trim() && clientId ? 1 : 0.5,
            }}
          >
            CRIAR PROJETO
          </button>
          <button
            type="button"
            onClick={() => handleSave(true)}
            disabled={!title.trim() || !clientId}
            className="flex-1 h-11 font-mono-mm text-[11px] tracking-[0.1em] font-semibold transition-opacity"
            style={{
              background: 'transparent',
              color: '#E5C158',
              borderRadius: '6px',
              border: '1px solid rgba(201,168,76,0.5)',
              opacity: title.trim() && clientId ? 1 : 0.5,
            }}
          >
            CRIAR E ABRIR PÁGINA
          </button>
        </div>
      </div>
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  Project Sheet Detail (visão rápida)                                 */
/* ------------------------------------------------------------------ */

function ProjectSheet({ project, onClose }: { project: Project; onClose: () => void }) {
  const { dispatch } = useAdmin()
  const router = useRouter()
  const [commentInput, setCommentInput] = useState('')
  const [checkInput, setCheckInput] = useState('')
  const p = project

  const update = (patch: Partial<Project>) => {
    dispatch({ type: 'UPDATE_PROJECT', payload: { ...p, ...patch } })
  }

  const toggleItem = (idx: number) => {
    update({ checklist: p.checklist.map((item, i) => i === idx ? { ...item, done: !item.done } : item) })
  }

  const addCheckItem = () => {
    if (!checkInput.trim()) return
    update({ checklist: [...p.checklist, { text: checkInput.trim(), done: false }] })
    setCheckInput('')
  }

  const addComment = () => {
    if (!commentInput.trim()) return
    update({ comments: [...p.comments, commentInput.trim()] })
    setCommentInput('')
  }

  const removeComment = (idx: number) => {
    update({ comments: p.comments.filter((_, i) => i !== idx) })
  }

  const moveStatus = (newStatus: ProjectStatus) => {
    dispatch({ type: 'MOVE_PROJECT', id: p.id, status: newStatus })
  }

  const done = p.checklist.filter(c => c.done).length
  const pct = projectProgress(p)
  const priorityCfg = PRIORITY_CONFIG[p.priority]

  return (
    <>
      <div className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.75)' }} onClick={onClose} />
      <aside
        className="fixed right-0 top-0 h-full z-50 flex flex-col overflow-y-auto"
        style={{ width: 'min(480px, 100vw)', background: '#0F0F0F', borderLeft: '1px solid rgba(255,255,255,0.12)' }}
      >
        {p.coverImageUrl && (
          <div className="relative w-full shrink-0" style={{ aspectRatio: '16/7' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.coverImageUrl} alt={p.title} className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #0F0F0F 2%, transparent 55%)' }} />
          </div>
        )}
        <div className="p-6 flex items-start justify-between border-b border-[rgba(255,255,255,0.12)]">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="font-mono-mm text-[10px] px-2 py-0.5 font-semibold" style={{ background: priorityCfg.bg, color: priorityCfg.color, borderRadius: '3px' }}>
                {priorityCfg.label}
              </span>
              <span className="font-mono-mm text-[10px] text-[#CBD5E1]">{p.serviceType}</span>
            </div>
            <h2 className="font-display font-semibold text-xl text-[#FFFFFF]">{p.title}</h2>
            <p className="font-mono-mm text-xs text-[#CBD5E1] mt-1">{p.clientName}</p>
          </div>
          <button onClick={onClose} className="text-[#CBD5E1] hover:text-white transition-colors" aria-label="Fechar"><X size={20} /></button>
        </div>

        <div className="p-6 flex-1 flex flex-col gap-5">
          <button
            onClick={() => router.push(`/admin/projetos/${p.id}`)}
            className="flex items-center justify-center gap-2 h-11 font-mono-mm text-[11px] tracking-[0.1em] font-semibold rounded-lg"
            style={{ background: '#C9A84C', color: '#080808' }}
          >
            <ExternalLink size={14} />
            ABRIR PÁGINA DO PROJETO
          </button>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-lg bg-[#161616] border border-[rgba(255,255,255,0.08)]">
              <p className="font-mono-mm text-[10px] font-semibold text-[#CBD5E1]">ENTREGA</p>
              <p className="font-display font-semibold text-sm text-[#F3F4F6] mt-1">{p.dueDate}</p>
            </div>
            <div className="p-3.5 rounded-lg bg-[#161616] border border-[rgba(255,255,255,0.08)]">
              <p className="font-mono-mm text-[10px] font-semibold text-[#CBD5E1]">VALOR</p>
              <p className="font-display font-bold text-sm text-[#E5C158] mt-1">R$ {p.value.toLocaleString('pt-BR')}</p>
            </div>
            {p.startDate && p.startDate !== '—' && (
              <div className="p-3.5 rounded-lg bg-[#161616] border border-[rgba(255,255,255,0.08)]">
                <p className="font-mono-mm text-[10px] font-semibold text-[#CBD5E1]">INÍCIO</p>
                <p className="font-display font-semibold text-sm text-[#F3F4F6] mt-1">{p.startDate}</p>
              </div>
            )}
            {p.location && (
              <div className="p-3.5 rounded-lg bg-[#161616] border border-[rgba(255,255,255,0.08)]">
                <p className="font-mono-mm text-[10px] font-semibold text-[#CBD5E1]">LOCAL</p>
                <p className="font-display font-semibold text-sm text-[#F3F4F6] mt-1">{p.location}</p>
              </div>
            )}
          </div>

          {p.description && (
            <div className="p-4 rounded-lg bg-[#161616] border border-[rgba(255,255,255,0.08)]">
              <p className="font-mono-mm text-[10px] font-semibold text-[#CBD5E1] mb-2">DESCRIÇÃO</p>
              <p className="font-display text-sm text-[#E5E7EB] whitespace-pre-wrap" style={{ lineHeight: 1.6 }}>{p.description}</p>
            </div>
          )}

          {/* Checklist */}
          <div className="p-4 rounded-lg bg-[#161616] border border-[rgba(255,255,255,0.08)]">
            <div className="flex items-center justify-between mb-3">
              <p className="font-mono-mm text-[10px] font-semibold text-[#CBD5E1]">CHECKLIST DE ETAPAS</p>
              <p className="font-mono-mm text-[10px] font-semibold text-[#E5C158]">{done}/{p.checklist.length}{p.checklist.length > 0 && ` — ${pct}%`}</p>
            </div>
            {p.checklist.length > 0 && (
              <>
                <div className="w-full bg-[#222] h-1.5 rounded-full overflow-hidden mb-3">
                  <div className="bg-[#C9A84C] h-full transition-all duration-300" style={{ width: `${pct}%` }} />
                </div>
                <div className="flex flex-col gap-2 mb-3">
                  {p.checklist.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => toggleItem(idx)}
                      className="flex items-center gap-2.5 text-left py-1"
                    >
                      <div
                        className="w-4 h-4 rounded flex items-center justify-center shrink-0 transition-colors"
                        style={{
                          background: item.done ? '#C9A84C' : 'transparent',
                          border: item.done ? '1px solid #C9A84C' : '1px solid rgba(255,255,255,0.3)',
                        }}
                      >
                        {item.done && <Check size={10} color="#080808" />}
                      </div>
                      <span
                        className="font-display text-sm"
                        style={{ color: item.done ? '#94A3B8' : '#F3F4F6', textDecoration: item.done ? 'line-through' : 'none' }}
                      >
                        {item.text}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
            <div className="flex gap-2">
              <input
                value={checkInput}
                onChange={e => setCheckInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCheckItem()}
                placeholder="Nova etapa..."
                className="flex-1 h-9 px-3 font-display text-sm outline-none"
                style={inputStyle}
              />
              <button onClick={addCheckItem} type="button" className="h-9 px-3 font-mono-mm text-[10px] font-semibold" style={{ background: 'rgba(201,168,76,0.2)', color: '#E5C158', borderRadius: '6px', border: '1px solid rgba(201,168,76,0.4)' }}>
                ADD
              </button>
            </div>
          </div>

          {/* Comentários */}
          <div className="p-4 rounded-lg bg-[#161616] border border-[rgba(255,255,255,0.08)]">
            <p className="font-mono-mm text-[10px] font-semibold text-[#CBD5E1] mb-3">COMENTÁRIOS ({p.comments.length})</p>
            <div className="flex flex-col gap-2 mb-3">
              {p.comments.length === 0 && (
                <p className="font-display text-xs text-[#64748B]">Nenhum comentário ainda.</p>
              )}
              {p.comments.map((c, idx) => (
                <div key={idx} className="flex items-start justify-between gap-2 px-3 py-2 rounded-md" style={{ background: '#0F0F0F', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <p className="font-display text-sm text-[#E5E7EB]" style={{ lineHeight: 1.5 }}>{c}</p>
                  <button onClick={() => removeComment(idx)} className="text-[#64748B] hover:text-red-400 shrink-0 mt-0.5" aria-label="Excluir comentário">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={commentInput}
                onChange={e => setCommentInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addComment()}
                placeholder="Escrever comentário..."
                className="flex-1 h-9 px-3 font-display text-sm outline-none"
                style={inputStyle}
              />
              <button onClick={addComment} type="button" aria-label="Enviar comentário" className="h-9 w-9 flex items-center justify-center shrink-0" style={{ background: '#C9A84C', color: '#080808', borderRadius: '6px' }}>
                <Send size={14} />
              </button>
            </div>
          </div>

          {/* Move stage */}
          <div className="flex flex-col gap-2">
            <p className="font-mono-mm text-[10px] font-semibold text-[#CBD5E1]">MOVER PARA ETAPA</p>
            <div className="grid grid-cols-2 gap-2">
              {COLUMNS.map(col => (
                <button
                  key={col.status}
                  onClick={() => moveStatus(col.status)}
                  className="h-9 px-3 font-mono-mm text-[10px] tracking-[0.06em] font-semibold rounded-md transition-all"
                  style={{
                    background: p.status === col.status ? '#C9A84C' : '#161616',
                    color: p.status === col.status ? '#080808' : '#CBD5E1',
                    border: `1px solid ${p.status === col.status ? '#C9A84C' : 'rgba(255,255,255,0.12)'}`,
                  }}
                >
                  {col.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-4 border-t border-[rgba(255,255,255,0.12)]">
            <button
              onClick={() => { dispatch({ type: 'DELETE_PROJECT', id: p.id }); onClose() }}
              className="flex items-center gap-2 font-mono-mm text-[11px] text-red-400 hover:text-red-300 font-semibold"
            >
              <Trash2 size={14} />
              EXCLUIR PROJETO
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                      */
/* ------------------------------------------------------------------ */

export function AdminProjetos() {
  const { state } = useAdmin()
  const router = useRouter()
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)
  const [search, setSearch] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<'all' | Priority>('all')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return state.projects.filter(p => {
      if (priorityFilter !== 'all' && p.priority !== priorityFilter) return false
      if (!q) return true
      return (
        p.title.toLowerCase().includes(q) ||
        p.clientName.toLowerCase().includes(q) ||
        p.serviceType.toLowerCase().includes(q)
      )
    })
  }, [state.projects, search, priorityFilter])

  const pipelineValue = useMemo(
    () => state.projects.reduce((s, p) => s + (p.value || 0), 0),
    [state.projects]
  )

  const avgProgress = useMemo(() => {
    const withTasks = state.projects.filter(p => p.checklist.length > 0)
    if (!withTasks.length) return 0
    return Math.round(withTasks.reduce((s, p) => s + projectProgress(p), 0) / withTasks.length)
  }, [state.projects])

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-semibold text-2xl text-[#FFFFFF]">Pipeline de Projetos</h1>
          <p className="font-mono-mm text-xs tracking-[0.08em] mt-1 text-[#CBD5E1]">
            {state.projects.length} PROJETOS · R$ {pipelineValue.toLocaleString('pt-BR')} EM PIPELINE · {avgProgress}% PROGRESSO MÉDIO
          </p>
        </div>
        <button
          onClick={() => setShowNewForm(true)}
          className="flex items-center justify-center gap-2 h-11 px-5 font-mono-mm text-xs tracking-[0.08em] font-semibold rounded-lg"
          style={{ background: '#C9A84C', color: '#080808' }}
        >
          <Plus size={16} />
          NOVO PROJETO
        </button>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por título, cliente ou tipo de serviço..."
            className="w-full h-11 pl-10 pr-4 font-display text-sm outline-none focus:border-[#C9A84C]"
            style={inputStyle}
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'urgent', 'normal', 'low'] as const).map(f => (
            <button
              key={f}
              onClick={() => setPriorityFilter(f)}
              className="h-11 px-4 font-mono-mm text-[10px] tracking-[0.06em] font-semibold rounded-lg transition-all"
              style={{
                background: priorityFilter === f ? 'rgba(201,168,76,0.2)' : '#111111',
                color: priorityFilter === f ? '#E5C158' : '#94A3B8',
                border: priorityFilter === f ? '1px solid rgba(201,168,76,0.5)' : '1px solid rgba(255,255,255,0.12)',
              }}
            >
              {f === 'all' ? 'TODAS' : PRIORITY_CONFIG[f].label}
            </button>
          ))}
        </div>
      </div>

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {COLUMNS.map(col => {
          const colProjects = filtered.filter(p => p.status === col.status)
          const colValue = colProjects.reduce((s, p) => s + (p.value || 0), 0)
          return (
            <div
              key={col.status}
              className="flex flex-col gap-3 p-4 bg-[#111111] border border-[rgba(255,255,255,0.12)] rounded-xl min-h-[450px]"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-[rgba(255,255,255,0.12)]">
                <div className="flex flex-col">
                  <span className="font-mono-mm text-xs font-semibold tracking-[0.08em] text-[#E5C158]">
                    {col.label}
                  </span>
                  <span className="font-mono-mm text-[10px] text-[#64748B]">
                    R$ {colValue.toLocaleString('pt-BR')}
                  </span>
                </div>
                <span className="w-5 h-5 rounded-full font-mono-mm text-[10px] font-bold flex items-center justify-center bg-[rgba(201,168,76,0.25)] text-[#E5C158]">
                  {colProjects.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex flex-col gap-3 flex-1">
                {colProjects.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center py-10 font-mono-mm text-xs text-[#94A3B8] border border-dashed border-[rgba(255,255,255,0.12)] rounded-lg">
                    Nenhum projeto
                  </div>
                ) : (
                  colProjects.map(p => {
                    const done = p.checklist.filter(c => c.done).length
                    const total = p.checklist.length
                    const priorityCfg = PRIORITY_CONFIG[p.priority]
                    const imgCount = p.images?.length ?? 0

                    return (
                      <div
                        key={p.id}
                        onClick={() => setSelectedProject(p)}
                        className="bg-[#161616] hover:bg-[#1C1C1C] border border-[rgba(255,255,255,0.12)] hover:border-[rgba(201,168,76,0.4)] rounded-lg flex flex-col transition-all cursor-pointer shadow-sm overflow-hidden"
                      >
                        {p.coverImageUrl && (
                          <div className="relative w-full shrink-0" style={{ aspectRatio: '16/7' }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={p.coverImageUrl} alt={p.title} className="absolute inset-0 h-full w-full object-cover" />
                          </div>
                        )}
                        <div className="p-4 flex flex-col gap-2.5">
                          <div className="flex items-center justify-between">
                            <span className="font-mono-mm text-[9px] px-2 py-0.5 font-semibold rounded" style={{ background: priorityCfg.bg, color: priorityCfg.color }}>
                              {priorityCfg.label}
                            </span>
                            <span className="font-mono-mm text-[10px] text-[#CBD5E1]">{p.serviceType}</span>
                          </div>

                          <div>
                            <p className="font-display font-semibold text-sm text-[#FFFFFF] leading-snug">{p.title}</p>
                            <p className="font-mono-mm text-xs text-[#CBD5E1] mt-0.5">{p.clientName}</p>
                          </div>

                          {total > 0 && (
                            <div>
                              <div className="w-full bg-[#222] h-1 rounded-full overflow-hidden mt-1">
                                <div className="bg-[#C9A84C] h-full" style={{ width: `${(done / total) * 100}%` }} />
                              </div>
                              <p className="font-mono-mm text-[10px] mt-1 text-[#CBD5E1]">{done}/{total} tarefas</p>
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-2 border-t border-[rgba(255,255,255,0.06)] font-mono-mm text-xs">
                            <span className="text-[#CBD5E1]">{p.dueDate}</span>
                            <span className="font-bold text-[#E5C158]">R$ {p.value.toLocaleString('pt-BR')}</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 font-mono-mm text-[10px] text-[#64748B]">
                              <span className="flex items-center gap-1">
                                <ImagePlus size={12} />
                                {imgCount}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageSquare size={12} />
                                {p.comments.length}
                              </span>
                            </div>
                            <button
                              onClick={e => { e.stopPropagation(); router.push(`/admin/projetos/${p.id}`) }}
                              className="flex items-center gap-1 font-mono-mm text-[10px] font-semibold text-[#E5C158] hover:text-white transition-colors"
                              title="Abrir página do projeto"
                            >
                              <ExternalLink size={12} />
                              ABRIR
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Project Sheet */}
      {selectedProject && (
        <ProjectSheet
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}

      {/* New Project Form */}
      {showNewForm && (
        <NewProjectForm onClose={() => setShowNewForm(false)} />
      )}
    </div>
  )
}
