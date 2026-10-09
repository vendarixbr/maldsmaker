import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Play } from 'lucide-react'
import { SiteImage } from '@/components/site/SiteImage'
import { Footer } from '@/components/site/Footer'
import { WhatsAppFloat } from '@/components/site/WhatsAppFloat'
import { CustomCursor } from '@/components/site/CustomCursor'
import { JsonLd } from '@/components/seo/JsonLd'
import { breadcrumbJsonLd } from '@/lib/seo'
import { getPublicPortfolio } from '@/lib/admin-db'
import { getSiteUrl, SITE_NAME } from '@/lib/site'

export const dynamic = 'force-dynamic'

type PageProps = { searchParams: Promise<{ cat?: string }> }

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Portfólio'
  const description = 'Videoclipes, ensaios, eventos e campanhas produzidos pela Malds Maker em Sorocaba, SP.'
  const url = `${getSiteUrl()}/portfolio`
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: 'website', url, siteName: SITE_NAME, title, description },
  }
}

export default async function PortfolioPage({ searchParams }: PageProps) {
  const { cat } = await searchParams
  const all = await getPublicPortfolio().catch(() => [])

  const counts = new Map<string, number>()
  for (const item of all) counts.set(item.category, (counts.get(item.category) ?? 0) + 1)
  const categories = Array.from(counts.keys())

  const active = cat && counts.has(cat) ? cat : ''
  const items = active ? all.filter(i => i.category === active) : all

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([{ name: 'Início', path: '/' }, { name: 'Portfólio', path: '/portfolio' }]),
          {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: `Portfólio — ${SITE_NAME}`,
            url: `${getSiteUrl()}/portfolio`,
            inLanguage: 'pt-BR',
            mainEntity: {
              '@type': 'ItemList',
              itemListElement: all.map((item, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                url: `${getSiteUrl()}/portfolio/${item.slug || item.id}`,
                name: item.title,
              })),
            },
          },
        ]}
      />
      <div id="mm-grain" aria-hidden="true" />
      <CustomCursor />
      <WhatsAppFloat />

      <main style={{ background: '#0A0A0A', minHeight: '100vh' }}>
        <header
          className="sticky top-0 z-50"
          style={{ background: 'rgba(10,10,10,0.88)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(201,168,76,0.12)' }}
        >
          <div className="site-container">
            <div className="flex items-center justify-between h-16 lg:h-20">
              <Link href="/" aria-label="Voltar para a página inicial" style={{ lineHeight: 0 }}>
                <SiteImage
                  imageKey="logo"
                  alt="Malds Maker"
                  width={200}
                  height={64}
                  className="w-auto"
                  style={{ height: 'clamp(48px, 5.5vw, 64px)', mixBlendMode: 'screen', objectFit: 'contain' }}
                />
              </Link>
              <Link
                href="/#contato"
                className="font-mono-mm text-[11px] tracking-[0.15em] uppercase px-4 h-10 flex items-center"
                style={{ background: '#C9A84C', color: '#0A0A0A' }}
              >
                Falar com a gente
              </Link>
            </div>
          </div>
        </header>

        <div className="site-container pt-12 lg:pt-16 pb-20">
          <p className="font-mono-mm text-[11px] tracking-[0.2em] mb-4" style={{ color: '#C9A84C' }}>PORTFÓLIO</p>
          <h1 className="font-display uppercase" style={{ fontSize: 'clamp(38px, 6vw, 72px)', color: '#F5F5F0', lineHeight: 1.02, letterSpacing: '0.01em' }}>
            Trabalhos que <span style={{ color: '#C9A84C' }}>falam por nós.</span>
          </h1>
          <p className="font-body mt-5 max-w-xl" style={{ color: '#A8A89A', fontSize: '17px', fontWeight: 300, lineHeight: 1.7 }}>
            Videoclipes, ensaios, eventos e campanhas. Escolha uma categoria ou abra um projeto para ver os detalhes.
          </p>

          {categories.length > 1 && (
            <nav aria-label="Categorias" className="flex gap-2 overflow-x-auto scrollbar-hide mt-10 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              {[{ value: '', label: 'TODOS', n: all.length }, ...categories.map(c => ({ value: c, label: c, n: counts.get(c) ?? 0 }))].map(({ value, label, n }) => {
                const isActive = active === value
                return (
                  <Link
                    key={label}
                    href={value ? `/portfolio?cat=${encodeURIComponent(value)}` : '/portfolio'}
                    scroll={false}
                    aria-current={isActive ? 'page' : undefined}
                    className="shrink-0 font-mono-mm text-[11px] tracking-[0.1em] px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    style={{
                      background: isActive ? '#C9A84C' : 'rgba(255,255,255,0.03)',
                      color: isActive ? '#0A0A0A' : '#8E8E84',
                      border: `1px solid ${isActive ? '#C9A84C' : 'rgba(255,255,255,0.07)'}`,
                      fontWeight: isActive ? 600 : 400,
                    }}
                  >
                    {label}
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: isActive ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.08)' }}>{n}</span>
                  </Link>
                )
              })}
            </nav>
          )}

          {items.length === 0 ? (
            <p className="font-body py-24 text-center" style={{ color: '#5A5A52' }}>Nenhum trabalho publicado ainda.</p>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-10 list-none p-0">
              {items.map(item => (
                <li key={item.id}>
                  <Link
                    href={`/portfolio/${item.slug || item.id}`}
                    className="group relative block overflow-hidden"
                    style={{ aspectRatio: '4/3', background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '2px' }}
                  >
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.imageUrl} alt={item.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                    ) : (
                      <SiteImage imageKey={item.imageKey} alt={item.title} fill className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                    )}
                    {item.isVideo && (
                      <span className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center rounded-full" style={{ background: '#C9A84C', color: '#0A0A0A' }} aria-label="Vídeo">
                        <Play size={13} fill="currentColor" />
                      </span>
                    )}
                    <div className="absolute inset-x-0 bottom-0 p-5 pt-16" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)' }}>
                      <p className="font-mono-mm text-[10px] tracking-[0.12em] mb-1.5" style={{ color: '#C9A84C' }}>
                        {[item.category, item.year].filter(Boolean).join(' · ')}
                      </p>
                      <p className="font-display uppercase text-lg flex items-center justify-between gap-2" style={{ color: '#F5F5F0', lineHeight: 1.15 }}>
                        <span className="line-clamp-2">{item.title}</span>
                        <ArrowRight size={16} className="shrink-0 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" style={{ color: '#C9A84C' }} />
                      </p>
                      {item.client && <p className="font-body text-xs mt-1" style={{ color: '#A8A89A' }}>{item.client}</p>}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-16 flex flex-col items-center gap-4 text-center py-12" style={{ border: '1px solid rgba(201,168,76,0.2)' }}>
            <p className="font-display uppercase text-2xl sm:text-3xl" style={{ color: '#F5F5F0' }}>Tem um projeto em mente?</p>
            <Link href="/#contato" className="font-mono-mm text-[11px] tracking-[0.14em] font-semibold px-8 h-12 flex items-center gap-2" style={{ background: '#C9A84C', color: '#0A0A0A' }}>
              FALAR COM A GENTE <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        <Footer />
      </main>
    </>
  )
}
