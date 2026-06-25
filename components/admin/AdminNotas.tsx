'use client'

import { useState, useMemo } from 'react'
import { useAdmin } from '@/lib/admin-context'
import type { GlobalNote } from '@/lib/data'
import { Plus, Pin, PinOff, Trash2, X, Search, Check } from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Note color config                                                   */
/* ------------------------------------------------------------------ */

const NOTE_COLORS: Record<GlobalNote['color'], { bg: string; border: string; accent: string }> = {
  default: { bg: '#111111',                       border: 'rgba(255,255,255,0.07)',  accent: '#C9A84C' },
  warm:    { bg: 'rgba(201,168,76,0.05)',          border: 'rgba(201,168,76,0.2)',    accent: '#C9A84C' },
  green:   { bg: 'rgba(30,132,73,0.06)',           border: 'rgba(30,132,73,0.2)',     accent: '#52BE80' },
  blue:    { bg: 'rgba(36,113,163,0.06)',          border: 'rgba(36,113,163,0.2)',    accent: '#5DADE2' },
  red:     { bg: 'rgba(192,57,43,0.06)',           border: 'rgba(192,57,43,0.2)',     accent: '#F1948A' },
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
      <div className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.65)' }} onClick={onClose} />
      <div
        className="fixed top-1/2 left-1/2 z-50 flex flex-col gap-4 p-6"
        style={{
          width: 'min(480px, 95vw)',
          transform: 'translate(-50%, -50%)',
          background: '#0F0F0F',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px',
        }}
      >
        <div className="flex items-center justify-between">
          <p className="font-mono-mm text-[11px] tracking-[0.1em]" style={{ color: '#C9A84C' }}>NOVA NOTA</p>
          <button onClick={onClose} style={{ color: '#555' }}><X size={18} /></button>
        </div>

        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Título (opcional)"
          className="h-10 px-3 font-display text-sm outline-none"
          style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#F2F2F2' }}
        />

        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Conteúdo da nota..."
          rows={5}
          className="px-3 py-2 font-display text-sm outline-none resize-none"
          style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#F2F2F2', lineHeight: 1.6 }}
        />

        <div className="flex items-center gap-3 flex-wrap">
          {/* Category */}
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="h-9 px-2 font-mono-mm text-[10px] tracking-[0.06em] outline-none"
            style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#AAAAAA' }}
          >
            {CATEGORIES.filter(c => c !== 'TODOS').map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Color swatches */}
          <div className="flex gap-1.5">
            {(Object.keys(NOTE_COLORS) as GlobalNote['color'][]).map(c => (
              <button
                key={c}
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
          onClick={save}
          className="h-10 font-mono-mm text-[11px] tracking-[0.1em] transition-opacity"
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
  const [checkState, setCheckState] = useState(note.checklist ?? [])

  const toggleCheck = (i: number) => {
    const updated = checkState.map((item, idx) => idx === i ? { ...item, done: !item.done } : item)
    setCheckState(updated)
  }

  return (
    <div
      className="flex flex-col gap-3 p-4"
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: '10px' }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <span
            className="inline-block font-mono-mm text-[9px] tracking-[0.08em] px-2 py-0.5 mb-1.5"
            style={{ background: `${cfg.accent}22`, color: cfg.accent, borderRadius: '3px' }}
          >
            {note.category}
          </span>
          {note.title && (
            <p className="font-display font-semibold text-sm" style={{ color: '#F2F2F2' }}>{note.title}</p>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => dispatch({ type: 'PIN_NOTE', id: note.id })}
            style={{ color: note.pinned ? cfg.accent : '#333' }}
            aria-label={note.pinned ? 'Desafixar' : 'Fixar'}
          >
            {note.pinned ? <Pin size={14} /> : <PinOff size={14} />}
          </button>
          <button
            onClick={() => dispatch({ type: 'DELETE_NOTE', id: note.id })}
            style={{ color: '#333' }}
            aria-label="Deletar nota"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Content */}
      {note.content && (
        <p className="font-display text-sm" style={{ color: '#AAAAAA', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
          {note.content}
        </p>
      )}

      {/* Checklist */}
      {checkState.length > 0 && (
        <div className="flex flex-col gap-2">
          {checkState.map((item, i) => (
            <button key={i} onClick={() => toggleCheck(i)} className="flex items-center gap-2 text-left">
              <div
                className="w-4 h-4 rounded flex items-center justify-center shrink-0"
                style={{
                  background: item.done ? cfg.accent : 'transparent',
                  border: item.done ? `1px solid ${cfg.accent}` : '1px solid rgba(255,255,255,0.2)',
                }}
              >
                {item.done && <Check size={9} color="#080808" />}
              </div>
              <span
                className="font-display text-xs"
                style={{ color: item.done ? '#444' : '#AAAAAA', textDecoration: item.done ? 'line-through' : 'none' }}
              >
                {item.text}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Footer */}
      <p className="font-mono-mm text-[9px]" style={{ color: '#444' }}>{note.createdAt}</p>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main AdminNotas                                                     */
/* ------------------------------------------------------------------ */

export function AdminNotas() {
  const { state } = useAdmin()
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('TODOS')
  const [showForm, setShowForm] = useState(false)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return state.notes
      .filter(n => {
        const matchCat = activeCategory === 'TODOS' || n.category === activeCategory
        const matchSearch = !q || n.content.toLowerCase().includes(q) || n.title?.toLowerCase().includes(q)
        return matchCat && matchSearch
      })
      .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))
  }, [state.notes, search, activeCategory])

  const pinned = filtered.filter(n => n.pinned)
  const unpinned = filtered.filter(n => !n.pinned)

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-semibold text-2xl" style={{ color: '#F2F2F2' }}>Notas</h1>
          <p className="font-mono-mm text-[11px] tracking-[0.08em] mt-1" style={{ color: '#555' }}>
            {state.notes.length} NOTAS &nbsp;·&nbsp; {state.notes.filter(n => n.pinned).length} FIXADAS
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="shrink-0 flex items-center gap-2 h-9 px-5 font-mono-mm text-[11px] tracking-[0.1em]"
          style={{ background: '#C9A84C', color: '#080808' }}
        >
          <Plus size={14} />
          NOVA NOTA
        </button>
      </div>

      {/* Search */}
      <div
        className="flex items-center gap-2 h-10 px-3"
        style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '6px' }}
      >
        <Search size={14} style={{ color: '#444' }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar notas..."
          className="flex-1 bg-transparent outline-none font-display text-sm"
          style={{ color: '#F2F2F2' }}
        />
        {search && <button onClick={() => setSearch('')} style={{ color: '#444' }}><X size={14} /></button>}
      </div>

      {/* Category filters */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className="h-8 px-3 font-mono-mm text-[10px] tracking-[0.06em] transition-colors"
            style={{
              background: activeCategory === cat ? '#C9A84C' : '#111111',
              color: activeCategory === cat ? '#080808' : '#555',
              border: '1px solid',
              borderColor: activeCategory === cat ? '#C9A84C' : 'rgba(255,255,255,0.06)',
              borderRadius: '6px',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Pinned section */}
      {pinned.length > 0 && (
        <section>
          <p className="font-mono-mm text-[10px] tracking-[0.1em] mb-3 flex items-center gap-2" style={{ color: '#C9A84C' }}>
            <Pin size={11} />
            FIXADAS
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {pinned.map(n => <NoteCard key={n.id} note={n} />)}
          </div>
        </section>
      )}

      {/* All notes */}
      {unpinned.length > 0 && (
        <section>
          {pinned.length > 0 && (
            <p className="font-mono-mm text-[10px] tracking-[0.1em] mb-3" style={{ color: '#555' }}>OUTRAS</p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {unpinned.map(n => <NoteCard key={n.id} note={n} />)}
          </div>
        </section>
      )}

      {filtered.length === 0 && (
        <p className="font-mono-mm text-[11px] py-12 text-center" style={{ color: '#333' }}>
          Nenhuma nota encontrada.
        </p>
      )}

      {showForm && <NewNoteForm onClose={() => setShowForm(false)} />}
    </div>
  )
}
