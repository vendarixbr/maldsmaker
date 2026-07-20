'use client'

import { useState, useMemo } from 'react'
import { useAdmin } from '@/lib/admin-context'
import type { Client, ClientStatus } from '@/lib/data'
import {
  Search,
  Plus,
  X,
  Phone,
  Mail,
  AtSign,
  Camera,
  Video,
  PhoneCall,
  FileText,
  Trash2,
  ChevronRight,
  Edit3,
  Check,
} from 'lucide-react'
import { BarChart, Bar, ResponsiveContainer, Tooltip } from 'recharts'

/* ------------------------------------------------------------------ */
/*  Status config                                                        */
/* ------------------------------------------------------------------ */

const STATUS_CONFIG: Record<ClientStatus, { color: string; bg: string }> = {
  ATIVO:       { color: '#1E8449', bg: 'rgba(30,132,73,0.12)' },
  'EM PAUSA':  { color: '#D4AC0D', bg: 'rgba(212,172,13,0.12)' },
  CONCLUÍDO:   { color: '#555',    bg: 'rgba(85,85,85,0.15)' },
  PROSPECT:    { color: '#2471A3', bg: 'rgba(36,113,163,0.12)' },
}

const ALL_STATUSES_CLIENT: ClientStatus[] = ['ATIVO', 'EM PAUSA', 'CONCLUÍDO', 'PROSPECT']

const HISTORY_ICONS: Record<string, React.ElementType> = {
  camera: Camera, video: Video, phone: PhoneCall, file: FileText,
}

/* ------------------------------------------------------------------ */
/*  New / Edit Client Modal                                             */
/* ------------------------------------------------------------------ */

interface ClientFormProps {
  initial?: Client | null
  onSave: (c: Client) => void
  onClose: () => void
}

function ClientForm({ initial, onSave, onClose }: ClientFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [niche, setNiche] = useState(initial?.niche ?? '')
  const [empresa, setEmpresa] = useState(initial?.empresa ?? '')
  const [whatsapp, setWhatsapp] = useState(initial?.whatsapp ?? '')
  const [email, setEmail] = useState(initial?.email ?? '')
  const [instagram, setInstagram] = useState(initial?.instagram ?? '')
  const [status, setStatus] = useState<ClientStatus>(initial?.status ?? 'PROSPECT')
  const [origem, setOrigem] = useState(initial?.origem ?? '')

  const isEdit = !!initial

  const handleSave = () => {
    if (!name.trim()) return
    const initials = name.trim().split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('')
    const payload: Client = initial
      ? { ...initial, name: name.trim(), niche: niche.trim(), empresa: empresa.trim() || undefined, whatsapp: whatsapp.trim(), email: email.trim() || undefined, instagram: instagram.trim() || undefined, status, origem: origem.trim() }
      : {
          id: Date.now().toString(),
          name: name.trim(),
          initials,
          niche: niche.trim() || 'GERAL',
          whatsapp: whatsapp.trim(),
          email: email.trim() || undefined,
          instagram: instagram.trim() || undefined,
          empresa: empresa.trim() || undefined,
          status,
          totalValue: 0,
          lastProject: 'Aguardando projeto',
          origem: origem.trim() || 'Site',
          notes: [],
          services: [],
          history: [],
          invoices: [],
          monthlyRevenue: [
            { month: 'Ago', value: 0 }, { month: 'Set', value: 0 }, { month: 'Out', value: 0 },
            { month: 'Nov', value: 0 }, { month: 'Dez', value: 0 }, { month: 'Jan', value: 0 },
          ],
        }
    onSave(payload)
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
          width: 'min(540px, 95vw)',
          maxHeight: '90vh',
          transform: 'translate(-50%, -50%)',
          background: '#0F0F0F',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="font-mono-mm text-[11px] tracking-[0.12em]" style={{ color: '#C9A84C' }}>
            {isEdit ? 'EDITAR CLIENTE' : 'NOVO CLIENTE'}
          </p>
          <button onClick={onClose} style={{ color: '#555' }}><X size={18} /></button>
        </div>

        {/* Form grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="font-mono-mm text-[10px] tracking-[0.08em]" style={{ color: '#555' }}>NOME *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Nome completo" className="h-10 px-3 font-display text-sm outline-none" style={inputStyle} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-mono-mm text-[10px] tracking-[0.08em]" style={{ color: '#555' }}>NICHO</label>
            <input value={niche} onChange={e => setNiche(e.target.value)} placeholder="Ex: ARTISTA MUSICAL" className="h-10 px-3 font-display text-sm outline-none" style={inputStyle} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-mono-mm text-[10px] tracking-[0.08em]" style={{ color: '#555' }}>EMPRESA</label>
            <input value={empresa} onChange={e => setEmpresa(e.target.value)} placeholder="Nome da empresa" className="h-10 px-3 font-display text-sm outline-none" style={inputStyle} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-mono-mm text-[10px] tracking-[0.08em]" style={{ color: '#555' }}>WHATSAPP *</label>
            <input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="(15) 99999-0000" className="h-10 px-3 font-display text-sm outline-none" style={inputStyle} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-mono-mm text-[10px] tracking-[0.08em]" style={{ color: '#555' }}>E-MAIL</label>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="email@dominio.com" type="email" className="h-10 px-3 font-display text-sm outline-none" style={inputStyle} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-mono-mm text-[10px] tracking-[0.08em]" style={{ color: '#555' }}>INSTAGRAM</label>
            <input value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="@usuario" className="h-10 px-3 font-display text-sm outline-none" style={inputStyle} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-mono-mm text-[10px] tracking-[0.08em]" style={{ color: '#555' }}>ORIGEM</label>
            <input value={origem} onChange={e => setOrigem(e.target.value)} placeholder="Instagram, Indicação..." className="h-10 px-3 font-display text-sm outline-none" style={inputStyle} />
          </div>

          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="font-mono-mm text-[10px] tracking-[0.08em]" style={{ color: '#555' }}>STATUS</label>
            <div className="flex gap-2 flex-wrap">
              {ALL_STATUSES_CLIENT.map(s => {
                const cfg = STATUS_CONFIG[s]
                return (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className="h-8 px-3 font-mono-mm text-[10px] tracking-[0.06em] transition-all"
                    style={{
                      background: status === s ? cfg.color : 'transparent',
                      color: status === s ? '#080808' : cfg.color,
                      border: `1px solid ${cfg.color}`,
                      borderRadius: '4px',
                      opacity: status === s ? 1 : 0.6,
                    }}
                  >
                    {s}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={!name.trim()}
          className="h-10 font-mono-mm text-[11px] tracking-[0.1em] transition-opacity"
          style={{
            background: name.trim() ? '#C9A84C' : 'rgba(201,168,76,0.3)',
            color: '#080808',
            borderRadius: '6px',
            opacity: name.trim() ? 1 : 0.5,
          }}
        >
          {isEdit ? 'SALVAR ALTERAÇÕES' : 'ADICIONAR CLIENTE'}
        </button>
      </div>
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  ClientDrawer                                                        */
/* ------------------------------------------------------------------ */

function ClientDrawer({ clientId, onClose, onEdit }: { clientId: string; onClose: () => void; onEdit: () => void }) {
  const { state, dispatch } = useAdmin()
  const client = state.clients.find(c => c.id === clientId)
  const [noteInput, setNoteInput] = useState('')
  const [activeTab, setActiveTab] = useState<'geral' | 'servicos' | 'notas' | 'historico'>('geral')

  if (!client) return null

  const cfg = STATUS_CONFIG[client.status]

  const addNote = () => {
    if (!noteInput.trim()) return
    dispatch({
      type: 'ADD_CLIENT_NOTE',
      clientId: client.id,
      note: {
        id: Date.now().toString(),
        category: 'CLIENTE',
        content: noteInput.trim(),
        color: 'default',
        pinned: false,
        createdAt: new Date().toLocaleDateString('pt-BR'),
      },
    })
    setNoteInput('')
  }

  const deleteClient = () => {
    dispatch({ type: 'DELETE_CLIENT', id: client.id })
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.65)' }} onClick={onClose} />

      {/* Drawer */}
      <aside
        className="fixed right-0 top-0 h-full z-50 flex flex-col overflow-y-auto"
        style={{ width: 'min(520px, 100vw)', background: '#0F0F0F', borderLeft: '1px solid rgba(255,255,255,0.07)' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center font-display font-bold text-base shrink-0"
              style={{ background: '#C9A84C', color: '#080808' }}
            >
              {client.initials}
            </div>
            <div>
              <h2 className="font-display font-semibold text-lg" style={{ color: '#F2F2F2' }}>{client.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className="font-mono-mm text-[10px] px-2 py-0.5 tracking-[0.08em]"
                  style={{ background: cfg.bg, color: cfg.color, borderRadius: '3px' }}
                >
                  {client.status}
                </span>
                <span className="font-mono-mm text-[10px]" style={{ color: '#555' }}>{client.niche}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="w-8 h-8 flex items-center justify-center transition-colors"
              style={{ color: '#555', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#C9A84C')}
              onMouseLeave={e => (e.currentTarget.style.color = '#555')}
              aria-label="Editar cliente"
            >
              <Edit3 size={14} />
            </button>
            <button onClick={onClose} style={{ color: '#555' }} aria-label="Fechar"><X size={20} /></button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          {(['geral', 'servicos', 'notas', 'historico'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 h-10 font-mono-mm text-[10px] tracking-[0.08em] uppercase transition-colors"
              style={{
                color: activeTab === tab ? '#C9A84C' : '#555',
                borderBottom: activeTab === tab ? '2px solid #C9A84C' : '2px solid transparent',
              }}
            >
              {tab === 'servicos' ? 'Serviços' : tab === 'historico' ? 'Histórico' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 p-6 flex flex-col gap-5">

          {/* ---- GERAL ---- */}
          {activeTab === 'geral' && (
            <>
              <div className="p-4 flex flex-col gap-3" style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px' }}>
                <p className="font-mono-mm text-[10px] tracking-[0.1em]" style={{ color: '#C9A84C' }}>CONTATO</p>
                {[
                  { Icon: Phone,  val: client.whatsapp,  label: 'WhatsApp' },
                  { Icon: Mail,   val: client.email,     label: 'E-mail' },
                  { Icon: AtSign, val: client.instagram, label: 'Instagram' },
                ].filter(r => r.val).map(({ Icon, val, label }) => (
                  <div key={label} className="flex items-center gap-3">
                    <Icon size={14} style={{ color: '#555' }} />
                    <span className="font-display text-sm" style={{ color: '#AAAAAA' }}>{val}</span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 flex flex-col gap-1" style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px' }}>
                  <p className="font-mono-mm text-[10px] tracking-[0.1em]" style={{ color: '#555' }}>FATURAMENTO TOTAL</p>
                  <p className="font-display font-bold text-2xl" style={{ color: '#C9A84C' }}>
                    {client.totalValue > 0 ? `R$ ${client.totalValue.toLocaleString('pt-BR')}` : '—'}
                  </p>
                </div>
                <div className="p-4 flex flex-col gap-1" style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px' }}>
                  <p className="font-mono-mm text-[10px] tracking-[0.1em]" style={{ color: '#555' }}>ORIGEM</p>
                  <p className="font-display font-medium text-base mt-auto" style={{ color: '#F2F2F2' }}>{client.origem}</p>
                </div>
              </div>

              {client.totalValue > 0 && (
                <div className="p-4" style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px' }}>
                  <p className="font-mono-mm text-[10px] tracking-[0.1em] mb-3" style={{ color: '#555' }}>FATURAMENTO MENSAL</p>
                  <ResponsiveContainer width="100%" height={80}>
                    <BarChart data={client.monthlyRevenue} barSize={8}>
                      <Bar dataKey="value" fill="#C9A84C" radius={[2, 2, 0, 0]} />
                      <Tooltip
                        contentStyle={{ background: '#111', border: 'none', fontSize: 11, fontFamily: 'monospace' }}
                        formatter={(v) => [`R$ ${Number(v ?? 0).toLocaleString('pt-BR')}`, '']}
                        labelFormatter={(l) => String(l ?? '')}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              <div className="p-4" style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px' }}>
                <p className="font-mono-mm text-[10px] tracking-[0.1em] mb-1" style={{ color: '#555' }}>ÚLTIMO PROJETO</p>
                <p className="font-display text-sm" style={{ color: '#AAAAAA' }}>{client.lastProject}</p>
              </div>

              {/* Delete client */}
              <button
                onClick={deleteClient}
                className="flex items-center gap-2 self-start font-mono-mm text-[11px] tracking-[0.08em] transition-opacity mt-2"
                style={{ color: '#C0392B', opacity: 0.6 }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '0.6')}
              >
                <Trash2 size={12} />
                REMOVER CLIENTE
              </button>
            </>
          )}

          {/* ---- SERVIÇOS ---- */}
          {activeTab === 'servicos' && (
            <div className="flex flex-col gap-2">
              {client.services.length === 0 ? (
                <p className="font-mono-mm text-[11px]" style={{ color: '#444' }}>Nenhum serviço registrado.</p>
              ) : client.services.map(s => (
                <div key={s.id} className="flex items-center justify-between p-4 gap-3" style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px' }}>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-medium text-sm truncate" style={{ color: '#F2F2F2' }}>{s.name}</p>
                    <p className="font-mono-mm text-[10px] mt-0.5" style={{ color: '#555' }}>{s.date}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <p className="font-display font-semibold text-sm" style={{ color: '#C9A84C' }}>
                      R$ {s.value.toLocaleString('pt-BR')}
                    </p>
                    <span
                      className="font-mono-mm text-[9px] px-2 py-0.5"
                      style={{
                        background: s.status === 'ENTREGUE' ? 'rgba(30,132,73,0.12)' : s.status === 'EM ANDAMENTO' ? 'rgba(212,172,13,0.1)' : 'rgba(36,113,163,0.12)',
                        color: s.status === 'ENTREGUE' ? '#1E8449' : s.status === 'EM ANDAMENTO' ? '#D4AC0D' : '#2471A3',
                        borderRadius: '3px',
                      }}
                    >
                      {s.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ---- NOTAS ---- */}
          {activeTab === 'notas' && (
            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <input
                  value={noteInput}
                  onChange={e => setNoteInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addNote()}
                  placeholder="Adicionar nota sobre o cliente..."
                  className="flex-1 h-9 px-3 font-display text-sm outline-none"
                  style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#F2F2F2' }}
                />
                <button onClick={addNote} className="h-9 px-4 font-mono-mm text-[10px] tracking-[0.08em]" style={{ background: '#C9A84C', color: '#080808', borderRadius: '6px' }}>
                  ADD
                </button>
              </div>
              {client.notes.length === 0 ? (
                <p className="font-mono-mm text-[11px]" style={{ color: '#444' }}>Sem notas para este cliente.</p>
              ) : client.notes.map(n => (
                <div key={n.id} className="p-4 flex items-start justify-between gap-3" style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px' }}>
                  <div className="flex-1 min-w-0">
                    <p className="font-mono-mm text-[9px] tracking-[0.08em] mb-1" style={{ color: '#C9A84C' }}>{n.category}</p>
                    <p className="font-display text-sm" style={{ color: '#AAAAAA', lineHeight: 1.5 }}>{n.content}</p>
                    <p className="font-mono-mm text-[10px] mt-2" style={{ color: '#333' }}>{n.createdAt}</p>
                  </div>
                  <button onClick={() => dispatch({ type: 'DELETE_CLIENT_NOTE', clientId: client.id, noteId: n.id })} style={{ color: '#333' }} aria-label="Remover nota">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* ---- HISTÓRICO ---- */}
          {activeTab === 'historico' && (
            <div className="flex flex-col gap-0">
              {client.history.length === 0 ? (
                <p className="font-mono-mm text-[11px]" style={{ color: '#444' }}>Sem histórico registrado.</p>
              ) : client.history.map((item, i) => {
                const Icon = HISTORY_ICONS[item.type] ?? FileText
                return (
                  <div key={item.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(201,168,76,0.12)', color: '#C9A84C' }}>
                        <Icon size={14} />
                      </div>
                      {i < client.history.length - 1 && (
                        <div className="w-px flex-1 my-1" style={{ background: 'rgba(255,255,255,0.05)' }} />
                      )}
                    </div>
                    <div className="flex-1 pb-5 min-w-0">
                      <p className="font-display font-medium text-sm" style={{ color: '#F2F2F2' }}>{item.title}</p>
                      <p className="font-mono-mm text-[10px]" style={{ color: '#555' }}>{item.date}</p>
                      {item.notes && (
                        <p className="font-display text-xs mt-1" style={{ color: '#666', lineHeight: 1.5 }}>{item.notes}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </aside>
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  Main CRM                                                            */
/* ------------------------------------------------------------------ */

const ALL_STATUSES: (ClientStatus | 'TODOS')[] = ['TODOS', 'ATIVO', 'EM PAUSA', 'CONCLUÍDO', 'PROSPECT']

export function AdminCRM() {
  const { state, dispatch } = useAdmin()
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<ClientStatus | 'TODOS'>('TODOS')
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)

  const filtered = useMemo(() => {
    return state.clients.filter(c => {
      const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.niche.toLowerCase().includes(search.toLowerCase()) ||
        c.empresa?.toLowerCase().includes(search.toLowerCase())
      const matchStatus = filterStatus === 'TODOS' || c.status === filterStatus
      return matchSearch && matchStatus
    })
  }, [state.clients, search, filterStatus])

  const handleSaveClient = (c: Client) => {
    if (editingClient) {
      dispatch({ type: 'UPDATE_CLIENT', payload: c })
    } else {
      dispatch({ type: 'ADD_CLIENT', payload: c })
    }
    setShowForm(false)
    setEditingClient(null)
  }

  const openEdit = () => {
    const client = state.clients.find(c => c.id === selectedClientId)
    if (client) {
      setEditingClient(client)
      setShowForm(true)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-semibold text-2xl" style={{ color: '#F2F2F2' }}>Clientes / CRM</h1>
          <p className="font-mono-mm text-[11px] tracking-[0.08em] mt-1" style={{ color: '#555' }}>
            {state.clients.filter(c => c.status === 'ATIVO').length} CLIENTES ATIVOS &nbsp;·&nbsp; {state.clients.length} TOTAL
          </p>
        </div>
        <button
          onClick={() => { setEditingClient(null); setShowForm(true) }}
          className="shrink-0 flex items-center gap-2 h-9 px-5 font-mono-mm text-[11px] tracking-[0.1em]"
          style={{ background: '#C9A84C', color: '#080808' }}
        >
          <Plus size={14} />
          NOVO CLIENTE
        </button>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div
          className="flex items-center gap-2 flex-1 h-10 px-3"
          style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '6px' }}
        >
          <Search size={14} style={{ color: '#444' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nome, nicho, empresa..."
            className="flex-1 bg-transparent outline-none font-display text-sm"
            style={{ color: '#F2F2F2' }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ color: '#444' }}><X size={14} /></button>
          )}
        </div>

        <div className="flex gap-1 flex-wrap">
          {ALL_STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className="h-10 px-3 font-mono-mm text-[10px] tracking-[0.06em] transition-colors"
              style={{
                background: filterStatus === s ? '#C9A84C' : '#111111',
                color: filterStatus === s ? '#080808' : '#555',
                border: '1px solid',
                borderColor: filterStatus === s ? '#C9A84C' : 'rgba(255,255,255,0.06)',
                borderRadius: '6px',
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Client table */}
      <div className="overflow-x-auto" style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px' }}>
        <table className="w-full min-w-[600px]">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {['CLIENTE', 'NICHO', 'CONTATO', 'STATUS', 'VALOR TOTAL', ''].map(h => (
                <th key={h} className="px-4 h-10 text-left font-mono-mm text-[10px] tracking-[0.08em]" style={{ color: '#555', background: '#0D0D0D' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center font-mono-mm text-[11px]" style={{ color: '#333' }}>
                  Nenhum cliente encontrado.
                </td>
              </tr>
            ) : filtered.map((c, i) => {
              const cfg = STATUS_CONFIG[c.status]
              return (
                <tr
                  key={c.id}
                  className="transition-colors"
                  style={{
                    borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    background: 'transparent',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#111111')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelectedClientId(c.id)}
                      className="flex items-center gap-3 text-left w-full"
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-xs shrink-0"
                        style={{ background: '#C9A84C', color: '#080808' }}
                      >
                        {c.initials}
                      </div>
                      <div className="min-w-0">
                        <p className="font-display font-medium text-sm truncate" style={{ color: '#F2F2F2' }}>{c.name}</p>
                        {c.empresa && <p className="font-mono-mm text-[10px] truncate" style={{ color: '#555' }}>{c.empresa}</p>}
                      </div>
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono-mm text-[10px] tracking-[0.06em]" style={{ color: '#777' }}>{c.niche}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-display text-sm" style={{ color: '#AAAAAA' }}>{c.whatsapp}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="font-mono-mm text-[10px] px-2 py-0.5 tracking-[0.06em]"
                      style={{ background: cfg.bg, color: cfg.color, borderRadius: '3px' }}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-display font-semibold text-sm" style={{ color: c.totalValue > 0 ? '#C9A84C' : '#333' }}>
                      {c.totalValue > 0 ? `R$ ${c.totalValue.toLocaleString('pt-BR')}` : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => setSelectedClientId(c.id)} style={{ color: '#444' }}>
                      <ChevronRight size={16} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {selectedClientId && (
        <ClientDrawer
          clientId={selectedClientId}
          onClose={() => setSelectedClientId(null)}
          onEdit={openEdit}
        />
      )}

      {showForm && (
        <ClientForm
          initial={editingClient}
          onSave={handleSaveClient}
          onClose={() => { setShowForm(false); setEditingClient(null) }}
        />
      )}
    </div>
  )
}
