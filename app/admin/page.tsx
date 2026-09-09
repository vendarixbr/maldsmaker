'use client'

import { AdminProvider, useAdmin } from '@/lib/admin-context'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminMobileNav } from '@/components/admin/AdminMobileNav'
import { AdminDashboard } from '@/components/admin/AdminDashboard'
import { AdminCRM } from '@/components/admin/AdminCRM'
import { AdminProjetos } from '@/components/admin/AdminProjetos'
import { AdminAgenda } from '@/components/admin/AdminAgenda'
import { AdminNotas } from '@/components/admin/AdminNotas'
import { AdminFinanceiro } from '@/components/admin/AdminFinanceiro'
import { AdminImagens } from '@/components/admin/AdminImagens'
import { AdminPortfolio } from '@/components/admin/AdminPortfolio'
import { AdminDepoimentos } from '@/components/admin/AdminDepoimentos'
import { AdminConfiguracoes } from '@/components/admin/AdminConfiguracoes'
import { Menu } from 'lucide-react'

function AdminShell() {
  const { activeSection, setSidebarOpen, isLoading, isSaving, error } = useAdmin()

  const sectionMap: Record<string, React.ReactNode> = {
    dashboard: <AdminDashboard />,
    clientes: <AdminCRM />,
    projetos: <AdminProjetos />,
    agenda: <AdminAgenda />,
    notas: <AdminNotas />,
    financeiro: <AdminFinanceiro />,
    portfolio: <AdminPortfolio />,
    depoimentos: <AdminDepoimentos />,
    imagens: <AdminImagens />,
    configuracoes: <AdminConfiguracoes />,
  }

  return (
    <div className="admin-page min-h-screen flex" style={{ background: '#080808' }}>
      <AdminSidebar />

      {/* Main content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden lg:ml-[240px]">
        {/* Mobile topbar */}
        <div
          className="flex lg:hidden items-center justify-between px-4 h-14 sticky top-0 z-20 shadow-md"
          style={{ background: '#0D0D0D', borderBottom: '1px solid rgba(255,255,255,0.12)' }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menu de navegação"
            className="w-10 h-10 flex items-center justify-center rounded-lg text-white hover:bg-white/5 active:bg-white/10 outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C]"
          >
            <Menu size={22} />
          </button>
          <span className="font-mono-mm text-xs tracking-[0.14em] font-semibold" style={{ color: '#E5C158' }}>
            MALDS MAKER ADMIN
          </span>
          <div className="w-10" />
        </div>

        {/* Page content with bottom padding for mobile navigation */}
        <div className="flex-1 p-4 sm:p-6 lg:p-7 pb-24 lg:pb-7 max-w-[1400px] w-full mx-auto">
          {(isLoading || isSaving || error) && (
            <div
              className="mb-4 px-4 py-3 font-mono-mm text-xs tracking-[0.08em] flex items-center gap-2 font-semibold"
              style={{
                background: error ? 'rgba(248,113,113,0.15)' : 'rgba(201,168,76,0.15)',
                border: error ? '1px solid rgba(248,113,113,0.4)' : '1px solid rgba(201,168,76,0.4)',
                borderRadius: '8px',
                color: error ? '#F87171' : '#E5C158',
              }}
              role="status"
              aria-live="polite"
            >
              {error ?? (isLoading ? 'CARREGANDO DADOS DO POSTGRES...' : 'SALVANDO NO POSTGRES...')}
            </div>
          )}
          {sectionMap[activeSection] ?? <AdminDashboard />}
        </div>
      </main>

      {/* Fixed bottom navigation for mobile */}
      <AdminMobileNav />
    </div>
  )
}

export default function AdminPage() {
  return (
    <AdminProvider>
      <AdminShell />
    </AdminProvider>
  )
}
