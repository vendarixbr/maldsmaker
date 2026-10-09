import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Página não encontrada',
  robots: { index: false, follow: false },
}

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-center" style={{ background: '#0A0A0A' }}>
      <p className="font-mono-mm text-[11px] tracking-[0.2em]" style={{ color: '#C9A84C' }}>ERRO 404</p>
      <h1 className="font-display uppercase" style={{ fontSize: 'clamp(40px, 8vw, 88px)', color: '#F5F5F0', lineHeight: 1 }}>
        Página não encontrada
      </h1>
      <p className="font-body max-w-md" style={{ color: '#A8A89A', lineHeight: 1.7 }}>
        O endereço pode ter mudado ou nunca ter existido. Volte para a página inicial ou veja nossos trabalhos.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/" className="h-12 px-8 flex items-center font-mono-mm text-[11px] tracking-[0.14em] font-semibold" style={{ background: '#C9A84C', color: '#0A0A0A' }}>
          IR PARA O INÍCIO
        </Link>
        <Link href="/portfolio" className="h-12 px-8 flex items-center font-mono-mm text-[11px] tracking-[0.14em] font-semibold" style={{ border: '1px solid rgba(201,168,76,0.5)', color: '#E5C158' }}>
          VER PORTFÓLIO
        </Link>
      </div>
    </main>
  )
}
