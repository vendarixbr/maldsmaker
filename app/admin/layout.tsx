import type { Metadata } from 'next'

// O painel nunca deve aparecer em buscadores.
export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false, nocache: true },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children
}
