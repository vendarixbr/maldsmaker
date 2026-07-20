'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  adminReducer,
  emptyAdminState,
  type AdminAction,
  type AdminState,
} from './admin-store'

interface AdminContextType {
  state: AdminState
  dispatch: (action: AdminAction) => void
  activeSection: string
  setActiveSection: (s: string) => void
  sidebarOpen: boolean
  setSidebarOpen: (v: boolean) => void
  isLoading: boolean
  isSaving: boolean
  error: string | null
}

const AdminContext = createContext<AdminContextType | null>(null)

export function AdminProvider({ children }: { children: ReactNode }) {
  const [state, localDispatch] = useReducer(adminReducer, emptyAdminState)
  const [activeSection, setActiveSection] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const confirmedState = useRef<AdminState>(emptyAdminState)

  const loadState = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/state', { cache: 'no-store' })
      if (!response.ok) throw new Error('Falha ao carregar dados')

      const payload = await response.json() as AdminState
      confirmedState.current = payload
      localDispatch({ type: 'HYDRATE', payload })
    } catch (err) {
      console.error(err)
      setError('Nao foi possivel carregar os dados do admin.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadState()
  }, [loadState])

  const dispatch = useCallback((action: AdminAction) => {
    if (action.type === 'HYDRATE') {
      confirmedState.current = action.payload
      localDispatch(action)
      return
    }

    const rollback = confirmedState.current
    localDispatch(action)
    setIsSaving(true)
    setError(null)

    void fetch('/api/admin/mutate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(action),
    })
      .then(async response => {
        if (!response.ok) throw new Error('Falha ao salvar dados')
        const payload = await response.json() as AdminState
        confirmedState.current = payload
        localDispatch({ type: 'HYDRATE', payload })
      })
      .catch(err => {
        console.error(err)
        localDispatch({ type: 'HYDRATE', payload: rollback })
        setError('Nao foi possivel salvar no banco. A alteracao foi desfeita.')
      })
      .finally(() => setIsSaving(false))
  }, [])

  return (
    <AdminContext.Provider
      value={{
        state,
        dispatch,
        activeSection,
        setActiveSection,
        sidebarOpen,
        setSidebarOpen,
        isLoading,
        isSaving,
        error,
      }}
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