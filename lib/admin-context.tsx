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
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  adminReducer,
  emptyAdminState,
  type AdminAction,
  type AdminState,
} from './admin-store'

interface AdminContextType {
  state: AdminState
  /** Aplica local na hora e persiste; resolve `true` quando o banco confirmou. */
  dispatch: (action: AdminAction) => Promise<boolean>
  activeSection: string
  setActiveSection: (s: string) => void
  sidebarOpen: boolean
  setSidebarOpen: (v: boolean) => void
  isLoading: boolean
  isSaving: boolean
  error: string | null
}

const AdminContext = createContext<AdminContextType | null>(null)

export const ADMIN_SECTIONS = [
  'dashboard',
  'leads',
  'clientes',
  'projetos',
  'agenda',
  'notas',
  'financeiro',
  'portfolio',
  'depoimentos',
  'imagens',
  'pagina-inicial',
  'configuracoes',
] as const

export function AdminProvider({ children }: { children: ReactNode }) {
  const [state, localDispatch] = useReducer(adminReducer, emptyAdminState)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const sectionParam = searchParams.get('section')
  const activeSection =
    sectionParam && (ADMIN_SECTIONS as readonly string[]).includes(sectionParam)
      ? sectionParam
      : 'dashboard'

  const setActiveSection = useCallback(
    (section: string) => {
      if (!(ADMIN_SECTIONS as readonly string[]).includes(section)) return
      const params = new URLSearchParams(searchParams.toString())
      if (section === 'dashboard') params.delete('section')
      else params.set('section', section)
      const qs = params.toString()
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: true })
    },
    [router, pathname, searchParams],
  )
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

  const dispatch = useCallback(async (action: AdminAction): Promise<boolean> => {
    if (action.type === 'HYDRATE') {
      confirmedState.current = action.payload
      localDispatch(action)
      return true
    }

    const rollback = confirmedState.current
    localDispatch(action)
    setIsSaving(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/mutate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action),
      })
      if (!response.ok) throw new Error('Falha ao salvar dados')
      const payload = await response.json() as AdminState
      confirmedState.current = payload
      localDispatch({ type: 'HYDRATE', payload })
      return true
    } catch (err) {
      console.error(err)
      localDispatch({ type: 'HYDRATE', payload: rollback })
      setError('Nao foi possivel salvar no banco. A alteracao foi desfeita.')
      return false
    } finally {
      setIsSaving(false)
    }
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