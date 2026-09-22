'use client'

import { useEffect, useRef, useState } from 'react'
import { Save, Check, Plus, Trash2, ChevronUp, ChevronDown, ExternalLink } from 'lucide-react'
import { useAdmin } from '@/lib/admin-context'
import type { HomeContent } from '@/lib/data'

const inputStyle = {
  background: '#161616',
  border: '1px solid rgba(255,255,255,0.16)',
  borderRadius: '6px',
  color: '#F9FAFB',
} as const

const TABS = [
  { id: 'hero', label: 'HERO' },
  { id: 'sobre', label: 'SOBRE' },
  { id: 'servicos', label: 'SERVIÇOS' },
  { id: 'nichos', label: 'NICHOS' },
  { id: 'nauta', label: 'NAUTA' },
  { id: 'contato', label: 'CONTATO' },
  { id: 'footer', label: 'RODAPÉ' },
] as const

type TabId = (typeof TABS)[number]['id']

/* ------------------------------------------------------------------ */
/*  Campos genéricos                                                    */
/* ------------------------------------------------------------------ */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-mono-mm text-[10px] font-semibold tracking-wider text-[#CBD5E1]">{label}</label>
      {children}
    </div>
  )
}

function TextInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-10 px-3 font-display text-sm outline-none focus:border-[#C9A84C]"
      style={inputStyle}
    />
  )
}

function TextArea({ value, onChange, rows = 3 }: { value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      rows={rows}
      className="p-3 font-display text-sm outline-none resize-y focus:border-[#C9A84C]"
      style={inputStyle}
    />
  )
}

/** Lista simples de textos (pills, bullets) — adicionar, editar, remover, reordenar. */
function StringListEditor({ items, onChange, placeholder }: { items: string[]; onChange: (items: string[]) => void; placeholder?: string }) {
  const update = (i: number, v: string) => onChange(items.map((it, idx) => (idx === i ? v : it)))
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i))
  const move = (i: number, dir: -1 | 1) => {
    const next = [...items]
    const j = i + dir
    if (j < 0 || j >= next.length) return
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }
  const add = () => onChange([...items, ''])

  return (
    <div className="flex flex-col gap-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <input
            value={item}
            onChange={e => update(i, e.target.value)}
            placeholder={placeholder}
            className="flex-1 h-9 px-3 font-display text-sm outline-none focus:border-[#C9A84C]"
            style={inputStyle}
          />
          <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="h-9 w-8 flex items-center justify-center rounded text-[#94A3B8] hover:text-[#E5C158] disabled:opacity-20" style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.14)' }}>
            <ChevronUp size={13} />
          </button>
          <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} className="h-9 w-8 flex items-center justify-center rounded text-[#94A3B8] hover:text-[#E5C158] disabled:opacity-20" style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.14)' }}>
            <ChevronDown size={13} />
          </button>
          <button type="button" onClick={() => remove(i)} className="h-9 w-9 flex items-center justify-center rounded text-[#CBD5E1] hover:text-red-400" style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.14)' }}>
            <Trash2 size={13} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="self-start flex items-center gap-1.5 h-9 px-3 font-mono-mm text-[10px] font-semibold rounded"
        style={{ background: '#161616', border: '1px solid rgba(201,168,76,0.4)', color: '#E5C158' }}
      >
        <Plus size={13} /> ADICIONAR
      </button>
    </div>
  )
}

/** Lista de pares label/valor (specs da ficha técnica). */
function PairListEditor({
  items, onChange,
}: {
  items: { label: string; value: string }[]
  onChange: (items: { label: string; value: string }[]) => void
}) {
  const update = (i: number, patch: Partial<{ label: string; value: string }>) =>
    onChange(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)))
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i))
  const move = (i: number, dir: -1 | 1) => {
    const next = [...items]
    const j = i + dir
    if (j < 0 || j >= next.length) return
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }
  const add = () => onChange([...items, { label: '', value: '' }])

  return (
    <div className="flex flex-col gap-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <input
            value={item.label}
            onChange={e => update(i, { label: e.target.value })}
            placeholder="Rótulo (ex: ÁREA TOTAL)"
            className="w-[40%] h-9 px-3 font-display text-sm outline-none focus:border-[#C9A84C]"
            style={inputStyle}
          />
          <input
            value={item.value}
            onChange={e => update(i, { value: e.target.value })}
            placeholder="Valor (ex: 480 m²)"
            className="flex-1 h-9 px-3 font-display text-sm outline-none focus:border-[#C9A84C]"
            style={inputStyle}
          />
          <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="h-9 w-8 flex items-center justify-center rounded text-[#94A3B8] hover:text-[#E5C158] disabled:opacity-20" style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.14)' }}>
            <ChevronUp size={13} />
          </button>
          <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} className="h-9 w-8 flex items-center justify-center rounded text-[#94A3B8] hover:text-[#E5C158] disabled:opacity-20" style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.14)' }}>
            <ChevronDown size={13} />
          </button>
          <button type="button" onClick={() => remove(i)} className="h-9 w-9 flex items-center justify-center rounded text-[#CBD5E1] hover:text-red-400" style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.14)' }}>
            <Trash2 size={13} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="self-start flex items-center gap-1.5 h-9 px-3 font-mono-mm text-[10px] font-semibold rounded"
        style={{ background: '#161616', border: '1px solid rgba(201,168,76,0.4)', color: '#E5C158' }}
      >
        <Plus size={13} /> ADICIONAR LINHA
      </button>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Tabs de conteúdo                                                     */
/* ------------------------------------------------------------------ */

function HeroTab({ draft, patch }: { draft: HomeContent; patch: (p: Partial<HomeContent>) => void }) {
  const set = (p: Partial<HomeContent['hero']>) => patch({ hero: { ...draft.hero, ...p } })
  return (
    <div className="flex flex-col gap-4">
      <Field label="SELO ACIMA DO TÍTULO"><TextInput value={draft.hero.badge} onChange={v => set({ badge: v })} /></Field>
      <Field label="SUBTÍTULO"><TextArea value={draft.hero.subtitle} onChange={v => set({ subtitle: v })} /></Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="TEXTO DO BOTÃO — PORTFÓLIO"><TextInput value={draft.hero.ctaPortfolioLabel} onChange={v => set({ ctaPortfolioLabel: v })} /></Field>
        <Field label="TEXTO DO BOTÃO — WHATSAPP"><TextInput value={draft.hero.ctaWhatsappLabel} onChange={v => set({ ctaWhatsappLabel: v })} /></Field>
      </div>
      <Field label="FAIXA DE TEXTO CORRIDO (MARQUEE)"><TextArea value={draft.hero.marquee} onChange={v => set({ marquee: v })} rows={2} /></Field>
      <p className="font-mono-mm text-[10px] text-[#64748B]">
        O logotipo &quot;MALDS MAKER LENTES BRILHANTES.&quot; é a marca fixa do site e não é editável aqui — troque as fotos da grade em Imagens do Site.
      </p>
    </div>
  )
}

function SobreTab({ draft, patch }: { draft: HomeContent; patch: (p: Partial<HomeContent>) => void }) {
  const set = (p: Partial<HomeContent['sobre']>) => patch({ sobre: { ...draft.sobre, ...p } })
  const headline = draft.sobre.headline
  const setHeadlineLine = (i: number, v: string) => set({ headline: headline.map((l, idx) => (idx === i ? v : l)) })
  const setStat = (i: number, p: Partial<HomeContent['sobre']['stats'][number]>) =>
    set({ stats: draft.sobre.stats.map((s, idx) => (idx === i ? { ...s, ...p } : s)) })

  return (
    <div className="flex flex-col gap-4">
      <Field label="ETIQUETA (TAPE LABEL)"><TextInput value={draft.sobre.tapeLabel} onChange={v => set({ tapeLabel: v })} /></Field>
      <Field label="TÍTULO — 4 LINHAS">
        <div className="flex flex-col gap-2">
          {headline.map((line, i) => (
            <TextInput key={i} value={line} onChange={v => setHeadlineLine(i, v)} placeholder={`Linha ${i + 1}`} />
          ))}
        </div>
      </Field>
      <Field label="PARÁGRAFO 1"><TextArea value={draft.sobre.paragraph1} onChange={v => set({ paragraph1: v })} rows={4} /></Field>
      <Field label="PARÁGRAFO 2"><TextArea value={draft.sobre.paragraph2} onChange={v => set({ paragraph2: v })} rows={4} /></Field>
      <Field label="NÚMEROS EM DESTAQUE">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {draft.sobre.stats.map((stat, i) => (
            <div key={i} className="flex gap-2 p-3 rounded-lg" style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.08)' }}>
              <input type="number" value={stat.value} onChange={e => setStat(i, { value: parseInt(e.target.value) || 0 })} className="w-20 h-9 px-2 font-display text-sm outline-none focus:border-[#C9A84C]" style={inputStyle} />
              <input value={stat.suffix} onChange={e => setStat(i, { suffix: e.target.value })} placeholder="+ / M+" className="w-16 h-9 px-2 font-display text-sm outline-none focus:border-[#C9A84C]" style={inputStyle} />
              <input value={stat.label} onChange={e => setStat(i, { label: e.target.value })} placeholder="Rótulo" className="flex-1 h-9 px-2 font-display text-sm outline-none focus:border-[#C9A84C]" style={inputStyle} />
            </div>
          ))}
        </div>
      </Field>
      <Field label="PÍLULAS DE NICHO">
        <StringListEditor items={draft.sobre.niches} onChange={v => set({ niches: v })} placeholder="Ex: ARTISTAS" />
      </Field>
    </div>
  )
}

function ServicosTab({ draft, patch }: { draft: HomeContent; patch: (p: Partial<HomeContent>) => void }) {
  const set = (p: Partial<HomeContent['servicos']>) => patch({ servicos: { ...draft.servicos, ...p } })
  const items = draft.servicos.items

  const updateItem = (i: number, p: Partial<HomeContent['servicos']['items'][number]>) =>
    set({ items: items.map((it, idx) => (idx === i ? { ...it, ...p } : it)) })
  const removeItem = (i: number) => set({ items: items.filter((_, idx) => idx !== i) })
  const moveItem = (i: number, dir: -1 | 1) => {
    const next = [...items]
    const j = i + dir
    if (j < 0 || j >= next.length) return
    ;[next[i], next[j]] = [next[j], next[i]]
    set({ items: next })
  }
  const addItem = () => set({ items: [...items, { name: 'Novo serviço', tag: '', description: '', bullets: [] }] })

  return (
    <div className="flex flex-col gap-5">
      <Field label="ETIQUETA (EYEBROW)"><TextInput value={draft.servicos.eyebrow} onChange={v => set({ eyebrow: v })} /></Field>
      <Field label="TÍTULO DA SEÇÃO"><TextInput value={draft.servicos.heading} onChange={v => set({ heading: v })} /></Field>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="font-mono-mm text-[10px] font-semibold tracking-wider text-[#E5C158]">LISTA DE SERVIÇOS ({items.length})</p>
          <button type="button" onClick={addItem} className="flex items-center gap-1.5 h-9 px-3 font-mono-mm text-[10px] font-semibold rounded" style={{ background: '#C9A84C', color: '#080808' }}>
            <Plus size={13} /> NOVO SERVIÇO
          </button>
        </div>

        {items.map((item, i) => (
          <div key={i} className="p-4 rounded-xl flex flex-col gap-3" style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-center justify-between">
              <span className="font-mono-mm text-[10px] font-bold" style={{ color: 'rgba(201,168,76,0.6)' }}>#{i + 1}</span>
              <div className="flex items-center gap-1.5">
                <button type="button" onClick={() => moveItem(i, -1)} disabled={i === 0} className="h-8 w-8 flex items-center justify-center rounded text-[#94A3B8] hover:text-[#E5C158] disabled:opacity-20" style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.14)' }}>
                  <ChevronUp size={13} />
                </button>
                <button type="button" onClick={() => moveItem(i, 1)} disabled={i === items.length - 1} className="h-8 w-8 flex items-center justify-center rounded text-[#94A3B8] hover:text-[#E5C158] disabled:opacity-20" style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.14)' }}>
                  <ChevronDown size={13} />
                </button>
                <button type="button" onClick={() => removeItem(i)} className="h-8 w-8 flex items-center justify-center rounded text-[#CBD5E1] hover:text-red-400" style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.14)' }}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="NOME DO SERVIÇO"><TextInput value={item.name} onChange={v => updateItem(i, { name: v })} /></Field>
              <Field label="TAG (CURTA, EM CAIXA ALTA)"><TextInput value={item.tag} onChange={v => updateItem(i, { tag: v })} placeholder="Ex: CAPTAÇÃO · DIREÇÃO · EDIÇÃO" /></Field>
            </div>
            <Field label="DESCRIÇÃO"><TextArea value={item.description} onChange={v => updateItem(i, { description: v })} /></Field>
            <Field label="O QUE ESTÁ INCLUÍDO">
              <StringListEditor items={item.bullets} onChange={v => updateItem(i, { bullets: v })} placeholder="Ex: Roteiro e direção criativa" />
            </Field>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="FAIXA CTA — TÍTULO"><TextInput value={draft.servicos.ctaTitle} onChange={v => set({ ctaTitle: v })} /></Field>
        <Field label="FAIXA CTA — SUBTÍTULO"><TextInput value={draft.servicos.ctaSubtitle} onChange={v => set({ ctaSubtitle: v })} /></Field>
        <Field label="FAIXA CTA — TEXTO DO BOTÃO"><TextInput value={draft.servicos.ctaButtonLabel} onChange={v => set({ ctaButtonLabel: v })} /></Field>
        <Field label="MENSAGEM PADRÃO NO WHATSAPP"><TextInput value={draft.servicos.ctaWhatsappMessage} onChange={v => set({ ctaWhatsappMessage: v })} /></Field>
      </div>
    </div>
  )
}

function NichosTab({ draft, patch }: { draft: HomeContent; patch: (p: Partial<HomeContent>) => void }) {
  const set = (p: Partial<HomeContent['nichosBanner']>) => patch({ nichosBanner: { ...draft.nichosBanner, ...p } })
  return (
    <div className="flex flex-col gap-4">
      <Field label="ETIQUETA (EYEBROW)"><TextInput value={draft.nichosBanner.eyebrow} onChange={v => set({ eyebrow: v })} /></Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="TÍTULO — LINHA 1"><TextInput value={draft.nichosBanner.headingLine1} onChange={v => set({ headingLine1: v })} /></Field>
        <Field label="TÍTULO — LINHA 2 (DESTAQUE)"><TextInput value={draft.nichosBanner.headingLine2} onChange={v => set({ headingLine2: v })} /></Field>
      </div>
      <Field label="NICHOS ATENDIDOS">
        <StringListEditor items={draft.nichosBanner.nichos} onChange={v => set({ nichos: v })} placeholder="Ex: MÚSICA" />
      </Field>
    </div>
  )
}

function NautaTab({ draft, patch }: { draft: HomeContent; patch: (p: Partial<HomeContent>) => void }) {
  const set = (p: Partial<HomeContent['nauta']>) => patch({ nauta: { ...draft.nauta, ...p } })
  return (
    <div className="flex flex-col gap-4">
      <Field label="ETIQUETA (EYEBROW)"><TextInput value={draft.nauta.eyebrow} onChange={v => set({ eyebrow: v })} /></Field>
      <Field label="FICHA TÉCNICA">
        <PairListEditor items={draft.nauta.specs} onChange={v => set({ specs: v })} />
      </Field>
      <Field label="CAPACIDADES / SELOS">
        <StringListEditor items={draft.nauta.capabilities} onChange={v => set({ capabilities: v })} placeholder="Ex: PRODUÇÕES AUDIOVISUAIS" />
      </Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="TEXTO DO BOTÃO DE RESERVA"><TextInput value={draft.nauta.ctaLabel} onChange={v => set({ ctaLabel: v })} /></Field>
        <Field label="MENSAGEM PADRÃO NO WHATSAPP"><TextInput value={draft.nauta.ctaWhatsappMessage} onChange={v => set({ ctaWhatsappMessage: v })} /></Field>
      </div>
      <p className="font-mono-mm text-[10px] text-[#64748B]">
        Capacidade, valores de diária e se aceita locação avulsa ficam em Configurações → Parâmetros Nauta Estúdio (aparecem automaticamente aqui na página pública).
      </p>
    </div>
  )
}

function ContatoTab({ draft, patch }: { draft: HomeContent; patch: (p: Partial<HomeContent>) => void }) {
  const set = (p: Partial<HomeContent['contato']>) => patch({ contato: { ...draft.contato, ...p } })
  return (
    <div className="flex flex-col gap-4">
      <Field label="ETIQUETA (EYEBROW)"><TextInput value={draft.contato.eyebrow} onChange={v => set({ eyebrow: v })} /></Field>
      <Field label="TÍTULO"><TextInput value={draft.contato.heading} onChange={v => set({ heading: v })} /></Field>
      <Field label="TEXTO DE INTRODUÇÃO"><TextArea value={draft.contato.intro} onChange={v => set({ intro: v })} /></Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="TEXTO DO BOTÃO WHATSAPP"><TextInput value={draft.contato.whatsappCtaLabel} onChange={v => set({ whatsappCtaLabel: v })} /></Field>
        <Field label="MENSAGEM PADRÃO NO WHATSAPP"><TextInput value={draft.contato.whatsappMessage} onChange={v => set({ whatsappMessage: v })} /></Field>
      </div>
      <p className="font-mono-mm text-[10px] text-[#64748B]">
        Telefone, e-mail, Instagram e cidade vêm de Configurações → Perfil do Produtor.
      </p>
    </div>
  )
}

function FooterTab({ draft, patch }: { draft: HomeContent; patch: (p: Partial<HomeContent>) => void }) {
  return (
    <div className="flex flex-col gap-4">
      <Field label="FRASE DE ASSINATURA"><TextInput value={draft.footer.tagline} onChange={v => patch({ footer: { ...draft.footer, tagline: v } })} /></Field>
      <p className="font-mono-mm text-[10px] text-[#64748B]">
        Os links de navegação, a lista de serviços e as redes sociais do rodapé são gerados automaticamente a partir da aba Serviços e de Configurações.
      </p>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Componente principal                                               */
/* ------------------------------------------------------------------ */

export function AdminPaginaInicial() {
  const { state, dispatch, isLoading } = useAdmin()
  const [tab, setTab] = useState<TabId>('hero')
  const [draft, setDraft] = useState<HomeContent>(state.homeContent)
  const [saved, setSaved] = useState(false)
  const syncedRef = useRef(false)

  useEffect(() => {
    if (!isLoading && !syncedRef.current) {
      setDraft(state.homeContent)
      syncedRef.current = true
    }
  }, [isLoading, state.homeContent])

  const patch = (p: Partial<HomeContent>) => setDraft(d => ({ ...d, ...p }))

  const handleSave = () => {
    dispatch({ type: 'UPDATE_HOME_CONTENT', payload: draft })
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-semibold text-2xl text-[#FFFFFF]">Página Inicial</h1>
          <p className="font-mono-mm text-xs tracking-[0.08em] mt-1 text-[#CBD5E1]">
            EDITE OS TEXTOS E LISTAS EXIBIDOS NA HOME DO SITE PÚBLICO
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 h-11 px-4 font-mono-mm text-xs font-semibold rounded-lg text-[#F3F4F6]"
            style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.16)' }}
          >
            <ExternalLink size={14} />
            VER SITE
          </a>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 h-11 px-5 font-mono-mm text-xs tracking-[0.1em] font-semibold transition-all rounded-lg"
            style={{ background: saved ? '#4ADE80' : '#C9A84C', color: '#080808' }}
          >
            {saved ? <Check size={16} /> : <Save size={16} />}
            {saved ? 'SALVO' : 'SALVAR'}
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="h-10 px-4 font-mono-mm text-[11px] tracking-[0.08em] font-semibold rounded-lg shrink-0 transition-all"
            style={{
              background: tab === t.id ? 'rgba(201,168,76,0.2)' : '#111111',
              color: tab === t.id ? '#E5C158' : '#94A3B8',
              border: tab === t.id ? '1px solid rgba(201,168,76,0.6)' : '1px solid rgba(255,255,255,0.12)',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-5 sm:p-6 rounded-xl" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.12)' }}>
        {tab === 'hero' && <HeroTab draft={draft} patch={patch} />}
        {tab === 'sobre' && <SobreTab draft={draft} patch={patch} />}
        {tab === 'servicos' && <ServicosTab draft={draft} patch={patch} />}
        {tab === 'nichos' && <NichosTab draft={draft} patch={patch} />}
        {tab === 'nauta' && <NautaTab draft={draft} patch={patch} />}
        {tab === 'contato' && <ContatoTab draft={draft} patch={patch} />}
        {tab === 'footer' && <FooterTab draft={draft} patch={patch} />}
      </div>
    </div>
  )
}
