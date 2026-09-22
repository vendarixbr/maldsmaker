import { Prisma } from '@prisma/client'
import { prisma } from './prisma'
import {
  type AdminAction,
  type AdminState,
} from './admin-store'
import { DEFAULT_SITE_SETTINGS, PORTFOLIO_ITEMS, TESTIMONIALS, type CalendarEvent, type Client, type Expense, type GlobalNote, type HomeContent, type PortfolioItem, type Project, type SiteSettings, type Testimonial } from './data'
import { mergeHomeContent } from './admin-store'

type DbClient = Awaited<ReturnType<typeof prisma.client.findMany>>[number]
type DbProject = Awaited<ReturnType<typeof prisma.project.findMany>>[number]
type DbEvent = Awaited<ReturnType<typeof prisma.calendarEvent.findMany>>[number]
type DbNote = Awaited<ReturnType<typeof prisma.globalNote.findMany>>[number]

function toClient(row: DbClient): Client {
  return {
    id: row.id,
    name: row.name,
    initials: row.initials,
    niche: row.niche,
    whatsapp: row.whatsapp,
    email: row.email ?? undefined,
    instagram: row.instagram ?? undefined,
    empresa: row.empresa ?? undefined,
    status: row.status as Client['status'],
    totalValue: row.totalValue,
    lastProject: row.lastProject,
    origem: row.origem,
    notes: row.notes as unknown as Client['notes'],
    services: row.services as unknown as Client['services'],
    history: row.history as unknown as Client['history'],
    invoices: row.invoices as unknown as Client['invoices'],
    monthlyRevenue: row.monthlyRevenue as unknown as Client['monthlyRevenue'],
  }
}

function toProject(row: DbProject): Project {
  return {
    id: row.id,
    clientId: row.clientId,
    clientName: row.clientName,
    title: row.title,
    serviceType: row.serviceType,
    dueDate: row.dueDate,
    priority: row.priority as Project['priority'],
    value: row.value,
    status: row.status as Project['status'],
    checklist: row.checklist as unknown as Project['checklist'],
    comments: row.comments as unknown as Project['comments'],
    description: row.description ?? '',
    startDate: row.startDate ?? '',
    location: row.location ?? '',
    coverImageUrl: row.coverImageUrl ?? undefined,
    images: (row.images as unknown as Project['images']) ?? [],
  }
}

function toEvent(row: DbEvent): CalendarEvent {
  return {
    id: row.id,
    title: row.title,
    type: row.type as CalendarEvent['type'],
    clientName: row.clientName ?? undefined,
    date: row.date,
    startTime: row.startTime,
    endTime: row.endTime,
    location: row.location,
    value: row.value ?? undefined,
    notes: row.notes ?? undefined,
  }
}

function toNote(row: DbNote): GlobalNote {
  return {
    id: row.id,
    title: row.title ?? undefined,
    category: row.category,
    content: row.content,
    color: row.color as GlobalNote['color'],
    pinned: row.pinned,
    createdAt: row.createdAt,
    checklist: row.checklist ? row.checklist as unknown as GlobalNote['checklist'] : undefined,
  }
}

function toExpense(row: { id: string; description: string; category: string; date: string; value: number; status: string }): Expense {
  return {
    id: row.id,
    description: row.description,
    category: row.category,
    date: row.date,
    value: row.value,
    status: row.status as Expense['status'],
  }
}

function toPortfolio(row: { id: string; title: string; slug: string; category: string; imageKey: string; imageUrl: string | null; isVideo: boolean; sortOrder: number; description: string; images: unknown }): PortfolioItem {
  let imagesList: PortfolioItem['images'] = []
  let extraMeta: Partial<PortfolioItem> = {}

  if (Array.isArray(row.images)) {
    for (const entry of row.images) {
      if (entry && typeof entry === 'object' && '_meta' in entry) {
        extraMeta = { ...extraMeta, ...(entry as Record<string, unknown>) }
      } else if (entry && typeof entry === 'object' && 'url' in entry) {
        imagesList.push(entry as any)
      }
    }
  }

  return {
    id: row.id,
    title: row.title,
    slug: row.slug ?? '',
    category: row.category,
    imageKey: row.imageKey,
    imageUrl: row.imageUrl ?? undefined,
    videoUrl: typeof extraMeta.videoUrl === 'string' ? extraMeta.videoUrl : undefined,
    client: typeof extraMeta.client === 'string' ? extraMeta.client : undefined,
    year: typeof extraMeta.year === 'string' ? extraMeta.year : undefined,
    featured: typeof extraMeta.featured === 'boolean' ? extraMeta.featured : false,
    tags: Array.isArray(extraMeta.tags) ? (extraMeta.tags as string[]) : [],
    isVideo: row.isVideo,
    sortOrder: row.sortOrder,
    description: row.description ?? '',
    images: imagesList,
  }
}

function toTestimonial(row: { id: string; name: string; niche: string; quote: string; instagram: string | null; imageKey: string; imageUrl: string | null; sortOrder: number }): Testimonial {
  return {
    id: row.id,
    name: row.name,
    niche: row.niche,
    quote: row.quote,
    instagram: row.instagram ?? undefined,
    imageKey: row.imageKey,
    imageUrl: row.imageUrl ?? undefined,
    sortOrder: row.sortOrder,
  }
}

async function safeFind<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    console.warn('Tabela nova ainda não migrada, usando fallback.', error)
    return fallback
  }
}

export async function getAdminState(): Promise<AdminState> {
  const [clients, projects, events, notes] = await Promise.all([
    prisma.client.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.project.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.calendarEvent.findMany({ orderBy: [{ date: 'asc' }, { startTime: 'asc' }] }),
    prisma.globalNote.findMany({ orderBy: { dbCreated: 'desc' } }),
  ])

  const expenses = await safeFind(
    () => prisma.expense.findMany({ orderBy: { date: 'desc' } }),
    []
  )
  const portfolio = await safeFind(
    () => prisma.portfolioItem.findMany({ orderBy: { sortOrder: 'asc' } }),
    []
  )
  const testimonials = await safeFind(
    () => prisma.testimonial.findMany({ orderBy: { sortOrder: 'asc' } }),
    []
  )
  const settingsRow = await safeFind(
    () => prisma.siteSettings.findUnique({ where: { id: 'default' } }),
    null
  )
  const homeContentRow = await safeFind(
    () => prisma.homeContent.findUnique({ where: { id: 'default' } }),
    null
  )

  return {
    clients: clients.map(toClient),
    projects: projects.map(toProject),
    events: events.map(toEvent),
    notes: notes.map(toNote),
    expenses: expenses.map(toExpense),
    portfolio: portfolio.length ? portfolio.map(toPortfolio) : PORTFOLIO_ITEMS,
    testimonials: testimonials.length ? testimonials.map(toTestimonial) : TESTIMONIALS,
    settings: { ...DEFAULT_SITE_SETTINGS, ...(settingsRow?.data as Partial<SiteSettings> | undefined) },
    homeContent: mergeHomeContent(homeContentRow?.data as Partial<HomeContent> | undefined),
  }
}

export async function getPublicHomeContent(): Promise<HomeContent> {
  const row = await safeFind(
    () => prisma.homeContent.findUnique({ where: { id: 'default' } }),
    null
  )
  return mergeHomeContent(row?.data as Partial<HomeContent> | undefined)
}

export async function getPublicSettings(): Promise<SiteSettings> {
  const row = await safeFind(
    () => prisma.siteSettings.findUnique({ where: { id: 'default' } }),
    null
  )
  return { ...DEFAULT_SITE_SETTINGS, ...(row?.data as Partial<SiteSettings> | undefined) }
}

export async function getPublicPortfolio(): Promise<PortfolioItem[]> {
  const items = await safeFind(
    () => prisma.portfolioItem.findMany({ orderBy: { sortOrder: 'asc' } }),
    []
  )
  if (items.length) return items.map(toPortfolio)
  return PORTFOLIO_ITEMS
}

export async function getPublicTestimonials(): Promise<Testimonial[]> {
  const items = await safeFind(
    () => prisma.testimonial.findMany({ orderBy: { sortOrder: 'asc' } }),
    []
  )
  if (items.length) return items.map(toTestimonial)
  return TESTIMONIALS
}

export async function getPublicPortfolioItem(slugOrId: string): Promise<PortfolioItem | null> {
  const items = await getPublicPortfolio()
  const clean = decodeURIComponent(slugOrId || '').trim().toLowerCase()
  return (
    items.find(
      item =>
        (item.slug && item.slug.toLowerCase() === clean) ||
        (item.id && item.id.toLowerCase() === clean)
    ) ?? null
  )
}

/**
 * Persiste UMA ação por vez, direto na entidade afetada.
 * Nunca apaga/recria o banco inteiro (evita perda de dados com edições concorrentes).
 */
export async function applyAdminAction(action: AdminAction): Promise<AdminState> {
  switch (action.type) {
    case 'HYDRATE':
      return getAdminState()

    case 'RESET_ALL':
      await prisma.$transaction([
        prisma.globalNote.deleteMany(),
        prisma.calendarEvent.deleteMany(),
        prisma.project.deleteMany(),
        prisma.client.deleteMany(),
        prisma.expense.deleteMany(),
        prisma.portfolioItem.deleteMany(),
        prisma.testimonial.deleteMany(),
      ])
      return getAdminState()

    // --- Clientes ---
    case 'ADD_CLIENT':
      await prisma.client.create({ data: clientToDb(action.payload) })
      break
    case 'UPDATE_CLIENT': {
      const data = clientToDb(action.payload)
      await prisma.client.upsert({
        where: { id: action.payload.id },
        update: data,
        create: data,
      })
      break
    }
    case 'DELETE_CLIENT':
      await prisma.$transaction([
        prisma.project.deleteMany({ where: { clientId: action.id } }),
        prisma.client.deleteMany({ where: { id: action.id } }),
      ])
      break

    // --- Projetos ---
    case 'ADD_PROJECT':
      await prisma.project.create({ data: projectToDb(action.payload) })
      break
    case 'UPDATE_PROJECT': {
      const data = projectToDb(action.payload)
      await prisma.project.upsert({
        where: { id: action.payload.id },
        update: data,
        create: data,
      })
      break
    }
    case 'MOVE_PROJECT':
      await prisma.project.updateMany({
        where: { id: action.id },
        data: { status: action.status },
      })
      break
    case 'DELETE_PROJECT':
      await prisma.project.deleteMany({ where: { id: action.id } })
      break

    // --- Agenda ---
    case 'ADD_EVENT':
      await prisma.calendarEvent.create({ data: eventToDb(action.payload) })
      break
    case 'UPDATE_EVENT': {
      const data = eventToDb(action.payload)
      await prisma.calendarEvent.upsert({
        where: { id: action.payload.id },
        update: data,
        create: data,
      })
      break
    }
    case 'DELETE_EVENT':
      await prisma.calendarEvent.deleteMany({ where: { id: action.id } })
      break

    // --- Notas globais ---
    case 'ADD_NOTE':
      await prisma.globalNote.create({ data: noteToDb(action.payload) })
      break
    case 'UPDATE_NOTE': {
      const data = noteToDb(action.payload)
      await prisma.globalNote.upsert({
        where: { id: action.payload.id },
        update: data,
        create: data,
      })
      break
    }
    case 'DELETE_NOTE':
      await prisma.globalNote.deleteMany({ where: { id: action.id } })
      break
    case 'PIN_NOTE': {
      const row = await prisma.globalNote.findUnique({ where: { id: action.id } })
      if (row) {
        await prisma.globalNote.update({
          where: { id: action.id },
          data: { pinned: !row.pinned },
        })
      }
      break
    }

    // --- Notas e faturas do cliente (JSON dentro do Client) ---
    case 'ADD_CLIENT_NOTE':
      await mutateClient(action.clientId, client => ({
        ...client,
        notes: [action.note, ...client.notes],
      }))
      break
    case 'DELETE_CLIENT_NOTE':
      await mutateClient(action.clientId, client => ({
        ...client,
        notes: client.notes.filter(n => n.id !== action.noteId),
      }))
      break
    case 'ADD_INVOICE':
      await mutateClient(action.clientId, client =>
        withRecalculatedTotal({ ...client, invoices: [action.invoice, ...client.invoices] })
      )
      break
    case 'UPDATE_INVOICE':
      await mutateClient(action.clientId, client =>
        withRecalculatedTotal({
          ...client,
          invoices: client.invoices.map(inv => (inv.id === action.invoice.id ? action.invoice : inv)),
        })
      )
      break
    case 'DELETE_INVOICE':
      await mutateClient(action.clientId, client =>
        withRecalculatedTotal({
          ...client,
          invoices: client.invoices.filter(inv => inv.id !== action.invoiceId),
        })
      )
      break

    // --- Financeiro ---
    case 'ADD_EXPENSE':
      await prisma.expense.create({ data: expenseToDb(action.payload) })
      break
    case 'UPDATE_EXPENSE': {
      const data = expenseToDb(action.payload)
      await prisma.expense.upsert({
        where: { id: action.payload.id },
        update: data,
        create: data,
      })
      break
    }
    case 'DELETE_EXPENSE':
      await prisma.expense.deleteMany({ where: { id: action.id } })
      break

    // --- Portfólio ---
    case 'ADD_PORTFOLIO':
      await prisma.portfolioItem.create({ data: portfolioToDb(action.payload) })
      break
    case 'UPDATE_PORTFOLIO': {
      const data = portfolioToDb(action.payload)
      await prisma.portfolioItem.upsert({
        where: { id: action.payload.id },
        update: data,
        create: data,
      })
      break
    }
    case 'DELETE_PORTFOLIO':
      await prisma.portfolioItem.deleteMany({ where: { id: action.id } })
      break

    // --- Depoimentos ---
    case 'ADD_TESTIMONIAL':
      await prisma.testimonial.create({ data: testimonialToDb(action.payload) })
      break
    case 'UPDATE_TESTIMONIAL': {
      const data = testimonialToDb(action.payload)
      await prisma.testimonial.upsert({
        where: { id: action.payload.id },
        update: data,
        create: data,
      })
      break
    }
    case 'DELETE_TESTIMONIAL':
      await prisma.testimonial.deleteMany({ where: { id: action.id } })
      break

    // --- Configurações ---
    case 'UPDATE_SETTINGS':
      await prisma.siteSettings.upsert({
        where: { id: 'default' },
        update: { data: action.payload as unknown as Prisma.InputJsonValue },
        create: { id: 'default', data: action.payload as unknown as Prisma.InputJsonValue },
      })
      break

    // --- Página inicial ---
    case 'UPDATE_HOME_CONTENT':
      await prisma.homeContent.upsert({
        where: { id: 'default' },
        update: { data: action.payload as unknown as Prisma.InputJsonValue },
        create: { id: 'default', data: action.payload as unknown as Prisma.InputJsonValue },
      })
      break

    default: {
      const _exhaustive: never = action
      void _exhaustive
      break
    }
  }

  return getAdminState()
}

/** Lê um cliente, aplica a mutação no JSON e salva de volta. */
async function mutateClient(clientId: string, mutate: (client: Client) => Client): Promise<void> {
  const row = await prisma.client.findUnique({ where: { id: clientId } })
  if (!row) throw new Error('Cliente não encontrado.')
  await prisma.client.update({
    where: { id: clientId },
    data: clientToDb(mutate(toClient(row))),
  })
}

function withRecalculatedTotal(client: Client): Client {
  const valid = client.invoices.filter(i => i.status !== 'CANCELADO')
  return { ...client, totalValue: valid.reduce((sum, i) => sum + i.value, 0) }
}

function clientToDb(client: Client) {
  return {
    id: client.id,
    name: client.name,
    initials: client.initials,
    niche: client.niche,
    whatsapp: client.whatsapp,
    email: client.email ?? null,
    instagram: client.instagram ?? null,
    empresa: client.empresa ?? null,
    status: client.status,
    totalValue: client.totalValue,
    lastProject: client.lastProject,
    origem: client.origem,
    notes: client.notes as unknown as Prisma.InputJsonValue,
    services: client.services as unknown as Prisma.InputJsonValue,
    history: client.history as unknown as Prisma.InputJsonValue,
    invoices: client.invoices as unknown as Prisma.InputJsonValue,
    monthlyRevenue: client.monthlyRevenue as unknown as Prisma.InputJsonValue,
  }
}

function projectToDb(project: Project) {
  return {
    id: project.id,
    clientId: project.clientId,
    clientName: project.clientName,
    title: project.title,
    serviceType: project.serviceType,
    dueDate: project.dueDate,
    priority: project.priority,
    value: project.value,
    status: project.status,
    checklist: project.checklist as unknown as Prisma.InputJsonValue,
    comments: project.comments as unknown as Prisma.InputJsonValue,
    description: project.description ?? '',
    startDate: project.startDate ?? '',
    location: project.location ?? '',
    coverImageUrl: project.coverImageUrl ?? null,
    images: (project.images ?? []) as unknown as Prisma.InputJsonValue,
  }
}

function eventToDb(event: CalendarEvent) {
  return {
    id: event.id,
    title: event.title,
    type: event.type,
    clientName: event.clientName ?? null,
    date: event.date,
    startTime: event.startTime,
    endTime: event.endTime,
    location: event.location,
    value: event.value ?? null,
    notes: event.notes ?? null,
  }
}

function noteToDb(note: GlobalNote) {
  return {
    id: note.id,
    title: note.title ?? null,
    category: note.category,
    content: note.content,
    color: note.color,
    pinned: note.pinned,
    createdAt: note.createdAt,
    checklist: note.checklist ? note.checklist as unknown as Prisma.InputJsonValue : Prisma.JsonNull,
  }
}

function expenseToDb(expense: Expense) {
  return {
    id: expense.id,
    description: expense.description,
    category: expense.category,
    date: expense.date,
    value: expense.value,
    status: expense.status,
  }
}

function portfolioToDb(item: PortfolioItem) {
  const images = (item.images ?? []).filter(img => img && typeof img === 'object' && !('_meta' in (img as any)))
  const hasMeta = Boolean(
    item.videoUrl ||
    item.client ||
    item.year ||
    item.featured ||
    (item.tags && item.tags.length > 0)
  )
  const finalImages = hasMeta
    ? [
        ...images,
        {
          _meta: true,
          videoUrl: item.videoUrl || undefined,
          client: item.client || undefined,
          year: item.year || undefined,
          featured: Boolean(item.featured),
          tags: item.tags || [],
        },
      ]
    : images

  return {
    id: item.id,
    title: item.title,
    slug: item.slug ?? '',
    category: item.category,
    imageKey: item.imageKey,
    imageUrl: item.imageUrl ?? null,
    isVideo: item.isVideo,
    sortOrder: item.sortOrder ?? 0,
    description: item.description ?? '',
    images: finalImages as unknown as Prisma.InputJsonValue,
  }
}

function testimonialToDb(item: Testimonial) {
  return {
    id: item.id,
    name: item.name,
    niche: item.niche,
    quote: item.quote,
    instagram: item.instagram ?? null,
    imageKey: item.imageKey,
    imageUrl: item.imageUrl ?? null,
    sortOrder: item.sortOrder ?? 0,
  }
}
