'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import {
  Play,
  ArrowUpRight,
  Sparkles,
  X,
  ExternalLink,
  Film,
  Camera,
  Star,
  ChevronRight,
} from 'lucide-react'
import { SiteImage } from '@/components/site/SiteImage'
import { PORTFOLIO_ITEMS, type PortfolioItem } from '@/lib/data'
import { parseVideoUrl } from '@/lib/video'

export function Portfolio() {
  const [activeFilter, setActiveFilter] = useState('TODOS')
  const [visibleCount, setVisibleCount] = useState(8)
  const [items, setItems] = useState<PortfolioItem[]>(PORTFOLIO_ITEMS)
  const [selectedVideoItem, setSelectedVideoItem] = useState<PortfolioItem | null>(null)

  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -80px 0px' })

  // Carrega do endpoint para sincronizar instantaneamente com o banco Postgres
  useEffect(() => {
    let cancelled = false
    fetch('/api/portfolio', { cache: 'no-store' })
      .then(res => (res.ok ? res.json() : null))
      .then((data: PortfolioItem[] | null) => {
        if (!cancelled && Array.isArray(data) && data.length) {
          setItems(data)
        }
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  // Fechar modal com tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedVideoItem(null)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Categorias disponíveis a partir dos dados reais
  const categories = useMemo(() => {
    const set = new Set<string>()
    items.forEach(i => set.add(i.category))
    return ['TODOS', ...Array.from(set)]
  }, [items])

  // Contagem por categoria
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { TODOS: items.length }
    for (const item of items) {
      counts[item.category] = (counts[item.category] || 0) + 1
    }
    return counts
  }, [items])

  // Itens filtrados
  const filtered = useMemo(() => {
    if (activeFilter === 'TODOS') return items
    return items.filter(item => item.category === activeFilter)
  }, [items, activeFilter])

  const displayed = useMemo(() => {
    return filtered.slice(0, visibleCount)
  }, [filtered, visibleCount])

  // Análise de vídeo do item selecionado
  const activeVideoEmbed = useMemo(() => {
    if (!selectedVideoItem?.videoUrl) return null
    return parseVideoUrl(selectedVideoItem.videoUrl)
  }, [selectedVideoItem])

  return (
    <section
      id="portfolio"
      ref={ref}
      className="section-spacing relative overflow-hidden"
      style={{ background: '#0D0D0D' }}
    >
      {/* Background Ambient Glow */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] pointer-events-none opacity-20 blur-[130px]"
        style={{ background: 'radial-gradient(circle, #C9A84C 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      <div className="site-container relative z-10">
        {/* Header Cinematográfico */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-[#C9A84C]" />
              <p className="font-mono-mm text-[11px] tracking-[0.2em] uppercase text-[#C9A84C]">
                // 04 · ARQUIVO AUDIOVISUAL & FOTOGRAFIA
              </p>
            </div>
            <h2
              className="font-display uppercase tracking-tight text-white"
              style={{ fontSize: 'clamp(32px, 5.2vw, 64px)', lineHeight: 1.05 }}
            >
              Obras que definem <span className="text-[#C9A84C]">marcas</span> e artistas.
            </h2>
            <p className="font-body text-sm sm:text-base text-[#A8A89A] mt-4 max-w-xl leading-relaxed">
              Direção criativa, cinema glass 4K, videoclipes, campanhas corporativas e cobertura de
              grandes palcos. Cada frame pensado para prender a atenção e gerar autoridade.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden sm:flex items-center gap-4 py-2 px-4 rounded-xl bg-[#141414] border border-[rgba(255,255,255,0.08)] self-start md:self-auto"
          >
            <div className="flex items-center gap-2 text-xs font-mono-mm text-[#CBD5E1]">
              <Film size={14} className="text-[#C9A84C]" />
              <span>{items.filter(i => i.isVideo).length} Vídeos</span>
            </div>
            <div className="w-[1px] h-4 bg-white/10" />
            <div className="flex items-center gap-2 text-xs font-mono-mm text-[#CBD5E1]">
              <Camera size={14} className="text-[#E5C158]" />
              <span>{items.filter(i => !i.isVideo).length} Ensaios</span>
            </div>
          </motion.div>
        </div>

        {/* Barra de Filtros com Contadores */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex gap-2 overflow-x-auto scrollbar-hide pb-3 mb-10 border-b border-[rgba(255,255,255,0.08)]"
        >
          {categories.map(c => {
            const count = categoryCounts[c] || 0
            const active = activeFilter === c
            return (
              <button
                key={c}
                onClick={() => {
                  setActiveFilter(c)
                  setVisibleCount(8)
                }}
                className="shrink-0 font-mono-mm text-[11px] tracking-[0.1em] px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 relative cursor-pointer"
                style={{
                  background: active ? '#C9A84C' : 'rgba(255,255,255,0.03)',
                  color: active ? '#0A0A0A' : '#8E8E84',
                  border: active ? '1px solid #C9A84C' : '1px solid rgba(255,255,255,0.07)',
                  fontWeight: active ? '600' : '400',
                }}
              >
                <span>{c}</span>
                <span
                  className="text-[9px] px-1.5 py-0.5 rounded-full"
                  style={{
                    background: active ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.08)',
                    color: active ? '#0A0A0A' : '#A8A89A',
                  }}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </motion.div>

        {/* Bento Grid Cinematográfico */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFilter}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {displayed.length === 0 ? (
              <div className="col-span-full py-16 text-center rounded-2xl bg-[#141414]/50 border border-white/5 flex flex-col items-center justify-center gap-3">
                <Sparkles size={24} className="text-[#C9A84C]" />
                <p className="font-display font-semibold text-lg text-white">Nenhuma obra nesta categoria no momento</p>
                <p className="font-body text-xs text-[#94A3B8] max-w-sm">
                  Estamos constantemente atualizando nosso acervo audiovisual. Explore todas as produções disponíveis.
                </p>
                <button
                  onClick={() => setActiveFilter('TODOS')}
                  className="mt-2 px-5 py-2 rounded-lg font-mono-mm text-[11px] font-semibold bg-[#C9A84C] text-[#0A0A0A] hover:bg-[#E5C158] transition-colors"
                >
                  VER TODOS OS TRABALHOS
                </button>
              </div>
            ) : (
              displayed.map((item, i) => {
                // Projetos destacados ou primeiros vídeos ganham card estendido 2 colunas em telas grandes
                const isWide = (item.featured || (item.isVideo && i === 0)) && displayed.length > 2
                const hasVideo = item.isVideo && item.videoUrl

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className={`group relative overflow-hidden rounded-2xl bg-[#141414] border border-[rgba(255,255,255,0.07)] hover:border-[rgba(201,168,76,0.5)] transition-all duration-500 shadow-xl ${
                    isWide ? 'md:col-span-2 lg:col-span-2' : 'col-span-1'
                  }`}
                  style={{ minHeight: isWide ? '380px' : '320px' }}
                >
                  {/* Container de Mídia */}
                  <div className="absolute inset-0 w-full h-full overflow-hidden">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06] opacity-85 group-hover:opacity-100"
                        loading="lazy"
                      />
                    ) : (
                      <SiteImage
                        imageKey={item.imageKey}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06] opacity-85 group-hover:opacity-100"
                        sizes={isWide ? '(max-width: 1024px) 100vw, 66vw' : '(max-width: 768px) 100vw, 33vw'}
                      />
                    )}

                    {/* Gradiente Escuro Cinematográfico */}
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-85 group-hover:opacity-95 transition-opacity"
                    />
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent pointer-events-none"
                    />
                  </div>

                  {/* Top Badges */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10 pointer-events-none">
                    <div className="flex items-center gap-2">
                      <span
                        className="font-mono-mm text-[10px] tracking-[0.14em] px-3 py-1 rounded-md uppercase font-semibold"
                        style={{
                          background: 'rgba(10,10,10,0.85)',
                          border: '1px solid rgba(201,168,76,0.4)',
                          color: '#E5C158',
                          backdropFilter: 'blur(8px)',
                        }}
                      >
                        {item.category}
                      </span>
                      {item.featured && (
                        <span
                          className="font-mono-mm text-[10px] tracking-[0.12em] px-2 py-1 rounded-md flex items-center gap-1 font-bold"
                          style={{
                            background: 'rgba(201,168,76,0.95)',
                            color: '#0A0A0A',
                          }}
                          title="Obra em Destaque"
                        >
                          <Star size={11} fill="currentColor" /> DESTAQUE
                        </span>
                      )}
                    </div>

                    {item.isVideo && (
                      <span
                        className="font-mono-mm text-[10px] tracking-[0.12em] px-2.5 py-1 rounded-md flex items-center gap-1.5 font-bold"
                        style={{
                          background: 'rgba(0,0,0,0.85)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          color: '#F5F5F0',
                          backdropFilter: 'blur(8px)',
                        }}
                      >
                        <Play size={10} fill="currentColor" className="text-[#C9A84C]" />
                        VÍDEO
                      </span>
                    )}
                  </div>

                  {/* Informações na Parte Inferior */}
                  <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7 flex flex-col justify-end z-10 pointer-events-none">
                    {/* Cliente e Ano */}
                    {(item.client || item.year) && (
                      <div className="flex items-center gap-2 mb-2 font-mono-mm text-[11px] tracking-wider text-[#C9A84C]">
                        {item.client && <span>{item.client}</span>}
                        {item.client && item.year && <span>·</span>}
                        {item.year && <span>{item.year}</span>}
                      </div>
                    )}

                    {/* Título do Projeto */}
                    <h3
                      className="font-display uppercase text-xl sm:text-2xl text-white font-bold tracking-tight leading-tight mb-2 group-hover:text-[#E5C158] transition-colors"
                    >
                      {item.title}
                    </h3>

                    {/* Descrição curta */}
                    {item.description && (
                      <p className="font-body text-xs sm:text-sm text-[#B8B8AD] line-clamp-2 max-w-xl mb-4 opacity-90">
                        {item.description}
                      </p>
                    )}

                    {/* Botões de Ação Interativos */}
                    <div className="flex items-center gap-3 pt-2 pointer-events-auto">
                      {hasVideo ? (
                        <button
                          onClick={() => setSelectedVideoItem(item)}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-mono-mm text-[11px] tracking-[0.12em] font-semibold transition-all duration-300 shadow-md cursor-pointer hover:scale-105 active:scale-95"
                          style={{
                            background: '#C9A84C',
                            color: '#0A0A0A',
                          }}
                        >
                          <Play size={13} fill="currentColor" />
                          ASSISTIR TEASER
                        </button>
                      ) : null}

                      <Link
                        href={`/portfolio/${item.slug || item.id}`}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-mono-mm text-[11px] tracking-[0.12em] transition-all duration-300 backdrop-blur-sm border"
                        style={{
                          background: hasVideo ? 'rgba(0,0,0,0.6)' : '#C9A84C',
                          color: hasVideo ? '#E5C158' : '#0A0A0A',
                          borderColor: hasVideo ? 'rgba(201,168,76,0.4)' : '#C9A84C',
                          fontWeight: hasVideo ? '500' : '600',
                        }}
                      >
                        VER CASE
                        <ArrowUpRight size={13} />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )
            })
          )}
          </motion.div>
        </AnimatePresence>

        {/* Load More Button */}
        {visibleCount < filtered.length && (
          <div className="flex flex-col items-center justify-center mt-12 gap-3">
            <button
              onClick={() => setVisibleCount(v => v + 6)}
              className="font-mono-mm text-xs tracking-[0.16em] h-12 px-10 rounded-xl transition-all duration-300 flex items-center gap-2 cursor-pointer"
              style={{
                background: 'transparent',
                border: '1px solid rgba(201,168,76,0.5)',
                color: '#E5C158',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget
                el.style.background = '#C9A84C'
                el.style.color = '#0A0A0A'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget
                el.style.background = 'transparent'
                el.style.color = '#E5C158'
              }}
            >
              CARREGAR MAIS OBRAS
              <ChevronRight size={14} />
            </button>
            <p className="font-mono-mm text-[11px] text-[#64748B]">
              Exibindo {displayed.length} de {filtered.length} projetos
            </p>
          </div>
        )}
      </div>

      {/* CINEMA LIGHTBOX / VIDEO MODAL */}
      <AnimatePresence>
        {selectedVideoItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedVideoItem(null)}
              className="fixed inset-0 bg-black/90 backdrop-blur-xl transition-opacity"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="relative z-10 w-full max-w-4xl bg-[#0F0F0F] border border-[rgba(201,168,76,0.3)] rounded-2xl overflow-hidden shadow-2xl flex flex-col"
              style={{ maxHeight: '94vh' }}
            >
              {/* Header do Player */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-[rgba(255,255,255,0.08)] bg-[#141414]">
                <div className="flex items-center gap-2">
                  <span className="font-mono-mm text-[10px] tracking-[0.14em] px-2.5 py-0.5 rounded bg-[#C9A84C]/20 text-[#E5C158] border border-[#C9A84C]/40 font-bold uppercase">
                    {selectedVideoItem.category}
                  </span>
                  <p className="font-display font-semibold text-sm text-white truncate max-w-sm sm:max-w-md">
                    {selectedVideoItem.title}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedVideoItem(null)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#94A3B8] hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Fechar player"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Player de Vídeo */}
              <div className="relative w-full bg-black" style={{ aspectRatio: '16/9' }}>
                {activeVideoEmbed?.embedUrl ? (
                  <iframe
                    src={activeVideoEmbed.embedUrl}
                    title={selectedVideoItem.title}
                    className="absolute inset-0 w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : activeVideoEmbed?.directUrl ? (
                  <video
                    src={activeVideoEmbed.directUrl}
                    controls
                    autoPlay
                    className="absolute inset-0 w-full h-full object-contain"
                  />
                ) : selectedVideoItem.imageUrl ? (
                  <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedVideoItem.imageUrl}
                      alt={selectedVideoItem.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-30"
                    />
                    <div className="relative z-10 flex flex-col items-center gap-3">
                      <Film size={36} className="text-[#E5C158]" />
                      <p className="font-display text-lg text-white font-semibold">
                        {selectedVideoItem.title}
                      </p>
                      <p className="font-mono-mm text-xs text-[#94A3B8] max-w-md">
                        Link direto do vídeo não disponível. Acesse a página do case para ver stills e galeria completa.
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Informações e CTAs da Obra */}
              <div className="p-5 sm:p-6 bg-[#0E0E0E] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono-mm text-[#C9A84C] mb-1">
                    {selectedVideoItem.client && <span>{selectedVideoItem.client}</span>}
                    {selectedVideoItem.client && selectedVideoItem.year && <span>·</span>}
                    {selectedVideoItem.year && <span>{selectedVideoItem.year}</span>}
                  </div>
                  <h4 className="font-display font-semibold text-lg text-white">
                    {selectedVideoItem.title}
                  </h4>
                  {selectedVideoItem.description && (
                    <p className="font-body text-xs sm:text-sm text-[#A8A89A] mt-1 max-w-xl line-clamp-2">
                      {selectedVideoItem.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/portfolio/${selectedVideoItem.slug || selectedVideoItem.id}`}
                    onClick={() => setSelectedVideoItem(null)}
                    className="flex items-center gap-2 h-11 px-5 rounded-xl font-mono-mm text-xs tracking-[0.1em] font-semibold transition-all bg-[#C9A84C] text-[#0A0A0A] hover:bg-[#E5C158]"
                  >
                    <span>VER CASE COMPLETO</span>
                    <ExternalLink size={13} />
                  </Link>
                  <a
                    href="#contato"
                    onClick={() => setSelectedVideoItem(null)}
                    className="flex items-center gap-1.5 h-11 px-4 rounded-xl font-mono-mm text-xs tracking-[0.1em] transition-all bg-[#161616] text-[#CBD5E1] border border-white/10 hover:text-white hover:border-[#C9A84C]"
                  >
                    SOLICITAR PROJETO
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  )
}
