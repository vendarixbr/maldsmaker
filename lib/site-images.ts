export interface SiteImageSlot {
  key: string
  label: string
  fallbackSrc: string
}

export const SITE_IMAGE_SLOTS: SiteImageSlot[] = [
  { key: 'logo', label: 'Logotipo', fallbackSrc: '/images/logo.png' },
  { key: 'nauta-studio', label: 'Nauta Estúdio — Foto Principal', fallbackSrc: '/images/nauta-studio.png' },
  { key: 'leonardo-claquete', label: 'Foto do Diretor Criativo', fallbackSrc: '/images/leonardo-claquete.png' },
  { key: 'avatar-rafael', label: 'Depoimento — Rafael Moreno', fallbackSrc: '/images/avatar-rafael.png' },
  { key: 'avatar-adega', label: 'Depoimento — Adega São Roque', fallbackSrc: '/images/avatar-adega.png' },
  { key: 'avatar-construtora', label: 'Depoimento — Construtora Horizonte', fallbackSrc: '/images/avatar-construtora.png' },
  { key: 'avatar-thiago', label: 'Depoimento — Dr. Thiago Alves', fallbackSrc: '/images/avatar-thiago.png' },
  { key: 'avatar-bianca', label: 'Depoimento — Bianca Ferreira', fallbackSrc: '/images/avatar-bianca.png' },
  { key: 'portfolio-territorio-mc-vitao', label: 'Portfólio — Território (MC Vitão)', fallbackSrc: '/images/portfolio/territorio-mc-vitao.png' },
  { key: 'portfolio-adega-sao-roque', label: 'Portfólio — Adega São Roque', fallbackSrc: '/images/portfolio/adega-sao-roque.png' },
  { key: 'portfolio-ensaio-rafael', label: 'Portfólio — Ensaio Rafael Moreno', fallbackSrc: '/images/portfolio/ensaio-rafael.png' },
  { key: 'portfolio-show-kaizen', label: 'Portfólio — Show Kaizen Music Festival', fallbackSrc: '/images/portfolio/show-kaizen.png' },
  { key: 'portfolio-campanha-kaizen', label: 'Portfólio — Campanha Verão Kaizen', fallbackSrc: '/images/portfolio/campanha-kaizen.png' },
  { key: 'portfolio-ep-ana-beatriz', label: 'Portfólio — EP Ana Beatriz Lima', fallbackSrc: '/images/portfolio/ep-ana-beatriz.png' },
  { key: 'portfolio-lancamento-horizonte', label: 'Portfólio — Lançamento Horizonte', fallbackSrc: '/images/portfolio/lancamento-horizonte.png' },
  { key: 'portfolio-madrugada-rafael', label: 'Portfólio — Madrugada (Rafael Moreno)', fallbackSrc: '/images/portfolio-8.png' },
]

const SLOT_BY_KEY = new Map(SITE_IMAGE_SLOTS.map(slot => [slot.key, slot]))

export const SITE_IMAGE_KEYS = new Set(SITE_IMAGE_SLOTS.map(slot => slot.key))

export function isSiteImageKey(key: string): boolean {
  return SITE_IMAGE_KEYS.has(key)
}

export function getFallbackSrc(key: string): string | undefined {
  return SLOT_BY_KEY.get(key)?.fallbackSrc
}

export const MAX_SITE_IMAGE_BYTES = 5 * 1024 * 1024
