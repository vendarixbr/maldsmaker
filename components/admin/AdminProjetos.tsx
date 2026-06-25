'use client'

import { useState } from 'react'
import { useAdmin } from '@/lib/admin-context'
import type { Project, ProjectStatus, Priority } from '@/lib/data'
import { Plus, X, Check, Trash2 } from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Config                                                              */
/* ------------------------------------------------------------------ */

const COLUMNS: { status: ProjectStatus; label: string }[] = [
  { status: 'BRIEFING',       label: 'BRIEFING' },
  { status: 'PRÉ-PRODUÇÃO',   label: 'PRÉ-PROD.' },
  { status: 'PRODUÇÃO',       label: 'PRODUÇÃO' },
  { status: 'ENTREGA',        label: 'ENTREGA' },
]

const PRIORITY_CONFIG: Record<Priority, { color: string; label: string }> = {
  urgent: { color: '#C0392B', label: 'URGENTE' },
  normal: { color: '#D4AC0D', label: 'NORMAL' },
  low:    { color: '#555',    label: 'BAIXA' },
}

const SERVICE_TYPES = ['CLIPE MUSICAL', 'INSTITUCIONAL', 'FOTO/VÍDEO', 'CONTEÚDO', 'ENSAIO FOTOGRÁFICO', 'DRONE', 'EVENTO', 'OUTRO']

/* ------------------------------------------------------------------ */
/*  New Project Form                                                    */
/* ------------------------------------------------------------------ */

function NewProjectForm({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useAdmin()
  const [clientId, setClientId] = useState('')
  const [title, setTitle] = useState('')
  const [serviceType, setServiceType] = useState('CLIPE MUSICAL')
  const [dueDate, setDueDate] = useState('')
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

  const handleSave = () => {
    if (!title.trim() || !clientId) return
    const newProject: Project = {
      id: `p${Date.now()}`,
      clientId,
      clientName: selectedClient?.name ?? '',
      title: title.trim(),
      serviceType,
      dueDate: dueDate
        ? new Date(dueDate + 'T12:00:00').toLocaleDateString('pt-BR')
        : '—',
      priority,
      value: parseFloat(value.replace(/\D/g, '')) || 0,
      status,
      checklist,
      comments: [],
    }
    dispatch({ type: 'ADD_PROJECT', payload: newProject })
    onClose()
  }

  const inputStyle = {
    background: '#161616',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '6px',
    color: '#F2F2F2',
  }

  return (
    <>
      <div className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={onClose} />
      <div
        className="fixed top-1/2 left-1/2 z-50 flex flex-col gap-5 p-6 overflow-y-auto"
        style={{
          width: 'min(560px, 95vw)',
          maxHeight: '90vh',
          transform: 'translate(-50%, -50%)',
          background: '#0F0F0F',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px',
        }}
      >
        <div className="flex items-center justify-between">
          <p className="font-mono-mm text-[11px] tracking-[0.12em]" style={{ color: '#C9A84C' }}>NOVO PROJETO</p>
          <button onClick={onClose} style={{ color: '#555' }}><X size={18} /></button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Cliente */}
          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="font-mono-mm text-[10px] tracking-[0.08em]" style={{ color: '#555' }}>CLIENTE *</label>
            <select
              value={clientId}
              onChange={e => setClientId(e.target.value)}
              className="h-10 px-3 font-display text-sm outline-none"
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
            <label className="font-mono-mm text-[10px] tracking-[0.08em]" style={{ color: '#555' }}>TÍTULO DO PROJETO *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder='Ex: Clipe "Madrugada"' className="h-10 px-3 font-display text-sm outline-none" style={inputStyle} />
          </div>

          {/* Tipo de serviço */}
          <div className="flex flex-col gap-1">
            <label className="font-mono-mm text-[10px] tracking-[0.08em]" style={{ color: '#555' }}>TIPO DE SERVIÇO</label>
            <select value={serviceType} onChange={e => setServiceType(e.target.value)} className="h-10 px-3 font-display text-sm outline-none" style={inputStyle}>
              {SERVICE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Data de entrega */}
          <div className="flex flex-col gap-1">
            <label className="font-mono-mm text-[10px] tracking-[0.08em]" style={{ color: '#555' }}>DATA DE ENTREGA</label>
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="h-10 px-3 font-display text-sm outline-none" style={inputStyle} />
          </div>

          {/* Valor */}
          <div className="flex flex-col gap-1">
            <label className="font-mono-mm text-[10px] tracking-[0.08em]" style={{ color: '#555' }}>VALOR (R$)</label>
            <input type="number" value={value} onChange={e => setValue(e.target.value)} placeholder="0,00" min="0" className="h-10 px-3 font-display text-sm outline-none" style={inputStyle} />
          </div>

          {/* Etapa inicial */}
          <div className="flex flex-col gap-1">
            <label className="font-mono-mm text-[10px] tracking-[0.08em]" style={{ color: '#555' }}>ETAPA INICIAL</label>
            <select value={status} onChange={e => setStatus(e.target.value as ProjectStatus)} className="h-10 px-3 font-display text-sm outline-none" style={inputStyle}>
              {COLUMNS.map(col => <option key={col.status} value={col.status}>{col.label}</option>)}
            </select>
          </div>

          {/* Prioridade */}
          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="font-mono-mm text-[10px] tracking-[0.08em]" style={{ color: '#555' }}>PRIORIDADE</label>
            <div className="flex gap-2">
              {(Object.keys(PRIORITY_CONFIG) as Priority[]).map(p => {
                const cfg = PRIORITY_CONFIG[p]
                return (
                  <button
                    key={p}
                    onClick={() => setPriority(p)}
                    className="h-8 px-3 font-mono-mm text-[10px] tracking-[0.06em] transition-all"
                    style={{
                      background: priority === p ? cfg.color : 'transparent',
                      color: priority === p ? '#080808' : cfg.color,
                      border: `1px solid ${cfg.color}`,
                      borderRadius: '4px',
                      opacity: priority === p ? 1 : 0.6,
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
            <label className="font-mono-mm text-[10px] tracking-[0.08em]" style={{ color: '#555' }}>CHECKLIST</label>
            <div className="flex gap-2">
              <input
                value={checklistInput}
                onChange={e => setChecklistInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCheckItem()}
                placeholder="Adicionar item ao checklist..."
                className="flex-1 h-9 px-3 font-display text-sm outline-none"
                style={inputStyle}
              />
              <button onClick={addCheckItem} className="h-9 px-4 font-mono-mm text-[10px]" style={{ background: 'rgba(201,168,76,0.15)', color: '#C9A84C', borderRadius: '6px', border: '1px solid rgba(201,168,76,0.3)' }}>
                ADD
              </button>
            </div>
            {checklist.length > 0 && (
              <div className="flex flex-col gap-1.5 mt-1">
                {checklist.map((item, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2" style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px' }}>
                    <span className="font-display text-sm" style={{ color: '#AAAAAA' }}>{item.text}</span>
                    <button onClick={() => removeCheckItem(i)} style={{ color: '#333' }}>
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={!title.trim() || !clientId}
          className="h-10 font-mono-mm text-[11px] tracking-[0.1em] transition-opacity"
          style={{
            background: title.trim() && clientId ? '#C9A84C' : 'rgba(201,168,76,0.3)',
            color: '#080808',
            borderRadius: '6px',
            opacity: title.trim() && clientId ? 1 : 0.5,
          }}
        >
          CRIAR PROJETO
        </button>
      </div>
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  Project detail sheet                                                */
/* ------------------------------------------------------------------ */

function ProjectSheet({ projectId, onClose }: { projectId: string; onClose: () => void }) {
  const { state, dispatch } = useAdmin()
  const [commentInput, setCommentInput] = useState('')
  const p = state.projects.find(x => x.id === projectId)
  if (!p) return null

  const pri = PRIORITY_CONFIG[p.priority]
  const done = p.checklist.filter(i => i.done).length
  const pct = p.checklist.length > 0 ? Math.round((done / p.checklist.length) * 100) : 0

  const toggleCheck = (idx: number) => {
    const updated: Project = {
      ...p,
      checklist: p.checklist.map((item, i) => i === idx ? { ...item, done: !item.done } : item),
    }
    dispatch({ type: 'UPDATE_PROJECT', payload: updated })
  }

  const addComment = () => {
    if (!commentInput.trim()) return
    dispatch({ type: 'UPDATE_PROJECT', payload: { ...p, comments: [...p.comments, commentInput.trim()] } })
    setCommentInput('')
  }

  const moveStatus = (status: ProjectStatus) => {
    dispatch({ type: 'MOVE_PROJECT', id: p.id, status })
  }

  const deleteProject = () => {
    dispatch({ type: 'DELETE_PROJECT', id: p.id })
    onClose()
  }

  return (
    <>
      <div className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.65)' }} onClick={onClose} />
      <aside className="fixed right-0 top-0 h-full z-50 flex flex-col overflow-y-auto" style={{ width: 'min(480px, 100vw)', background: '#0F0F0F', borderLeft: '1px solid rgba(255,255,255,0.07)' }}>
        {/* Header */}
        <div className="flex items-start justify-between p-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono-mm text-[10px] px-2 py-0.5" style={{ background: `${pri.color}22`, color: pri.color, borderRadius: '3px' }}>{pri.label}</span>
              <span className="font-mono-mm text-[10px]" style={{ color: '#555' }}>{p.serviceType}</span>
            </div>
            <h2 className="font-display font-semibold text-lg" style={{ color: '#F2F2F2' }}>{p.title}</h2>
            <p className="font-mono-mm text-[11px] mt-1" style={{ color: '#555' }}>{p.clientName}</p>
          </div>
          <button onClick={onClose} style={{ color: '#555' }}><X size={20} /></button>
        </div>

        <div className="flex-1 p-6 flex flex-col gap-5">
          {/* Meta row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3" style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px' }}>
              <p className="font-mono-mm text-[10px]" style={{ color: '#555' }}>ENTREGA</p>
              <p className="font-display font-medium text-sm mt-1" style={{ color: '#F2F2F2' }}>{p.dueDate}</p>
            </div>
            <div className="p-3" style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px' }}>
              <p className="font-mono-mm text-[10px]" style={{ color: '#555' }}>VALOR</p>
              <p className="font-display font-semibold text-sm mt-1" style={{ color: '#C9A84C' }}>
                {p.value > 0 ? `R$ ${p.value.toLocaleString('pt-BR')}` : '—'}
              </p>
            </div>
          </div>

          {/* Progress + checklist */}
          <div className="p-4" style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px' }}>
            <div className="flex items-center justify-between mb-2">
              <p className="font-mono-mm text-[10px] tracking-[0.08em]" style={{ color: '#C9A84C' }}>CHECKLIST</p>
              <p className="font-mono-mm text-[10px]" style={{ color: '#555' }}>{done}/{p.checklist.length} — {pct}%</p>
            </div>
            {p.checklist.length > 0 && (
              <div className="h-1 rounded-full mb-4" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div className="h-1 rounded-full transition-all" style={{ width: `${pct}%`, background: '#C9A84C' }} />
              </div>
            )}
            <div className="flex flex-col gap-2">
              {p.checklist.length === 0 ? (
                <p className="font-mono-mm text-[11px]" style={{ color: '#444' }}>Sem itens no checklist.</p>
              ) : p.checklist.map((item, i) => (
                <button key={i} onClick={() => toggleCheck(i)} className="flex items-center gap-3 text-left">
                  <div
                    className="w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors"
                    style={{
                      background: item.done ? '#C9A84C' : 'transparent',
                      border: item.done ? '1px solid #C9A84C' : '1px solid rgba(255,255,255,0.15)',
                    }}
                  >
                    {item.done && <Check size={11} color="#080808" />}
                  </div>
                  <span
                    className="font-display text-sm"
                    style={{ color: item.done ? '#555' : '#AAAAAA', textDecoration: item.done ? 'line-through' : 'none' }}
                  >
                    {item.text}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Move stage */}
          <div className="p-4" style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px' }}>
            <p className="font-mono-mm text-[10px] tracking-[0.08em] mb-3" style={{ color: '#C9A84C' }}>MOVER ETAPA</p>
            <div className="flex gap-2 flex-wrap">
              {COLUMNS.map(col => (
                <button
                  key={col.status}
                  onClick={() => moveStatus(col.status)}
                  className="h-8 px-3 font-mono-mm text-[10px] tracking-[0.06em] transition-all"
                  style={{
                    background: p.status === col.status ? '#C9A84C' : '#111111',
                    color: p.status === col.status ? '#080808' : '#555',
                    border: '1px solid',
                    borderColor: p.status === col.status ? '#C9A84C' : 'rgba(255,255,255,0.07)',
                    borderRadius: '4px',
                  }}
                >
                  {col.label}
                </button>
              ))}
            </div>
          </div>

          {/* Comments */}
          <div className="p-4 flex flex-col gap-3" style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px' }}>
            <p className="font-mono-mm text-[10px] tracking-[0.08em]" style={{ color: '#C9A84C' }}>COMENTÁRIOS</p>
            {p.comments.length === 0 ? (
              <p className="font-mono-mm text-[11px]" style={{ color: '#444' }}>Nenhum comentário ainda.</p>
            ) : p.comments.map((c, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: '#C9A84C' }} />
                <p className="font-display text-sm" style={{ color: '#AAAAAA', lineHeight: 1.5 }}>{c}</p>
              </div>
            ))}
            <div className="flex gap-2">
              <input
                value={commentInput}
                onChange={e => setCommentInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addComment()}
                placeholder="Adicionar comentário..."
                className="flex-1 h-9 px-3 font-display text-sm outline-none"
                style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#F2F2F2' }}
              />
              <button onClick={addComment} className="h-9 px-4 font-mono-mm text-[10px] tracking-[0.08em]" style={{ background: '#C9A84C', color: '#080808', borderRadius: '6px' }}>
                ADD
              </button>
            </div>
          </div>

          {/* Delete */}
          <button
            onClick={deleteProject}
            className="flex items-center gap-2 self-start font-mono-mm text-[11px] tracking-[0.08em] transition-opacity mt-2"
            style={{ color: '#C0392B', opacity: 0.6 }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '0.6')}
          >
            <Trash2 size={12} />
            REMOVER PROJETO
          </button>
        </div>
      </aside>
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  Kanban card                                                         */
/* ------------------------------------------------------------------ */

function KanbanCard({ project, onClick }: { project: Project; onClick: () => void }) {
  const done = project.checklist.filter(i => i.done).length
  const total = project.checklist.length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  const pri = PRIORITY_CONFIG[project.priority]

  return (
    <button
      onClick={onClick}
      className="w-full text-left flex flex-col gap-3 p-3 transition-all"
      style={{ background: '#131313', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px' }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(201,168,76,0.3)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-display font-medium text-sm leading-snug" style={{ color: '#F2F2F2' }}>{project.title}</p>
        <span className="font-mono-mm text-[9px] px-1.5 py-0.5 shrink-0" style={{ background: `${pri.color}22`, color: pri.color, borderRadius: '3px' }}>
          {pri.label}
        </span>
      </div>
      <p className="font-mono-mm text-[10px]" style={{ color: '#555' }}>{project.clientName}</p>
      {total > 0 && (
        <div>
          <div className="h-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div className="h-0.5 rounded-full" style={{ width: `${pct}%`, background: '#C9A84C' }} />
          </div>
          <p className="font-mono-mm text-[9px] mt-1" style={{ color: '#444' }}>{done}/{total} tarefas</p>
        </div>
      )}
      <div className="flex items-center justify-between">
        <span className="font-display text-xs font-semibold" style={{ color: '#C9A84C' }}>
          {project.value > 0 ? `R$ ${project.value.toLocaleString('pt-BR')}` : '—'}
        </span>
        <span className="font-mono-mm text-[9px]" style={{ color: '#444' }}>{project.dueDate}</span>
      </div>
    </button>
  )
}

/* ------------------------------------------------------------------ */
/*  Main board                                                          */
/* ------------------------------------------------------------------ */

export function AdminProjetos() {
  const { state } = useAdmin()
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)

  const totalPipeline = state.projects.reduce((s, p) => s + p.value, 0)

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-semibold text-2xl" style={{ color: '#F2F2F2' }}>Projetos</h1>
          <p className="font-mono-mm text-[11px] tracking-[0.08em] mt-1" style={{ color: '#555' }}>
            {state.projects.length} PROJETOS &nbsp;·&nbsp; R$ {totalPipeline.toLocaleString('pt-BR')} EM PIPELINE
          </p>
        </div>
        <button
          onClick={() => setShowNewForm(true)}
          className="shrink-0 flex items-center gap-2 h-9 px-5 font-mono-mm text-[11px] tracking-[0.1em]"
          style={{ background: '#C9A84C', color: '#080808' }}
        >
          <Plus size={14} />
          NOVO PROJETO
        </button>
      </div>

      {/* Kanban board */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {COLUMNS.map(col => {
          const colProjects = state.projects.filter(p => p.status === col.status)
          return (
            <div key={col.status} className="flex flex-col gap-3">
              {/* Column header */}
              <div
                className="flex items-center justify-between px-3 py-2"
                style={{ background: '#0D0D0D', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px' }}
              >
                <span className="font-mono-mm text-[10px] tracking-[0.1em]" style={{ color: '#C9A84C' }}>{col.label}</span>
                <span
                  className="w-5 h-5 flex items-center justify-center font-mono-mm text-[10px] rounded-full"
                  style={{ background: 'rgba(201,168,76,0.15)', color: '#C9A84C' }}
                >
                  {colProjects.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex flex-col gap-2 min-h-[120px]">
                {colProjects.length === 0 ? (
                  <div
                    className="flex-1 flex items-center justify-center h-20 font-mono-mm text-[10px]"
                    style={{ border: '1px dashed rgba(255,255,255,0.05)', borderRadius: '8px', color: '#333' }}
                  >
                    VAZIO
                  </div>
                ) : colProjects.map(p => (
                  <KanbanCard key={p.id} project={p} onClick={() => setSelectedProjectId(p.id)} />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {selectedProjectId && (
        <ProjectSheet
          projectId={selectedProjectId}
          onClose={() => setSelectedProjectId(null)}
        />
      )}

      {showNewForm && (
        <NewProjectForm onClose={() => setShowNewForm(false)} />
      )}
    </div>
  )
}
