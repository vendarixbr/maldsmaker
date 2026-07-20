import { Prisma } from '@prisma/client'
import { prisma } from './prisma'
import {
  adminReducer,
  staticAdminState,
  type AdminAction,
  type AdminState,
} from './admin-store'
import type { CalendarEvent, Client, GlobalNote, Project } from './data'

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

export async function getAdminState(): Promise<AdminState> {
  await seedIfEmpty()

  const [clients, projects, events, notes] = await Promise.all([
    prisma.client.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.project.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.calendarEvent.findMany({ orderBy: [{ date: 'asc' }, { startTime: 'asc' }] }),
    prisma.globalNote.findMany({ orderBy: { dbCreated: 'desc' } }),
  ])

  return {
    clients: clients.map(toClient),
    projects: projects.map(toProject),
    events: events.map(toEvent),
    notes: notes.map(toNote),
  }
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
}

async function seedIfEmpty() {
  const seeded = await prisma.adminMeta.findUnique({ where: { key: 'initial_seed' } })
  if (seeded) return

  const [clients, projects, events, notes] = await Promise.all([
    prisma.client.count(),
    prisma.project.count(),
    prisma.calendarEvent.count(),
    prisma.globalNote.count(),
  ])

  if (clients + projects + events + notes > 0) {
    await prisma.adminMeta.upsert({
      where: { key: 'initial_seed' },
      update: { value: 'existing_data' },
      create: { key: 'initial_seed', value: 'existing_data' },
    })
    return
  }

  await replaceAdminState(staticAdminState)
  await prisma.adminMeta.upsert({
    where: { key: 'initial_seed' },
    update: { value: 'static_data' },
    create: { key: 'initial_seed', value: 'static_data' },
  })
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