'use client'

import { useState, useMemo } from 'react'
import { useAdmin } from '@/lib/admin-context'
import type { CalendarEvent, EventType } from '@/lib/data'
import { ChevronLeft, ChevronRight, Plus, X, Clock, MapPin, User, DollarSign, Trash2 } from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Config                                                              */
/* ------------------------------------------------------------------ */

const EVENT_COLORS: Record<EventType, { bg: string; color: string; dot: string }> = {
  Shoot:      { bg: 'rgba(201,168,76,0.15)',  color: '#C9A84C', dot: '#C9A84C' },
  Reunião:    { bg: 'rgba(36,113,163,0.15)',  color: '#5DADE2', dot: '#5DADE2' },
  Entrega:    { bg: 'rgba(30,132,73,0.15)',   color: '#52BE80', dot: '#52BE80' },
  Aula:       { bg: 'rgba(155,89,182,0.15)',  color: '#BB8FCE', dot: '#BB8FCE' },
  Workshop:   { bg: 'rgba(231,76,60,0.15)',   color: '#F1948A', dot: '#F1948A' },
  Bloqueado:  { bg: 'rgba(85,85,85,0.2)',     color: '#777',    dot: '#555' },
}

const EVENT_TYPES: EventType[] = ['Shoot', 'Reunião', 'Entrega', 'Aula', 'Workshop', 'Bloqueado']
const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

/* ------------------------------------------------------------------ */
/*  New Event Form                                                      */
/* ------------------------------------------------------------------ */

function NewEventForm({ onClose, defaultDate }: { onClose: () => void; defaultDate?: string }) {
  const { state, dispatch } = useAdmin()
  const [title, setTitle] = useState('')
  const [type, setType] = useState<EventType>('Shoot')
  const [clientId, setClientId] = useState('')
  const [date, setDate] = useState(defaultDate ?? new Date().toISOString().split('T')[0])
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('18:00')
  const [location, setLocation] = useState('')
  const [value, setValue] = useState('')
  const [notes, setNotes] = useState('')

  const handleSave = () => {
    if (!title.trim() || !date) return
    const selectedClient = state.clients.find(c => c.id === clientId)
    const newEvent: CalendarEvent = {
      id: `e${Date.now()}`,
      title: title.trim(),
      type,
      clientName: selectedClient?.name,
      date,
      startTime,
      endTime: endTime || '',
      location: location.trim() || 'A definir',
      value: parseFloat(value) || undefined,
      notes: notes.trim() || undefined,
    }
    dispatch({ type: 'ADD_EVENT', payload: newEvent })
    onClose()
  }

  const cfg = EVENT_COLORS[type]

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
          width: 'min(520px, 95vw)',
          maxHeight: '90vh',
          transform: 'translate(-50%, -50%)',
          background: '#0F0F0F',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px',
        }}
      >
        <div className="flex items-center justify-between">
          <p className="font-mono-mm text-[11px] tracking-[0.12em]" style={{ color: '#C9A84C' }}>NOVO EVENTO</p>
          <button onClick={onClose} style={{ color: '#555' }}><X size={18} /></button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Título */}
          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="font-mono-mm text-[10px] tracking-[0.08em]" style={{ color: '#555' }}>TÍTULO *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Shoot Clipe MC Vitão" className="h-10 px-3 font-display text-sm outline-none" style={inputStyle} />
          </div>

          {/* Tipo */}
          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="font-mono-mm text-[10px] tracking-[0.08em]" style={{ color: '#555' }}>TIPO</label>
            <div className="flex gap-2 flex-wrap">
              {EVENT_TYPES.map(t => {
                const c = EVENT_COLORS[t]
                return (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className="h-8 px-3 font-mono-mm text-[10px] tracking-[0.06em] transition-all"
                    style={{
                      background: type === t ? c.color : 'transparent',
                      color: type === t ? '#080808' : c.color,
                      border: `1px solid ${c.color}`,
                      borderRadius: '4px',
                      opacity: type === t ? 1 : 0.6,
                    }}
                  >
                    {t.toUpperCase()}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Cliente */}
          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="font-mono-mm text-[10px] tracking-[0.08em]" style={{ color: '#555' }}>CLIENTE (OPCIONAL)</label>
            <select value={clientId} onChange={e => setClientId(e.target.value)} className="h-10 px-3 font-display text-sm outline-none" style={inputStyle}>
              <option value="">Sem cliente</option>
              {state.clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* Data */}
          <div className="flex flex-col gap-1">
            <label className="font-mono-mm text-[10px] tracking-[0.08em]" style={{ color: '#555' }}>DATA *</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="h-10 px-3 font-display text-sm outline-none" style={inputStyle} />
          </div>

          {/* Local */}
          <div className="flex flex-col gap-1">
            <label className="font-mono-mm text-[10px] tracking-[0.08em]" style={{ color: '#555' }}>LOCAL</label>
            <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Nauta Estúdio, Externo..." className="h-10 px-3 font-display text-sm outline-none" style={inputStyle} />
          </div>

          {/* Horários */}
          <div className="flex flex-col gap-1">
            <label className="font-mono-mm text-[10px] tracking-[0.08em]" style={{ color: '#555' }}>INÍCIO</label>
            <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="h-10 px-3 font-display text-sm outline-none" style={inputStyle} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-mono-mm text-[10px] tracking-[0.08em]" style={{ color: '#555' }}>FIM</label>
            <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="h-10 px-3 font-display text-sm outline-none" style={inputStyle} />
          </div>

          {/* Valor */}
          <div className="flex flex-col gap-1">
            <label className="font-mono-mm text-[10px] tracking-[0.08em]" style={{ color: '#555' }}>VALOR (R$)</label>
            <input type="number" value={value} onChange={e => setValue(e.target.value)} placeholder="0" min="0" className="h-10 px-3 font-display text-sm outline-none" style={inputStyle} />
          </div>

          {/* Notas */}
          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="font-mono-mm text-[10px] tracking-[0.08em]" style={{ color: '#555' }}>NOTAS</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Observações, equipamentos, etc." rows={3} className="px-3 py-2 font-display text-sm outline-none resize-none" style={inputStyle} />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={!title.trim() || !date}
          className="h-10 font-mono-mm text-[11px] tracking-[0.1em] transition-opacity"
          style={{
            background: title.trim() && date ? cfg.color : 'rgba(201,168,76,0.3)',
            color: '#080808',
            borderRadius: '6px',
            opacity: title.trim() && date ? 1 : 0.5,
          }}
        >
          CRIAR EVENTO
        </button>
      </div>
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  Event detail sheet                                                  */
/* ------------------------------------------------------------------ */

function EventSheet({ event, onClose }: { event: CalendarEvent; onClose: () => void }) {
  const { dispatch } = useAdmin()
  const cfg = EVENT_COLORS[event.type]

  return (
    <>
      <div className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.65)' }} onClick={onClose} />
      <aside className="fixed right-0 top-0 h-full z-50 flex flex-col overflow-y-auto" style={{ width: 'min(420px, 100vw)', background: '#0F0F0F', borderLeft: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-start justify-between p-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div>
            <span className="inline-block font-mono-mm text-[10px] px-2 py-0.5 mb-2" style={{ background: cfg.bg, color: cfg.color, borderRadius: '3px' }}>
              {event.type.toUpperCase()}
            </span>
            <h2 className="font-display font-semibold text-lg" style={{ color: '#F2F2F2' }}>{event.title}</h2>
          </div>
          <button onClick={onClose} style={{ color: '#555' }}><X size={20} /></button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          {[
            { Icon: Clock,      label: 'HORÁRIO',  value: `${event.startTime}${event.endTime ? ` – ${event.endTime}` : ''}` },
            { Icon: MapPin,     label: 'LOCAL',    value: event.location },
            ...(event.clientName ? [{ Icon: User,        label: 'CLIENTE', value: event.clientName }] : []),
            ...(event.value      ? [{ Icon: DollarSign,  label: 'VALOR',   value: `R$ ${event.value.toLocaleString('pt-BR')}` }] : []),
          ].map(({ Icon, label, value }) => (
            <div key={label} className="flex items-center gap-4 p-4" style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px' }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: cfg.bg, color: cfg.color }}>
                <Icon size={14} />
              </div>
              <div>
                <p className="font-mono-mm text-[10px]" style={{ color: '#555' }}>{label}</p>
                <p className="font-display text-sm mt-0.5" style={{ color: '#F2F2F2' }}>{value}</p>
              </div>
            </div>
          ))}

          {event.notes && (
            <div className="p-4" style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px' }}>
              <p className="font-mono-mm text-[10px] mb-2" style={{ color: '#555' }}>NOTAS</p>
              <p className="font-display text-sm" style={{ color: '#AAAAAA', lineHeight: 1.6 }}>{event.notes}</p>
            </div>
          )}

          <button
            onClick={() => { dispatch({ type: 'DELETE_EVENT', id: event.id }); onClose() }}
            className="flex items-center gap-2 font-mono-mm text-[11px] tracking-[0.08em] self-start mt-2 transition-opacity"
            style={{ color: '#C0392B', opacity: 0.7 }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '0.7')}
          >
            <Trash2 size={12} />
            REMOVER EVENTO
          </button>
        </div>
      </aside>
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  Main agenda                                                         */
/* ------------------------------------------------------------------ */

export function AdminAgenda() {
  const { state } = useAdmin()
  const [currentDate, setCurrentDate] = useState(new Date(2025, 0, 1))
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [view, setView] = useState<'month' | 'list'>('month')
  const [showNewForm, setShowNewForm] = useState(false)
  const [newFormDate, setNewFormDate] = useState<string | undefined>()

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const calendarDays = useMemo(() => {
    const days: (number | null)[] = []
    for (let i = 0; i < firstDayOfMonth; i++) days.push(null)
    for (let d = 1; d <= daysInMonth; d++) days.push(d)
    return days
  }, [firstDayOfMonth, daysInMonth])

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return state.events.filter(e => e.date === dateStr)
  }

  const monthEvents = useMemo(() =>
    state.events
      .filter(e => e.date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`))
      .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime)),
    [state.events, year, month]
  )

  const openNewForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    setNewFormDate(dateStr)
    setShowNewForm(true)
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-semibold text-2xl text-[#F2F2F2]">Agenda</h1>
          <p className="font-mono-mm text-xs tracking-[0.08em] mt-1 text-[#A0A0A0]">
            {monthEvents.length} EVENTOS EM {MONTHS[month].toUpperCase()} {year}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex" style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }}>
            {(['month', 'list'] as const).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className="h-11 px-4 font-mono-mm text-xs tracking-[0.08em] font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C]"
                style={{ background: view === v ? '#C9A84C' : 'transparent', color: view === v ? '#080808' : '#A0A0A0', borderRadius: '7px' }}
              >
                {v === 'month' ? 'MÊS' : 'LISTA'}
              </button>
            ))}
          </div>
          <button
            onClick={() => { setNewFormDate(undefined); setShowNewForm(true) }}
            className="flex items-center justify-center gap-2 h-11 px-4 font-mono-mm text-xs tracking-[0.08em] font-semibold outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080808]"
            style={{ background: '#C9A84C', color: '#080808', borderRadius: '8px' }}
          >
            <Plus size={16} />
            NOVO EVENTO
          </button>
        </div>
      </div>

      {/* Month nav */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
          className="w-11 h-11 flex items-center justify-center transition-colors text-[#E0E0E0] hover:text-[#C9A84C] outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C]"
          style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }}
          aria-label="Mês anterior"
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className="font-display font-semibold text-lg text-[#F2F2F2]">
          {MONTHS[month]} {year}
        </h2>
        <button
          onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
          className="w-11 h-11 flex items-center justify-center transition-colors text-[#E0E0E0] hover:text-[#C9A84C] outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C]"
          style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }}
          aria-label="Próximo mês"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Month view */}
      {view === 'month' && (
        <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', overflow: 'hidden' }}>
          <div className="grid grid-cols-7">
            {WEEKDAYS.map(d => (
              <div key={d} className="h-10 flex items-center justify-center font-mono-mm text-xs font-semibold text-[#A0A0A0]"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: '#0D0D0D' }}>
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {calendarDays.map((day, idx) => {
              const events = day ? getEventsForDay(day) : []
              const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear()
              return (
                <div
                  key={idx}
                  className="min-h-[72px] sm:min-h-[90px] p-1.5 flex flex-col gap-1 group"
                  style={{
                    borderRight: (idx + 1) % 7 !== 0 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                    borderBottom: idx < calendarDays.length - 7 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                    background: day ? 'transparent' : 'rgba(0,0,0,0.2)',
                  }}
                >
                  {day && (
                    <>
                      <div className="flex items-center justify-between">
                        <span
                          className="w-6 h-6 flex items-center justify-center font-mono-mm text-xs font-bold rounded-full"
                          style={{
                            background: isToday ? '#C9A84C' : 'transparent',
                            color: isToday ? '#080808' : '#A0A0A0',
                          }}
                        >
                          {day}
                        </span>
                        <button
                          onClick={() => openNewForDay(day)}
                          className="w-6 h-6 flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity text-[#C9A84C] outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C] rounded"
                          aria-label={`Adicionar evento dia ${day}`}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      {events.slice(0, 2).map(e => {
                        const cfg = EVENT_COLORS[e.type]
                        return (
                          <button
                            key={e.id}
                            onClick={() => setSelectedEvent(e)}
                            className="w-full text-left px-1.5 py-1 truncate font-display text-[11px] font-medium transition-opacity outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C]"
                            style={{ background: cfg.bg, color: cfg.color, borderRadius: '4px' }}
                            onMouseEnter={el => (el.currentTarget.style.opacity = '0.8')}
                            onMouseLeave={el => (el.currentTarget.style.opacity = '1')}
                          >
                            {e.title}
                          </button>
                        )
                      })}
                      {events.length > 2 && (
                        <span className="font-mono-mm text-[10px] px-1 font-semibold text-[#A0A0A0]">
                          +{events.length - 2} mais
                        </span>
                      )}
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* List view */}
      {view === 'list' && (
        <div className="flex flex-col gap-2.5">
          {monthEvents.length === 0 ? (
            <p className="font-mono-mm text-xs py-8 text-center text-[#888]">
              Nenhum evento este mês.
            </p>
          ) : monthEvents.map(event => {
            const cfg = EVENT_COLORS[event.type]
            const d = new Date(event.date + 'T12:00:00')
            const dayNum = d.getDate()
            const dayName = WEEKDAYS[d.getDay()]
            return (
              <button
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                className="w-full flex items-center gap-3 sm:gap-4 p-4 text-left transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C]"
                style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(201,168,76,0.3)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
              >
                <div className="shrink-0 w-12 text-center">
                  <p className="font-mono-mm text-xs text-[#A0A0A0] font-medium">{dayName}</p>
                  <p className="font-display font-bold text-xl text-[#C9A84C]">{dayNum}</p>
                </div>
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: cfg.dot }} />
                <div className="flex-1 min-w-0">
                  <p className="font-display font-medium text-sm text-[#F2F2F2] truncate">{event.title}</p>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="font-mono-mm text-xs text-[#A0A0A0]">
                      {event.startTime}{event.endTime ? ` – ${event.endTime}` : ''}
                    </span>
                    <span className="font-mono-mm text-xs text-[#888]">{event.location}</span>
                  </div>
                </div>
                <span className="shrink-0 font-mono-mm text-[11px] px-2.5 py-1 font-semibold" style={{ background: cfg.bg, color: cfg.color, borderRadius: '4px' }}>
                  {event.type.toUpperCase()}
                </span>
                {event.value && (
                  <span className="shrink-0 font-display font-bold text-sm text-[#C9A84C]">
                    R$ {event.value.toLocaleString('pt-BR')}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}

      {selectedEvent && (
        <EventSheet event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}

      {showNewForm && (
        <NewEventForm
          defaultDate={newFormDate}
          onClose={() => { setShowNewForm(false); setNewFormDate(undefined) }}
        />
      )}
    </div>
  )
}
