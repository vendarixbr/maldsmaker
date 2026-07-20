'use client'

import { useAdmin } from '@/lib/admin-context'
import {
  LayoutDashboard,
  Users,
  Film,
  Calendar,
  NotebookPen,
  BarChart2,
  Settings,
  X,
  ExternalLink,
  LogOut,
} from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

const navItems = [
  { id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { id: 'clientes', label: 'Clientes / CRM', Icon: Users },
  { id: 'projetos', label: 'Projetos', Icon: Film },
  { id: 'agenda', label: 'Agenda', Icon: Calendar },
  { id: 'notas', label: 'Notas', Icon: NotebookPen },
  { id: 'financeiro', label: 'Financeiro', Icon: BarChart2 },
  { id: 'configuracoes', label: 'Configurações', Icon: Settings },
]

export function AdminSidebar() {
  const { activeSection, setActiveSection, sidebarOpen, setSidebarOpen } = useAdmin()
  const router = useRouter()

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
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — hidden off-screen on mobile, always visible on lg+ */}
      <aside
        className={`fixed top-0 left-0 h-full z-50 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
        style={{
          width: '240px',
          background: '#0D0D0D',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Top — logo + user */}
        <div className="flex items-center justify-between px-5 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3">
            <Image src="/images/logo.png" alt="Malds Maker" width={110} height={30} className="h-6 w-auto object-contain" />
          </div>
          <button
            className="lg:hidden text-mm-white"
            onClick={() => setSidebarOpen(false)}
            aria-label="Fechar sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* User */}
        <div className="px-5 py-4 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-display font-bold text-sm"
            style={{ background: '#C9A84C', color: '#080808' }}
          >
            LM
          </div>
          <div>
            <p className="font-display font-medium text-sm" style={{ color: '#F2F2F2' }}>
              Leonardo M.
            </p>
            <p className="font-mono-mm text-[10px] tracking-[0.1em]" style={{ color: '#555' }}>
              ADMIN
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map(({ id, label, Icon }) => {
            const active = activeSection === id
            return (
              <button
                key={id}
                onClick={() => handleNav(id)}
                className="w-full flex items-center gap-3 px-5 h-11 transition-colors duration-150 text-left"
                style={{
                  background: active ? '#191919' : 'transparent',
                  borderLeft: active ? '2px solid #C9A84C' : '2px solid transparent',
                  color: active ? '#C9A84C' : '#888',
                }}
                onMouseEnter={e => {
                  if (!active) (e.currentTarget as HTMLButtonElement).style.background = '#161616'
                }}
                onMouseLeave={e => {
                  if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                }}
              >
                <Icon size={18} />
                <span className="font-display font-medium text-sm">{label}</span>
              </button>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="px-5 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between mb-3">
            <span
              className="font-mono-mm text-[10px] tracking-[0.1em] px-2 py-1 border"
              style={{ borderColor: 'rgba(201,168,76,0.4)', color: '#C9A84C' }}
            >
              DA RUA PRA RUA
            </span>
          </div>
          <a
            href="/"
            className="flex items-center gap-2 font-mono-mm text-[10px] tracking-[0.1em] transition-colors mb-3"
            style={{ color: '#444' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#666')}
            onMouseLeave={e => (e.currentTarget.style.color = '#444')}
          >
            <ExternalLink size={11} />
            VER SITE PÚBLICO
          </a>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 font-mono-mm text-[10px] tracking-[0.1em] transition-colors"
            style={{ color: '#444' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#F1948A')}
            onMouseLeave={e => (e.currentTarget.style.color = '#444')}
          >
            <LogOut size={11} />
            SAIR
          </button>
        </div>
      </aside>
    </>
  )
}
