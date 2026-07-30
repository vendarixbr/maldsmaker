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

const PRIORITY_CONFIG: Record<Priority, { color: string; bg: string; label: string }> = {
  urgent: { color: '#F87171', bg: 'rgba(248,113,113,0.15)', label: 'URGENTE' },
  normal: { color: '#FACC15', bg: 'rgba(250,204,21,0.15)',  label: 'NORMAL' },
  low:    { color: '#94A3B8', bg: 'rgba(148,163,184,0.15)', label: 'BAIXA' },
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
    border: '1px solid rgba(255,255,255,0.16)',
    borderRadius: '6px',
    color: '#F9FAFB',
  }

  return (
    <>
      <div className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.75)' }} onClick={onClose} />
      <div
        className="fixed top-1/2 left-1/2 z-50 flex flex-col gap-5 p-6 overflow-y-auto"
        style={{
          width: 'min(560px, 95vw)',
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

          {/* Tipo de serviço */}
          <div className="flex flex-col gap-1">
            <label className="font-mono-mm text-[10px] tracking-[0.08em] font-semibold" style={{ color: '#CBD5E1' }}>TIPO DE SERVIÇO</label>
            <select value={serviceType} onChange={e => setServiceType(e.target.value)} className="h-10 px-3 font-display text-sm outline-none focus:border-[#C9A84C]" style={inputStyle}>
              {SERVICE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
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

        <button
          type="button"
          onClick={handleSave}
          disabled={!title.trim() || !clientId}
          className="h-11 font-mono-mm text-[11px] tracking-[0.1em] font-semibold transition-opacity mt-2"
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
/*  Project Sheet Detail                                                */
/* ------------------------------------------------------------------ */

function ProjectSheet({ project, onClose }: { project: Project; onClose: () => void }) {
  const { dispatch } = useAdmin()
  const p = project

  const toggleItem = (idx: number) => {
    const updated = p.checklist.map((item, i) => i === idx ? { ...item, done: !item.done } : item)
    dispatch({ type: 'UPDATE_PROJECT', payload: { ...p, checklist: updated } })
  }

  const moveStatus = (newStatus: ProjectStatus) => {
    dispatch({ type: 'MOVE_PROJECT', id: p.id, status: newStatus })
  }

  const done = p.checklist.filter(c => c.done).length
  const pct = p.checklist.length > 0 ? Math.round((done / p.checklist.length) * 100) : 0
  const priorityCfg = PRIORITY_CONFIG[p.priority]

  return (
    <>
      <div className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.75)' }} onClick={onClose} />
      <aside
        className="fixed right-0 top-0 h-full z-50 flex flex-col overflow-y-auto"
        style={{ width: 'min(460px, 100vw)', background: '#0F0F0F', borderLeft: '1px solid rgba(255,255,255,0.12)' }}
      >
        <div className="p-6 flex items-start justify-between border-b border-[rgba(255,255,255,0.12)]">
          <div>
            <div className="flex items-center gap-2 mb-2">
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
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-lg bg-[#161616] border border-[rgba(255,255,255,0.08)]">
              <p className="font-mono-mm text-[10px] font-semibold text-[#CBD5E1]">ENTREGA</p>
              <p className="font-display font-semibold text-sm text-[#F3F4F6] mt-1">{p.dueDate}</p>
            </div>
            <div className="p-3.5 rounded-lg bg-[#161616] border border-[rgba(255,255,255,0.08)]">
              <p className="font-mono-mm text-[10px] font-semibold text-[#CBD5E1]">VALOR</p>
              <p className="font-display font-bold text-sm text-[#E5C158] mt-1">R$ {p.value.toLocaleString('pt-BR')}</p>
            </div>
          </div>

          {/* Checklist */}
          {p.checklist.length > 0 && (
            <div className="p-4 rounded-lg bg-[#161616] border border-[rgba(255,255,255,0.08)]">
              <div className="flex items-center justify-between mb-3">
                <p className="font-mono-mm text-[10px] font-semibold text-[#CBD5E1]">CHECKLIST DE ETAPAS</p>
                <p className="font-mono-mm text-[10px] font-semibold text-[#E5C158]">{done}/{p.checklist.length} — {pct}%</p>
              </div>
              <div className="w-full bg-[#222] h-1.5 rounded-full overflow-hidden mb-3">
                <div className="bg-[#C9A84C] h-full transition-all duration-300" style={{ width: `${pct}%` }} />
              </div>
              <div className="flex flex-col gap-2">
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
            </div>
          )}

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
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-semibold text-2xl text-[#FFFFFF]">Pipeline de Projetos</h1>
          <p className="font-mono-mm text-xs tracking-[0.08em] mt-1 text-[#CBD5E1]">
            {state.projects.length} PROJETOS EM ANDAMENTO
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

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {COLUMNS.map(col => {
          const colProjects = state.projects.filter(p => p.status === col.status)
          return (
            <div
              key={col.status}
              className="flex flex-col gap-3 p-4 bg-[#111111] border border-[rgba(255,255,255,0.12)] rounded-xl min-h-[450px]"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-[rgba(255,255,255,0.12)]">
                <span className="font-mono-mm text-xs font-semibold tracking-[0.08em] text-[#E5C158]">
                  {col.label}
                </span>
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

                    return (
                      <div
                        key={p.id}
                        onClick={() => setSelectedProject(p)}
                        className="p-4 bg-[#161616] hover:bg-[#1C1C1C] border border-[rgba(255,255,255,0.12)] hover:border-[rgba(201,168,76,0.4)] rounded-lg flex flex-col gap-2.5 transition-all cursor-pointer shadow-sm"
                      >
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
