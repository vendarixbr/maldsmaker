import { Nav } from '@/components/site/Nav'
import { Hero } from '@/components/site/Hero'
import { Manifesto } from '@/components/site/Manifesto'
import { Servicos } from '@/components/site/Servicos'
import { Nauta } from '@/components/site/Nauta'
import { Portfolio } from '@/components/site/Portfolio'
import { NichosBanner } from '@/components/site/NichosBanner'
import { DaRuaPraRua } from '@/components/site/DaRuaPraRua'
import { Depoimentos } from '@/components/site/Depoimentos'
import { Contato } from '@/components/site/Contato'
import { Footer } from '@/components/site/Footer'
import { CustomCursor } from '@/components/site/CustomCursor'

export default function Home() {
  return (
    <>
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
        <DaRuaPraRua />
        <Depoimentos />
        <Contato />
        <Footer />
      </main>
    </>
  )
}
