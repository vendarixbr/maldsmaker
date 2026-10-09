import type { HomeContent, PricingPlan, SiteSettings } from './data'
import { getSiteUrl, SITE_NAME } from './site'

export const SITE_DESCRIPTION =
  'Produção audiovisual, fotografia profissional e locação do Nauta Estúdio (480 m²) em Sorocaba, SP. Do clipe ao institucional, do ensaio ao evento.'

/** Normaliza o telefone salvo nas configurações para o formato E.164 (+5515...). */
export function toE164(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  return `+${digits.startsWith('55') ? digits : `55${digits}`}`
}

/** "R$ 2.800" -> "2800" (para o campo price do schema.org). */
export function priceToNumber(value: string): string | null {
  const cleaned = value.replace(/[^\d,]/g, '').replace(',', '.')
  return cleaned && !Number.isNaN(Number(cleaned)) ? cleaned : null
}

export function resolvePlanPrice(plan: PricingPlan, settings: SiteSettings): string {
  if (plan.priceSource === 'nauta-diaria') return settings.nautaValorDiaria
  if (plan.priceSource === 'nauta-meio') return settings.nautaValorMeio
  return plan.price
}

export function ogImageUrl(): string {
  return `${getSiteUrl()}/opengraph-image`
}

export function localBusinessJsonLd(settings: SiteSettings, home: HomeContent) {
  const site = getSiteUrl()
  const [city, region] = settings.cidade.split(',').map(s => s.trim())
  const sameAs = [
    settings.instagram ? `https://www.instagram.com/${settings.instagram.replace('@', '')}` : null,
    settings.youtube || null,
  ].filter(Boolean)

  const nautaOffers = home.precos.plans
    .filter(plan => plan.priceSource !== 'custom')
    .map(plan => {
      const price = priceToNumber(resolvePlanPrice(plan, settings))
      return price
        ? {
            '@type': 'Offer',
            name: plan.name,
            description: plan.description,
            price,
            priceCurrency: 'BRL',
            url: `${site}/#valores`,
          }
        : null
    })
    .filter(Boolean)

  return {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'ProfessionalService'],
    '@id': `${site}/#organization`,
    name: settings.empresa || SITE_NAME,
    alternateName: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: site,
    logo: `${site}/images/logo.png`,
    image: [ogImageUrl(), `${site}/images/nauta-studio.png`],
    telephone: toE164(settings.whatsapp),
    email: settings.email,
    founder: { '@type': 'Person', name: settings.nome },
    address: {
      '@type': 'PostalAddress',
      addressLocality: city || 'Sorocaba',
      addressRegion: region || 'SP',
      addressCountry: 'BR',
    },
    areaServed: [{ '@type': 'City', name: city || 'Sorocaba' }, { '@type': 'Country', name: 'Brasil' }],
    sameAs,
    knowsAbout: ['Produção audiovisual', 'Fotografia profissional', 'Videoclipes', 'Locação de estúdio', 'Conteúdo para redes sociais'],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Serviços',
      itemListElement: [
        ...home.servicos.items.map(item => ({
          '@type': 'Offer',
          itemOffered: { '@type': 'Service', name: item.name, description: item.description, provider: { '@id': `${site}/#organization` } },
        })),
        ...nautaOffers,
      ],
    },
  }
}

export function websiteJsonLd() {
  const site = getSiteUrl()
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${site}/#website`,
    url: site,
    name: SITE_NAME,
    inLanguage: 'pt-BR',
    publisher: { '@id': `${site}/#organization` },
  }
}

export function faqJsonLd(items: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items
      .filter(i => i.question.trim() && i.answer.trim())
      .map(i => ({
        '@type': 'Question',
        name: i.question,
        acceptedAnswer: { '@type': 'Answer', text: i.answer },
      })),
  }
}

export function breadcrumbJsonLd(trail: { name: string; path: string }[]) {
  const site = getSiteUrl()
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t.name, item: `${site}${t.path}` })),
  }
}
