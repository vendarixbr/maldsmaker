'use client'

import { useAdmin } from '@/lib/admin-context'
import {
  LayoutDashboard,
  Inbox,
  Users,
  Film,
  Calendar,
  NotebookPen,
  BarChart2,
  Settings,
  X,
  ExternalLink,
  LogOut,
  Images,
  LayoutGrid,
  MessageSquareQuote,
  Search,
} from 'lucide-react'
import { SiteImage } from '@/components/site/SiteImage'
import { useRouter } from 'next/navigation'

const navItems = [
  { id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { id: 'leads', label: 'Leads', Icon: Inbox, badge: true },
  { id: 'clientes', label: 'Clientes / CRM', Icon: Users },
  { id: 'projetos', label: 'Projetos', Icon: Film },
  { id: 'agenda', label: 'Agenda', Icon: Calendar },
  { id: 'notas', label: 'Notas', Icon: NotebookPen },
  { id: 'financeiro', label: 'Financeiro', Icon: BarChart2 },
  { id: 'portfolio', label: 'Portfólio Site', Icon: LayoutGrid },
  { id: 'depoimentos', label: 'Depoimentos', Icon: MessageSquareQuote },
  { id: 'imagens', label: 'Imagens do Site', Icon: Images },
  { id: 'configuracoes', label: 'Configurações', Icon: Settings },
]

export function AdminSidebar() {
  const { state, activeSection, setActiveSection, sidebarOpen, setSidebarOpen } = useAdmin()
  const router = useRouter()
  const pendingLeads = state.clients.filter(c => c.status === 'PROSPECT').length

  const handleNav = (id: string) => {
    setActiveSection(id)
    setSidebarOpen(false)
  }

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.replace('/admin/login')
    router.refresh()
  }

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden transition-opacity duration-200"
          style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full z-50 flex flex-col transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
        style={{
          width: '240px',
          background: '#0D0D0D',
          borderRight: '1px solid rgba(255,255,255,0.12)',
        }}
        aria-label="Navegação Principal Admin"
      >
        {/* Top — logo + close */}
        <div
          className="flex items-center justify-between px-5 h-16 shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.12)' }}
        >
          <div className="flex items-center gap-3">
            <SiteImage
              imageKey="logo"
              alt="Malds Maker Logo"
              width={110}
              height={30}
              className="h-6 w-auto object-contain"
              priority
            />
          </div>
          <button
            className="lg:hidden text-gray-300 hover:text-white p-2 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-[#C9A84C] outline-none"
            onClick={() => setSidebarOpen(false)}
            aria-label="Fechar menu lateral"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Profile Info */}
        <div
          className="px-5 py-4 flex items-center gap-3 shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.12)' }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-display font-bold text-sm"
            style={{ background: '#C9A84C', color: '#080808' }}
            aria-hidden="true"
          >
            LM
          </div>
          <div>
            <p className="font-display font-semibold text-sm text-[#FFFFFF]">
              Leonardo M.
            </p>
            <p className="font-mono-mm text-[10px] tracking-[0.12em] font-semibold text-[#CBD5E1]">
              ADMINISTRADOR
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-4 overflow-y-auto" aria-label="Menu de Seções">
          {navItems.map(({ id, label, Icon, badge }) => {
            const active = activeSection === id
            const count = badge ? pendingLeads : 0
            return (
              <button
                key={id}
                onClick={() => handleNav(id)}
                aria-current={active ? 'page' : undefined}
                className="w-full flex items-center gap-3 px-5 h-12 transition-colors duration-150 text-left outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C] focus-visible:ring-inset"
                style={{
                  background: active ? '#1C1C1C' : 'transparent',
                  borderLeft: active ? '3px solid #C9A84C' : '3px solid transparent',
                  color: active ? '#E5C158' : '#D1D5DB',
                }}
                onMouseEnter={e => {
                  if (!active) (e.currentTarget as HTMLButtonElement).style.background = '#161616'
                }}
                onMouseLeave={e => {
                  if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                }}
              >
                <Icon size={19} aria-hidden="true" style={{ color: active ? '#E5C158' : '#CBD5E1' }} />
                <span className="font-display font-medium text-sm flex-1">{label}</span>
                {count > 0 && (
                  <span
                    className="min-w-5 h-5 px-1.5 rounded-full font-mono-mm text-[10px] font-bold flex items-center justify-center"
                    style={{ background: '#C9A84C', color: '#080808' }}
                  >
                    {count}
                  </span>
                )}
              </button>
            )
          })}
          <div className="px-5 pt-3">
            <button
              onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
              className="w-full flex items-center justify-between px-3 h-10 rounded-lg text-[#94A3B8] hover:text-[#E5C158] hover:border-[rgba(201,168,76,0.4)] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C]"
              style={{ border: '1px solid rgba(255,255,255,0.1)', background: '#111111' }}
              aria-label="Abrir busca rápida"
            >
              <span className="flex items-center gap-2 font-mono-mm text-[10px] tracking-[0.08em]">
                <Search size={13} />
                BUSCA RÁPIDA
              </span>
              <kbd className="font-mono-mm text-[10px] px-1.5 py-0.5 rounded" style={{ border: '1px solid rgba(255,255,255,0.15)' }}>
                ⌘K
              </kbd>
            </button>
          </div>
        </nav>

        {/* Footer actions */}
        <div className="px-5 py-4 shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.12)' }}>
          <div className="flex items-center justify-between mb-3">
            <span
              className="font-mono-mm text-[10px] tracking-[0.1em] px-2.5 py-1 border font-semibold rounded"
              style={{ borderColor: 'rgba(201,168,76,0.5)', color: '#E5C158', background: 'rgba(201,168,76,0.08)' }}
            >
              DA RUA PRA RUA
            </span>
          </div>
          <a
            href="/"
            className="flex items-center gap-2 font-mono-mm text-[11px] tracking-[0.08em] transition-colors py-2 text-[#D1D5DB] hover:text-[#E5C158] focus-visible:ring-2 focus-visible:ring-[#C9A84C] outline-none rounded"
          >
            <ExternalLink size={14} aria-hidden="true" />
            VER SITE PÚBLICO
          </a>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 font-mono-mm text-[11px] tracking-[0.08em] transition-colors py-2 text-[#D1D5DB] hover:text-red-400 focus-visible:ring-2 focus-visible:ring-red-400 outline-none rounded mt-1"
          >
            <LogOut size={14} aria-hidden="true" />
            SAIR DA CONTA
          </button>
        </div>
      </aside>
    </>
  )
}
