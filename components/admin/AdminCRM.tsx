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
  ATIVO:       { color: '#4ADE80', bg: 'rgba(74,222,128,0.15)' },
  'EM PAUSA':  { color: '#FACC15', bg: 'rgba(250,204,21,0.15)' },
  CONCLUÍDO:   { color: '#C084FC', bg: 'rgba(192,132,252,0.15)' },
  PROSPECT:    { color: '#38BDF8', bg: 'rgba(56,189,248,0.15)' },
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
          width: 'min(540px, 95vw)',
          maxHeight: '90vh',
          transform: 'translate(-50%, -50%)',
          background: '#0F0F0F',
          border: '1px solid rgba(255,255,255,0.14)',
          borderRadius: '12px',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="font-mono-mm text-[11px] tracking-[0.12em] font-semibold" style={{ color: '#E5C158' }}>
            {isEdit ? 'EDITAR CLIENTE' : 'NOVO CLIENTE'}
          </p>
          <button onClick={onClose} className="text-[#CBD5E1] hover:text-white transition-colors" aria-label="Fechar"><X size={18} /></button>
        </div>

        {/* Form grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="font-mono-mm text-[10px] tracking-[0.08em] font-semibold" style={{ color: '#CBD5E1' }}>NOME *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Nome completo" className="h-10 px-3 font-display text-sm outline-none focus:border-[#C9A84C]" style={inputStyle} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-mono-mm text-[10px] tracking-[0.08em] font-semibold" style={{ color: '#CBD5E1' }}>NICHO</label>
            <input value={niche} onChange={e => setNiche(e.target.value)} placeholder="Ex: ARTISTA MUSICAL" className="h-10 px-3 font-display text-sm outline-none focus:border-[#C9A84C]" style={inputStyle} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-mono-mm text-[10px] tracking-[0.08em] font-semibold" style={{ color: '#CBD5E1' }}>EMPRESA</label>
            <input value={empresa} onChange={e => setEmpresa(e.target.value)} placeholder="Nome da empresa" className="h-10 px-3 font-display text-sm outline-none focus:border-[#C9A84C]" style={inputStyle} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-mono-mm text-[10px] tracking-[0.08em] font-semibold" style={{ color: '#CBD5E1' }}>WHATSAPP *</label>
            <input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="(15) 99999-0000" className="h-10 px-3 font-display text-sm outline-none focus:border-[#C9A84C]" style={inputStyle} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-mono-mm text-[10px] tracking-[0.08em] font-semibold" style={{ color: '#CBD5E1' }}>E-MAIL</label>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="email@dominio.com" type="email" className="h-10 px-3 font-display text-sm outline-none focus:border-[#C9A84C]" style={inputStyle} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-mono-mm text-[10px] tracking-[0.08em] font-semibold" style={{ color: '#CBD5E1' }}>INSTAGRAM</label>
            <input value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="@usuario" className="h-10 px-3 font-display text-sm outline-none focus:border-[#C9A84C]" style={inputStyle} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-mono-mm text-[10px] tracking-[0.08em] font-semibold" style={{ color: '#CBD5E1' }}>ORIGEM</label>
            <input value={origem} onChange={e => setOrigem(e.target.value)} placeholder="Instagram, Indicação..." className="h-10 px-3 font-display text-sm outline-none focus:border-[#C9A84C]" style={inputStyle} />
          </div>

          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="font-mono-mm text-[10px] tracking-[0.08em] font-semibold" style={{ color: '#CBD5E1' }}>STATUS</label>
            <div className="flex gap-2 flex-wrap">
              {ALL_STATUSES_CLIENT.map(s => {
                const cfg = STATUS_CONFIG[s]
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className="h-8 px-3 font-mono-mm text-[10px] tracking-[0.06em] font-semibold transition-all"
                    style={{
                      background: status === s ? cfg.color : 'transparent',
                      color: status === s ? '#080808' : cfg.color,
                      border: `1px solid ${cfg.color}`,
                      borderRadius: '4px',
                      opacity: status === s ? 1 : 0.8,
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
          type="button"
          onClick={handleSave}
          disabled={!name.trim()}
          className="h-11 font-mono-mm text-[11px] tracking-[0.1em] font-semibold transition-opacity mt-2"
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
/*  Client Sheet                                                        */
/* ------------------------------------------------------------------ */

function ClientSheet({ client, onClose, onEdit }: { client: Client; onClose: () => void; onEdit: () => void }) {
  const { dispatch } = useAdmin()
  const [activeTab, setActiveTab] = useState<'info' | 'history' | 'notes' | 'invoices'>('info')
  const [noteContent, setNoteContent] = useState('')
  const [noteCategory, setNoteCategory] = useState('CLIENTE')

  const cfg = STATUS_CONFIG[client.status]

  const handleAddNote = () => {
    if (!noteContent.trim()) return
    dispatch({
      type: 'ADD_CLIENT_NOTE',
      clientId: client.id,
      note: {
        id: Date.now().toString(),
        category: noteCategory,
        content: noteContent.trim(),
        color: 'default',
        pinned: false,
        createdAt: new Date().toLocaleDateString('pt-BR'),
      },
    })
    setNoteContent('')
  }

  return (
    <>
      <div className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.75)' }} onClick={onClose} />
      <aside
        className="fixed right-0 top-0 h-full z-50 flex flex-col overflow-y-auto"
        style={{ width: 'min(480px, 100vw)', background: '#0F0F0F', borderLeft: '1px solid rgba(255,255,255,0.12)' }}
      >
        {/* Top bar */}
        <div className="p-6 flex items-start justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center font-display font-bold text-lg shrink-0"
              style={{ background: '#C9A84C', color: '#080808' }}
            >
              {client.initials}
            </div>
            <div>
              <h2 className="font-display font-semibold text-lg text-[#FFFFFF]">{client.name}</h2>
              <span className="font-mono-mm text-[10px] text-[#CBD5E1]">{client.niche}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="p-2 transition-colors text-[#CBD5E1] hover:text-[#E5C158] hover:bg-[rgba(255,255,255,0.06)] rounded-md"
              title="Editar cliente"
            >
              <Edit3 size={16} />
            </button>
            <button onClick={onClose} className="p-2 text-[#CBD5E1] hover:text-white transition-colors" aria-label="Fechar">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[rgba(255,255,255,0.12)] bg-[#111111]">
          {(['info', 'history', 'notes', 'invoices'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 h-11 font-mono-mm text-[10px] tracking-[0.08em] font-semibold transition-colors outline-none"
              style={{
                color: activeTab === tab ? '#E5C158' : '#CBD5E1',
                borderBottom: activeTab === tab ? '2px solid #C9A84C' : '2px solid transparent',
              }}
            >
              {tab === 'info' && 'INFO'}
              {tab === 'history' && `HISTÓRICO (${client.history.length})`}
              {tab === 'notes' && `NOTAS (${client.notes.length})`}
              {tab === 'invoices' && `FATURAS (${client.invoices.length})`}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 flex-1 flex flex-col gap-4">
          {/* TAB: INFO */}
          {activeTab === 'info' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.08)' }}>
                <span className="font-mono-mm text-[10px] tracking-[0.08em] text-[#CBD5E1]">STATUS DE CONTRATO</span>
                <span className="font-mono-mm text-[10px] px-2.5 py-1 font-semibold" style={{ background: cfg.bg, color: cfg.color, borderRadius: '4px' }}>
                  {client.status}
                </span>
              </div>

              <div className="flex flex-col gap-2 p-4 rounded-lg" style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.08)' }}>
                {[
                  { Icon: Phone, label: 'WHATSAPP', val: client.whatsapp, href: `https://wa.me/${client.whatsapp.replace(/\D/g, '')}` },
                  ...(client.email ? [{ Icon: Mail, label: 'E-MAIL', val: client.email, href: `mailto:${client.email}` }] : []),
                  ...(client.instagram ? [{ Icon: AtSign, label: 'INSTAGRAM', val: client.instagram, href: `https://instagram.com/${client.instagram.replace('@', '')}` }] : []),
                ].map(({ Icon, label, val, href }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between py-2 border-b border-[rgba(255,255,255,0.06)] last:border-0 hover:text-[#C9A84C] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Icon size={14} className="text-[#CBD5E1]" />
                      <span className="font-mono-mm text-[10px] text-[#CBD5E1]">{label}</span>
                    </div>
                    <span className="font-display text-sm font-medium text-[#FFFFFF]">{val}</span>
                  </a>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-lg" style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <p className="font-mono-mm text-[10px] tracking-[0.1em] text-[#CBD5E1]">FATURAMENTO TOTAL</p>
                  <p className="font-display font-bold text-lg text-[#E5C158] mt-1">R$ {client.totalValue.toLocaleString('pt-BR')}</p>
                </div>
                <div className="p-3.5 rounded-lg" style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <p className="font-mono-mm text-[10px] tracking-[0.1em] text-[#CBD5E1]">ORIGEM</p>
                  <p className="font-display font-semibold text-sm text-[#F3F4F6] mt-1">{client.origem}</p>
                </div>
              </div>

              {client.monthlyRevenue.length > 0 && (
                <div className="p-4 rounded-lg" style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <p className="font-mono-mm text-[10px] tracking-[0.1em] mb-3 text-[#CBD5E1]">FATURAMENTO MENSAL</p>
                  <ResponsiveContainer width="100%" height={100}>
                    <BarChart data={client.monthlyRevenue}>
                      <Bar dataKey="value" fill="#C9A84C" radius={[2, 2, 0, 0]} />
                      <Tooltip contentStyle={{ background: '#0F0F0F', borderColor: 'rgba(255,255,255,0.1)', fontSize: 11 }} formatter={(v: any) => [`R$ ${v}`, 'Valor']} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              <div className="p-4 rounded-lg" style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="font-mono-mm text-[10px] tracking-[0.1em] mb-1 text-[#CBD5E1]">ÚLTIMO PROJETO</p>
                <p className="font-display text-sm font-medium text-[#F3F4F6]">{client.lastProject}</p>
              </div>
            </div>
          )}

          {/* TAB: HISTORY */}
          {activeTab === 'history' && (
            <div className="flex flex-col gap-3">
              {client.history.length === 0 ? (
                <p className="font-mono-mm text-xs text-[#CBD5E1] py-8 text-center">Nenhum histórico registrado.</p>
              ) : client.history.map(item => {
                const IconComp = HISTORY_ICONS[item.type] ?? FileText
                return (
                  <div key={item.id} className="p-4 rounded-lg flex items-start gap-3 bg-[#161616] border border-[rgba(255,255,255,0.08)]">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-[rgba(201,168,76,0.15)] text-[#E5C158]">
                      <IconComp size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-display font-medium text-sm text-[#F3F4F6]">{item.title}</p>
                        <span className="font-mono-mm text-[10px] text-[#CBD5E1] shrink-0">{item.date}</span>
                      </div>
                      <p className="font-display text-xs text-[#CBD5E1] mt-1" style={{ lineHeight: 1.5 }}>{item.notes}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* TAB: NOTES */}
          {activeTab === 'notes' && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2 p-3 rounded-lg bg-[#161616] border border-[rgba(255,255,255,0.08)]">
                <textarea
                  value={noteContent}
                  onChange={e => setNoteContent(e.target.value)}
                  placeholder="Nova observação sobre este cliente..."
                  rows={2}
                  className="bg-transparent font-display text-sm outline-none text-[#F3F4F6] resize-none placeholder-[#94A3B8]"
                />
                <div className="flex items-center justify-between pt-2 border-t border-[rgba(255,255,255,0.06)]">
                  <select
                    value={noteCategory}
                    onChange={e => setNoteCategory(e.target.value)}
                    className="bg-[#0F0F0F] px-2 py-1 font-mono-mm text-[10px] text-[#CBD5E1] border border-[rgba(255,255,255,0.1)] rounded outline-none"
                  >
                    <option value="CLIENTE">CLIENTE</option>
                    <option value="PRODUÇÃO">PRODUÇÃO</option>
                    <option value="FINANCEIRO">FINANCEIRO</option>
                  </select>
                  <button
                    onClick={handleAddNote}
                    disabled={!noteContent.trim()}
                    className="px-3 py-1 font-mono-mm text-[10px] font-semibold bg-[#C9A84C] text-[#080808] rounded disabled:opacity-40 transition-opacity"
                  >
                    SALVAR NOTA
                  </button>
                </div>
              </div>

              {client.notes.map(n => (
                <div key={n.id} className="p-4 rounded-lg bg-[#161616] border border-[rgba(255,255,255,0.08)] flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono-mm text-[10px] px-2 py-0.5 bg-[rgba(201,168,76,0.15)] text-[#E5C158] rounded font-semibold">
                      {n.category}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono-mm text-[10px] text-[#CBD5E1]">{n.createdAt}</span>
                      <button
                        onClick={() => dispatch({ type: 'DELETE_CLIENT_NOTE', clientId: client.id, noteId: n.id })}
                        className="text-[#CBD5E1] hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                  <p className="font-display text-sm text-[#F3F4F6]" style={{ lineHeight: 1.5 }}>{n.content}</p>
                </div>
              ))}
            </div>
          )}

          {/* TAB: INVOICES */}
          {activeTab === 'invoices' && (
            <div className="flex flex-col gap-3">
              {client.invoices.length === 0 ? (
                <p className="font-mono-mm text-xs text-[#CBD5E1] py-8 text-center">Nenhuma fatura registrada.</p>
              ) : client.invoices.map(inv => (
                <div key={inv.id} className="p-4 rounded-lg flex items-center justify-between bg-[#161616] border border-[rgba(255,255,255,0.08)]">
                  <div>
                    <p className="font-mono-mm text-xs font-semibold text-[#FFFFFF]">{inv.id}</p>
                    <p className="font-mono-mm text-[10px] text-[#CBD5E1] mt-0.5">{inv.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-display font-bold text-sm text-[#E5C158]">R$ {inv.value.toLocaleString('pt-BR')}</p>
                    <span
                      className="inline-block font-mono-mm text-[9px] px-2 py-0.5 rounded font-semibold mt-1"
                      style={{
                        background: inv.status === 'RECEBIDO' ? 'rgba(74,222,128,0.15)' : 'rgba(250,204,21,0.15)',
                        color: inv.status === 'RECEBIDO' ? '#4ADE80' : '#FACC15',
                      }}
                    >
                      {inv.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-auto pt-4 border-t border-[rgba(255,255,255,0.12)]">
            <button
              onClick={() => { dispatch({ type: 'DELETE_CLIENT', id: client.id }); onClose() }}
              className="flex items-center gap-2 font-mono-mm text-[11px] text-red-400 hover:text-red-300 font-semibold"
            >
              <Trash2 size={14} />
              REMOVER CLIENTE
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  Main CRM Component                                                 */
/* ------------------------------------------------------------------ */

export function AdminCRM() {
  const { state, dispatch } = useAdmin()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ClientStatus | 'ALL'>('ALL')
  const [nicheFilter, setNicheFilter] = useState('ALL')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)

  // Unique niches
  const niches = useMemo(() => {
    return Array.from(new Set(state.clients.map(c => c.niche))).sort()
  }, [state.clients])

  // Filtered clients
  const filteredClients = useMemo(() => {
    return state.clients.filter(c => {
      const matchSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.niche.toLowerCase().includes(search.toLowerCase()) ||
        (c.empresa && c.empresa.toLowerCase().includes(search.toLowerCase()))
      const matchStatus = statusFilter === 'ALL' || c.status === statusFilter
      const matchNiche = nicheFilter === 'ALL' || c.niche === nicheFilter
      return matchSearch && matchStatus && matchNiche
    })
  }, [state.clients, search, statusFilter, nicheFilter])

  // Aggregate metrics
  const totalRevenue = useMemo(() => state.clients.reduce((s, c) => s + c.totalValue, 0), [state.clients])
  const activeCount = useMemo(() => state.clients.filter(c => c.status === 'ATIVO').length, [state.clients])

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-semibold text-2xl text-[#FFFFFF]">Clientes & CRM</h1>
          <p className="font-mono-mm text-xs tracking-[0.08em] mt-1 text-[#CBD5E1]">
            {state.clients.length} CLIENTES CADASTRADOS · {activeCount} ATIVOS · R$ {totalRevenue.toLocaleString('pt-BR')} EM VENDAS
          </p>
        </div>
        <button
          onClick={() => setShowNewForm(true)}
          className="flex items-center justify-center gap-2 h-11 px-5 font-mono-mm text-xs tracking-[0.08em] font-semibold rounded-lg"
          style={{ background: '#C9A84C', color: '#080808' }}
        >
          <Plus size={16} />
          NOVO CLIENTE
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="flex-1 flex items-center gap-2 px-3.5 h-11 bg-[#111111] border border-[rgba(255,255,255,0.14)] rounded-lg">
          <Search size={16} className="text-[#CBD5E1]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nome, nicho ou empresa..."
            className="flex-1 bg-transparent font-display text-sm outline-none text-[#FFFFFF] placeholder-[#94A3B8]"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-[#CBD5E1] hover:text-white"><X size={14} /></button>
          )}
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as any)}
          className="h-11 px-3.5 font-mono-mm text-xs tracking-[0.06em] bg-[#111111] border border-[rgba(255,255,255,0.14)] text-[#F3F4F6] rounded-lg outline-none"
        >
          <option value="ALL">TODOS OS STATUS</option>
          {ALL_STATUSES_CLIENT.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {/* Niche filter */}
        <select
          value={nicheFilter}
          onChange={e => setNicheFilter(e.target.value)}
          className="h-11 px-3.5 font-mono-mm text-xs tracking-[0.06em] bg-[#111111] border border-[rgba(255,255,255,0.14)] text-[#F3F4F6] rounded-lg outline-none"
        >
          <option value="ALL">TODOS OS NICHOS</option>
          {niches.map(n => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </div>

      {/* Clients Table / Cards Grid */}
      <div className="bg-[#111111] border border-[rgba(255,255,255,0.12)] rounded-xl overflow-hidden">
        {filteredClients.length === 0 ? (
          <p className="font-mono-mm text-xs py-12 text-center text-[#CBD5E1]">
            Nenhum cliente encontrado.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.12)] bg-[#161616]">
                  <th className="px-5 py-3 font-mono-mm text-xs font-semibold text-[#E5C158]">CLIENTE</th>
                  <th className="px-4 py-3 font-mono-mm text-xs font-semibold text-[#E5C158]">NICHO</th>
                  <th className="px-4 py-3 font-mono-mm text-xs font-semibold text-[#E5C158]">CONTATO</th>
                  <th className="px-4 py-3 font-mono-mm text-xs font-semibold text-[#E5C158]">STATUS</th>
                  <th className="px-4 py-3 font-mono-mm text-xs font-semibold text-[#E5C158] text-right">VALOR TOTAL</th>
                  <th className="px-4 py-3 font-mono-mm text-xs font-semibold text-[#E5C158] text-right">AÇÕES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(255,255,255,0.08)]">
                {filteredClients.map(c => {
                  const cfg = STATUS_CONFIG[c.status]
                  return (
                    <tr
                      key={c.id}
                      onClick={() => setSelectedClient(c)}
                      className="hover:bg-[rgba(255,255,255,0.03)] cursor-pointer transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center font-display font-bold text-xs shrink-0 bg-[#C9A84C] text-[#080808]">
                            {c.initials}
                          </div>
                          <div>
                            <p className="font-display font-semibold text-sm text-[#FFFFFF]">{c.name}</p>
                            {c.empresa && <p className="font-mono-mm text-xs text-[#CBD5E1]">{c.empresa}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 font-mono-mm text-xs font-medium text-[#CBD5E1]">
                        {c.niche}
                      </td>
                      <td className="px-4 py-4 font-mono-mm text-xs text-[#F3F4F6]">
                        {c.whatsapp}
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-mono-mm text-[10px] px-2.5 py-1 font-semibold rounded" style={{ background: cfg.bg, color: cfg.color }}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-display font-bold text-sm text-[#E5C158] text-right">
                        R$ {c.totalValue.toLocaleString('pt-BR')}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button
                          onClick={e => {
                            e.stopPropagation()
                            setEditingClient(c)
                          }}
                          className="p-1.5 text-[#CBD5E1] hover:text-[#E5C158] transition-colors rounded"
                          title="Editar"
                        >
                          <Edit3 size={15} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Client Detail Sheet */}
      {selectedClient && (
        <ClientSheet
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
          onEdit={() => {
            setEditingClient(selectedClient)
            setSelectedClient(null)
          }}
        />
      )}

      {/* New Client Form */}
      {showNewForm && (
        <ClientForm
          onSave={newClient => {
            dispatch({ type: 'ADD_CLIENT', payload: newClient })
            setShowNewForm(false)
          }}
          onClose={() => setShowNewForm(false)}
        />
      )}

      {/* Edit Client Form */}
      {editingClient && (
        <ClientForm
          initial={editingClient}
          onSave={updated => {
            dispatch({ type: 'UPDATE_CLIENT', payload: updated })
            setEditingClient(null)
          }}
          onClose={() => setEditingClient(null)}
        />
      )}
    </div>
  )
}
