'use client'

import { useMemo, useState } from 'react'
import { useAdmin } from '@/lib/admin-context'
import { TrendingUp, Plus, X, Trash2 } from 'lucide-react'
import {
  AreaChart, Area, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts'

/* ------------------------------------------------------------------ */
/*  Config                                                              */
/* ------------------------------------------------------------------ */

const NICHE_COLORS = ['#E5C158', '#5DADE2', '#52BE80', '#BB8FCE', '#F1948A', '#FACC15']

const STATUS_CONFIG: Record<string, { color: string; bg: string }> = {
  RECEBIDO:  { color: '#4ADE80', bg: 'rgba(74,222,128,0.15)' },
  PENDENTE:  { color: '#FACC15', bg: 'rgba(250,204,21,0.15)' },
  CANCELADO: { color: '#F87171', bg: 'rgba(248,113,113,0.15)' },
  PAGO:      { color: '#F87171', bg: 'rgba(248,113,113,0.15)' },
}

const MONTH_LABELS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
const EXPENSE_CATEGORIES = ['GERAL', 'EQUIPAMENTO', 'EQUIPE', 'LOCAÇÃO', 'TRANSPORTE', 'ALIMENTAÇÃO', 'MARKETING', 'SOFTWARE', 'OUTRO']

function parseBrDate(date: string): { day: number; month: number; year: number } | null {
  const [d, m, y] = date.split('/').map(Number)
  if (!d || !m || !y) return null
  return { day: d, month: m, year: y }
}

function toTitleCase(value: string): string {
  return value
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function todayBr(): string {
  return new Date().toLocaleDateString('pt-BR')
}

/* ------------------------------------------------------------------ */
/*  Custom tooltip                                                      */
/* ------------------------------------------------------------------ */

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.16)', borderRadius: '6px', padding: '8px 12px' }}>
      <p className="font-mono-mm text-[10px] mb-1 font-semibold" style={{ color: '#E5C158' }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="font-display font-semibold text-sm" style={{ color: p.color ?? '#FFFFFF' }}>
          {p.name}: R$ {Number(p.value).toLocaleString('pt-BR')}
        </p>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                      */
/* ------------------------------------------------------------------ */

export function AdminFinanceiro() {
  const { state, dispatch } = useAdmin()
  const [showReceita, setShowReceita] = useState(false)
  const [showCusto, setShowCusto] = useState(false)

  // Receita form
  const [recClientId, setRecClientId] = useState('')
  const [recValue, setRecValue] = useState('')
  const [recDate, setRecDate] = useState('')
  const [recStatus, setRecStatus] = useState<'RECEBIDO' | 'PENDENTE'>('RECEBIDO')

  // Custo form
  const [cusDesc, setCusDesc] = useState('')
  const [cusCategory, setCusCategory] = useState('GERAL')
  const [cusValue, setCusValue] = useState('')
  const [cusDate, setCusDate] = useState('')
  const [cusStatus, setCusStatus] = useState<'PAGO' | 'PENDENTE'>('PAGO')

  // All invoices across all clients
  const allInvoices = useMemo(
    () => state.clients.flatMap(c => c.invoices.map(inv => ({ ...inv, clientName: c.name, clientId: c.id }))),
    [state.clients]
  )

  const expenses = useMemo(() => state.expenses ?? [], [state.expenses])

  const totalRecebido = allInvoices.filter(i => i.status === 'RECEBIDO').reduce((s, i) => s + i.value, 0)
  const totalPendente = allInvoices.filter(i => i.status === 'PENDENTE').reduce((s, i) => s + i.value, 0)
  const totalGeral = allInvoices.filter(i => i.status !== 'CANCELADO').reduce((s, i) => s + i.value, 0)
  const recebidoCount = allInvoices.filter(i => i.status === 'RECEBIDO').length

  const totalCustosPagos = expenses.filter(e => e.status === 'PAGO').reduce((s, e) => s + e.value, 0)
  const totalCustosPendentes = expenses.filter(e => e.status === 'PENDENTE').reduce((s, e) => s + e.value, 0)
  const lucroLiquido = totalRecebido - totalCustosPagos

  // Monthly billing series (receita x custo)
  const monthlySeries = useMemo(() => {
    const byMonth = new Map<string, { label: string; receita: number; custo: number }>()
    const put = (date: string, field: 'receita' | 'custo', value: number) => {
      const parsed = parseBrDate(date)
      if (!parsed) return
      const key = `${parsed.year}-${String(parsed.month).padStart(2, '0')}`
      const entry = byMonth.get(key) ?? { label: MONTH_LABELS[parsed.month - 1], receita: 0, custo: 0 }
      entry[field] += value
      byMonth.set(key, entry)
    }
    for (const inv of allInvoices) {
      if (inv.status === 'CANCELADO') continue
      put(inv.date, 'receita', inv.value)
    }
    for (const exp of expenses) {
      if (exp.status === 'CANCELADO') continue
      put(exp.date, 'custo', exp.value)
    }
    return [...byMonth.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([, v]) => v)
  }, [allInvoices, expenses])

  const currentMonthRevenue = monthlySeries.at(-1)?.receita ?? 0
  const prevMonthRevenue = monthlySeries.at(-2)?.receita ?? 0
  const monthDelta = prevMonthRevenue > 0
    ? ((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue * 100).toFixed(1)
    : '0'

  // Revenue by niche
  const revenueByNiche = useMemo(() => {
    const byNiche = new Map<string, number>()
    for (const c of state.clients) {
      byNiche.set(c.niche, (byNiche.get(c.niche) ?? 0) + c.totalValue)
    }
    return [...byNiche.entries()]
      .filter(([, value]) => value > 0)
      .sort(([, a], [, b]) => b - a)
      .map(([niche, value]) => ({ niche: toTitleCase(niche), value }))
  }, [state.clients])

  // Most recent invoices + expenses combined for table
  const recentTransactions = useMemo(() => {
    const invs = [...allInvoices]
      .filter(inv => parseBrDate(inv.date))
      .map(inv => ({ id: inv.id, label: inv.clientName, date: inv.date, status: inv.status, value: inv.value, kind: 'RECEITA' as const, clientId: inv.clientId }))
    const exps = [...expenses]
      .filter(e => parseBrDate(e.date))
      .map(e => ({ id: e.id, label: e.description, date: e.date, status: e.status, value: -e.value, kind: 'CUSTO' as const, clientId: '' }))
    const all = [...invs, ...exps]
    const score = (d: string) => {
      const p = parseBrDate(d)!
      return p.year * 10000 + p.month * 100 + p.day
    }
    return all.sort((a, b) => score(b.date) - score(a.date)).slice(0, 10)
  }, [allInvoices, expenses])

  const summaryCards = [
    { label: 'RECEBIDO',  value: `R$ ${totalRecebido.toLocaleString('pt-BR')}`,  up: true,  delta: `${recebidoCount} faturas` },
    { label: 'A RECEBER', value: `R$ ${totalPendente.toLocaleString('pt-BR')}`,  up: false, delta: `${state.clients.filter(c => c.invoices.some(i => i.status === 'PENDENTE')).length} clientes` },
    { label: 'CUSTOS PAGOS', value: `R$ ${totalCustosPagos.toLocaleString('pt-BR')}`, up: false, delta: totalCustosPendentes > 0 ? `+ R$ ${totalCustosPendentes.toLocaleString('pt-BR')} pend.` : `${expenses.length} lançamentos` },
    { label: 'LUCRO LÍQUIDO', value: `R$ ${lucroLiquido.toLocaleString('pt-BR')}`, up: lucroLiquido >= 0, delta: `Receita R$ ${totalGeral.toLocaleString('pt-BR')}` },
  ]

  const inputStyle = {
    background: '#161616',
    border: '1px solid rgba(255,255,255,0.16)',
    borderRadius: '6px',
    color: '#F9FAFB',
  }

  const handleAddReceita = () => {
    const v = parseFloat(String(recValue).replace(',', '.')) || 0
    if (!recClientId || v <= 0) return
    const dateStr = recDate ? new Date(recDate + 'T12:00:00').toLocaleDateString('pt-BR') : todayBr()
    dispatch({
      type: 'ADD_INVOICE',
      clientId: recClientId,
      invoice: {
        id: `INV-${Date.now().toString().slice(-6)}`,
        date: dateStr,
        value: v,
        status: recStatus,
      },
    })
    setRecClientId(''); setRecValue(''); setRecDate(''); setRecStatus('RECEBIDO')
    setShowReceita(false)
  }

  const handleAddCusto = () => {
    const v = parseFloat(String(cusValue).replace(',', '.')) || 0
    if (!cusDesc.trim() || v <= 0) return
    const dateStr = cusDate ? new Date(cusDate + 'T12:00:00').toLocaleDateString('pt-BR') : todayBr()
    dispatch({
      type: 'ADD_EXPENSE',
      payload: {
        id: `exp-${Date.now()}`,
        description: cusDesc.trim(),
        category: cusCategory,
        date: dateStr,
        value: v,
        status: cusStatus,
      },
    })
    setCusDesc(''); setCusCategory('GERAL'); setCusValue(''); setCusDate(''); setCusStatus('PAGO')
    setShowCusto(false)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-semibold text-2xl text-[#FFFFFF]">Financeiro</h1>
          <p className="font-mono-mm text-xs tracking-[0.08em] mt-1 uppercase text-[#CBD5E1]">
            VISÃO GERAL · {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowReceita(true)}
            className="flex items-center gap-2 h-11 px-4 font-mono-mm text-[11px] tracking-[0.08em] font-semibold rounded-lg"
            style={{ background: '#C9A84C', color: '#080808' }}
          >
            <Plus size={15} /> RECEITA
          </button>
          <button
            onClick={() => setShowCusto(true)}
            className="flex items-center gap-2 h-11 px-4 font-mono-mm text-[11px] tracking-[0.08em] font-semibold rounded-lg bg-[#161616] border border-[rgba(248,113,113,0.4)] text-[#F87171]"
          >
            <Plus size={15} /> CUSTO
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {summaryCards.map(card => (
          <div
            key={card.label}
            className="p-5 flex flex-col gap-2 bg-[#111111] border border-[rgba(255,255,255,0.12)] rounded-xl"
          >
            <p className="font-mono-mm text-xs tracking-[0.08em] font-semibold" style={{ color: '#E5C158' }}>{card.label}</p>
            <p className="font-display font-bold text-2xl text-[#FFFFFF]">{card.value}</p>
            <div className="flex items-center gap-1">
              <TrendingUp size={13} style={{ color: card.up ? '#4ADE80' : '#FACC15' }} />
              <span className="font-mono-mm text-xs font-semibold" style={{ color: card.up ? '#4ADE80' : '#FACC15' }}>
                {card.delta}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[60%_38%] gap-4">
        {/* Area chart — monthly revenue x costs */}
        <div className="p-4 sm:p-5 bg-[#111111] border border-[rgba(255,255,255,0.12)] rounded-xl">
          <p className="font-mono-mm text-xs tracking-[0.08em] font-semibold mb-1" style={{ color: '#E5C158' }}>
            RECEITA × CUSTOS
          </p>
          <div className="flex gap-4 mb-4">
            <span className="flex items-center gap-1.5 font-mono-mm text-[10px] text-[#CBD5E1]"><span className="w-2.5 h-2.5 rounded-full" style={{ background: '#E5C158' }} /> Receita</span>
            <span className="flex items-center gap-1.5 font-mono-mm text-[10px] text-[#CBD5E1]"><span className="w-2.5 h-2.5 rounded-full" style={{ background: '#F87171' }} /> Custos</span>
          </div>
          {monthlySeries.length === 0 ? (
            <p className="font-mono-mm text-xs py-14 text-center text-[#CBD5E1]">Nenhum lançamento ainda. Adicione uma receita ou custo.</p>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={monthlySeries} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#C9A84C" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#C9A84C" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="label" tick={{ fill: '#D1D5DB', fontSize: 10, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#D1D5DB', fontSize: 10, fontFamily: 'monospace' }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="receita" name="Receita" stroke="#E5C158" strokeWidth={2.5} fill="url(#goldGrad)" dot={{ fill: '#E5C158', r: 3, strokeWidth: 0 }} activeDot={{ r: 5 }} />
                <Area type="monotone" dataKey="custo" name="Custo" stroke="#F87171" strokeWidth={2} fill="transparent" dot={{ fill: '#F87171', r: 2, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
          <p className="font-mono-mm text-[10px] mt-3 text-[#CBD5E1]">ESTE MÊS R$ {currentMonthRevenue.toLocaleString('pt-BR')} · {monthDelta}% vs mês ant.</p>
        </div>

        {/* Donut — revenue by niche */}
        <div className="p-4 sm:p-5 flex flex-col bg-[#111111] border border-[rgba(255,255,255,0.12)] rounded-xl">
          <p className="font-mono-mm text-xs tracking-[0.08em] font-semibold mb-4" style={{ color: '#E5C158' }}>
            RECEITA POR NICHO
          </p>
          <div className="flex-1 flex items-center justify-center">
            {revenueByNiche.length === 0 ? (
              <p className="font-mono-mm text-xs py-10 text-center text-[#CBD5E1]">Sem receita registrada ainda.</p>
            ) : (
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={revenueByNiche} dataKey="value" nameKey="niche" cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={3}>
                    {revenueByNiche.map((_, idx) => (
                      <Cell key={idx} fill={NICHE_COLORS[idx % NICHE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#161616', borderColor: 'rgba(255,255,255,0.16)', fontSize: 11, color: '#FFF' }} formatter={(v: any) => [`R$ ${v.toLocaleString('pt-BR')}`, 'Valor']} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {revenueByNiche.map((item, idx) => (
              <div key={item.niche} className="flex items-center gap-1.5 font-mono-mm text-[10px] text-[#CBD5E1]">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: NICHE_COLORS[idx % NICHE_COLORS.length] }} />
                <span>{item.niche}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="p-4 sm:p-5 bg-[#111111] border border-[rgba(255,255,255,0.12)] rounded-xl">
        <p className="font-mono-mm text-xs tracking-[0.08em] font-semibold mb-4 text-[#E5C158]">
          MOVIMENTAÇÕES RECENTES
        </p>
        {recentTransactions.length === 0 ? (
          <p className="font-mono-mm text-xs py-6 text-[#CBD5E1]">Nenhum lançamento ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.12)] text-[#E5C158] font-mono-mm text-xs font-semibold">
                  <th className="py-2.5 px-3">TIPO</th>
                  <th className="py-2.5 px-3">DESCRIÇÃO</th>
                  <th className="py-2.5 px-3">DATA</th>
                  <th className="py-2.5 px-3">STATUS</th>
                  <th className="py-2.5 px-3 text-right">VALOR</th>
                  <th className="py-2.5 px-3 text-right">AÇÃO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(255,255,255,0.08)] font-display text-sm">
                {recentTransactions.map(inv => {
                  const cfg = STATUS_CONFIG[inv.status] ?? { color: '#CBD5E1', bg: 'rgba(255,255,255,0.1)' }
                  return (
                    <tr key={`${inv.kind}-${inv.id}`} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                      <td className="py-3 px-3 font-mono-mm text-[10px] font-semibold text-[#CBD5E1]">{inv.kind}</td>
                      <td className="py-3 px-3 text-[#F3F4F6] font-medium">{inv.label}</td>
                      <td className="py-3 px-3 font-mono-mm text-xs text-[#CBD5E1]">{inv.date}</td>
                      <td className="py-3 px-3">
                        <span className="font-mono-mm text-[10px] px-2.5 py-0.5 rounded font-semibold" style={{ background: cfg.bg, color: cfg.color }}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-bold text-right" style={{ color: inv.value >= 0 ? '#E5C158' : '#F87171' }}>
                        {inv.value >= 0 ? '+' : '−'} R$ {Math.abs(inv.value).toLocaleString('pt-BR')}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => {
                            if (inv.kind === 'RECEITA') dispatch({ type: 'DELETE_INVOICE', clientId: inv.clientId, invoiceId: inv.id })
                            else dispatch({ type: 'DELETE_EXPENSE', id: inv.id })
                          }}
                          className="p-1.5 text-[#CBD5E1] hover:text-red-400 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 size={14} />
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

      {/* Modal Receita */}
      {showReceita && (
        <>
          <div className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.75)' }} onClick={() => setShowReceita(false)} />
          <div className="fixed top-1/2 left-1/2 z-50 flex flex-col gap-4 p-6" style={{ width: 'min(480px, 95vw)', transform: 'translate(-50%, -50%)', background: '#0F0F0F', border: '1px solid rgba(255,255,255,0.14)', borderRadius: '12px' }}>
            <div className="flex items-center justify-between">
              <p className="font-mono-mm text-[11px] tracking-[0.12em] font-semibold" style={{ color: '#E5C158' }}>NOVA RECEITA</p>
              <button onClick={() => setShowReceita(false)} className="text-[#CBD5E1] hover:text-white"><X size={18} /></button>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="font-mono-mm text-[10px] font-semibold text-[#CBD5E1]">CLIENTE *</label>
                <select value={recClientId} onChange={e => setRecClientId(e.target.value)} className="h-10 px-3 font-display text-sm outline-none" style={inputStyle}>
                  <option value="">Selecionar...</option>
                  {state.clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-mono-mm text-[10px] font-semibold text-[#CBD5E1]">VALOR (R$) *</label>
                  <input type="number" min="0" step="0.01" value={recValue} onChange={e => setRecValue(e.target.value)} placeholder="0,00" className="h-10 px-3 font-display text-sm outline-none" style={inputStyle} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-mono-mm text-[10px] font-semibold text-[#CBD5E1]">DATA</label>
                  <input type="date" value={recDate} onChange={e => setRecDate(e.target.value)} className="h-10 px-3 font-display text-sm outline-none" style={inputStyle} />
                </div>
              </div>
              <div className="flex gap-2">
                {(['RECEBIDO', 'PENDENTE'] as const).map(s => (
                  <button key={s} type="button" onClick={() => setRecStatus(s)} className="h-8 px-3 font-mono-mm text-[10px] font-semibold rounded" style={{ background: recStatus === s ? '#C9A84C' : 'transparent', color: recStatus === s ? '#080808' : '#CBD5E1', border: '1px solid rgba(255,255,255,0.2)' }}>{s}</button>
                ))}
              </div>
            </div>
            <button onClick={handleAddReceita} disabled={!recClientId || !(parseFloat(recValue) > 0)} className="h-11 font-mono-mm text-[11px] font-semibold rounded-lg" style={{ background: '#C9A84C', color: '#080808', opacity: recClientId && parseFloat(recValue) > 0 ? 1 : 0.5 }}>ADICIONAR RECEITA</button>
          </div>
        </>
      )}

      {/* Modal Custo */}
      {showCusto && (
        <>
          <div className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.75)' }} onClick={() => setShowCusto(false)} />
          <div className="fixed top-1/2 left-1/2 z-50 flex flex-col gap-4 p-6" style={{ width: 'min(480px, 95vw)', transform: 'translate(-50%, -50%)', background: '#0F0F0F', border: '1px solid rgba(255,255,255,0.14)', borderRadius: '12px' }}>
            <div className="flex items-center justify-between">
              <p className="font-mono-mm text-[11px] tracking-[0.12em] font-semibold" style={{ color: '#F87171' }}>NOVO CUSTO</p>
              <button onClick={() => setShowCusto(false)} className="text-[#CBD5E1] hover:text-white"><X size={18} /></button>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="font-mono-mm text-[10px] font-semibold text-[#CBD5E1]">DESCRIÇÃO *</label>
                <input value={cusDesc} onChange={e => setCusDesc(e.target.value)} placeholder="Ex: Aluguel estúdio, freelancer edição..." className="h-10 px-3 font-display text-sm outline-none" style={inputStyle} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-mono-mm text-[10px] font-semibold text-[#CBD5E1]">CATEGORIA</label>
                  <select value={cusCategory} onChange={e => setCusCategory(e.target.value)} className="h-10 px-3 font-display text-sm outline-none" style={inputStyle}>
                    {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-mono-mm text-[10px] font-semibold text-[#CBD5E1]">VALOR (R$) *</label>
                  <input type="number" min="0" step="0.01" value={cusValue} onChange={e => setCusValue(e.target.value)} placeholder="0,00" className="h-10 px-3 font-display text-sm outline-none" style={inputStyle} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-mono-mm text-[10px] font-semibold text-[#CBD5E1]">DATA</label>
                  <input type="date" value={cusDate} onChange={e => setCusDate(e.target.value)} className="h-10 px-3 font-display text-sm outline-none" style={inputStyle} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-mono-mm text-[10px] font-semibold text-[#CBD5E1]">STATUS</label>
                  <div className="flex gap-2 h-10 items-center">
                    {(['PAGO', 'PENDENTE'] as const).map(s => (
                      <button key={s} type="button" onClick={() => setCusStatus(s)} className="h-8 px-3 font-mono-mm text-[10px] font-semibold rounded" style={{ background: cusStatus === s ? '#F87171' : 'transparent', color: cusStatus === s ? '#080808' : '#CBD5E1', border: '1px solid rgba(255,255,255,0.2)' }}>{s}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <button onClick={handleAddCusto} disabled={!cusDesc.trim() || !(parseFloat(cusValue) > 0)} className="h-11 font-mono-mm text-[11px] font-semibold rounded-lg" style={{ background: '#F87171', color: '#080808', opacity: cusDesc.trim() && parseFloat(cusValue) > 0 ? 1 : 0.5 }}>ADICIONAR CUSTO</button>
          </div>
        </>
      )}
    </div>
  )
}
