'use client'

import {
  createContext,
  useContext,
  useReducer,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import {
  CLIENTS,
  PROJECTS,
  CALENDAR_EVENTS,
  GLOBAL_NOTES,
  type Client,
  type Project,
  type CalendarEvent,
  type GlobalNote,
  type Note,
} from './data'

/* ------------------------------------------------------------------ */
/*  State shape                                                         */
/* ------------------------------------------------------------------ */

interface AdminState {
  clients: Client[]
  projects: Project[]
  events: CalendarEvent[]
  notes: GlobalNote[]
}

type AdminAction =
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

function reducer(state: AdminState, action: AdminAction): AdminState {
  switch (action.type) {
    case 'ADD_CLIENT':
      return { ...state, clients: [action.payload, ...state.clients] }
    case 'UPDATE_CLIENT':
      return {
        ...state,
        clients: state.clients.map(c => c.id === action.payload.id ? action.payload : c),
      }
    case 'DELETE_CLIENT':
      return { ...state, clients: state.clients.filter(c => c.id !== action.id) }
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
    default:
      return state
  }
}

/* ------------------------------------------------------------------ */
/*  Context                                                             */
/* ------------------------------------------------------------------ */

interface AdminContextType {
  state: AdminState
  dispatch: React.Dispatch<AdminAction>
  activeSection: string
  setActiveSection: (s: string) => void
  sidebarOpen: boolean
  setSidebarOpen: (v: boolean) => void
}

const AdminContext = createContext<AdminContextType | null>(null)

export function AdminProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    clients: CLIENTS,
    projects: PROJECTS,
    events: CALENDAR_EVENTS,
    notes: GLOBAL_NOTES,
  })
  const [activeSection, setActiveSection] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <AdminContext.Provider
      value={{ state, dispatch, activeSection, setActiveSection, sidebarOpen, setSidebarOpen }}
    >
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider')
  return ctx
}
