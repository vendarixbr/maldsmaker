import type { Metadata, Viewport } from 'next'
import { Bebas_Neue, DM_Sans, DM_Mono } from 'next/font/google'
import { SiteImageProvider } from '@/lib/site-image-context'
import { SiteContentProvider } from '@/lib/site-content-context'
import { getSiteUrl } from '@/lib/site'
import './globals.css'

const bebasNeue = Bebas_Neue({
  subsets: ['latin'],
  variable: '--font-bebas',
  weight: ['400'],
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['300', '400', '500', '600', '700'],
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  variable: '--font-dm-mono',
  weight: ['300', '400', '500'],
})

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: 'Malds Maker — Produção Audiovisual em Sorocaba, SP',
  description:
    'Produção audiovisual, fotografia profissional e Nauta Estúdio 480m² em Sorocaba, SP. Do clipe ao institucional, do ensaio ao evento.',
  keywords: [
    'produção audiovisual',
    'fotografia',
    'Sorocaba',
    'estúdio',
    'clipe musical',
    'vídeo institucional',
  ],
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#0A0A0A',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${bebasNeue.variable} ${dmSans.variable} ${dmMono.variable} bg-[#0A0A0A]`}
    >
      <body className="antialiased bg-[#0A0A0A] text-[#F5F5F0]" style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }} suppressHydrationWarning>
        <SiteImageProvider>
          <SiteContentProvider>{children}</SiteContentProvider>
        </SiteImageProvider>
      </body>
    </html>
  )
}
