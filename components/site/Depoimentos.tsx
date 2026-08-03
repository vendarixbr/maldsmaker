'use client'

import { useRef, useCallback, useEffect, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import useEmblaCarousel from 'embla-carousel-react'
import { SiteImage } from '@/components/site/SiteImage'

const testimonials = [
  {
    quote: 'O lançamento do empreendimento foi um sucesso enorme. O vídeo produzido pela Malds Maker foi decisivo para as vendas. Parceiros de altíssimo nível.',
    name: 'Construtora Horizonte',
    niche: 'EMPRESA',
    imageKey: 'avatar-construtora',
  },
  {
    quote: 'A Malds Maker entregou um clipe que superou tudo que eu imaginava. Leonardo entende a alma do artista e coloca isso na câmera com perfeição.',
    name: 'Rafael Moreno',
    niche: 'ARTISTA MUSICAL',
    imageKey: 'avatar-rafael',
  },
  {
    quote: 'Contratamos para o vídeo institucional da adega e o resultado foi impactante. Profissionalismo do início ao fim, com um olhar que valoriza o produto.',
    name: 'Adega São Roque',
    niche: 'ADEGA',
    imageKey: 'avatar-adega',
  },
  {
    quote: 'Recomendo para qualquer advogado que queira construir uma imagem sólida nas redes. Sério, competente e criativo. O resultado fala por si.',
    name: 'Dr. Thiago Alves',
    niche: 'ADVOGADO',
    imageKey: 'avatar-thiago',
  },
  {
    quote: 'Meu conteúdo mudou completamente depois que comecei a trabalhar com a Malds Maker. O engajamento aumentou e minha audiência percebeu a diferença de qualidade.',
    name: 'Bianca Ferreira',
    niche: 'INFLUENCER',
    imageKey: 'avatar-bianca',
  },
]

export function Depoimentos() {
  const sectionRef = useRef(null)
  const inView = useInView(sectionRef, { once: true, margin: '0px 0px -80px 0px' })

  const [selectedIndex, setSelectedIndex] = useState(0)

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' })

  const prev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const next = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap())
    emblaApi.on('select', onSelect)
    onSelect()
    return () => { emblaApi.off('select', onSelect) }
  }, [emblaApi])

  return (
    <section
      id="depoimentos"
      ref={sectionRef}
      className="section-spacing overflow-hidden"
      style={{ background: '#0A0A0A' }}
    >
      <div className="site-container">

        {/* Header row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-6"
        >
          <div>
            <p className="overline mb-4">Clientes</p>
            <h2
              className="font-display uppercase"
              style={{ fontSize: 'clamp(36px, 5.5vw, 64px)', color: '#F5F5F0', letterSpacing: '0.02em', lineHeight: 1 }}
            >
              Quem fez, aprovou.
            </h2>
          </div>

          {/* Arrow navigation */}
          <div className="flex items-center gap-3">
            <button
              onClick={prev}
              className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200"
              style={{ border: '1px solid rgba(201,168,76,0.4)', color: '#C9A84C' }}
              aria-label="Anterior"
              onMouseEnter={e => { const el = e.currentTarget; el.style.background = '#C9A84C'; el.style.color = '#0A0A0A' }}
              onMouseLeave={e => { const el = e.currentTarget; el.style.background = 'transparent'; el.style.color = '#C9A84C' }}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={next}
              className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200"
              style={{ border: '1px solid rgba(201,168,76,0.4)', color: '#C9A84C' }}
              aria-label="Próximo"
              onMouseEnter={e => { const el = e.currentTarget; el.style.background = '#C9A84C'; el.style.color = '#0A0A0A' }}
              onMouseLeave={e => { const el = e.currentTarget; el.style.background = 'transparent'; el.style.color = '#C9A84C' }}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </motion.div>

        {/* Embla carousel — each slide is 100% width */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.15 }}
          ref={emblaRef}
          className="overflow-hidden"
        >
          <div className="flex">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-full"
              >
                <div
                  className="flex flex-col gap-8 p-8 lg:p-10"
                  style={{
                    background: '#111111',
                    border: '1px solid rgba(245,245,240,0.07)',
                  }}
                >
                  {/* Gold opening quote */}
                  <span
                    className="font-display leading-none select-none block"
                    style={{ fontSize: '56px', color: '#C9A84C', opacity: 0.3, lineHeight: 0.8 }}
                  >
                    &ldquo;
                  </span>

                  <p
                    className="font-body italic"
                    style={{
                      color: '#C8C8C0',
                      fontSize: 'clamp(16px, 1.4vw, 20px)',
                      fontWeight: 300,
                      lineHeight: 1.8,
                    }}
                  >
                    {t.quote}
                  </p>

                  {/* Avatar + name */}
                  <div className="flex items-center gap-4">
                    <div
                      className="relative w-11 h-11 rounded-full overflow-hidden shrink-0"
                      style={{ border: '1px solid rgba(201,168,76,0.4)' }}
                    >
                      <SiteImage
                        imageKey={t.imageKey}
                        alt={t.name}
                        fill
                        className="object-cover"
                        sizes="44px"
                      />
                    </div>
                    <div>
                      <p
                        className="font-display uppercase"
                        style={{ fontSize: '14px', color: '#F5F5F0', letterSpacing: '0.06em' }}
                      >
                        {t.name}
                      </p>
                      <p
                        className="font-mono-mm text-[10px] tracking-[0.14em] mt-0.5"
                        style={{ color: '#C9A84C' }}
                      >
                        {t.niche}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => emblaApi?.scrollTo(i)}
              className="transition-all duration-300"
              style={{
                width: selectedIndex === i ? '24px' : '6px',
                height: '6px',
                borderRadius: '3px',
                background: selectedIndex === i ? '#C9A84C' : 'rgba(255,255,255,0.18)',
              }}
              aria-label={`Depoimento ${i + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  )
}
