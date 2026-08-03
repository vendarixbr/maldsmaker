import { NextResponse } from 'next/server'
import { applyAdminAction } from '@/lib/admin-db'
import type { Client } from '@/lib/data'

interface ContactPayload {
  nome?: string
  contato?: string
  empresa?: string
  servico?: string
  mensagem?: string
}

function initialsFromName(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('') || 'LD'
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as ContactPayload
    const name = body.nome?.trim()
    const contact = body.contato?.trim()

    if (!name || !contact) {
      return NextResponse.json({ error: 'Nome e contato são obrigatórios.' }, { status: 400 })
    }

    const now = new Date()
    const createdAt = now.toLocaleDateString('pt-BR')
    const isEmail = contact.includes('@')
    const service = body.servico?.trim() || 'Lead do site'
    const message = body.mensagem?.trim()

    const client: Client = {
      id: `lead-${Date.now()}`,
      name,
      initials: initialsFromName(name),
      niche: service.toUpperCase(),
      whatsapp: isEmail ? '' : contact,
      email: isEmail ? contact : undefined,
      instagram: undefined,
      empresa: body.empresa?.trim() || undefined,
      status: 'PROSPECT',
      totalValue: 0,
      lastProject: `Lead recebido pelo site - ${service}`,
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
        notes: [service, message].filter(Boolean).join(' - '),
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