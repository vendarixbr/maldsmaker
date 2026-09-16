import { NextResponse } from 'next/server'
import { applyAdminAction } from '@/lib/admin-db'
import { rateLimit, clientIp } from '@/lib/rate-limit'
import type { Client } from '@/lib/data'

export const dynamic = 'force-dynamic'

const CONTACT_LIMIT = 5
const CONTACT_WINDOW_MS = 60 * 60 * 1000 // 5 envios por hora por IP
const MIN_FILL_MS = 2500 // tempo mínimo de preenchimento (barreira anti-bot)

interface ContactPayload {
  nome?: string
  contato?: string
  empresa?: string
  servico?: string
  mensagem?: string
  /** Honeypot: campo invisível que humanos não preenchem. */
  website?: string
  /** Timestamp (ms) de quando o formulário foi aberto. */
  startedAt?: number
}

function initialsFromName(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('') || 'LD'
}

/** Resposta de sucesso falsa para bots (não revela a barreira). */
function fakeSuccess() {
  return NextResponse.json({ ok: true })
}

export async function POST(request: Request) {
  const ip = clientIp(request)
  const check = rateLimit(`contact:${ip}`, CONTACT_LIMIT, CONTACT_WINDOW_MS)
  if (!check.ok) {
    const response = NextResponse.json(
      { error: 'Muitas mensagens em sequência. Tente novamente mais tarde.' },
      { status: 429 }
    )
    response.headers.set('Retry-After', String(check.retryAfterSec))
    return response
  }

  try {
    const body = await request.json() as ContactPayload

    // Honeypot preenchido = bot
    if (body.website && body.website.trim() !== '') {
      console.warn('Contato bloqueado (honeypot).', { ip })
      return fakeSuccess()
    }

    // Preenchimento instantâneo = bot
    if (typeof body.startedAt === 'number' && Number.isFinite(body.startedAt)) {
      const elapsed = Date.now() - body.startedAt
      if (elapsed < MIN_FILL_MS) {
        console.warn('Contato bloqueado (preenchimento instantâneo).', { ip, elapsed })
        return fakeSuccess()
      }
    }

    const name = body.nome?.trim()
    const contact = body.contato?.trim()

    if (!name || !contact) {
      return NextResponse.json({ error: 'Nome e contato são obrigatórios.' }, { status: 400 })
    }

    if (name.length > 120 || contact.length > 160) {
      return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 })
    }

    const now = new Date()
    const createdAt = now.toLocaleDateString('pt-BR')
    const isEmail = contact.includes('@')
    const service = body.servico?.trim() || 'Lead do site'
    const message = body.mensagem?.trim()?.slice(0, 2000)

    const client: Client = {
      id: `lead-${Date.now()}`,
      name,
      initials: initialsFromName(name),
      niche: service.toUpperCase().slice(0, 60),
      whatsapp: isEmail ? '' : contact,
      email: isEmail ? contact : undefined,
      instagram: undefined,
      empresa: body.empresa?.trim().slice(0, 120) || undefined,
      status: 'PROSPECT',
      totalValue: 0,
      lastProject: `Lead recebido pelo site - ${service}`.slice(0, 160),
      origem: 'Site',
      notes: message ? [{
        id: `note-${Date.now()}`,
        category: 'LEAD',
        content: message,
        color: 'default',
        pinned: true,
        createdAt,
      }] : [],
      services: [],
      history: [{
        id: `history-${Date.now()}`,
        date: createdAt,
        type: 'phone',
        title: 'Lead recebido pelo formulário do site',
        notes: [service, message].filter(Boolean).join(' - ').slice(0, 500),
      }],
      invoices: [],
      monthlyRevenue: [
        { month: 'Ago', value: 0 },
        { month: 'Set', value: 0 },
        { month: 'Out', value: 0 },
        { month: 'Nov', value: 0 },
        { month: 'Dez', value: 0 },
        { month: 'Jan', value: 0 },
      ],
    }

    await applyAdminAction({ type: 'ADD_CLIENT', payload: client })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Failed to create contact lead', error)
    return NextResponse.json(
      { error: 'Não foi possível enviar a mensagem.' },
      { status: 500 }
    )
  }
}
