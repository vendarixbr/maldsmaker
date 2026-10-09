import { Plus } from 'lucide-react'
import type { HomeContent } from '@/lib/data'

/** Perguntas frequentes com <details> nativo: acessível, sem JavaScript e com o texto no HTML. */
export function Faq({ content }: { content: HomeContent['faq'] }) {
  const items = content.items.filter(i => i.question.trim() && i.answer.trim())
  if (!items.length) return null

  return (
    <section id="faq" className="section-spacing" style={{ background: '#0A0A0A' }}>
      <div className="site-container grid grid-cols-1 lg:grid-cols-[34%_1fr] gap-10 lg:gap-20">
        <div>
          <p className="font-mono-mm text-[11px] tracking-[0.14em] mb-4" style={{ color: '#C9A84C' }}>{content.eyebrow}</p>
          <h2 className="font-display uppercase" style={{ fontSize: 'clamp(34px, 5vw, 56px)', color: '#F5F5F0', letterSpacing: '0.02em', lineHeight: 1.02 }}>
            {content.heading}
          </h2>
        </div>

        <div style={{ borderTop: '1px solid rgba(245,245,240,0.1)' }}>
          {items.map(item => (
            <details key={item.question} className="group" style={{ borderBottom: '1px solid rgba(245,245,240,0.1)' }}>
              <summary className="flex items-center justify-between gap-6 py-6 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                <h3 className="font-display text-lg sm:text-xl group-open:text-[#E5C158] transition-colors" style={{ color: '#F5F5F0', fontWeight: 600 }}>
                  {item.question}
                </h3>
                <Plus size={20} className="shrink-0 transition-transform duration-200 group-open:rotate-45" style={{ color: '#C9A84C' }} aria-hidden="true" />
              </summary>
              <p className="font-body pb-6 pr-10" style={{ color: '#A8A89A', fontSize: '16px', fontWeight: 300, lineHeight: 1.8 }}>{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
