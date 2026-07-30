'use client'

import { useMemo } from 'react'
import { useAdmin } from '@/lib/admin-context'
import { TrendingUp } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
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
}

const MONTH_LABELS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

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

/* ------------------------------------------------------------------ */
/*  Custom tooltip                                                      */
/* ------------------------------------------------------------------ */

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.16)', borderRadius: '6px', padding: '8px 12px' }}>
      <p className="font-mono-mm text-[10px] mb-1 font-semibold" style={{ color: '#E5C158' }}>{label}</p>
      <p className="font-display font-semibold text-sm" style={{ color: '#FFFFFF' }}>
        R$ {Number(payload[0].value).toLocaleString('pt-BR')}
      </p>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                      */
/* ------------------------------------------------------------------ */

export function AdminFinanceiro() {
  const { state } = useAdmin()

  // All invoices across all clients
  const allInvoices = useMemo(
    () => state.clients.flatMap(c => c.invoices.map(inv => ({ ...inv, clientName: c.name }))),
    [state.clients]
  )

  const totalRecebido = allInvoices.filter(i => i.status === 'RECEBIDO').reduce((s, i) => s + i.value, 0)
  const totalPendente = allInvoices.filter(i => i.status === 'PENDENTE').reduce((s, i) => s + i.value, 0)
  const totalGeral = allInvoices.reduce((s, i) => s + i.value, 0)
  const recebidoCount = allInvoices.filter(i => i.status === 'RECEBIDO').length

  // Monthly billing series
  const monthlyRevenue = useMemo(() => {
    const byMonth = new Map<string, { label: string; value: number }>()
    for (const inv of allInvoices) {
      const parsed = parseBrDate(inv.date)
      if (!parsed) continue
      const key = `${parsed.year}-${String(parsed.month).padStart(2, '0')}`
      const entry = byMonth.get(key)
      if (entry) entry.value += inv.value
      else byMonth.set(key, { label: MONTH_LABELS[parsed.month - 1], value: inv.value })
    }
    return [...byMonth.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([, v]) => v)
  }, [allInvoices])

  const currentMonthRevenue = monthlyRevenue.at(-1)?.value ?? 0
  const prevMonthRevenue = monthlyRevenue.at(-2)?.value ?? 0
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

  // Most recent invoices
  const recentTransactions = useMemo(() => {
    return [...allInvoices]
      .filter(inv => parseBrDate(inv.date))
      .sort((a, b) => {
        const pa = parseBrDate(a.date)!
        const pb = parseBrDate(b.date)!
        return (pb.year * 10000 + pb.month * 100 + pb.day) - (pa.year * 10000 + pa.month * 100 + pa.day)
      })
      .slice(0, 8)
  }, [allInvoices])

  const summaryCards = [
    { label: 'RECEBIDO (TOTAL)',  value: `R$ ${totalRecebido.toLocaleString('pt-BR')}`,  up: true,  delta: `${recebidoCount} faturas` },
    { label: 'PENDENTE',          value: `R$ ${totalPendente.toLocaleString('pt-BR')}`,  up: false, delta: `${state.clients.filter(c => c.invoices.some(i => i.status === 'PENDENTE')).length} clientes` },
    { label: 'ESTE MÊS',          value: `R$ ${currentMonthRevenue.toLocaleString('pt-BR')}`,  up: Number(monthDelta) >= 0, delta: `${monthDelta}% vs mês ant.` },
    { label: 'TOTAL HISTÓRICO',   value: `R$ ${totalGeral.toLocaleString('pt-BR')}`,     up: true,  delta: `${allInvoices.length} faturas` },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="font-display font-semibold text-2xl text-[#FFFFFF]">Financeiro</h1>
        <p className="font-mono-mm text-xs tracking-[0.08em] mt-1 uppercase text-[#CBD5E1]">
          VISÃO GERAL · {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
        </p>
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
        {/* Area chart — monthly revenue */}
        <div className="p-4 sm:p-5 bg-[#111111] border border-[rgba(255,255,255,0.12)] rounded-xl">
          <p className="font-mono-mm text-xs tracking-[0.08em] font-semibold mb-5" style={{ color: '#E5C158' }}>
            FATURAMENTO MENSAL{monthlyRevenue.length > 1 ? ` (${monthlyRevenue[0].label.toUpperCase()} – ${monthlyRevenue.at(-1)!.label.toUpperCase()})` : ''}
          </p>
          {monthlyRevenue.length === 0 ? (
            <p className="font-mono-mm text-xs py-14 text-center text-[#CBD5E1]">Nenhuma fatura registrada ainda.</p>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={monthlyRevenue} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
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
                <Area type="monotone" dataKey="value" stroke="#E5C158" strokeWidth={2.5} fill="url(#goldGrad)" dot={{ fill: '#E5C158', r: 3, strokeWidth: 0 }} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
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
          TRANSAÇÕES RECENTES
        </p>
        {recentTransactions.length === 0 ? (
          <p className="font-mono-mm text-xs py-6 text-[#CBD5E1]">Nenhuma fatura registrada ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.12)] text-[#E5C158] font-mono-mm text-xs font-semibold">
                  <th className="py-2.5 px-3">CÓDIGO</th>
                  <th className="py-2.5 px-3">CLIENTE</th>
                  <th className="py-2.5 px-3">DATA</th>
                  <th className="py-2.5 px-3">STATUS</th>
                  <th className="py-2.5 px-3 text-right">VALOR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(255,255,255,0.08)] font-display text-sm">
                {recentTransactions.map(inv => {
                  const cfg = STATUS_CONFIG[inv.status] ?? { color: '#CBD5E1', bg: 'rgba(255,255,255,0.1)' }
                  return (
                    <tr key={inv.id} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                      <td className="py-3 px-3 font-mono-mm text-xs font-semibold text-[#FFFFFF]">{inv.id}</td>
                      <td className="py-3 px-3 text-[#F3F4F6] font-medium">{inv.clientName}</td>
                      <td className="py-3 px-3 font-mono-mm text-xs text-[#CBD5E1]">{inv.date}</td>
                      <td className="py-3 px-3">
                        <span className="font-mono-mm text-[10px] px-2.5 py-0.5 rounded font-semibold" style={{ background: cfg.bg, color: cfg.color }}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-bold text-[#E5C158] text-right">
                        R$ {inv.value.toLocaleString('pt-BR')}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
