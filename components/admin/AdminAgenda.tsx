'use client'

import { useState, useMemo } from 'react'
import { useAdmin } from '@/lib/admin-context'
import type { CalendarEvent, EventType } from '@/lib/data'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Clock,
  MapPin,
  User,
  DollarSign,
  Trash2,
  Edit2,
  Calendar as CalendarIcon,
  Filter,
} from 'lucide-react'

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
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

/* ------------------------------------------------------------------ */
/*  Event Form (Create & Edit)                                          */
/* ------------------------------------------------------------------ */

function EventForm({
  onClose,
  defaultDate,
  initialEvent,
}: {
  onClose: () => void
  defaultDate?: string
  initialEvent?: CalendarEvent
}) {
  const { state, dispatch } = useAdmin()
  const isEditing = Boolean(initialEvent)

  const [title, setTitle] = useState(initialEvent?.title ?? '')
  const [type, setType] = useState<EventType>(initialEvent?.type ?? 'Shoot')
  const [clientId, setClientId] = useState(() => {
    if (!initialEvent?.clientName) return ''
    const match = state.clients.find(c => c.name === initialEvent.clientName)
    return match ? match.id : ''
  })
  const [date, setDate] = useState(
    initialEvent?.date ?? defaultDate ?? new Date().toISOString().split('T')[0]
  )
  const [startTime, setStartTime] = useState(initialEvent?.startTime ?? '09:00')
  const [endTime, setEndTime] = useState(initialEvent?.endTime ?? '18:00')
  const [location, setLocation] = useState(initialEvent?.location ?? '')
  const [value, setValue] = useState(initialEvent?.value ? String(initialEvent.value) : '')
  const [notes, setNotes] = useState(initialEvent?.notes ?? '')

  const handleSave = () => {
    if (!title.trim() || !date) return
    const selectedClient = state.clients.find(c => c.id === clientId)

    const eventPayload: CalendarEvent = {
      id: initialEvent?.id ?? `e${Date.now()}`,
      title: title.trim(),
      type,
      clientName: selectedClient?.name ?? (clientId ? undefined : initialEvent?.clientName),
      date,
      startTime,
      endTime: endTime || '',
      location: location.trim() || 'A definir',
      value: parseFloat(value) || undefined,
      notes: notes.trim() || undefined,
    }

    if (isEditing) {
      dispatch({ type: 'UPDATE_EVENT', payload: eventPayload })
    } else {
      dispatch({ type: 'ADD_EVENT', payload: eventPayload })
    }

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
          <p className="font-mono-mm text-[11px] tracking-[0.12em]" style={{ color: '#C9A84C' }}>
            {isEditing ? 'EDITAR EVENTO' : 'NOVO EVENTO'}
          </p>
          <button onClick={onClose} style={{ color: '#555' }} aria-label="Fechar">
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Título */}
          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="font-mono-mm text-[10px] tracking-[0.08em]" style={{ color: '#888' }}>
              TÍTULO *
            </label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ex: Shoot Clipe MC Vitão"
              className="h-10 px-3 font-display text-sm outline-none focus:border-[#C9A84C]"
              style={inputStyle}
            />
          </div>

          {/* Tipo */}
          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="font-mono-mm text-[10px] tracking-[0.08em]" style={{ color: '#888' }}>
              TIPO
            </label>
            <div className="flex gap-2 flex-wrap">
              {EVENT_TYPES.map(t => {
                const c = EVENT_COLORS[t]
                return (
                  <button
                    key={t}
                    type="button"
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
            <label className="font-mono-mm text-[10px] tracking-[0.08em]" style={{ color: '#888' }}>
              CLIENTE (OPCIONAL)
            </label>
            <select
              value={clientId}
              onChange={e => setClientId(e.target.value)}
              className="h-10 px-3 font-display text-sm outline-none"
              style={inputStyle}
            >
              <option value="">Sem cliente associado</option>
              {state.clients.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.empresa || c.niche})
                </option>
              ))}
            </select>
          </div>

          {/* Data */}
          <div className="flex flex-col gap-1">
            <label className="font-mono-mm text-[10px] tracking-[0.08em]" style={{ color: '#888' }}>
              DATA *
            </label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="h-10 px-3 font-display text-sm outline-none"
              style={inputStyle}
            />
          </div>

          {/* Local */}
          <div className="flex flex-col gap-1">
            <label className="font-mono-mm text-[10px] tracking-[0.08em]" style={{ color: '#888' }}>
              LOCAL
            </label>
            <input
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="Nauta Estúdio, Remoto..."
              className="h-10 px-3 font-display text-sm outline-none"
              style={inputStyle}
            />
          </div>

          {/* Horários */}
          <div className="flex flex-col gap-1">
            <label className="font-mono-mm text-[10px] tracking-[0.08em]" style={{ color: '#888' }}>
              INÍCIO
            </label>
            <input
              type="time"
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
              className="h-10 px-3 font-display text-sm outline-none"
              style={inputStyle}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-mono-mm text-[10px] tracking-[0.08em]" style={{ color: '#888' }}>
              FIM
            </label>
            <input
              type="time"
              value={endTime}
              onChange={e => setEndTime(e.target.value)}
              className="h-10 px-3 font-display text-sm outline-none"
              style={inputStyle}
            />
          </div>

          {/* Valor */}
          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="font-mono-mm text-[10px] tracking-[0.08em]" style={{ color: '#888' }}>
              VALOR (R$)
            </label>
            <input
              type="number"
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder="0.00"
              min="0"
              step="50"
              className="h-10 px-3 font-display text-sm outline-none"
              style={inputStyle}
            />
          </div>

          {/* Notas */}
          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="font-mono-mm text-[10px] tracking-[0.08em]" style={{ color: '#888' }}>
              NOTAS / OBSERVAÇÕES
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Detalhes da gravação, equipamentos, contrato, etc."
              rows={3}
              className="px-3 py-2 font-display text-sm outline-none resize-none"
              style={inputStyle}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={!title.trim() || !date}
          className="h-11 font-mono-mm text-[11px] tracking-[0.1em] transition-opacity font-semibold mt-2"
          style={{
            background: title.trim() && date ? cfg.color : 'rgba(201,168,76,0.3)',
            color: '#080808',
            borderRadius: '6px',
            opacity: title.trim() && date ? 1 : 0.5,
          }}
        >
          {isEditing ? 'SALVAR ALTERAÇÕES' : 'CRIAR EVENTO'}
        </button>
      </div>
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  Event Detail Sheet                                                  */
/* ------------------------------------------------------------------ */

function EventSheet({
  event,
  onClose,
  onEdit,
}: {
  event: CalendarEvent
  onClose: () => void
  onEdit: (ev: CalendarEvent) => void
}) {
  const { dispatch } = useAdmin()
  const cfg = EVENT_COLORS[event.type]

  const formattedDate = useMemo(() => {
    if (!event.date) return ''
    const [y, m, d] = event.date.split('-').map(Number)
    if (!y || !m || !d) return event.date
    const dateObj = new Date(y, m - 1, d)
    return dateObj.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }, [event.date])

  return (
    <>
      <div className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.65)' }} onClick={onClose} />
      <aside
        className="fixed right-0 top-0 h-full z-50 flex flex-col overflow-y-auto"
        style={{
          width: 'min(440px, 100vw)',
          background: '#0F0F0F',
          borderLeft: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <div className="flex items-start justify-between p-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div>
            <span
              className="inline-block font-mono-mm text-[10px] px-2.5 py-0.5 mb-2 font-semibold"
              style={{ background: cfg.bg, color: cfg.color, borderRadius: '4px' }}
            >
              {event.type.toUpperCase()}
            </span>
            <h2 className="font-display font-semibold text-xl text-[#F2F2F2] leading-snug">{event.title}</h2>
            <p className="font-mono-mm text-xs capitalize text-[#888] mt-1">{formattedDate}</p>
          </div>
          <button onClick={onClose} style={{ color: '#666' }} aria-label="Fechar">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4 flex-1">
          {[
            { Icon: Clock, label: 'HORÁRIO', value: `${event.startTime}${event.endTime ? ` – ${event.endTime}` : ''}` },
            { Icon: MapPin, label: 'LOCAL', value: event.location },
            ...(event.clientName ? [{ Icon: User, label: 'CLIENTE', value: event.clientName }] : []),
            ...(event.value ? [{ Icon: DollarSign, label: 'VALOR', value: `R$ ${event.value.toLocaleString('pt-BR')}` }] : []),
          ].map(({ Icon, label, value }) => (
            <div
              key={label}
              className="flex items-center gap-4 p-4"
              style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px' }}
            >
              <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: cfg.bg, color: cfg.color }}>
                <Icon size={16} />
              </div>
              <div>
                <p className="font-mono-mm text-[10px] tracking-[0.06em]" style={{ color: '#666' }}>{label}</p>
                <p className="font-display text-sm mt-0.5 text-[#F2F2F2] font-medium">{value}</p>
              </div>
            </div>
          ))}

          {event.notes && (
            <div className="p-4" style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px' }}>
              <p className="font-mono-mm text-[10px] tracking-[0.06em] mb-2" style={{ color: '#666' }}>NOTAS / OBSERVAÇÕES</p>
              <p className="font-display text-sm text-[#AAAAAA]" style={{ lineHeight: 1.6 }}>
                {event.notes}
              </p>
            </div>
          )}

          <div className="mt-auto pt-6 flex items-center justify-between border-t border-[rgba(255,255,255,0.06)] gap-3">
            <button
              onClick={() => {
                onClose()
                onEdit(event)
              }}
              className="flex-1 flex items-center justify-center gap-2 h-10 font-mono-mm text-[11px] tracking-[0.08em] font-semibold transition-colors"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '6px',
                color: '#F2F2F2',
              }}
            >
              <Edit2 size={14} />
              EDITAR EVENTO
            </button>

            <button
              onClick={() => {
                dispatch({ type: 'DELETE_EVENT', id: event.id })
                onClose()
              }}
              className="flex items-center justify-center gap-2 h-10 px-4 font-mono-mm text-[11px] tracking-[0.08em] font-semibold transition-colors"
              style={{
                background: 'rgba(192,57,43,0.15)',
                border: '1px solid rgba(192,57,43,0.3)',
                borderRadius: '6px',
                color: '#E74C3C',
              }}
            >
              <Trash2 size={14} />
              EXCLUIR
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Agenda Component                                              */
/* ------------------------------------------------------------------ */

export function AdminAgenda() {
  const { state } = useAdmin()
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [view, setView] = useState<'month' | 'list'>('month')
  const [showNewForm, setShowNewForm] = useState(false)
  const [newFormDate, setNewFormDate] = useState<string | undefined>()
  const [filterType, setFilterType] = useState<EventType | 'ALL'>('ALL')

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

  // Filter events by selected category filter
  const filteredEvents = useMemo(() => {
    if (filterType === 'ALL') return state.events
    return state.events.filter(e => e.type === filterType)
  }, [state.events, filterType])

  const getEventsForDay = (day: number) => {
    const monthStr = String(month + 1).padStart(2, '0')
    const dayStr = String(day).padStart(2, '0')
    const dateStr = `${year}-${monthStr}-${dayStr}`
    return filteredEvents.filter(e => e.date === dateStr)
  }

  const monthEvents = useMemo(() => {
    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`
    return filteredEvents
      .filter(e => e.date.startsWith(monthKey))
      .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
  }, [filteredEvents, year, month])

  const openNewForDay = (day: number) => {
    const monthStr = String(month + 1).padStart(2, '0')
    const dayStr = String(day).padStart(2, '0')
    const dateStr = `${year}-${monthStr}-${dayStr}`
    setNewFormDate(dateStr)
    setShowNewForm(true)
  }

  const handleGoToday = () => {
    setCurrentDate(new Date())
  }

  // Count events by type for the filter badges
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: state.events.length }
    EVENT_TYPES.forEach(t => {
      counts[t] = state.events.filter(e => e.type === t).length
    })
    return counts
  }, [state.events])

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-semibold text-2xl text-[#F2F2F2]">Agenda & Calendário</h1>
          <p className="font-mono-mm text-xs tracking-[0.08em] mt-1 text-[#A0A0A0]">
            {monthEvents.length} EVENTO{monthEvents.length === 1 ? '' : 'S'} EM {MONTHS[month].toUpperCase()} {year}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* View toggle (MÊS / LISTA) */}
          <div className="flex" style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }}>
            {(['month', 'list'] as const).map(v => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className="h-10 px-4 font-mono-mm text-xs tracking-[0.08em] font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C]"
                style={{
                  background: view === v ? '#C9A84C' : 'transparent',
                  color: view === v ? '#080808' : '#A0A0A0',
                  borderRadius: '7px',
                }}
              >
                {v === 'month' ? 'MÊS' : 'LISTA'}
              </button>
            ))}
          </div>

          {/* New Event Button */}
          <button
            type="button"
            onClick={() => {
              setNewFormDate(undefined)
              setShowNewForm(true)
            }}
            className="flex items-center justify-center gap-2 h-10 px-4 font-mono-mm text-xs tracking-[0.08em] font-semibold outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C]"
            style={{ background: '#C9A84C', color: '#080808', borderRadius: '8px' }}
          >
            <Plus size={16} />
            NOVO EVENTO
          </button>
        </div>
      </div>

      {/* Filter Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[rgba(255,255,255,0.06)]">
        <span className="flex items-center gap-1 font-mono-mm text-[10px] text-[#666] tracking-[0.08em] mr-1 shrink-0">
          <Filter size={12} />
          FILTRAR:
        </span>

        <button
          type="button"
          onClick={() => setFilterType('ALL')}
          className="h-7 px-3 font-mono-mm text-[10px] tracking-[0.06em] font-semibold shrink-0 transition-all"
          style={{
            background: filterType === 'ALL' ? '#F2F2F2' : '#141414',
            color: filterType === 'ALL' ? '#080808' : '#888',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '14px',
          }}
        >
          TODOS ({typeCounts.ALL})
        </button>

        {EVENT_TYPES.map(t => {
          const cfg = EVENT_COLORS[t]
          const isSelected = filterType === t
          return (
            <button
              key={t}
              type="button"
              onClick={() => setFilterType(t)}
              className="h-7 px-3 font-mono-mm text-[10px] tracking-[0.06em] font-semibold shrink-0 transition-all"
              style={{
                background: isSelected ? cfg.color : '#141414',
                color: isSelected ? '#080808' : cfg.color,
                border: `1px solid ${cfg.color}`,
                borderRadius: '14px',
                opacity: isSelected ? 1 : 0.7,
              }}
            >
              {t.toUpperCase()} ({typeCounts[t] ?? 0})
            </button>
          )
        })}
      </div>

      {/* Navigation Bar (Month & Year + Hoje) */}
      <div className="flex items-center justify-between gap-4 bg-[#111111] p-3 rounded-lg border border-[rgba(255,255,255,0.06)]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
            className="w-9 h-9 flex items-center justify-center transition-colors text-[#E0E0E0] hover:text-[#C9A84C] outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C]"
            style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px' }}
            aria-label="Mês anterior"
          >
            <ChevronLeft size={18} />
          </button>

          <h2 className="font-display font-semibold text-lg text-[#F2F2F2] min-w-[160px] text-center">
            {MONTHS[month]} {year}
          </h2>

          <button
            type="button"
            onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
            className="w-9 h-9 flex items-center justify-center transition-colors text-[#E0E0E0] hover:text-[#C9A84C] outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C]"
            style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px' }}
            aria-label="Próximo mês"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <button
          type="button"
          onClick={handleGoToday}
          className="flex items-center gap-1.5 h-9 px-3 font-mono-mm text-[11px] tracking-[0.08em] font-semibold text-[#C9A84C] hover:bg-[rgba(201,168,76,0.1)] transition-colors border border-[rgba(201,168,76,0.3)] rounded-md"
        >
          <CalendarIcon size={14} />
          HOJE
        </button>
      </div>

      {/* Month View Grid */}
      {view === 'month' && (
        <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', overflow: 'hidden' }}>
          {/* Weekday Labels */}
          <div className="grid grid-cols-7">
            {WEEKDAYS.map(d => (
              <div
                key={d}
                className="h-10 flex items-center justify-center font-mono-mm text-xs font-semibold text-[#888]"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: '#0D0D0D' }}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day, idx) => {
              const events = day ? getEventsForDay(day) : []
              const now = new Date()
              const isToday =
                day === now.getDate() &&
                month === now.getMonth() &&
                year === now.getFullYear()

              return (
                <div
                  key={idx}
                  onClick={() => {
                    if (day) openNewForDay(day)
                  }}
                  className={`min-h-[85px] sm:min-h-[105px] p-1.5 flex flex-col gap-1 group transition-colors ${
                    day ? 'cursor-pointer hover:bg-[rgba(255,255,255,0.02)]' : ''
                  }`}
                  style={{
                    borderRight: (idx + 1) % 7 !== 0 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                    borderBottom: idx < calendarDays.length - 7 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                    background: day ? 'transparent' : 'rgba(0,0,0,0.25)',
                  }}
                >
                  {day && (
                    <>
                      <div className="flex items-center justify-between">
                        <span
                          className="w-6 h-6 flex items-center justify-center font-mono-mm text-xs font-bold rounded-full transition-transform"
                          style={{
                            background: isToday ? '#C9A84C' : 'transparent',
                            color: isToday ? '#080808' : '#A0A0A0',
                          }}
                        >
                          {day}
                        </span>
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation()
                            openNewForDay(day)
                          }}
                          className="w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[#C9A84C] hover:bg-[rgba(201,168,76,0.15)] rounded"
                          aria-label={`Adicionar evento dia ${day}`}
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      {/* Event Cards in Cell */}
                      <div className="flex flex-col gap-1 overflow-hidden">
                        {events.slice(0, 3).map(e => {
                          const cfg = EVENT_COLORS[e.type]
                          return (
                            <button
                              key={e.id}
                              type="button"
                              onClick={el => {
                                el.stopPropagation()
                                setSelectedEvent(e)
                              }}
                              className="w-full text-left px-1.5 py-1 truncate font-display text-[11px] font-medium transition-transform hover:scale-[1.02] outline-none"
                              style={{ background: cfg.bg, color: cfg.color, borderRadius: '4px' }}
                              title={`${e.title} (${e.startTime})`}
                            >
                              {e.title}
                            </button>
                          )
                        })}
                        {events.length > 3 && (
                          <span className="font-mono-mm text-[10px] px-1 font-semibold text-[#888]">
                            +{events.length - 3} mais
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
        <div className="flex flex-col gap-3">
          {monthEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center border border-[rgba(255,255,255,0.06)] rounded-lg bg-[#0F0F0F]">
              <CalendarIcon size={32} className="text-[#444] mb-2" />
              <p className="font-mono-mm text-xs text-[#888]">
                Nenhum evento encontrado para este mês ou filtro.
              </p>
              <button
                type="button"
                onClick={() => {
                  setNewFormDate(undefined)
                  setShowNewForm(true)
                }}
                className="mt-4 font-mono-mm text-xs text-[#C9A84C] underline hover:text-[#E5C158]"
              >
                + Adicionar primeiro evento
              </button>
            </div>
          ) : (
            monthEvents.map(event => {
              const cfg = EVENT_COLORS[event.type]
              const [y, m, dNum] = event.date.split('-').map(Number)
              const dObj = new Date(y, (m || 1) - 1, dNum || 1)
              const dayName = WEEKDAYS[dObj.getDay()]

              return (
                <div
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 text-left transition-all cursor-pointer bg-[#111111] hover:bg-[#151515] border border-[rgba(255,255,255,0.08)] hover:border-[rgba(201,168,76,0.3)] rounded-lg"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="shrink-0 w-12 text-center">
                      <p className="font-mono-mm text-xs text-[#888] font-medium">{dayName}</p>
                      <p className="font-display font-bold text-xl text-[#C9A84C]">{dNum}</p>
                    </div>

                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: cfg.dot }} />

                    <div className="flex-1 min-w-0">
                      <p className="font-display font-medium text-base text-[#F2F2F2] truncate">{event.title}</p>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="font-mono-mm text-xs text-[#A0A0A0] flex items-center gap-1">
                          <Clock size={12} />
                          {event.startTime}{event.endTime ? ` – ${event.endTime}` : ''}
                        </span>
                        <span className="font-mono-mm text-xs text-[#888] flex items-center gap-1">
                          <MapPin size={12} />
                          {event.location}
                        </span>
                        {event.clientName && (
                          <span className="font-mono-mm text-xs text-[#C9A84C] flex items-center gap-1">
                            <User size={12} />
                            {event.clientName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    <span
                      className="font-mono-mm text-[11px] px-2.5 py-1 font-semibold"
                      style={{ background: cfg.bg, color: cfg.color, borderRadius: '4px' }}
                    >
                      {event.type.toUpperCase()}
                    </span>

                    {event.value && (
                      <span className="font-display font-bold text-sm text-[#C9A84C]">
                        R$ {event.value.toLocaleString('pt-BR')}
                      </span>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Event Details Sheet */}
      {selectedEvent && (
        <EventSheet
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onEdit={ev => setEditingEvent(ev)}
        />
      )}

      {/* New Event Form */}
      {showNewForm && (
        <EventForm
          defaultDate={newFormDate}
          onClose={() => {
            setShowNewForm(false)
            setNewFormDate(undefined)
          }}
        />
      )}

      {/* Edit Event Form */}
      {editingEvent && (
        <EventForm
          initialEvent={editingEvent}
          onClose={() => setEditingEvent(null)}
        />
      )}
    </div>
  )
}
