'use client'

import { AdminProvider, useAdmin } from '@/lib/admin-context'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminDashboard } from '@/components/admin/AdminDashboard'
import { AdminCRM } from '@/components/admin/AdminCRM'
import { AdminProjetos } from '@/components/admin/AdminProjetos'
import { AdminAgenda } from '@/components/admin/AdminAgenda'
import { AdminNotas } from '@/components/admin/AdminNotas'
import { AdminFinanceiro } from '@/components/admin/AdminFinanceiro'
import { AdminConfiguracoes } from '@/components/admin/AdminConfiguracoes'
import { Menu } from 'lucide-react'

function AdminShell() {
  const { activeSection, setSidebarOpen } = useAdmin()

  const sectionMap: Record<string, React.ReactNode> = {
    dashboard: <AdminDashboard />,
    clientes: <AdminCRM />,
    projetos: <AdminProjetos />,
    agenda: <AdminAgenda />,
    notas: <AdminNotas />,
    financeiro: <AdminFinanceiro />,
    configuracoes: <AdminConfiguracoes />,
  }

  return (
    <div className="admin-page min-h-screen flex" style={{ background: '#080808' }}>
      <AdminSidebar />

      {/* Main content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden lg:ml-[240px]">
        {/* Mobile topbar */}
        <div
          className="flex lg:hidden items-center justify-between px-4 h-14 sticky top-0 z-30"
          style={{ background: '#0D0D0D', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menu"
            style={{ color: '#F2F2F2' }}
          >
            <Menu size={22} />
          </button>
          <span className="font-mono-mm text-[11px] tracking-[0.12em]" style={{ color: '#C9A84C' }}>
            MALDS MAKER
          </span>
          <div className="w-6" />
        </div>

        {/* Page content */}
        <div className="flex-1 p-5 lg:p-7 max-w-[1400px] w-full mx-auto">
          {sectionMap[activeSection] ?? <AdminDashboard />}
        </div>
      </main>


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
