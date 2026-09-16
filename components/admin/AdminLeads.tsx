'use client'

import { useMemo, useState } from 'react'
import { useAdmin } from '@/lib/admin-context'
import type { Client } from '@/lib/data'
import { Check, Trash2, MessageCircle, Mail, Building2, CalendarClock, Inbox } from 'lucide-react'

function digitsOnly(value: string): string {
  return value.replace(/\D/g, '')
}

/** Monta link wa.me a partir do telefone/WhatsApp cadastrado. */
function whatsappLink(whatsapp: string): string | null {
  const digits = digitsOnly(whatsapp)
  if (digits.length < 10) return null
  const withCountry = digits.length <= 11 ? `55${digits}` : digits
  return `https://wa.me/${withCountry}`
}

function LeadCard({ lead }: { lead: Client }) {
  const { dispatch } = useAdmin()
  const [confirmDiscard, setConfirmDiscard] = useState(false)

  const leadNote = lead.notes.find(n => n.category === 'LEAD') ?? lead.notes[0]
  const wa = whatsappLink(lead.whatsapp)

  const handleApprove = () => {
    dispatch({ type: 'UPDATE_CLIENT', payload: { ...lead, status: 'ATIVO' } })
  }

  const handleDiscard = () => {
    if (!confirmDiscard) {
      setConfirmDiscard(true)
      return
    }
    dispatch({ type: 'DELETE_CLIENT', id: lead.id })
  }

  return (
    <div className="p-5 bg-[#111111] border border-[rgba(255,255,255,0.12)] rounded-xl flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 font-display font-bold text-sm"
            style={{ background: 'rgba(201,168,76,0.2)', color: '#E5C158', border: '1px solid rgba(201,168,76,0.4)' }}
          >
            {lead.initials}
          </div>
          <div className="min-w-0">
            <p className="font-display font-semibold text-base text-white truncate">{lead.name}</p>
            <p className="font-mono-mm text-[10px] tracking-[0.1em] text-[#E5C158]">{lead.niche || 'LEAD DO SITE'}</p>
          </div>
        </div>
        <span
          className="font-mono-mm text-[9px] px-2 py-1 rounded shrink-0 font-semibold"
          style={{ background: 'rgba(250,204,21,0.12)', color: '#FACC15', border: '1px solid rgba(250,204,21,0.35)' }}
        >
          {lead.origem === 'Site' ? 'SITE' : lead.origem.toUpperCase()}
        </span>
      </div>

      <div className="flex flex-col gap-1.5 font-display text-sm">
        {lead.empresa && (
          <p className="flex items-center gap-2 text-[#E5E7EB]">
            <Building2 size={13} className="text-[#64748B] shrink-0" />
            {lead.empresa}
          </p>
        )}
        <p className="flex items-center gap-2 text-[#E5E7EB]">
          <CalendarClock size={13} className="text-[#64748B] shrink-0" />
          {lead.lastProject}
        </p>
        {leadNote && (
          <p className="mt-1 px-3 py-2.5 rounded-md text-[#E5E7EB] whitespace-pre-wrap" style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.08)', lineHeight: 1.6 }}>
            “{leadNote.content}”
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {wa && (
          <a
            href={`${wa}?text=${encodeURIComponent(`Olá ${lead.name}! Aqui é da Malds Maker, recebemos seu contato pelo site.`)}`}
            target="_blank"
            rel="noreferrer"
            className="flex-1 min-w-[140px] flex items-center justify-center gap-2 h-10 font-mono-mm text-[11px] font-semibold rounded-lg"
            style={{ background: '#C9A84C', color: '#080808' }}
          >
            <MessageCircle size={14} />
            CHAMAR NO WHATSAPP
          </a>
        )}
        {lead.email && (
          <a
            href={`mailto:${lead.email}`}
            className="flex-1 min-w-[120px] flex items-center justify-center gap-2 h-10 font-mono-mm text-[11px] font-semibold rounded-lg text-[#F3F4F6]"
            style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.16)' }}
          >
            <Mail size={14} />
            RESPONDER E-MAIL
          </a>
        )}
      </div>

      <div className="flex gap-2 pt-1 border-t border-[rgba(255,255,255,0.08)]">
        <button
          onClick={handleApprove}
          className="flex-1 flex items-center justify-center gap-2 h-10 mt-3 font-mono-mm text-[11px] font-semibold rounded-lg"
          style={{ background: 'rgba(74,222,128,0.12)', color: '#4ADE80', border: '1px solid rgba(74,222,128,0.4)' }}
        >
          <Check size={14} />
          APROVAR COMO CLIENTE
        </button>
        <button
          onClick={handleDiscard}
          onBlur={() => setConfirmDiscard(false)}
          className="flex-1 flex items-center justify-center gap-2 h-10 mt-3 font-mono-mm text-[11px] font-semibold rounded-lg"
          style={{
            background: confirmDiscard ? 'rgba(248,113,113,0.15)' : 'transparent',
            color: '#F87171',
            border: '1px solid rgba(248,113,113,0.4)',
          }}
        >
          <Trash2 size={14} />
          {confirmDiscard ? 'CONFIRMAR?' : 'DISPENSAR'}
        </button>
      </div>
    </div>
  )
}

export function AdminLeads() {
  const { state, setActiveSection } = useAdmin()

  const leads = useMemo(() => {
    return state.clients
      .filter(c => c.status === 'PROSPECT')
      .sort((a, b) => {
        const siteFirst = (b.origem === 'Site' ? 1 : 0) - (a.origem === 'Site' ? 1 : 0)
        if (siteFirst !== 0) return siteFirst
        return b.id.localeCompare(a.id)
      })
  }, [state.clients])

  const siteLeads = leads.filter(l => l.origem === 'Site').length

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-semibold text-2xl text-[#FFFFFF]">Caixa de entrada</h1>
          <p className="font-mono-mm text-xs tracking-[0.08em] mt-1 text-[#CBD5E1]">
            {leads.length} AGUARDANDO TRIAGEM · {siteLeads} DO SITE
          </p>
        </div>
        <button
          onClick={() => setActiveSection('clientes')}
          className="flex items-center justify-center gap-2 h-11 px-5 font-mono-mm text-xs tracking-[0.08em] font-semibold rounded-lg text-[#F3F4F6]"
          style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.16)' }}
        >
          VER TODOS OS CLIENTES
        </button>
      </div>

      {leads.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 bg-[#111111] border border-[rgba(255,255,255,0.12)] rounded-xl text-center">
          <Inbox size={28} className="text-[#4ADE80]" />
          <p className="font-display font-semibold text-lg text-white">Caixa zerada</p>
          <p className="font-mono-mm text-xs text-[#94A3B8] max-w-sm" style={{ lineHeight: 1.7 }}>
            Novos contatos do site aparecem aqui para você aprovar ou dispensar.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
          {leads.map(lead => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
        </div>
      )}
    </div>
  )
}
