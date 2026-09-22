'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd'
import { useAdmin } from '@/lib/admin-context'
import type { PortfolioItem } from '@/lib/data'
import {
  Plus,
  Trash2,
  Edit3,
  Copy,
  Film,
  Image as ImageIcon,
  Search,
  ExternalLink,
  ImagePlus,
  ChevronUp,
  ChevronDown,
  GripVertical,
  LayoutGrid,
  List,
  Play,
  Star,
  Layers,
  Sparkles,
} from 'lucide-react'
import { SiteImage } from '@/components/site/SiteImage'
import { SITE_IMAGE_SLOTS } from '@/lib/site-images'
import { uniqueSlug } from '@/lib/slug'

const CATEGORIES = [
  'MÚSICA',
  'CLIPES',
  'INSTITUCIONAL',
  'EVENTOS',
  'ENSAIOS',
  'EMPRESAS',
  'AO VIVO',
  'MODA',
  'PUBLICIDADE',
]

const inputStyle = {
  background: '#161616',
  border: '1px solid rgba(255,255,255,0.16)',
  borderRadius: '6px',
  color: '#F9FAFB',
} as const

export function AdminPortfolio() {
  const { state, dispatch } = useAdmin()
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('TODOS')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

  const portfolio = state.portfolio ?? []

  // Métricas
  const stats = useMemo(() => {
    const total = portfolio.length
    const videos = portfolio.filter(p => p.isVideo).length
    const photos = total - videos
    const featuredCount = portfolio.filter(p => p.featured).length
    const cats = new Set(portfolio.map(p => p.category)).size
    return { total, videos, photos, featuredCount, cats }
  }, [portfolio])

  // Contagem por categoria para as abas
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { TODOS: portfolio.length }
    for (const item of portfolio) {
      counts[item.category] = (counts[item.category] || 0) + 1
    }
    return counts
  }, [portfolio])

  const items = useMemo(() => {
    const q = search.trim().toLowerCase()
    return [...portfolio]
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .filter(item => {
        if (categoryFilter !== 'TODOS' && item.category !== categoryFilter) return false
        if (!q) return true
        return (
          item.title.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          (item.client ?? '').toLowerCase().includes(q) ||
          (item.year ?? '').toLowerCase().includes(q) ||
          (item.description ?? '').toLowerCase().includes(q)
        )
      })
  }, [portfolio, search, categoryFilter])

  const moveItem = (id: string, dir: -1 | 1) => {
    const ordered = [...portfolio].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    const idx = ordered.findIndex(i => i.id === id)
    const other = ordered[idx + dir]
    if (idx === -1 || !other) return
    const current = ordered[idx]
    dispatch({ type: 'UPDATE_PORTFOLIO', payload: { ...current, sortOrder: other.sortOrder ?? 0 } })
    dispatch({ type: 'UPDATE_PORTFOLIO', payload: { ...other, sortOrder: current.sortOrder ?? 0 } })
  }

  // Arrastar e soltar na visualização em lista — reindexa sortOrder do portfólio inteiro,
  // não só do subconjunto filtrado, pra não embaralhar itens escondidos pelo filtro/busca.
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return
    const from = result.source.index
    const to = result.destination.index
    if (from === to) return

    const fullOrdered = [...portfolio].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    const draggedId = items[from].id
    const targetId = items[to].id

    const dragged = fullOrdered.find(p => p.id === draggedId)
    const withoutDragged = fullOrdered.filter(p => p.id !== draggedId)
    const targetIdx = withoutDragged.findIndex(p => p.id === targetId)
    if (!dragged || targetIdx === -1) return

    const movingDown = to > from
    withoutDragged.splice(movingDown ? targetIdx + 1 : targetIdx, 0, dragged)

    withoutDragged.forEach((item, i) => {
      const nextOrder = i + 1
      if (item.sortOrder !== nextOrder) {
        dispatch({ type: 'UPDATE_PORTFOLIO', payload: { ...item, sortOrder: nextOrder } })
      }
    })
  }

  // Duplica um projeto e vai direto para a página dele, sem modal.
  const handleDuplicate = (item: PortfolioItem) => {
    const id = `pf-${Date.now()}`
    const siblings = portfolio.map(p => p.slug)
    const copy: PortfolioItem = {
      ...item,
      id,
      slug: uniqueSlug(`${item.title} copia`, siblings),
      title: `${item.title} (cópia)`,
      featured: false,
      sortOrder: portfolio.length + 1,
    }
    dispatch({ type: 'ADD_PORTFOLIO', payload: copy })
    router.push(`/admin/portfolio/${id}`)
  }

  const allCategories = useMemo(() => {
    const set = new Set(CATEGORIES)
    portfolio.forEach(p => set.add(p.category))
    return ['TODOS', ...Array.from(set)]
  }, [portfolio])

  // Cria um item vazio e vai direto para a página dele — sem modal.
  const handleCreate = () => {
    const id = `pf-${Date.now()}`
    const siblings = portfolio.map(p => p.slug)
    const newItem: PortfolioItem = {
      id,
      title: 'Novo Projeto',
      slug: uniqueSlug('Novo Projeto', siblings),
      category: 'CLIPES',
      imageKey: SITE_IMAGE_SLOTS.find(s => s.key.startsWith('portfolio'))?.key ?? 'portfolio-territorio-mc-vitao',
      isVideo: false,
      featured: false,
      sortOrder: portfolio.length + 1,
      description: '',
      images: [],
    }
    dispatch({ type: 'ADD_PORTFOLIO', payload: newItem })
    router.push(`/admin/portfolio/${id}`)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono-mm text-[10px] tracking-[0.14em] px-2 py-0.5 rounded bg-[#C9A84C]/20 text-[#E5C158] border border-[#C9A84C]/40 font-bold">
              AUDIOVISUAL & FOTOGRAFIA
            </span>
            <span className="font-mono-mm text-[10px] text-[#64748B]">
              MALDS MAKER
            </span>
          </div>
          <h1 className="font-display font-semibold text-2xl sm:text-3xl text-white mt-1">
            Portfólio do Site
          </h1>
          <p className="font-mono-mm text-xs tracking-[0.06em] mt-1 text-[#CBD5E1]">
            GERENCIE OS CASES, VÍDEOCLIPES, ENSAIOS E OBRAS EXIBIDAS NA HOME
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Switch Grid / Table */}
          <div className="flex items-center rounded-lg bg-[#141414] border border-[rgba(255,255,255,0.14)] p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'grid' ? 'bg-[#C9A84C] text-[#080808]' : 'text-[#94A3B8] hover:text-white'
              }`}
              title="Visualização em Grade"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'table' ? 'bg-[#C9A84C] text-[#080808]' : 'text-[#94A3B8] hover:text-white'
              }`}
              title="Visualização em Lista / Reordenação"
            >
              <List size={15} />
            </button>
          </div>

          <button
            onClick={handleCreate}
            className="flex items-center justify-center gap-2 h-11 px-5 font-mono-mm text-xs tracking-[0.08em] font-semibold rounded-lg shadow-lg hover:shadow-[#C9A84C]/20 transition-all cursor-pointer"
            style={{ background: '#C9A84C', color: '#080808' }}
          >
            <Plus size={16} />
            NOVO PROJETO
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-xl bg-[#111111] border border-[rgba(255,255,255,0.1)] flex flex-col">
          <span className="font-mono-mm text-[10px] text-[#94A3B8] tracking-wider">TOTAL CASES</span>
          <span className="font-display font-bold text-xl sm:text-2xl text-white mt-1">
            {stats.total}
          </span>
        </div>
        <div className="p-3.5 rounded-xl bg-[#111111] border border-[rgba(255,255,255,0.1)] flex flex-col">
          <span className="font-mono-mm text-[10px] text-[#94A3B8] tracking-wider flex items-center gap-1">
            <Film size={11} className="text-[#C9A84C]" /> VÍDEOS
          </span>
          <span className="font-display font-bold text-xl sm:text-2xl text-[#E5C158] mt-1">
            {stats.videos}
          </span>
        </div>
        <div className="p-3.5 rounded-xl bg-[#111111] border border-[rgba(255,255,255,0.1)] flex flex-col">
          <span className="font-mono-mm text-[10px] text-[#94A3B8] tracking-wider flex items-center gap-1">
            <ImageIcon size={11} className="text-cyan-400" /> FOTOS
          </span>
          <span className="font-display font-bold text-xl sm:text-2xl text-cyan-400 mt-1">
            {stats.photos}
          </span>
        </div>
        <div className="p-3.5 rounded-xl bg-[#111111] border border-[rgba(255,255,255,0.1)] flex flex-col">
          <span className="font-mono-mm text-[10px] text-[#94A3B8] tracking-wider flex items-center gap-1">
            <Star size={11} className="text-yellow-400 fill-yellow-400" /> DESTAQUES
          </span>
          <span className="font-display font-bold text-xl sm:text-2xl text-yellow-400 mt-1">
            {stats.featuredCount}
          </span>
        </div>
        <div className="p-3.5 rounded-xl bg-[#111111] border border-[rgba(255,255,255,0.1)] flex flex-col col-span-2 sm:col-span-1">
          <span className="font-mono-mm text-[10px] text-[#94A3B8] tracking-wider flex items-center gap-1">
            <Layers size={11} className="text-purple-400" /> CATEGORIAS
          </span>
          <span className="font-display font-bold text-xl sm:text-2xl text-purple-300 mt-1">
            {stats.cats}
          </span>
        </div>
      </div>

      {/* Search & Filter bar */}
      <div className="flex flex-col gap-3">
        <div className="relative w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar projeto por título, cliente, categoria ou descrição..."
            className="w-full h-11 pl-11 pr-4 font-display text-sm outline-none focus:border-[#C9A84C] transition-colors"
            style={inputStyle}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono-mm text-[#94A3B8] hover:text-white"
            >
              LIMPAR
            </button>
          )}
        </div>

        {/* Category Pills with counts */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {allCategories.map(c => {
            const count = categoryCounts[c] || 0
            const active = categoryFilter === c
            return (
              <button
                key={c}
                onClick={() => setCategoryFilter(c)}
                className="h-9 px-3.5 font-mono-mm text-[10px] tracking-[0.06em] font-semibold rounded-lg transition-all shrink-0 flex items-center gap-1.5"
                style={{
                  background: active ? 'rgba(201,168,76,0.2)' : '#111111',
                  color: active ? '#E5C158' : '#94A3B8',
                  border: active ? '1px solid rgba(201,168,76,0.6)' : '1px solid rgba(255,255,255,0.12)',
                }}
              >
                <span>{c}</span>
                <span
                  className="px-1.5 py-0.2 rounded-full text-[9px]"
                  style={{
                    background: active ? '#C9A84C' : 'rgba(255,255,255,0.08)',
                    color: active ? '#080808' : '#CBD5E1',
                  }}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Content Rendering */}
      {items.length === 0 ? (
        <div className="py-16 text-center bg-[#111111] border border-[rgba(255,255,255,0.12)] rounded-2xl flex flex-col items-center justify-center gap-3">
          <Sparkles size={28} className="text-[#C9A84C]" />
          <p className="font-display font-semibold text-lg text-white">Nenhum projeto encontrado</p>
          <p className="font-mono-mm text-xs text-[#94A3B8] max-w-md">
            Tente alterar os filtros de busca ou adicione um novo trabalho ao portfólio.
          </p>
          <button
            onClick={handleCreate}
            className="mt-2 flex items-center gap-2 h-10 px-5 font-mono-mm text-xs font-semibold rounded-lg bg-[#C9A84C] text-[#080808]"
          >
            <Plus size={15} /> NOVO PROJETO
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((item, idx) => (
            <div
              key={item.id}
              className="flex flex-col justify-between p-4 bg-[#111111] border border-[rgba(255,255,255,0.12)] hover:border-[rgba(201,168,76,0.4)] transition-all rounded-2xl group shadow-md"
            >
              {/* Media Thumbnail */}
              <div className="flex flex-col gap-3">
                <div
                  className="relative w-full overflow-hidden rounded-xl bg-[#161616] cursor-pointer"
                  style={{ aspectRatio: '16/10' }}
                  onClick={() => router.push(`/admin/portfolio/${item.id}`)}
                >
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <SiteImage
                      imageKey={item.imageKey}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="340px"
                    />
                  )}

                  {/* Badges no topo */}
                  <div className="absolute top-2 left-2 flex items-center gap-1.5">
                    <span
                      className="font-mono-mm text-[9px] px-2 py-0.5 rounded font-bold"
                      style={{
                        background: 'rgba(0,0,0,0.75)',
                        border: '1px solid rgba(201,168,76,0.4)',
                        color: '#E5C158',
                        backdropFilter: 'blur(4px)',
                      }}
                    >
                      {item.category}
                    </span>
                    {item.featured && (
                      <span
                        className="font-mono-mm text-[9px] px-1.5 py-0.5 rounded font-bold flex items-center gap-1"
                        style={{ background: 'rgba(234,179,8,0.9)', color: '#080808' }}
                        title="Destaque na página inicial"
                      >
                        <Star size={9} fill="currentColor" />
                      </span>
                    )}
                  </div>

                  <div className="absolute top-2 right-2 flex items-center gap-1">
                    <span
                      className="font-mono-mm text-[9px] px-2 py-0.5 rounded font-bold"
                      style={{
                        background: 'rgba(0,0,0,0.75)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: '#CBD5E1',
                      }}
                    >
                      #{idx + 1}
                    </span>
                  </div>

                  {/* Badges na parte inferior */}
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                    {item.isVideo ? (
                      <span className="font-mono-mm text-[9px] px-2 py-0.5 rounded bg-[#C9A84C] text-[#080808] font-bold flex items-center gap-1 shadow">
                        <Play size={9} fill="currentColor" /> VÍDEO
                      </span>
                    ) : (
                      <span className="font-mono-mm text-[9px] px-2 py-0.5 rounded bg-black/70 text-[#94A3B8] border border-white/10 font-bold flex items-center gap-1">
                        <ImageIcon size={9} /> FOTO
                      </span>
                    )}

                    <span className="font-mono-mm text-[9px] px-2 py-0.5 rounded bg-black/70 text-[#CBD5E1] border border-white/10 flex items-center gap-1">
                      <ImagePlus size={10} />
                      {(item.images ?? []).length} fotos
                    </span>
                  </div>
                </div>

                {/* Project Details */}
                <div>
                  <h3 className="font-display font-semibold text-base text-white leading-snug line-clamp-1 group-hover:text-[#E5C158] transition-colors">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 font-mono-mm text-[11px] text-[#94A3B8]">
                    {item.client && (
                      <span className="truncate text-[#CBD5E1]">{item.client}</span>
                    )}
                    {item.client && item.year && <span>·</span>}
                    {item.year && <span>{item.year}</span>}
                  </div>
                  {item.description && (
                    <p className="font-display text-xs text-[#64748B] mt-1.5 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Controls and Actions */}
              <div className="flex flex-col gap-2 pt-3 mt-3 border-t border-[rgba(255,255,255,0.08)]">
                {/* Reorder and View Links */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => moveItem(item.id, -1)}
                      disabled={idx === 0}
                      className="h-8 w-8 flex items-center justify-center rounded-lg bg-[#161616] border border-[rgba(255,255,255,0.14)] text-[#CBD5E1] hover:text-[#E5C158] hover:border-[#C9A84C] disabled:opacity-25 transition-colors"
                      title="Mover para cima no site"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button
                      onClick={() => moveItem(item.id, 1)}
                      disabled={idx === items.length - 1}
                      className="h-8 w-8 flex items-center justify-center rounded-lg bg-[#161616] border border-[rgba(255,255,255,0.14)] text-[#CBD5E1] hover:text-[#E5C158] hover:border-[#C9A84C] disabled:opacity-25 transition-colors"
                      title="Mover para baixo no site"
                    >
                      <ChevronDown size={14} />
                    </button>
                  </div>

                  <a
                    href={`/portfolio/${item.slug || item.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 font-mono-mm text-[10px] text-[#94A3B8] hover:text-[#E5C158] transition-colors"
                    title="Abrir página pública do projeto"
                  >
                    <span>Ver no site</span>
                    <ExternalLink size={11} />
                  </a>
                </div>

                {/* Main Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/admin/portfolio/${item.id}`)}
                    className="flex-1 flex items-center justify-center gap-1.5 h-9 font-mono-mm text-[11px] font-semibold rounded-lg bg-[#161616] border border-[rgba(255,255,255,0.16)] text-[#F3F4F6] hover:border-[#C9A84C] hover:text-[#E5C158] transition-colors"
                  >
                    <Edit3 size={13} /> EDITAR
                  </button>
                  <button
                    onClick={() => handleDuplicate(item)}
                    className="flex items-center justify-center h-9 w-9 rounded-lg bg-[#161616] border border-[rgba(255,255,255,0.16)] text-[#CBD5E1] hover:border-[#C9A84C] hover:text-[#E5C158] transition-colors"
                    title="Duplicar projeto"
                  >
                    <Copy size={13} />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Excluir "${item.title}" do portfólio?`)) {
                        dispatch({ type: 'DELETE_PORTFOLIO', id: item.id })
                      }
                    }}
                    className="flex items-center justify-center h-9 w-9 rounded-lg bg-[#161616] border border-[rgba(255,255,255,0.16)] text-[#CBD5E1] hover:border-[#F87171] hover:text-[#F87171] transition-colors"
                    title="Excluir do portfólio"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* LIST VIEW — arrastar para reordenar */
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="rounded-2xl border border-[rgba(255,255,255,0.12)] bg-[#111111] overflow-hidden">
            <div className="hidden sm:flex items-center gap-4 px-4 py-3 border-b border-[rgba(255,255,255,0.1)] font-mono-mm text-[10px] text-[#94A3B8] uppercase">
              <span className="w-6" />
              <span className="w-14">Capa</span>
              <span className="flex-1">Título & Cliente</span>
              <span className="w-28">Categoria</span>
              <span className="w-20">Tipo</span>
              <span className="w-20">Destaque</span>
              <span className="w-28 text-right">Ações</span>
            </div>
            <Droppable droppableId="portfolio-list">
              {provided => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="divide-y divide-[rgba(255,255,255,0.06)] font-display text-sm">
                  {items.map((item, idx) => (
                    <Draggable key={item.id} draggableId={item.id} index={idx}>
                      {(dragProvided, dragSnapshot) => (
                        <div
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          className="flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-4 px-4 py-3 hover:bg-white/[0.02] transition-colors"
                          style={{
                            ...dragProvided.draggableProps.style,
                            background: dragSnapshot.isDragging ? '#1A1A1A' : undefined,
                          }}
                        >
                          <button
                            {...dragProvided.dragHandleProps}
                            className="w-6 shrink-0 flex items-center justify-center text-[#64748B] hover:text-[#E5C158] cursor-grab active:cursor-grabbing"
                            aria-label="Arrastar para reordenar"
                          >
                            <GripVertical size={15} />
                          </button>

                          <div className="w-14 h-10 shrink-0 rounded-lg overflow-hidden relative bg-[#161616] border border-white/10">
                            {item.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <SiteImage imageKey={item.imageKey} alt="" fill className="object-cover" sizes="60px" />
                            )}
                          </div>

                          <div className="flex-1 min-w-[140px]">
                            <p className="font-semibold text-white leading-tight">{item.title}</p>
                            <p className="font-mono-mm text-[11px] text-[#94A3B8] mt-0.5">
                              {item.client || 'Sem cliente'} {item.year && `· ${item.year}`}
                            </p>
                          </div>

                          <div className="w-28 shrink-0">
                            <span className="font-mono-mm text-[10px] px-2 py-0.5 rounded bg-black/60 border border-[rgba(201,168,76,0.3)] text-[#E5C158]">
                              {item.category}
                            </span>
                          </div>

                          <div className="w-20 shrink-0">
                            {item.isVideo ? (
                              <span className="font-mono-mm text-[10px] text-[#E5C158] font-bold flex items-center gap-1">
                                <Play size={10} fill="currentColor" /> VÍDEO
                              </span>
                            ) : (
                              <span className="font-mono-mm text-[10px] text-[#94A3B8] flex items-center gap-1">
                                <ImageIcon size={10} /> FOTO
                              </span>
                            )}
                          </div>

                          <div className="w-20 shrink-0">
                            {item.featured ? (
                              <span className="font-mono-mm text-[10px] text-yellow-400 flex items-center gap-1 font-bold">
                                <Star size={11} fill="currentColor" /> SIM
                              </span>
                            ) : (
                              <span className="font-mono-mm text-[10px] text-[#64748B]">NÃO</span>
                            )}
                          </div>

                          <div className="w-28 shrink-0 flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => router.push(`/admin/portfolio/${item.id}`)}
                              className="p-2 rounded-lg bg-[#161616] border border-white/10 text-white hover:text-[#E5C158] hover:border-[#C9A84C]"
                              title="Editar"
                            >
                              <Edit3 size={13} />
                            </button>
                            <button
                              onClick={() => handleDuplicate(item)}
                              className="p-2 rounded-lg bg-[#161616] border border-white/10 text-[#CBD5E1] hover:text-[#E5C158] hover:border-[#C9A84C]"
                              title="Duplicar"
                            >
                              <Copy size={13} />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Excluir "${item.title}"?`)) {
                                  dispatch({ type: 'DELETE_PORTFOLIO', id: item.id })
                                }
                              }}
                              className="p-2 rounded-lg bg-[#161616] border border-white/10 text-[#CBD5E1] hover:text-red-400 hover:border-red-400"
                              title="Excluir"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        </DragDropContext>
      )}
    </div>
  )
}
