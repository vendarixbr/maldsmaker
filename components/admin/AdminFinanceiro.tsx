'use client'

import { useAdmin } from '@/lib/admin-context'
import { MONTHLY_REVENUE, REVENUE_BY_NICHE, RECENT_TRANSACTIONS } from '@/lib/data'
import { TrendingUp } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts'

/* ------------------------------------------------------------------ */
/*  Config                                                              */
/* ------------------------------------------------------------------ */

const NICHE_COLORS = ['#C9A84C', '#E8C97A', '#A07830', '#6B5020', '#D4AC0D', '#F0D080']

const STATUS_CONFIG: Record<string, { color: string; bg: string }> = {
  RECEBIDO:  { color: '#52BE80', bg: 'rgba(30,132,73,0.12)' },
  PENDENTE:  { color: '#F4D03F', bg: 'rgba(212,172,13,0.12)' },
  CANCELADO: { color: '#F1948A', bg: 'rgba(192,57,43,0.12)' },
}

/* ------------------------------------------------------------------ */
/*  Custom tooltip                                                      */
/* ------------------------------------------------------------------ */

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '8px 12px' }}>
      <p className="font-mono-mm text-[10px] mb-1" style={{ color: '#C9A84C' }}>{label}</p>
      <p className="font-display font-semibold text-sm" style={{ color: '#F2F2F2' }}>
        R$ {Number(payload[0].value).toLocaleString('pt-BR')}
      </p>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main                                                                */
/* ------------------------------------------------------------------ */

export function AdminFinanceiro() {
  const { state } = useAdmin()

  // Compute summary from state invoices
  const allInvoices = state.clients.flatMap(c => c.invoices)
  const totalRecebido = allInvoices.filter(i => i.status === 'RECEBIDO').reduce((s, i) => s + i.value, 0)
  const totalPendente = allInvoices.filter(i => i.status === 'PENDENTE').reduce((s, i) => s + i.value, 0)
  const totalGeral = allInvoices.reduce((s, i) => s + i.value, 0)

  // Current month (Jan 2025 in our mock world)
  const currentMonthRevenue = MONTHLY_REVENUE[MONTHLY_REVENUE.length - 1].value
  const prevMonthRevenue = MONTHLY_REVENUE[MONTHLY_REVENUE.length - 2].value
  const monthDelta = prevMonthRevenue > 0
    ? ((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue * 100).toFixed(1)
    : '0'

  const summaryCards = [
    { label: 'RECEBIDO (TOTAL)',  value: `R$ ${totalRecebido.toLocaleString('pt-BR')}`,  up: true,  delta: '+12%' },
    { label: 'PENDENTE',          value: `R$ ${totalPendente.toLocaleString('pt-BR')}`,  up: false, delta: `${state.clients.filter(c => c.invoices.some(i => i.status === 'PENDENTE')).length} clientes` },
    { label: 'ESTE MÊS',          value: `R$ ${currentMonthRevenue.toLocaleString('pt-BR')}`,  up: Number(monthDelta) >= 0, delta: `${monthDelta}% vs mês ant.` },
    { label: 'TOTAL HISTÓRICO',   value: `R$ ${totalGeral.toLocaleString('pt-BR')}`,     up: true,  delta: `${allInvoices.length} faturas` },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="font-display font-semibold text-2xl" style={{ color: '#F2F2F2' }}>Financeiro</h1>
        <p className="font-mono-mm text-[11px] tracking-[0.08em] mt-1" style={{ color: '#555' }}>
          VISÃO GERAL · JANEIRO 2025
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {summaryCards.map(card => (
          <div
            key={card.label}
            className="p-5 flex flex-col gap-2"
            style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px' }}
          >
            <p className="font-mono-mm text-[10px] tracking-[0.08em]" style={{ color: '#C9A84C' }}>{card.label}</p>
            <p className="font-display font-bold text-2xl" style={{ color: '#F2F2F2' }}>{card.value}</p>
            <div className="flex items-center gap-1">
              <TrendingUp size={11} style={{ color: card.up ? '#52BE80' : '#F4D03F' }} />
              <span className="font-mono-mm text-[10px]" style={{ color: card.up ? '#52BE80' : '#F4D03F' }}>
                {card.delta}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[60%_38%] gap-4">
        {/* Area chart — monthly revenue */}
        <div
          className="p-5"
          style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px' }}
        >
          <p className="font-mono-mm text-[11px] tracking-[0.08em] mb-5" style={{ color: '#C9A84C' }}>
            FATURAMENTO MENSAL (AGO – JAN)
          </p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={MONTHLY_REVENUE} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#C9A84C" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#C9A84C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: '#555', fontSize: 10, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#555', fontSize: 10, fontFamily: 'monospace' }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="value" stroke="#C9A84C" strokeWidth={2} fill="url(#goldGrad)" dot={{ fill: '#C9A84C', r: 3, strokeWidth: 0 }} activeDot={{ r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Donut — revenue by niche */}
        <div
          className="p-5 flex flex-col"
          style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px' }}
        >
          <p className="font-mono-mm text-[11px] tracking-[0.08em] mb-4" style={{ color: '#C9A84C' }}>
            RECEITA POR NICHO
          </p>
          <div className="flex-1 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={REVENUE_BY_NICHE}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={72}
                  dataKey="value"
                  paddingAngle={3}
                >
                  {REVENUE_BY_NICHE.map((_, i) => (
                    <Cell key={i} fill={NICHE_COLORS[i % NICHE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#161616', border: 'none', fontSize: 11 }}
                  formatter={(v: number) => [`R$ ${v.toLocaleString('pt-BR')}`, '']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="flex flex-col gap-1.5 mt-2">
            {REVENUE_BY_NICHE.map((item, i) => (
              <div key={item.niche} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: NICHE_COLORS[i] }} />
                  <span className="font-mono-mm text-[10px]" style={{ color: '#777' }}>{item.niche}</span>
                </div>
                <span className="font-display text-xs font-semibold" style={{ color: '#C9A84C' }}>
                  R$ {item.value.toLocaleString('pt-BR')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bar chart — clients top revenue */}
      <div
        className="p-5"
        style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px' }}
      >
        <p className="font-mono-mm text-[11px] tracking-[0.08em] mb-5" style={{ color: '#C9A84C' }}>
          CLIENTES POR FATURAMENTO
        </p>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart
            data={[...state.clients].filter(c => c.totalValue > 0).sort((a, b) => b.totalValue - a.totalValue).slice(0, 7).map(c => ({ name: c.name.split(' ')[0], value: c.totalValue }))}
            margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
            barSize={14}
          >
            <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: '#555', fontSize: 10, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#555', fontSize: 10, fontFamily: 'monospace' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" fill="#C9A84C" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent transactions */}
      <div
        className="p-5"
        style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px' }}
      >
        <p className="font-mono-mm text-[11px] tracking-[0.08em] mb-4" style={{ color: '#C9A84C' }}>
          TRANSAÇÕES RECENTES
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[400px]">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                {['ID', 'DATA', 'VALOR', 'STATUS'].map(h => (
                  <th key={h} className="pb-2 text-left font-mono-mm text-[10px] tracking-[0.08em]" style={{ color: '#444' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RECENT_TRANSACTIONS.map((txn, i) => {
                const cfg = STATUS_CONFIG[txn.status]
                return (
                  <tr
                    key={txn.id}
                    style={{ borderBottom: i < RECENT_TRANSACTIONS.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                  >
                    <td className="py-3 font-mono-mm text-[11px]" style={{ color: '#555' }}>{txn.id}</td>
                    <td className="py-3 font-display text-sm" style={{ color: '#AAAAAA' }}>{txn.date}</td>
                    <td className="py-3 font-display font-semibold text-sm" style={{ color: '#C9A84C' }}>
                      R$ {txn.value.toLocaleString('pt-BR')}
                    </td>
                    <td className="py-3">
                      <span
                        className="font-mono-mm text-[10px] px-2 py-0.5"
                        style={{ background: cfg.bg, color: cfg.color, borderRadius: '3px' }}
                      >
                        {txn.status}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
