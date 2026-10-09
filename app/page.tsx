import { Nav } from '@/components/site/Nav'
import { Hero } from '@/components/site/Hero'
import { Manifesto } from '@/components/site/Manifesto'
import { Servicos } from '@/components/site/Servicos'
import { Nauta } from '@/components/site/Nauta'
import { Portfolio } from '@/components/site/Portfolio'
import { NichosBanner } from '@/components/site/NichosBanner'
import { Precos } from '@/components/site/Precos'
import { Depoimentos } from '@/components/site/Depoimentos'
import { Faq } from '@/components/site/Faq'
import { Contato } from '@/components/site/Contato'
import { Footer } from '@/components/site/Footer'
import { CustomCursor } from '@/components/site/CustomCursor'
import { WhatsAppFloat } from '@/components/site/WhatsAppFloat'
import { JsonLd } from '@/components/seo/JsonLd'
import { getPublicHomeContent, getPublicSettings } from '@/lib/admin-db'
import { faqJsonLd, localBusinessJsonLd, websiteJsonLd } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const [home, settings] = await Promise.all([getPublicHomeContent(), getPublicSettings()])

  return (
    <>
      <JsonLd data={[localBusinessJsonLd(settings, home), websiteJsonLd(), faqJsonLd(home.faq.items)]} />

      {/* Fixed global overlays */}
      <div id="mm-grain" aria-hidden="true" />
      <CustomCursor />

      <main style={{ background: '#0A0A0A' }}>
        <Nav />
        <Hero />
        <Manifesto />
        <Servicos />
        <NichosBanner />
        <Nauta />
        <Portfolio />
        <Precos content={home.precos} settings={settings} />
        <Depoimentos />
        <Faq content={home.faq} />
        <Contato />
        <Footer />
      </main>

      <WhatsAppFloat />
    </>
  )
}
