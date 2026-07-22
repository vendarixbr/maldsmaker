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

  // Derived metrics — deltas are only shown where they can be computed from real data
  const metrics = useMemo(() => {
    const activeClients = state.clients.filter(c => c.status === 'ATIVO').length
    const activeProjects = state.projects.length
    const pipeline = state.projects.reduce((s, p) => s + p.value, 0)

    const now = new Date()
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const prevMonthKey = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, '0')}`
    const shootsThisMonth = state.events.filter(e => e.type === 'Shoot' && e.date.startsWith(currentMonthKey)).length
    const shootsPrevMonth = state.events.filter(e => e.type === 'Shoot' && e.date.startsWith(prevMonthKey)).length
    const shootsDelta = shootsThisMonth - shootsPrevMonth

    return [
      { label: 'CLIENTES ATIVOS',         value: String(activeClients) },
      { label: 'PROJETOS EM ANDAMENTO',    value: String(activeProjects) },
      { label: 'VALOR EM PIPELINE',        value: `R$ ${pipeline.toLocaleString('pt-BR')}` },
      {
        label: 'SHOOTS ESTE MÊS',
        value: String(shootsThisMonth),
        delta: shootsDelta === 0 ? undefined : `${shootsDelta > 0 ? '+' : ''}${shootsDelta} vs mês ant.`,
        up: shootsDelta >= 0,
      },
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
          <h1 className="font-display font-semibold text-2xl text-[#F2F2F2]">
            Bom dia, Leo
          </h1>
          <p className="font-mono-mm text-xs tracking-[0.1em] mt-1 capitalize text-[#A0A0A0]">
            {dateStr}
          </p>
        </div>
        <button
          onClick={() => setActiveSection('projetos')}
          className="shrink-0 h-11 px-5 font-mono-mm text-xs tracking-[0.1em] transition-all duration-200 rounded-lg flex items-center justify-center font-semibold outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080808]"
          style={{ background: '#C9A84C', color: '#080808' }}
        >
          NOVA ENTRADA +
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {metrics.map(m => (
          <div
            key={m.label}
            className="flex flex-col gap-2 p-5"
            style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }}
          >
            <p className="font-mono-mm text-xs tracking-[0.1em] font-medium" style={{ color: '#C9A84C' }}>
              {m.label}
            </p>
            <p className="font-display font-bold text-3xl text-[#F2F2F2]">
              {m.value}
            </p>
            {m.delta && (
              <div className="flex items-center gap-1">
                {m.up ? (
                  <TrendingUp size={13} style={{ color: '#52BE80' }} />
                ) : (
                  <TrendingDown size={13} style={{ color: '#F1948A' }} />
                )}
                <span
                  className="font-mono-mm text-xs font-medium"
                  style={{ color: m.up ? '#52BE80' : '#F1948A' }}
                >
                  {m.delta}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Main split view */}
      <div className="grid grid-cols-1 lg:grid-cols-[60%_38%] gap-4">

        {/* Upcoming schedules */}
        <div
          className="p-4 sm:p-5 flex flex-col gap-4"
          style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }}
        >
          <div className="flex items-center justify-between">
            <p className="font-mono-mm text-xs tracking-[0.12em] font-semibold" style={{ color: '#C9A84C' }}>
              PRÓXIMOS AGENDAMENTOS
            </p>
            <button
              onClick={() => setActiveSection('agenda')}
              className="font-mono-mm text-xs text-[#A0A0A0] hover:text-[#C9A84C] transition-colors p-1.5 rounded focus-visible:ring-2 focus-visible:ring-[#C9A84C] outline-none"
            >
              VER TODOS →
            </button>
          </div>

          <div className="flex flex-col gap-0">
            {upcomingEvents.length === 0 ? (
              <p className="font-mono-mm text-xs text-[#888] py-4">Nenhum evento agendado.</p>
            ) : upcomingEvents.map((item, i) => (
              <div
                key={item.id}
                className="flex items-center gap-3 sm:gap-4 py-3"
                style={{ borderBottom: i < upcomingEvents.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}
              >
                {/* Date */}
                <div className="shrink-0 w-14 font-mono-mm text-xs font-medium tracking-[0.08em]" style={{ color: '#C9A84C' }}>
                  {item.date}
                </div>

                {/* Connector */}
                <div className="shrink-0 flex flex-col items-center self-stretch">
                  <div className="w-px flex-1" style={{ background: 'rgba(255,255,255,0.08)' }} />
                  <div className="w-2.5 h-2.5 rounded-full my-1" style={{ background: statusColors[item.status] }} />
                  <div className="w-px flex-1" style={{ background: 'rgba(255,255,255,0.08)' }} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="font-display font-medium text-sm truncate text-[#F2F2F2]">
                    {item.client}
                  </p>
                  <p className="font-mono-mm text-xs text-[#A0A0A0]">
                    {item.service}
                  </p>
                </div>

                {/* Time pill */}
                <div
                  className="shrink-0 font-mono-mm text-[11px] px-2.5 py-1 font-medium"
                  style={{
                    border: '1px solid rgba(201,168,76,0.4)',
                    color: '#C9A84C',
                    borderRadius: '999px',
                    background: 'rgba(201,168,76,0.06)',
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
            className="p-4 sm:p-5 flex flex-col gap-4"
            style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }}
          >
            <div className="flex items-center justify-between">
              <p className="font-mono-mm text-xs tracking-[0.12em] font-semibold" style={{ color: '#C9A84C' }}>
                PIPELINE DE PROJETOS
              </p>
              <button
                onClick={() => setActiveSection('projetos')}
                className="font-mono-mm text-xs text-[#A0A0A0] hover:text-[#C9A84C] transition-colors p-1.5 rounded focus-visible:ring-2 focus-visible:ring-[#C9A84C] outline-none"
              >
                VER TUDO →
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(kanbanPreview).map(([col, items]) => (
                <div key={col}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <p className="font-mono-mm text-[10px] font-semibold tracking-[0.06em] text-[#A0A0A0] truncate">
                      {col}
                    </p>
                    <span
                      className="w-4 h-4 rounded-full flex items-center justify-center font-mono-mm text-[10px] font-bold shrink-0"
                      style={{ background: 'rgba(201,168,76,0.2)', color: '#C9A84C' }}
                    >
                      {items.length}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    {items.length === 0 ? (
                      <div
                        className="px-2 py-1.5 font-display text-xs text-[#666]"
                        style={{ border: '1px dashed rgba(255,255,255,0.08)', borderRadius: '4px' }}
                      >
                        —
                      </div>
                    ) : items.map((name, idx) => (
                      <div
                        key={`${name}-${idx}`}
                        className="px-2 py-1.5 font-display text-xs truncate"
                        style={{
                          background: '#191919',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '4px',
                          color: '#E0E0E0',
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
            className="p-4 sm:p-5 flex flex-col gap-3"
            style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }}
          >
            <p className="font-mono-mm text-xs tracking-[0.12em] font-semibold" style={{ color: '#C9A84C' }}>
              ATIVIDADE RECENTE
            </p>
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-start gap-3 py-1">
                <div
                  className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-xs"
                  style={{ background: 'rgba(201,168,76,0.2)', color: '#C9A84C' }}
                >
                  {item.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display text-xs text-[#E0E0E0]" style={{ lineHeight: 1.4 }}>
                    {item.action}
                  </p>
                </div>
                <span className="font-mono-mm text-[10px] text-[#A0A0A0] shrink-0 font-medium">
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
