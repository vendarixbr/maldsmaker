import { Check } from 'lucide-react'
import type { HomeContent, SiteSettings } from '@/lib/data'
import { resolvePlanPrice } from '@/lib/seo'

function waHref(whatsapp: string, message: string) {
  const digits = whatsapp.replace(/\D/g, '')
  return `https://wa.me/${digits.startsWith('55') ? digits : `55${digits}`}?text=${encodeURIComponent(message)}`
}

/** Seção de valores. Server component: o conteúdo já vai no HTML para o Google. */
export function Precos({ content, settings }: { content: HomeContent['precos']; settings: SiteSettings }) {
  if (!content.plans.length) return null

  return (
    <section id="valores" className="section-spacing" style={{ background: '#0D0D0D' }}>
      <div className="site-container">
        <div className="mb-14 max-w-2xl">
          <p className="font-mono-mm text-[11px] tracking-[0.14em] mb-4" style={{ color: '#C9A84C' }}>{content.eyebrow}</p>
          <h2 className="font-display uppercase" style={{ fontSize: 'clamp(34px, 5.2vw, 60px)', color: '#F5F5F0', letterSpacing: '0.02em', lineHeight: 1.02 }}>
            {content.heading}
          </h2>
          {content.intro && (
            <p className="font-body mt-5" style={{ color: '#A8A89A', fontSize: '17px', fontWeight: 300, lineHeight: 1.7 }}>{content.intro}</p>
          )}
        </div>

        <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 list-none p-0 m-0">
          {content.plans.map(plan => {
            const price = resolvePlanPrice(plan, settings)
            return (
              <li
                key={plan.name}
                className="relative flex flex-col gap-5 p-7"
                style={{
                  background: plan.highlight ? '#15130C' : '#111111',
                  border: `1px solid ${plan.highlight ? 'rgba(201,168,76,0.6)' : 'rgba(245,245,240,0.08)'}`,
                }}
              >
                {plan.highlight && (
                  <span className="absolute -top-3 left-7 font-mono-mm text-[10px] tracking-[0.14em] font-semibold px-3 h-6 flex items-center" style={{ background: '#C9A84C', color: '#0A0A0A' }}>
                    MAIS PROCURADO
                  </span>
                )}
                <div>
                  <h3 className="font-display uppercase text-xl" style={{ color: '#F5F5F0', letterSpacing: '0.04em' }}>{plan.name}</h3>
                  <p className="font-body text-sm mt-2" style={{ color: '#A8A89A', lineHeight: 1.6 }}>{plan.description}</p>
                </div>

                <div>
                  <p className="font-display" style={{ fontSize: price.length > 12 ? '26px' : '38px', color: '#E5C158', lineHeight: 1 }}>{price}</p>
                  {plan.priceNote && <p className="font-mono-mm text-[10px] tracking-[0.12em] mt-2 uppercase" style={{ color: '#5A5A52' }}>{plan.priceNote}</p>}
                </div>

                <ul className="flex flex-col gap-2.5 list-none p-0 m-0 flex-1">
                  {plan.features.map(feature => (
                    <li key={feature} className="flex items-start gap-2.5 font-body text-sm" style={{ color: '#D6D6CC' }}>
                      <Check size={15} className="mt-0.5 shrink-0" style={{ color: '#C9A84C' }} aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <a
                  href={waHref(settings.whatsapp, plan.ctaWhatsappMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-12 flex items-center justify-center font-mono-mm text-[11px] tracking-[0.14em] font-semibold"
                  style={
                    plan.highlight
                      ? { background: '#C9A84C', color: '#0A0A0A' }
                      : { border: '1px solid rgba(201,168,76,0.5)', color: '#E5C158' }
                  }
                >
                  {plan.ctaLabel}
                </a>
              </li>
            )
          })}
        </ul>

        {content.note && <p className="font-mono-mm text-[11px] mt-8" style={{ color: '#5A5A52' }}>{content.note}</p>}
      </div>
    </section>
  )
}
