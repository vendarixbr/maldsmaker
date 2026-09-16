/** Base pública do site (sem barra no fim). Configure NEXT_PUBLIC_SITE_URL no deploy. */
export function getSiteUrl(): string {
  const fromEnv = (process.env.NEXT_PUBLIC_SITE_URL ?? '').trim().replace(/\/+$/, '')
  if (fromEnv) return fromEnv
  return 'https://maldsmaker.com.br'
}

export const SITE_NAME = 'Malds Maker'
export const SITE_TAGLINE = 'Produção Audiovisual em Sorocaba, SP'
