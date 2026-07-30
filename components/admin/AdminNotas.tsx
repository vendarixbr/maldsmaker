'use client'

import { useState, useMemo } from 'react'
import { useAdmin } from '@/lib/admin-context'
import type { GlobalNote } from '@/lib/data'
import { Plus, Pin, PinOff, Trash2, X, Search, Check } from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Note color config                                                   */
/* ------------------------------------------------------------------ */

const NOTE_COLORS: Record<GlobalNote['color'], { bg: string; border: string; accent: string }> = {
  default: { bg: '#111111',                       border: 'rgba(255,255,255,0.14)',  accent: '#E5C158' },
  warm:    { bg: 'rgba(201,168,76,0.08)',          border: 'rgba(201,168,76,0.3)',    accent: '#E5C158' },
  green:   { bg: 'rgba(30,132,73,0.1)',            border: 'rgba(74,222,128,0.3)',    accent: '#4ADE80' },
  blue:    { bg: 'rgba(36,113,163,0.1)',           border: 'rgba(56,189,248,0.3)',    accent: '#38BDF8' },
  red:     { bg: 'rgba(192,57,43,0.1)',            border: 'rgba(248,113,113,0.3)',   accent: '#F87171' },
}

const CATEGORIES = ['TODOS', 'TAREFAS', 'IDEIAS', 'REFERÊNCIAS', 'CLIENTES', 'PESSOAL']

/* ------------------------------------------------------------------ */
/*  New note form                                                       */
/* ------------------------------------------------------------------ */

function NewNoteForm({ onClose }: { onClose: () => void }) {
  const { dispatch } = useAdmin()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('IDEIAS')
  const [color, setColor] = useState<GlobalNote['color']>('default')

  const save = () => {
    if (!content.trim()) return
    dispatch({
      type: 'ADD_NOTE',
      payload: {
        id: Date.now().toString(),
        title: title.trim() || undefined,
        content: content.trim(),
        category,
        color,
        pinned: false,
        createdAt: new Date().toLocaleDateString('pt-BR'),
      },
    })
    onClose()
  }

  return (
    <>
      <div className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.75)' }} onClick={onClose} />
      <div
        className="fixed top-1/2 left-1/2 z-50 flex flex-col gap-4 p-6"
        style={{
          width: 'min(480px, 95vw)',
          transform: 'translate(-50%, -50%)',
          background: '#0F0F0F',
          border: '1px solid rgba(255,255,255,0.14)',
          borderRadius: '12px',
        }}
      >
        <div className="flex items-center justify-between">
          <p className="font-mono-mm text-[11px] tracking-[0.1em] font-semibold" style={{ color: '#E5C158' }}>NOVA NOTA</p>
          <button onClick={onClose} className="text-[#CBD5E1] hover:text-white transition-colors" aria-label="Fechar"><X size={18} /></button>
        </div>

        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Título (opcional)"
          className="h-10 px-3 font-display text-sm outline-none focus:border-[#C9A84C]"
          style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.16)', borderRadius: '6px', color: '#F9FAFB' }}
        />

        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Conteúdo da nota..."
          rows={5}
          className="px-3 py-2 font-display text-sm outline-none resize-none focus:border-[#C9A84C]"
          style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.16)', borderRadius: '6px', color: '#F9FAFB', lineHeight: 1.6 }}
        />

        <div className="flex items-center gap-3 flex-wrap">
          {/* Category */}
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="h-9 px-2.5 font-mono-mm text-[10px] tracking-[0.06em] font-semibold outline-none"
            style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.16)', borderRadius: '6px', color: '#F3F4F6' }}
          >
            {CATEGORIES.filter(c => c !== 'TODOS').map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Color swatches */}
          <div className="flex gap-2">
            {(Object.keys(NOTE_COLORS) as GlobalNote['color'][]).map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className="w-5 h-5 rounded-full transition-transform"
                style={{
                  background: NOTE_COLORS[c].accent,
                  transform: color === c ? 'scale(1.3)' : 'scale(1)',
                  outline: color === c ? `2px solid ${NOTE_COLORS[c].accent}` : 'none',
                  outlineOffset: '2px',
                }}
                aria-label={`Cor ${c}`}
              />
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={save}
          className="h-11 font-mono-mm text-[11px] tracking-[0.1em] font-semibold transition-opacity mt-1"
          style={{ background: '#C9A84C', color: '#080808', borderRadius: '6px' }}
        >
          SALVAR NOTA
        </button>
      </div>
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  Note card                                                           */
/* ------------------------------------------------------------------ */

function NoteCard({ note }: { note: GlobalNote }) {
  const { dispatch } = useAdmin()
  const cfg = NOTE_COLORS[note.color]
  const checklist = note.checklist ?? []

  const toggleCheck = (i: number) => {
    const updated = checklist.map((item, idx) => idx === i ? { ...item, done: !item.done } : item)
    dispatch({ type: 'UPDATE_NOTE', payload: { ...note, checklist: updated } })
  }

  return (
    <div
      className="flex flex-col gap-3 p-4 shadow-sm"
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: '10px' }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <span
            className="inline-block font-mono-mm text-[9px] tracking-[0.08em] px-2 py-0.5 mb-1.5 font-semibold"
            style={{ background: `${cfg.accent}25`, color: cfg.accent, borderRadius: '4px' }}
          >
            {note.category}
          </span>
          {note.title && (
            <p className="font-display font-semibold text-base text-[#FFFFFF]">{note.title}</p>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => dispatch({ type: 'PIN_NOTE', id: note.id })}
            className="p-1 text-[#CBD5E1] hover:text-[#E5C158] transition-colors rounded"
            aria-label={note.pinned ? 'Desafixar' : 'Fixar'}
          >
            {note.pinned ? <Pin size={15} style={{ color: cfg.accent }} /> : <PinOff size={15} />}
          </button>
          <button
            onClick={() => dispatch({ type: 'DELETE_NOTE', id: note.id })}
            className="p-1 text-[#CBD5E1] hover:text-red-400 transition-colors rounded"
            aria-label="Deletar nota"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Content */}
      {note.content && (
        <p className="font-display text-sm text-[#F3F4F6]" style={{ lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
          {note.content}
        </p>
      )}

      {/* Checklist */}
      {checklist.length > 0 && (
        <div className="flex flex-col gap-2 pt-1 border-t border-[rgba(255,255,255,0.08)]">
          {checklist.map((item, i) => (
            <button key={i} onClick={() => toggleCheck(i)} className="flex items-center gap-2 text-left py-0.5">
              <div
                className="w-4 h-4 rounded flex items-center justify-center shrink-0 transition-colors"
                style={{
                  background: item.done ? cfg.accent : 'transparent',
                  border: item.done ? `1px solid ${cfg.accent}` : '1px solid rgba(255,255,255,0.3)',
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
      )}

      <div className="pt-2 border-t border-[rgba(255,255,255,0.06)] flex items-center justify-between text-[10px] font-mono-mm text-[#CBD5E1]">
        <span>{note.createdAt}</span>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                      */
/* ------------------------------------------------------------------ */

export function AdminNotas() {
  const { state } = useAdmin()
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('TODOS')
  const [showNewForm, setShowNewForm] = useState(false)

  const filteredNotes = useMemo(() => {
    return state.notes.filter(n => {
      const matchCat = selectedCategory === 'TODOS' || n.category === selectedCategory
      const matchSearch =
        search === '' ||
        (n.title && n.title.toLowerCase().includes(search.toLowerCase())) ||
        n.content.toLowerCase().includes(search.toLowerCase())
      return matchCat && matchSearch
    })
  }, [state.notes, selectedCategory, search])

  const pinnedNotes = useMemo(() => filteredNotes.filter(n => n.pinned), [filteredNotes])
  const otherNotes = useMemo(() => filteredNotes.filter(n => !n.pinned), [filteredNotes])

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-semibold text-2xl text-[#FFFFFF]">Notas & Anotações</h1>
          <p className="font-mono-mm text-xs tracking-[0.08em] mt-1 text-[#CBD5E1]">
            {state.notes.length} NOTAS CADASTRADAS
          </p>
        </div>
        <button
          onClick={() => setShowNewForm(true)}
          className="flex items-center justify-center gap-2 h-11 px-5 font-mono-mm text-xs tracking-[0.08em] font-semibold rounded-lg"
          style={{ background: '#C9A84C', color: '#080808' }}
        >
          <Plus size={16} />
          NOVA NOTA
        </button>
      </div>

      {/* Filter & search bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-2 px-3.5 h-11 bg-[#111111] border border-[rgba(255,255,255,0.14)] rounded-lg">
          <Search size={16} className="text-[#CBD5E1]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar notas por título ou conteúdo..."
            className="flex-1 bg-transparent font-display text-sm outline-none text-[#FFFFFF] placeholder-[#94A3B8]"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-[#CBD5E1] hover:text-white"><X size={14} /></button>
          )}
        </div>

        {/* Category pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className="h-11 px-3.5 font-mono-mm text-xs tracking-[0.06em] font-semibold shrink-0 transition-colors rounded-lg"
              style={{
                background: selectedCategory === cat ? '#C9A84C' : '#111111',
                color: selectedCategory === cat ? '#080808' : '#CBD5E1',
                border: `1px solid ${selectedCategory === cat ? '#C9A84C' : 'rgba(255,255,255,0.14)'}`,
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <p className="font-mono-mm text-xs py-12 text-center text-[#CBD5E1]">
          Nenhuma nota encontrada.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Pinned section */}
          {pinnedNotes.length > 0 && (
            <div className="flex flex-col gap-3">
              <p className="font-mono-mm text-xs font-semibold tracking-[0.12em] text-[#E5C158] flex items-center gap-1.5">
                <Pin size={14} />
                FIXADAS ({pinnedNotes.length})
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pinnedNotes.map(note => (
                  <NoteCard key={note.id} note={note} />
                ))}
              </div>
            </div>
          )}

          {/* Other notes section */}
          {otherNotes.length > 0 && (
            <div className="flex flex-col gap-3">
              {pinnedNotes.length > 0 && (
                <p className="font-mono-mm text-xs font-semibold tracking-[0.12em] text-[#CBD5E1]">
                  OUTRAS NOTAS ({otherNotes.length})
                </p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {otherNotes.map(note => (
                  <NoteCard key={note.id} note={note} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* New Note Form Modal */}
      {showNewForm && (
        <NewNoteForm onClose={() => setShowNewForm(false)} />
      )}
    </div>
  )
}
