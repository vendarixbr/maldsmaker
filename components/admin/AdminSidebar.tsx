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
          className="fixed inset-0 z-40 lg:hidden transition-opacity duration-200"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(3px)' }}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar — hidden off-screen on mobile, always visible on lg+ */}
      <aside
        className={`fixed top-0 left-0 h-full z-50 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
        style={{
          width: '240px',
          background: '#0D0D0D',
          borderRight: '1px solid rgba(255,255,255,0.08)',
        }}
        aria-label="Navegação Principal Admin"
      >
        {/* Top — logo + close */}
        <div className="flex items-center justify-between px-5 h-16 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-3">
            <Image src="/images/logo.png" alt="Malds Maker Logo" width={110} height={30} className="h-6 w-auto object-contain" priority />
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
        <div className="px-5 py-4 flex items-center gap-3 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-display font-bold text-sm"
            style={{ background: '#C9A84C', color: '#080808' }}
            aria-hidden="true"
          >
            LM
          </div>
          <div>
            <p className="font-display font-medium text-sm text-[#F2F2F2]">
              Leonardo M.
            </p>
            <p className="font-mono-mm text-[10px] tracking-[0.12em] font-semibold text-[#A0A0A0]">
              ADMINISTRADOR
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-4 overflow-y-auto" aria-label="Menu de Seções">
          {navItems.map(({ id, label, Icon }) => {
            const active = activeSection === id
            return (
              <button
                key={id}
                onClick={() => handleNav(id)}
                aria-current={active ? 'page' : undefined}
                className="w-full flex items-center gap-3 px-5 h-12 transition-colors duration-150 text-left outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C] focus-visible:ring-inset"
                style={{
                  background: active ? '#191919' : 'transparent',
                  borderLeft: active ? '3px solid #C9A84C' : '3px solid transparent',
                  color: active ? '#C9A84C' : '#AAAAAA',
                }}
                onMouseEnter={e => {
                  if (!active) (e.currentTarget as HTMLButtonElement).style.background = '#161616'
                }}
                onMouseLeave={e => {
                  if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                }}
              >
                <Icon size={19} aria-hidden="true" />
                <span className="font-display font-medium text-sm">{label}</span>
              </button>
            )
          })}
        </nav>

        {/* Footer actions */}
        <div className="px-5 py-4 shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center justify-between mb-3">
            <span
              className="font-mono-mm text-[10px] tracking-[0.1em] px-2 py-1 border font-semibold"
              style={{ borderColor: 'rgba(201,168,76,0.4)', color: '#C9A84C' }}
            >
              DA RUA PRA RUA
            </span>
          </div>
          <a
            href="/"
            className="flex items-center gap-2 font-mono-mm text-[11px] tracking-[0.08em] transition-colors py-2 text-[#AAAAAA] hover:text-[#C9A84C] focus-visible:ring-2 focus-visible:ring-[#C9A84C] outline-none rounded"
          >
            <ExternalLink size={14} aria-hidden="true" />
            VER SITE PÚBLICO
          </a>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 font-mono-mm text-[11px] tracking-[0.08em] transition-colors py-2 text-[#AAAAAA] hover:text-red-400 focus-visible:ring-2 focus-visible:ring-red-400 outline-none rounded mt-1"
          >
            <LogOut size={14} aria-hidden="true" />
            SAIR DA CONTA
          </button>
        </div>
      </aside>
    </>
  )
}
