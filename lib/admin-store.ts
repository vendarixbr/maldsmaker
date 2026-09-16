import {
  CALENDAR_EVENTS,
  CLIENTS,
  EXPENSES,
  GLOBAL_NOTES,
  PORTFOLIO_ITEMS,
  PROJECTS,
  TESTIMONIALS,
  type CalendarEvent,
  type Client,
  type Expense,
  type GlobalNote,
  type Invoice,
  type Note,
  type PortfolioItem,
  type Project,
  type Testimonial,
} from './data'

export interface AdminState {
  clients: Client[]
  projects: Project[]
  events: CalendarEvent[]
  notes: GlobalNote[]
  expenses: Expense[]
  portfolio: PortfolioItem[]
  testimonials: Testimonial[]
}

export type AdminAction =
  | { type: 'HYDRATE'; payload: AdminState }
  | { type: 'RESET_ALL' }
  | { type: 'ADD_CLIENT'; payload: Client }
  | { type: 'UPDATE_CLIENT'; payload: Client }
  | { type: 'DELETE_CLIENT'; id: string }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'UPDATE_PROJECT'; payload: Project }
  | { type: 'MOVE_PROJECT'; id: string; status: Project['status'] }
  | { type: 'DELETE_PROJECT'; id: string }
  | { type: 'ADD_EVENT'; payload: CalendarEvent }
  | { type: 'UPDATE_EVENT'; payload: CalendarEvent }
  | { type: 'DELETE_EVENT'; id: string }
  | { type: 'ADD_NOTE'; payload: GlobalNote }
  | { type: 'UPDATE_NOTE'; payload: GlobalNote }
  | { type: 'DELETE_NOTE'; id: string }
  | { type: 'PIN_NOTE'; id: string }
  | { type: 'ADD_CLIENT_NOTE'; clientId: string; note: Note }
  | { type: 'DELETE_CLIENT_NOTE'; clientId: string; noteId: string }
  | { type: 'ADD_INVOICE'; clientId: string; invoice: Invoice }
  | { type: 'UPDATE_INVOICE'; clientId: string; invoice: Invoice }
  | { type: 'DELETE_INVOICE'; clientId: string; invoiceId: string }
  | { type: 'ADD_EXPENSE'; payload: Expense }
  | { type: 'UPDATE_EXPENSE'; payload: Expense }
  | { type: 'DELETE_EXPENSE'; id: string }
  | { type: 'ADD_PORTFOLIO'; payload: PortfolioItem }
  | { type: 'UPDATE_PORTFOLIO'; payload: PortfolioItem }
  | { type: 'DELETE_PORTFOLIO'; id: string }
  | { type: 'ADD_TESTIMONIAL'; payload: Testimonial }
  | { type: 'UPDATE_TESTIMONIAL'; payload: Testimonial }
  | { type: 'DELETE_TESTIMONIAL'; id: string }

export const emptyAdminState: AdminState = {
  clients: [],
  projects: [],
  events: [],
  notes: [],
  expenses: [],
  portfolio: [],
  testimonials: [],
}

export const staticAdminState: AdminState = {
  clients: CLIENTS,
  projects: PROJECTS,
  events: CALENDAR_EVENTS,
  notes: GLOBAL_NOTES,
  expenses: EXPENSES,
  portfolio: PORTFOLIO_ITEMS,
  testimonials: TESTIMONIALS,
}

export function adminReducer(state: AdminState, action: AdminAction): AdminState {
  switch (action.type) {
    case 'HYDRATE':
      return normalizeState({ ...emptyAdminState, ...action.payload })
    case 'RESET_ALL':
      return emptyAdminState
    case 'ADD_CLIENT':
      return { ...state, clients: [action.payload, ...state.clients] }
    case 'UPDATE_CLIENT':
      return {
        ...state,
        clients: state.clients.map(c => c.id === action.payload.id ? action.payload : c),
      }
    case 'DELETE_CLIENT':
      return {
        ...state,
        clients: state.clients.filter(c => c.id !== action.id),
        projects: state.projects.filter(p => p.clientId !== action.id),
      }
    case 'ADD_PROJECT':
      return { ...state, projects: [action.payload, ...state.projects] }
    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map(p => p.id === action.payload.id ? action.payload : p),
      }
    case 'MOVE_PROJECT':
      return {
        ...state,
        projects: state.projects.map(p =>
          p.id === action.id ? { ...p, status: action.status } : p
        ),
      }
    case 'DELETE_PROJECT':
      return { ...state, projects: state.projects.filter(p => p.id !== action.id) }
    case 'ADD_EVENT':
      return { ...state, events: [action.payload, ...state.events] }
    case 'UPDATE_EVENT':
      return {
        ...state,
        events: state.events.map(e => e.id === action.payload.id ? action.payload : e),
      }
    case 'DELETE_EVENT':
      return { ...state, events: state.events.filter(e => e.id !== action.id) }
    case 'ADD_NOTE':
      return { ...state, notes: [action.payload, ...state.notes] }
    case 'UPDATE_NOTE':
      return {
        ...state,
        notes: state.notes.map(n => n.id === action.payload.id ? action.payload : n),
      }
    case 'DELETE_NOTE':
      return { ...state, notes: state.notes.filter(n => n.id !== action.id) }
    case 'PIN_NOTE':
      return {
        ...state,
        notes: state.notes.map(n => n.id === action.id ? { ...n, pinned: !n.pinned } : n),
      }
    case 'ADD_CLIENT_NOTE':
      return {
        ...state,
        clients: state.clients.map(c =>
          c.id === action.clientId
            ? { ...c, notes: [action.note, ...c.notes] }
            : c
        ),
      }
    case 'DELETE_CLIENT_NOTE':
      return {
        ...state,
        clients: state.clients.map(c =>
          c.id === action.clientId
            ? { ...c, notes: c.notes.filter(n => n.id !== action.noteId) }
            : c
        ),
      }
    case 'ADD_INVOICE':
      return {
        ...state,
        clients: state.clients.map(c =>
          c.id === action.clientId
            ? recalcClientTotals({ ...c, invoices: [action.invoice, ...c.invoices] })
            : c
        ),
      }
    case 'UPDATE_INVOICE':
      return {
        ...state,
        clients: state.clients.map(c =>
          c.id === action.clientId
            ? recalcClientTotals({
                ...c,
                invoices: c.invoices.map(inv => (inv.id === action.invoice.id ? action.invoice : inv)),
              })
            : c
        ),
      }
    case 'DELETE_INVOICE':
      return {
        ...state,
        clients: state.clients.map(c =>
          c.id === action.clientId
            ? recalcClientTotals({ ...c, invoices: c.invoices.filter(inv => inv.id !== action.invoiceId) })
            : c
        ),
      }
    case 'ADD_EXPENSE':
      return { ...state, expenses: [action.payload, ...state.expenses] }
    case 'UPDATE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.map(e => (e.id === action.payload.id ? action.payload : e)),
      }
    case 'DELETE_EXPENSE':
      return { ...state, expenses: state.expenses.filter(e => e.id !== action.id) }
    case 'ADD_PORTFOLIO':
      return { ...state, portfolio: [...state.portfolio, action.payload] }
    case 'UPDATE_PORTFOLIO':
      return {
        ...state,
        portfolio: state.portfolio.map(p => (p.id === action.payload.id ? action.payload : p)),
      }
    case 'DELETE_PORTFOLIO':
      return { ...state, portfolio: state.portfolio.filter(p => p.id !== action.id) }
    case 'ADD_TESTIMONIAL':
      return { ...state, testimonials: [...state.testimonials, action.payload] }
    case 'UPDATE_TESTIMONIAL':
      return {
        ...state,
        testimonials: state.testimonials.map(t => (t.id === action.payload.id ? action.payload : t)),
      }
    case 'DELETE_TESTIMONIAL':
      return { ...state, testimonials: state.testimonials.filter(t => t.id !== action.id) }
    default:
      return state
  }
}

function recalcClientTotals(client: Client): Client {
  const valid = client.invoices.filter(i => i.status !== 'CANCELADO')
  return { ...client, totalValue: valid.reduce((s, i) => s + i.value, 0) }
}

function normalizeState(s: AdminState): AdminState {
  return {
    clients: s.clients ?? [],
    projects: (s.projects ?? []).map(p => ({
      ...p,
      description: p.description ?? '',
      startDate: p.startDate ?? '',
      location: p.location ?? '',
      coverImageUrl: p.coverImageUrl ?? undefined,
      images: p.images ?? [],
      checklist: p.checklist ?? [],
      comments: p.comments ?? [],
    })),
    events: s.events ?? [],
    notes: s.notes ?? [],
    expenses: (s as Partial<AdminState>).expenses ?? [],
    portfolio: ((s as Partial<AdminState>).portfolio ?? []).map(p => ({
      ...p,
      slug: p.slug ?? '',
      description: p.description ?? '',
      images: p.images ?? [],
    })),
    testimonials: (s as Partial<AdminState>).testimonials ?? [],
  }
}

export function withDefaults(s: Partial<AdminState>): AdminState {
  return normalizeState({ ...emptyAdminState, ...s })
}
