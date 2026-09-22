import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft, ArrowRight, Play } from 'lucide-react'
import { SiteImage } from '@/components/site/SiteImage'
import { Footer } from '@/components/site/Footer'
import { CustomCursor } from '@/components/site/CustomCursor'
import { getPublicPortfolio, getPublicPortfolioItem } from '@/lib/admin-db'
import { getFallbackSrc } from '@/lib/site-images'
import { getSiteUrl, SITE_NAME } from '@/lib/site'
import { parseVideoUrl } from '@/lib/video'

export const dynamic = 'force-dynamic'

type PageProps = { params: Promise<{ slug: string }> }

function coverUrl(imageUrl: string | undefined, imageKey: string): string {
  if (imageUrl) return imageUrl
  const fallback = getFallbackSrc(imageKey) ?? ''
  if (/^https?:\/\//.test(fallback)) return fallback
  return `${getSiteUrl()}${fallback.startsWith('/') ? fallback : `/${fallback}`}`
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const site = getSiteUrl()
  const item = await getPublicPortfolioItem(slug)
  if (!item) return { title: `Trabalho não encontrado — ${SITE_NAME}` }

  const slugPath = item.slug || item.id
  const title = `${item.title} — ${SITE_NAME}`
  const description =
    item.description?.trim() ||
    `${item.title} · ${item.category} · Produção audiovisual Malds Maker em Sorocaba, SP.`
  const url = `${site}/portfolio/${slugPath}`
  const image = coverUrl(item.imageUrl, item.imageKey)

  return {
    title,
    description,
    keywords: [item.title, item.category, 'portfólio', 'produção audiovisual', 'Sorocaba', 'Malds Maker'],
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      siteName: SITE_NAME,
      title,
      description,
      images: [{ url: image, alt: item.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  }
}

export default async function PortfolioItemPage({ params }: PageProps) {
  const { slug } = await params
  const item = await getPublicPortfolioItem(slug)
  if (!item) notFound()
  // URL antiga por id continua funcionando, mas redireciona para o slug canônico
  if (item.slug && item.slug !== slug) redirect(`/portfolio/${item.slug}`)

  const site = getSiteUrl()
  const all = await getPublicPortfolio()
  const related = all.filter(i => i.id !== item.id && i.category === item.category).slice(0, 3)
  const fallbackRelated = related.length
    ? related
    : all.filter(i => i.id !== item.id).slice(0, 3)
  const gallery = item.images ?? []
  const canonical = `${site}/portfolio/${item.slug}`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VisualArtwork',
    name: item.title,
    description: item.description || `${item.title} · ${item.category}`,
    url: canonical,
    image: coverUrl(item.imageUrl, item.imageKey),
    genre: item.category,
    creator: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: site,
    },
  }

  return (
    <>
      <div id="mm-grain" aria-hidden="true" />
      <CustomCursor />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main style={{ background: '#0A0A0A' }}>
        {/* Topbar */}
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
                href="/#portfolio"
                className="font-mono-mm text-[11px] tracking-[0.15em] uppercase transition-colors hover:text-[#C9A84C]"
                style={{ color: '#A8A89A' }}
              >
                ← Todos os trabalhos
              </Link>
            </div>
          </div>
        </header>

        {/* Hero / capa */}
        <div className="site-container pt-10 lg:pt-14">
          <div
            className="relative overflow-hidden"
            style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '2px', background: '#1a1a1a' }}
          >
            <div className="relative w-full" style={{ aspectRatio: '16/8' }}>
              {item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.imageUrl} alt={item.title} className="absolute inset-0 h-full w-full object-cover" />
              ) : (
                <SiteImage
                  imageKey={item.imageKey}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="100vw"
                  priority
                />
              )}
              <div
                className="absolute inset-x-0 bottom-0 p-5 sm:p-8 pt-20"
                style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)' }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="font-mono-mm text-[10px] tracking-[0.12em] px-2 py-0.5"
                    style={{ background: 'rgba(10,10,10,0.7)', border: '1px solid rgba(201,168,76,0.4)', color: '#C9A84C' }}
                  >
                    {item.category}
                  </span>
                  {item.isVideo && (
                    <span
                      className="font-mono-mm text-[10px] tracking-[0.12em] px-2 py-0.5 font-bold flex items-center gap-1"
                      style={{ background: '#C9A84C', color: '#0A0A0A' }}
                    >
                      <Play size={10} fill="currentColor" /> VÍDEO
                    </span>
                  )}
                </div>
                <h1 className="font-display uppercase" style={{ fontSize: 'clamp(34px, 5vw, 60px)', color: '#F5F5F0', letterSpacing: '0.02em', lineHeight: 1 }}>
                  {item.title}
                </h1>
              </div>
            </div>
          </div>

          {/* Detalhes */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 py-10 lg:py-14">
            <div>
              {/* Player de Vídeo Embutido (se houver videoUrl) */}
              {item.isVideo && item.videoUrl && (() => {
                const parsed = parseVideoUrl(item.videoUrl)
                return (
                  <div className="mb-10">
                    <p className="font-mono-mm text-[11px] tracking-[0.14em] mb-4 text-[#C9A84C] flex items-center gap-2">
                      <Play size={12} fill="currentColor" /> REPRODUÇÃO DO VÍDEO
                    </p>
                    <div className="relative w-full overflow-hidden rounded-xl bg-black border border-[rgba(201,168,76,0.3)] shadow-2xl" style={{ aspectRatio: '16/9' }}>
                      {parsed.embedUrl ? (
                        <iframe
                          src={parsed.embedUrl}
                          title={item.title}
                          className="absolute inset-0 w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : parsed.directUrl ? (
                        <video src={parsed.directUrl} controls className="absolute inset-0 w-full h-full object-contain" />
                      ) : null}
                    </div>
                  </div>
                )
              })()}

              <p className="font-mono-mm text-[11px] tracking-[0.14em] mb-4" style={{ color: '#C9A84C' }}>
                SOBRE O TRABALHO
              </p>
              {item.description ? (
                <p className="font-body text-base sm:text-lg whitespace-pre-wrap" style={{ color: '#D6D6CC', lineHeight: 1.8 }}>
                  {item.description}
                </p>
              ) : (
                <p className="font-body text-base" style={{ color: '#5A5A52', lineHeight: 1.8 }}>
                  Produção original Malds Maker — direção, captação e finalização pela nossa equipe.
                </p>
              )}

              {/* Galeria */}
              {gallery.length > 0 && (
                <div className="mt-12">
                  <p className="font-mono-mm text-[11px] tracking-[0.14em] mb-6" style={{ color: '#C9A84C' }}>
                    GALERIA & STILLS ({gallery.length})
                  </p>
                  <div className="columns-1 sm:columns-2 gap-3">
                    {gallery.map(img => (
                      <div
                        key={img.id}
                        className="relative break-inside-avoid mb-3 overflow-hidden rounded-xl"
                        style={{ aspectRatio: '4/3', background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.06)' }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.url} alt={item.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Ficha + CTA */}
            <aside className="flex flex-col gap-6 lg:sticky lg:top-28 h-fit">
              <div
                className="p-6 rounded-xl"
                style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <p className="font-mono-mm text-[11px] tracking-[0.14em] mb-5" style={{ color: '#C9A84C' }}>
                  FICHA TÉCNICA
                </p>
                <div className="flex flex-col gap-4">
                  {[
                    ['Projeto', item.title],
                    item.client ? ['Cliente', item.client] : null,
                    item.year ? ['Ano', item.year] : null,
                    ['Categoria', item.category],
                    ['Formato', item.isVideo ? 'Vídeo / Cinema 4K' : 'Fotografia / Stills'],
                    ['Produção', 'Malds Maker Studio'],
                  ]
                    .filter(Boolean)
                    .map((entry) => {
                      const [label, value] = entry as [string, string]
                      return (
                        <div key={label} className="flex flex-col gap-1 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                          <span className="font-mono-mm text-[10px] tracking-[0.12em] uppercase text-[#64748B]">
                            {label}
                          </span>
                          <span className="font-display text-sm sm:text-base text-[#F5F5F0]">
                            {value}
                          </span>
                        </div>
                      )
                    })}
                </div>
                <Link
                  href="/#contato"
                  className="mt-6 flex items-center justify-center gap-2 h-12 font-mono-mm text-[11px] tracking-[0.14em] font-semibold transition-all rounded-lg"
                  style={{ background: '#C9A84C', color: '#0A0A0A' }}
                >
                  QUERO UM PROJETO ASSIM
                  <ArrowRight size={14} />
                </Link>
              </div>
              <Link
                href="/#portfolio"
                className="flex items-center justify-center gap-2 h-11 font-mono-mm text-[11px] tracking-[0.14em] transition-all rounded-lg"
                style={{ border: '1px solid rgba(245,245,240,0.15)', color: '#A8A89A' }}
              >
                <ArrowLeft size={14} />
                VOLTAR AO PORTFÓLIO
              </Link>
            </aside>
          </div>

          {/* Relacionados */}
          {fallbackRelated.length > 0 && (
            <div className="pb-16 lg:pb-20">
              <p className="font-mono-mm text-[11px] tracking-[0.14em] mb-6" style={{ color: '#C9A84C' }}>
                VEJA TAMBÉM
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {fallbackRelated.map(rel => (
                  <Link
                    key={rel.id}
                    href={`/portfolio/${rel.slug || rel.id}`}
                    className="relative group block overflow-hidden"
                    style={{ aspectRatio: '4/3', background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '2px' }}
                  >
                    {rel.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={rel.imageUrl} alt={rel.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                    ) : (
                      <SiteImage
                        imageKey={rel.imageKey}
                        alt={rel.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                        sizes="(max-width: 640px) 100vw, 33vw"
                      />
                    )}
                    <div
                      className="absolute inset-x-0 bottom-0 p-4 pt-12"
                      style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)' }}
                    >
                      <p className="font-mono-mm text-[9px] tracking-[0.12em] mb-1" style={{ color: '#C9A84C' }}>
                        {rel.category}
                      </p>
                      <p className="font-display uppercase text-sm" style={{ color: '#F5F5F0', lineHeight: 1.2 }}>
                        {rel.title}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <Footer />
      </main>
    </>
  )
}
