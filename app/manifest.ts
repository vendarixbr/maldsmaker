import type { MetadataRoute } from 'next'
import { SITE_NAME } from '@/lib/site'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — Produção Audiovisual`,
    short_name: SITE_NAME,
    description: 'Produção audiovisual, fotografia profissional e Nauta Estúdio em Sorocaba, SP.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0A0A0A',
    theme_color: '#0A0A0A',
    lang: 'pt-BR',
    icons: [
      { src: '/icon-dark-32x32.png', sizes: '32x32', type: 'image/png' },
      { src: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  }
}
