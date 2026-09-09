import { Prisma } from '@prisma/client'
import { prisma } from './prisma'
import {
  adminReducer,
  type AdminAction,
  type AdminState,
} from './admin-store'
import { PORTFOLIO_ITEMS, TESTIMONIALS, type CalendarEvent, type Client, type Expense, type GlobalNote, type PortfolioItem, type Project, type Testimonial } from './data'

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

function toPortfolio(row: { id: string; title: string; category: string; imageKey: string; imageUrl: string | null; isVideo: boolean; sortOrder: number }): PortfolioItem {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    imageKey: row.imageKey,
    imageUrl: row.imageUrl ?? undefined,
    isVideo: row.isVideo,
    sortOrder: row.sortOrder,
  }
}

function toTestimonial(row: { id: string; name: string; niche: string; quote: string; instagram: string | null; imageKey: string; sortOrder: number }): Testimonial {
  return {
    id: row.id,
    name: row.name,
    niche: row.niche,
    quote: row.quote,
    instagram: row.instagram ?? undefined,
    imageKey: row.imageKey,
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

  return {
    clients: clients.map(toClient),
    projects: projects.map(toProject),
    events: events.map(toEvent),
    notes: notes.map(toNote),
    expenses: expenses.map(toExpense),
    portfolio: portfolio.length ? portfolio.map(toPortfolio) : PORTFOLIO_ITEMS,
    testimonials: testimonials.length ? testimonials.map(toTestimonial) : TESTIMONIALS,
  }
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

export async function applyAdminAction(action: AdminAction): Promise<AdminState> {
  const current = await getAdminState()
  const next = adminReducer(current, action)
  await replaceAdminState(next)
  return next
}

export async function replaceAdminState(state: AdminState) {
  const writes: Prisma.PrismaPromise<unknown>[] = [
    prisma.globalNote.deleteMany(),
    prisma.calendarEvent.deleteMany(),
    prisma.project.deleteMany(),
    prisma.client.deleteMany(),
  ]

  if (state.clients.length) {
    writes.push(prisma.client.createMany({ data: state.clients.map(clientToDb) }))
  }
  if (state.projects.length) {
    writes.push(prisma.project.createMany({ data: state.projects.map(projectToDb) }))
  }
  if (state.events.length) {
    writes.push(prisma.calendarEvent.createMany({ data: state.events.map(eventToDb) }))
  }
  if (state.notes.length) {
    writes.push(prisma.globalNote.createMany({ data: state.notes.map(noteToDb) }))
  }

  await prisma.$transaction(writes)

  // Tabelas novas — separadas para não quebrar se a migração ainda não rodou
  try {
    await prisma.expense.deleteMany()
    if (state.expenses.length) {
      await prisma.expense.createMany({ data: state.expenses.map(expenseToDb) })
    }
  } catch (error) {
    console.warn('Skip expenses persist (tabela ausente). Rode `prisma db push`.', error)
  }

  try {
    await prisma.portfolioItem.deleteMany()
    if (state.portfolio.length) {
      await prisma.portfolioItem.createMany({ data: state.portfolio.map(portfolioToDb) })
    }
  } catch (error) {
    console.warn('Skip portfolio persist (tabela ausente).', error)
  }

  try {
    await prisma.testimonial.deleteMany()
    if (state.testimonials.length) {
      await prisma.testimonial.createMany({ data: state.testimonials.map(testimonialToDb) })
    }
  } catch (error) {
    console.warn('Skip testimonials persist (tabela ausente).', error)
  }
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
  return {
    id: item.id,
    title: item.title,
    category: item.category,
    imageKey: item.imageKey,
    imageUrl: item.imageUrl ?? null,
    isVideo: item.isVideo,
    sortOrder: item.sortOrder ?? 0,
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
    sortOrder: item.sortOrder ?? 0,
  }
}
