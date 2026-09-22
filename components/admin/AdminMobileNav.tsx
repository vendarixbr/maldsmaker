'use client'

import { useState } from 'react'
import { useAdmin } from '@/lib/admin-context'
import {
  LayoutDashboard,
  Inbox,
  Users,
  Film,
  Calendar,
  MoreHorizontal,
  NotebookPen,
  BarChart2,
  Settings,
  LogOut,
  X,
  Images,
  LayoutGrid,
  MessageSquareQuote,
  Home,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

const mainTabs = [
  { id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { id: 'clientes', label: 'Clientes', Icon: Users },
  { id: 'projetos', label: 'Projetos', Icon: Film },
  { id: 'agenda', label: 'Agenda', Icon: Calendar },
]

const extraTabs = [
  { id: 'leads', label: 'Leads', Icon: Inbox },
  { id: 'notas', label: 'Notas', Icon: NotebookPen },
  { id: 'financeiro', label: 'Financeiro', Icon: BarChart2 },
  { id: 'portfolio', label: 'Portfólio', Icon: LayoutGrid },
  { id: 'depoimentos', label: 'Depoimentos', Icon: MessageSquareQuote },
  { id: 'imagens', label: 'Imagens', Icon: Images },
  { id: 'pagina-inicial', label: 'Página Inicial', Icon: Home },
  { id: 'configuracoes', label: 'Configurações', Icon: Settings },
]

export function AdminMobileNav() {
  const { state, activeSection, setActiveSection } = useAdmin()
  const [moreOpen, setMoreOpen] = useState(false)
  const router = useRouter()
  const pendingLeads = state.clients.filter(c => c.status === 'PROSPECT').length

  const handleNav = (id: string) => {
    setActiveSection(id)
    setMoreOpen(false)
  }

  const handleLogout = async () => {
    setMoreOpen(false)
    await fetch('/api/admin/logout', { method: 'POST' })
    router.replace('/admin/login')
    router.refresh()
  }

  const isExtraActive = extraTabs.some(t => t.id === activeSection)

  return (
    <>
      {/* Popover menu for "Mais" options */}
      {moreOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden flex flex-col justify-end"
          style={{ background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(4px)' }}
          onClick={() => setMoreOpen(false)}
        >
          <div
            className="w-full bg-[#0D0D0D] border-t border-white/10 p-5 rounded-t-2xl flex flex-col gap-3 shadow-2xl animate-in slide-in-from-bottom duration-200"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-label="Menu Adicional"
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="font-mono-mm text-xs tracking-[0.14em] text-[#E5C158] font-semibold">
                OUTRAS SEÇÕES
              </span>
              <button
                onClick={() => setMoreOpen(false)}
                className="w-9 h-9 flex items-center justify-center text-[#CBD5E1] hover:text-white rounded-lg active:bg-white/5 focus-visible:ring-2 focus-visible:ring-[#C9A84C] outline-none"
                aria-label="Fechar menu"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 py-2">
              {extraTabs.map(({ id, label, Icon }) => {
                const active = activeSection === id
                const count = id === 'leads' ? pendingLeads : 0
                return (
                  <button
                    key={id}
                    onClick={() => handleNav(id)}
                    className="relative flex flex-col items-center justify-center gap-2 p-3 rounded-xl min-h-[72px] transition-all border outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C]"
                    style={{
                      background: active ? 'rgba(201, 168, 76, 0.2)' : '#161616',
                      borderColor: active ? '#C9A84C' : 'rgba(255, 255, 255, 0.12)',
                      color: active ? '#E5C158' : '#CBD5E1',
                    }}
                  >
                    <Icon size={22} />
                    <span className="font-display font-medium text-xs text-center">{label}</span>
                    {count > 0 && (
                      <span
                        className="absolute top-1.5 right-1.5 min-w-5 h-5 px-1 rounded-full font-mono-mm text-[10px] font-bold flex items-center justify-center"
                        style={{ background: '#C9A84C', color: '#080808' }}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            <div className="pt-2 border-t border-white/10">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 h-12 rounded-xl text-red-400 bg-red-950/20 border border-red-900/30 font-mono-mm text-xs tracking-wider outline-none focus-visible:ring-2 focus-visible:ring-red-400 active:bg-red-950/40"
              >
                <LogOut size={16} />
                SAIR DA CONTA
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Bottom Navigation Bar on Mobile */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-30 lg:hidden flex items-center justify-around h-16 px-2 bg-[#0D0D0D] border-t border-white/10 shadow-2xl"
        aria-label="Navegação móvel inferior"
      >
        {mainTabs.map(({ id, label, Icon }) => {
          const active = activeSection === id
          return (
            <button
              key={id}
              onClick={() => handleNav(id)}
              className="flex-1 flex flex-col items-center justify-center h-full min-h-[44px] gap-1 transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C] rounded-lg"
              aria-current={active ? 'page' : undefined}
              style={{ color: active ? '#E5C158' : '#CBD5E1' }}
            >
              <Icon size={20} className={active ? 'scale-110 transition-transform' : ''} />
              <span className="font-display text-[11px] font-medium tracking-tight">{label}</span>
            </button>
          )
        })}

        {/* Mais Tab */}
        <button
          onClick={() => setMoreOpen(!moreOpen)}
          className="flex-1 flex flex-col items-center justify-center h-full min-h-[44px] gap-1 transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C] rounded-lg"
          aria-expanded={moreOpen}
          aria-label="Mais seções"
          style={{ color: isExtraActive || moreOpen ? '#E5C158' : '#CBD5E1' }}
        >
          <MoreHorizontal size={20} className={isExtraActive || moreOpen ? 'scale-110' : ''} />
          <span className="font-display text-[11px] font-medium tracking-tight">Mais</span>
        </button>
      </nav>
    </>
  )
}
