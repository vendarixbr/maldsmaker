'use client'

import { useMemo } from 'react'
import { useAdmin } from '@/lib/admin-context'
import { TrendingUp, TrendingDown } from 'lucide-react'

const EVENT_COLORS: Record<string, string> = {
  Shoot:     '#C9A84C',
  Reunião:   '#5DADE2',
  Entrega:   '#52BE80',
  Aula:      '#BB8FCE',
  Workshop:  '#F1948A',
  Bloqueado: '#555',
}

const statusColors: Record<string, string> = {
  confirmed: '#1E8449',
  pending:   '#D4AC0D',
  cancelled: '#C0392B',
}

// Derive "confirmed" from event type — shoots + deliveries are confirmed, meetings pending
function eventConfirmed(type: string) {
  return type === 'Shoot' || type === 'Entrega' || type === 'Workshop' || type === 'Aula'
}

export function AdminDashboard() {
  const { state, setActiveSection } = useAdmin()
  const today = new Date()
  const dateStr = today.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })

  // Derived metrics
  const metrics = useMemo(() => {
    const activeClients = state.clients.filter(c => c.status === 'ATIVO').length
    const activeProjects = state.projects.length
    const pipeline = state.projects.reduce((s, p) => s + p.value, 0)
    const shootEvents = state.events.filter(e => e.type === 'Shoot').length
    return [
      { label: 'CLIENTES ATIVOS',         value: String(activeClients),                          delta: '+3',   up: true },
      { label: 'PROJETOS EM ANDAMENTO',    value: String(activeProjects),                         delta: '+2',   up: true },
      { label: 'VALOR EM PIPELINE',        value: `R$ ${pipeline.toLocaleString('pt-BR')}`,       delta: '+12%', up: true },
      { label: 'SHOOTS ESTE MÊS',          value: String(shootEvents),                            delta: '-2',   up: false },
    ]
  }, [state.clients, state.projects, state.events])

  // Upcoming events — next 10 sorted by date
  const upcomingEvents = useMemo(() => {
    return [...state.events]
      .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
      .slice(0, 8)
      .map(e => {
        const d = new Date(e.date + 'T12:00:00')
        const dayNum = String(d.getDate()).padStart(2, '0')
        const monthNames = ['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ']
        const dateLabel = `${dayNum} ${monthNames[d.getMonth()]}`
        return {
          id: e.id,
          date: dateLabel,
          client: e.clientName ?? e.title,
          service: e.type.toUpperCase(),
          time: e.endTime ? `${e.startTime} – ${e.endTime}` : e.startTime,
          status: eventConfirmed(e.type) ? 'confirmed' : 'pending',
          typeColor: EVENT_COLORS[e.type] ?? '#C9A84C',
        }
      })
  }, [state.events])

  // Kanban preview from live projects
  const kanbanPreview = useMemo(() => {
    const map: Record<string, string[]> = {
      'EM BRIEFING':    [],
      'EM PRODUÇÃO':    [],
      'ENTREGA':        [],
    }
    state.projects.forEach(p => {
      if (p.status === 'BRIEFING' || p.status === 'PRÉ-PRODUÇÃO') map['EM BRIEFING'].push(p.clientName)
      else if (p.status === 'PRODUÇÃO') map['EM PRODUÇÃO'].push(p.clientName)
      else if (p.status === 'ENTREGA') map['ENTREGA'].push(p.clientName)
    })
    return map
  }, [state.projects])

  // Recent activity from latest events + client data
  const recentActivity = useMemo(() => {
    return state.clients.slice(0, 5).map(c => ({
      initials: c.initials,
      name: c.name,
      action: c.history[0]?.title ?? c.lastProject,
      time: c.history[0]?.date ?? '—',
    }))
  }, [state.clients])

  return (
    <div className="flex flex-col gap-6">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-semibold text-2xl" style={{ color: '#F2F2F2' }}>
            Bom dia, Leo
          </h1>
          <p className="font-mono-mm text-[11px] tracking-[0.1em] mt-1 capitalize" style={{ color: '#555' }}>
            {dateStr}
          </p>
        </div>
        <button
          onClick={() => setActiveSection('projetos')}
          className="shrink-0 h-9 px-5 font-mono-mm text-[11px] tracking-[0.1em] transition-all duration-200"
          style={{ background: '#C9A84C', color: '#080808' }}
        >
          NOVA ENTRADA +
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {metrics.map(m => (
          <div
            key={m.label}
            className="flex flex-col gap-2 p-5"
            style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px' }}
          >
            <p className="font-mono-mm text-[10px] tracking-[0.1em]" style={{ color: '#C9A84C' }}>
              {m.label}
            </p>
            <p className="font-display font-bold text-3xl" style={{ color: '#F2F2F2' }}>
              {m.value}
            </p>
            <div className="flex items-center gap-1">
              {m.up ? (
                <TrendingUp size={11} style={{ color: '#1E8449' }} />
              ) : (
                <TrendingDown size={11} style={{ color: '#C0392B' }} />
              )}
              <span
                className="font-mono-mm text-[10px]"
                style={{ color: m.up ? '#1E8449' : '#C0392B' }}
              >
                {m.delta}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 60/40 split */}
      <div className="grid grid-cols-1 lg:grid-cols-[60%_38%] gap-4">

        {/* Upcoming schedules */}
        <div
          className="p-5 flex flex-col gap-4"
          style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px' }}
        >
          <div className="flex items-center justify-between">
            <p className="font-mono-mm text-[11px] tracking-[0.1em]" style={{ color: '#C9A84C' }}>
              PRÓXIMOS AGENDAMENTOS
            </p>
            <button
              onClick={() => setActiveSection('agenda')}
              className="font-mono-mm text-[10px]"
              style={{ color: '#555' }}
            >
              VER TODOS →
            </button>
          </div>

          <div className="flex flex-col gap-0">
            {upcomingEvents.length === 0 ? (
              <p className="font-mono-mm text-[11px]" style={{ color: '#333' }}>Nenhum evento agendado.</p>
            ) : upcomingEvents.map((item, i) => (
              <div
                key={item.id}
                className="flex items-center gap-4 py-3"
                style={{ borderBottom: i < upcomingEvents.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
              >
                {/* Date */}
                <div className="shrink-0 w-14 font-mono-mm text-[10px] tracking-[0.08em]" style={{ color: '#C9A84C' }}>
                  {item.date}
                </div>

                {/* Connector */}
                <div className="shrink-0 flex flex-col items-center self-stretch">
                  <div className="w-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
                  <div className="w-2 h-2 rounded-full my-1" style={{ background: statusColors[item.status] }} />
                  <div className="w-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="font-display font-medium text-sm truncate" style={{ color: '#F2F2F2' }}>
                    {item.client}
                  </p>
                  <p className="font-mono-mm text-[10px]" style={{ color: '#555' }}>
                    {item.service}
                  </p>
                </div>

                {/* Time pill */}
                <div
                  className="shrink-0 font-mono-mm text-[10px] px-2 py-1"
                  style={{
                    border: '1px solid rgba(201,168,76,0.3)',
                    color: '#C9A84C',
                    borderRadius: '999px',
                  }}
                >
                  {item.time}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — kanban + activity */}
        <div className="flex flex-col gap-4">

          {/* Kanban preview */}
          <div
            className="p-5 flex flex-col gap-4"
            style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px' }}
          >
            <div className="flex items-center justify-between">
              <p className="font-mono-mm text-[11px] tracking-[0.1em]" style={{ color: '#C9A84C' }}>
                PIPELINE DE PROJETOS
              </p>
              <button
                onClick={() => setActiveSection('projetos')}
                className="font-mono-mm text-[10px]"
                style={{ color: '#555' }}
              >
                VER TUDO →
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(kanbanPreview).map(([col, items]) => (
                <div key={col}>
                  <div className="flex items-center gap-1 mb-2">
                    <p className="font-mono-mm text-[9px] tracking-[0.06em]" style={{ color: '#555' }}>
                      {col}
                    </p>
                    <span
                      className="w-4 h-4 rounded-full flex items-center justify-center font-mono-mm text-[9px]"
                      style={{ background: 'rgba(201,168,76,0.15)', color: '#C9A84C' }}
                    >
                      {items.length}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    {items.length === 0 ? (
                      <div
                        className="px-2 py-1 font-display text-xs"
                        style={{ border: '1px dashed rgba(255,255,255,0.05)', borderRadius: '3px', color: '#333' }}
                      >
                        —
                      </div>
                    ) : items.map((name, idx) => (
                      <div
                        key={`${name}-${idx}`}
                        className="px-2 py-1 font-display text-xs truncate"
                        style={{
                          background: '#191919',
                          border: '1px solid rgba(255,255,255,0.05)',
                          borderRadius: '3px',
                          color: '#AAAAAA',
                        }}
                      >
                        {name}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent activity */}
          <div
            className="p-5 flex flex-col gap-3"
            style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px' }}
          >
            <p className="font-mono-mm text-[11px] tracking-[0.1em]" style={{ color: '#C9A84C' }}>
              ATIVIDADE RECENTE
            </p>
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div
                  className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-xs"
                  style={{ background: 'rgba(201,168,76,0.15)', color: '#C9A84C' }}
                >
                  {item.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display text-xs" style={{ color: '#AAAAAA', lineHeight: 1.4 }}>
                    {item.action}
                  </p>
                </div>
                <span className="font-mono-mm text-[10px] shrink-0" style={{ color: '#444' }}>
                  {item.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
