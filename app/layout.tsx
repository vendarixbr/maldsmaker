import type { Metadata, Viewport } from 'next'
import { Bebas_Neue, DM_Sans, DM_Mono } from 'next/font/google'
import { SiteImageProvider } from '@/lib/site-image-context'
import { SiteContentProvider } from '@/lib/site-content-context'
import { getSiteUrl, SITE_NAME, SITE_TAGLINE } from '@/lib/site'
import { SITE_DESCRIPTION } from '@/lib/seo'
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
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    'produção audiovisual Sorocaba',
    'fotografia profissional Sorocaba',
    'estúdio fotográfico Sorocaba',
    'locação de estúdio',
    'Nauta Estúdio',
    'videoclipe',
    'vídeo institucional',
    'ensaio fotográfico',
    'cobertura de eventos',
    'Malds Maker',
  ],
  authors: [{ name: SITE_NAME, url: getSiteUrl() }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: 'business',
  alternates: { canonical: './' },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: SITE_NAME,
    url: '/',
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
  },
  formatDetection: { telephone: false, email: false, address: false },
  verification: { google: process.env.GOOGLE_SITE_VERIFICATION || undefined },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-light-32x32.png', sizes: '32x32', type: 'image/png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', sizes: '32x32', type: 'image/png', media: '(prefers-color-scheme: dark)' },
    ],
    apple: '/apple-icon.png',
  },
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
