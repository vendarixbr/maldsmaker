'use client'

import { useRef, useCallback, useEffect, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'
import useEmblaCarousel from 'embla-carousel-react'
import { SiteImage } from '@/components/site/SiteImage'
import { TESTIMONIALS, type Testimonial } from '@/lib/data'

export function Depoimentos() {
  const sectionRef = useRef(null)
  const inView = useInView(sectionRef, { once: true, margin: '0px 0px -80px 0px' })

  const [selectedIndex, setSelectedIndex] = useState(0)
  const [testimonials, setTestimonials] = useState<Testimonial[]>(TESTIMONIALS)

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' })

  const prev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const next = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  useEffect(() => {
    let cancelled = false
    fetch('/api/testimonials', { cache: 'no-store' })
      .then(res => (res.ok ? res.json() : null))
      .then((data: Testimonial[] | null) => {
        if (!cancelled && Array.isArray(data) && data.length) setTestimonials(data)
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

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
            {testimonials.map((t) => (
              <div
                key={t.id}
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
                        imageKey={t.imageKey || 'avatar-bianca'}
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
                      {t.instagram && (
                        <a
                          href={t.instagram}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 mt-2 h-10 px-5 font-mono-mm text-[10px] tracking-[0.14em] font-semibold transition-all duration-200 self-start"
                          style={{ border: '1px solid rgba(201,168,76,0.5)', color: '#E5C158', borderRadius: '999px' }}
                          onMouseEnter={e => { const el = e.currentTarget; el.style.background = '#C9A84C'; el.style.color = '#0A0A0A' }}
                          onMouseLeave={e => { const el = e.currentTarget; el.style.background = 'transparent'; el.style.color = '#E5C158' }}
                        >
                          <ExternalLink size={14} />
                          VER PERFIL NO INSTAGRAM
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((t) => (
            <button
              key={t.id}
              onClick={() => emblaApi?.scrollTo(testimonials.findIndex(x => x.id === t.id))}
              className="transition-all duration-300"
              style={{
                width: selectedIndex === testimonials.findIndex(x => x.id === t.id) ? '24px' : '6px',
                height: '6px',
                borderRadius: '3px',
                background: selectedIndex === testimonials.findIndex(x => x.id === t.id) ? '#C9A84C' : 'rgba(255,255,255,0.18)',
              }}
              aria-label={`Depoimento ${t.name}`}
            />
          ))}
        </div>

      </div>
    </section>
  )
}
