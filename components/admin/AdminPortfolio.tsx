'use client'

import { useCallback, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd'
import { useAdmin } from '@/lib/admin-context'
import type { PortfolioItem } from '@/lib/data'
import { SiteImage } from '@/components/site/SiteImage'
import { ConfirmDialog } from '@/components/admin/admin-ui'
import { PortfolioQuickEdit } from '@/components/admin/PortfolioQuickEdit'
import { uniqueSlug } from '@/lib/slug'
import {
  Copy,
  ExternalLink,
  GripVertical,
  Image as ImageIcon,
  LayoutGrid,
  List,
  Pencil,
  Play,
  Plus,
  Search,
  Star,
  Trash2,
  X,
} from 'lucide-react'

const iconBtn =
  'h-8 w-8 flex items-center justify-center rounded-lg bg-black/70 backdrop-blur border border-white/15 text-[#E2E8F0] transition-colors'

function Cover({ item, sizes }: { item: PortfolioItem; sizes: string }) {
  if (item.imageUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={item.imageUrl} alt={item.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
  }
  return <SiteImage imageKey={item.imageKey} alt={item.title} fill className="object-cover" sizes={sizes} />
}

export function AdminPortfolio() {
  const { state, dispatch } = useAdmin()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [toDelete, setToDelete] = useState<PortfolioItem | null>(null)

  // Filtros vivem na URL: ?section=portfolio&q=...&cat=...&view=list
  const q = searchParams.get('q') ?? ''
  const cat = searchParams.get('cat') ?? ''
  const view = searchParams.get('view') === 'list' ? 'list' : 'grid'

  const setParam = useCallback(
    (key: 'q' | 'cat' | 'view', value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) params.set(key, value)
      else params.delete(key)
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [router, pathname, searchParams],
  )

  // O editor rápido vive na URL: ?section=portfolio&edit=novo | &edit=<id>
  const editParam = searchParams.get('edit')

  const setEdit = useCallback(
    (value: string | null) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) params.set('edit', value)
      else params.delete('edit')
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [router, pathname, searchParams],
  )

  const closeEditor = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('edit')
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }, [router, pathname, searchParams])

  const ordered = useMemo(
    () => [...(state.portfolio ?? [])].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    [state.portfolio],
  )

  const editing = editParam && editParam !== 'novo' ? ordered.find(p => p.id === editParam) ?? null : null
  const editorOpen = editParam === 'novo' || Boolean(editing)

  const toggleFeatured = (item: PortfolioItem) =>
    void dispatch({ type: 'UPDATE_PORTFOLIO', payload: { ...item, featured: !item.featured } })

  const categories = useMemo(() => {
    const counts = new Map<string, number>()
    for (const p of ordered) counts.set(p.category, (counts.get(p.category) ?? 0) + 1)
    return Array.from(counts.entries())
  }, [ordered])

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    return ordered.filter(p => {
      if (cat && p.category !== cat) return false
      if (!term) return true
      return [p.title, p.client, p.category, p.year].some(v => (v ?? '').toLowerCase().includes(term))
    })
  }, [ordered, q, cat])

  const isFiltering = Boolean(q.trim() || cat)

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || isFiltering) return
    const { index: from } = result.source
    const { index: to } = result.destination
    if (from === to) return
    const ids = ordered.map(p => p.id)
    const [moved] = ids.splice(from, 1)
    ids.splice(to, 0, moved)
    void dispatch({ type: 'REORDER_PORTFOLIO', ids })
  }

  const handleDuplicate = async (item: PortfolioItem) => {
    const id = `pf-${Date.now()}`
    const copy: PortfolioItem = {
      ...item,
      id,
      title: `${item.title} (cópia)`,
      slug: uniqueSlug(`${item.title} copia`, ordered.map(p => p.slug)),
      featured: false,
      sortOrder: ordered.length + 1,
    }
    if (await dispatch({ type: 'ADD_PORTFOLIO', payload: copy })) setEdit(id)
  }

  const confirmDelete = () => {
    if (toDelete) void dispatch({ type: 'DELETE_PORTFOLIO', id: toDelete.id })
    setToDelete(null)
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-semibold text-2xl sm:text-3xl text-white">Portfólio</h1>
          <p className="font-mono-mm text-xs tracking-[0.06em] mt-1 text-[#94A3B8]">
            {ordered.length} {ordered.length === 1 ? 'PROJETO' : 'PROJETOS'} · {ordered.filter(p => p.featured).length} EM DESTAQUE
          </p>
        </div>
        <button type="button" onClick={() => setEdit('novo')} className="flex items-center gap-2 h-11 px-5 font-mono-mm text-xs tracking-[0.08em] font-semibold rounded-lg shrink-0" style={{ background: '#C9A84C', color: '#080808' }}>
          <Plus size={16} />
          <span className="hidden sm:inline">NOVO PROJETO</span>
          <span className="sm:hidden">NOVO</span>
        </button>
      </div>

      {/* Barra de busca / filtros */}
      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <input
              value={q}
              onChange={e => setParam('q', e.target.value)}
              placeholder="Buscar por título, cliente, categoria ou ano"
              className="w-full h-11 pl-10 pr-10 font-display text-sm outline-none focus:border-[#C9A84C] rounded-lg bg-[#161616] border border-white/15 text-white"
            />
            {q && (
              <button
                onClick={() => setParam('q', '')}
                aria-label="Limpar busca"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-white"
              >
                <X size={15} />
              </button>
            )}
          </div>
          <div className="flex items-center rounded-lg bg-[#141414] border border-white/15 p-1 shrink-0">
            {([['grid', LayoutGrid, 'Grade'], ['list', List, 'Lista e ordem']] as const).map(([id, Icon, label]) => (
              <button
                key={id}
                onClick={() => setParam('view', id === 'grid' ? '' : id)}
                title={label}
                aria-label={label}
                aria-pressed={view === id}
                className="h-9 w-9 flex items-center justify-center rounded transition-colors"
                style={{ background: view === id ? '#C9A84C' : 'transparent', color: view === id ? '#080808' : '#94A3B8' }}
              >
                <Icon size={15} />
              </button>
            ))}
          </div>
        </div>

        {categories.length > 1 && (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {[['', 'TODOS', ordered.length] as const, ...categories.map(([c, n]) => [c, c, n] as const)].map(([value, label, n]) => {
              const active = cat === value
              return (
                <button
                  key={label}
                  onClick={() => setParam('cat', value)}
                  className="h-8 px-3 font-mono-mm text-[10px] tracking-[0.06em] font-semibold rounded-full shrink-0 transition-colors"
                  style={{
                    background: active ? 'rgba(201,168,76,0.2)' : '#111111',
                    color: active ? '#E5C158' : '#94A3B8',
                    border: `1px solid ${active ? 'rgba(201,168,76,0.6)' : 'rgba(255,255,255,0.12)'}`,
                  }}
                >
                  {label} · {n}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Conteúdo */}
      {filtered.length === 0 ? (
        <div className="py-16 px-4 text-center bg-[#111111] border border-white/10 rounded-2xl flex flex-col items-center gap-3">
          <p className="font-display font-semibold text-lg text-white">
            {ordered.length === 0 ? 'Seu portfólio está vazio' : 'Nenhum projeto encontrado'}
          </p>
          {isFiltering ? (
            <button
              onClick={() => router.replace(`${pathname}?section=portfolio`, { scroll: false })}
              className="font-mono-mm text-xs text-[#E5C158] hover:underline"
            >
              LIMPAR FILTROS
            </button>
          ) : (
            <button type="button" onClick={() => setEdit('novo')} className="flex items-center gap-2 h-10 px-5 font-mono-mm text-xs font-semibold rounded-lg" style={{ background: '#C9A84C', color: '#080808' }}>
              <Plus size={15} /> ADICIONAR O PRIMEIRO
            </button>
          )}
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(item => (
            <div
              key={item.id}
              className="group flex flex-col bg-[#111111] border border-white/10 hover:border-[rgba(201,168,76,0.45)] transition-colors rounded-2xl overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setEdit(item.id)}
                aria-label={`Editar ${item.title}`}
                className="relative block w-full bg-[#161616] overflow-hidden text-left"
                style={{ aspectRatio: '16/10' }}
              >
                <Cover item={item} sizes="340px" />
                <div className="absolute top-2 left-2 flex items-center gap-1.5">
                  <span className="font-mono-mm text-[9px] px-2 h-5 flex items-center rounded font-bold bg-black/75 text-[#E5C158] border border-[rgba(201,168,76,0.4)]">
                    {item.category}
                  </span>
                </div>
                <span className="absolute bottom-2 left-2 font-mono-mm text-[9px] px-2 h-5 flex items-center gap-1 rounded font-bold bg-black/75 text-[#E2E8F0] border border-white/15">
                  {item.isVideo ? <Play size={9} fill="currentColor" /> : <ImageIcon size={9} />}
                  {item.isVideo ? 'VÍDEO' : 'FOTO'}
                </span>
              </button>

              {/* Destaque fica sempre visível; as demais ações aparecem no hover (desktop) e sempre no toque */}
              <div className="relative">
                <button
                  onClick={() => toggleFeatured(item)}
                  title={item.featured ? 'Remover destaque da home' : 'Destacar na home'}
                  aria-label={item.featured ? 'Remover destaque da home' : 'Destacar na home'}
                  aria-pressed={Boolean(item.featured)}
                  className={`absolute -top-11 left-2 ${iconBtn} ${item.featured ? 'text-yellow-400 border-yellow-400/50' : 'hover:text-yellow-400'}`}
                >
                  <Star size={14} fill={item.featured ? 'currentColor' : 'none'} />
                </button>
                <div className="absolute -top-11 right-2 flex gap-1.5 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 transition-opacity">
                  <button onClick={() => setEdit(item.id)} title="Editar" aria-label="Editar" className={`${iconBtn} hover:text-[#E5C158]`}>
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => handleDuplicate(item)} title="Duplicar" aria-label="Duplicar" className={`${iconBtn} hover:text-[#E5C158]`}>
                    <Copy size={13} />
                  </button>
                  <button onClick={() => setToDelete(item)} title="Excluir" aria-label="Excluir" className={`${iconBtn} hover:text-[#F87171]`}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <div className="p-4 flex flex-col gap-1">
                <button type="button" onClick={() => setEdit(item.id)} className="text-left font-display font-semibold text-base text-white leading-snug line-clamp-1 hover:text-[#E5C158]">
                  {item.title}
                </button>
                <p className="font-mono-mm text-[11px] text-[#94A3B8] truncate">
                  {[item.client, item.year].filter(Boolean).join(' · ') || 'Sem cliente'}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {isFiltering && (
            <p className="font-mono-mm text-[11px] text-[#94A3B8]">Limpe a busca e os filtros para reordenar arrastando.</p>
          )}
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="portfolio-list" isDropDisabled={isFiltering}>
              {provided => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="rounded-2xl border border-white/10 bg-[#111111] overflow-hidden divide-y divide-white/[0.06]"
                >
                  {filtered.map((item, idx) => (
                    <Draggable key={item.id} draggableId={item.id} index={idx} isDragDisabled={isFiltering}>
                      {(drag, snap) => (
                        <div
                          ref={drag.innerRef}
                          {...drag.draggableProps}
                          className="flex items-center gap-3 px-3 sm:px-4 py-3"
                          style={{ ...drag.draggableProps.style, background: snap.isDragging ? '#1A1A1A' : '#111111' }}
                        >
                          <button
                            {...drag.dragHandleProps}
                            aria-label="Arrastar para reordenar"
                            className="w-6 shrink-0 flex justify-center text-[#64748B] hover:text-[#E5C158] disabled:opacity-30"
                            style={{ cursor: isFiltering ? 'not-allowed' : 'grab' }}
                          >
                            <GripVertical size={16} />
                          </button>
                          <button type="button" onClick={() => setEdit(item.id)} aria-label={`Editar ${item.title}`} className="relative w-16 h-11 shrink-0 rounded-lg overflow-hidden bg-[#161616] border border-white/10">
                            <Cover item={item} sizes="64px" />
                          </button>
                          <button type="button" onClick={() => setEdit(item.id)} className="flex-1 min-w-0 text-left">
                            <p className="font-display font-semibold text-sm text-white truncate flex items-center gap-1.5">
                              {item.title}
                              {item.featured && <Star size={11} className="text-yellow-400 shrink-0" fill="currentColor" />}
                            </p>
                            <p className="font-mono-mm text-[11px] text-[#94A3B8] truncate">
                              {[item.category, item.client, item.year].filter(Boolean).join(' · ')}
                            </p>
                          </button>
                          <span className="hidden sm:flex items-center gap-1 font-mono-mm text-[10px] text-[#94A3B8] w-16 shrink-0">
                            {item.isVideo ? <Play size={10} fill="currentColor" /> : <ImageIcon size={10} />}
                            {item.isVideo ? 'VÍDEO' : 'FOTO'}
                          </span>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => toggleFeatured(item)}
                              title={item.featured ? 'Remover destaque da home' : 'Destacar na home'}
                              aria-label={item.featured ? 'Remover destaque da home' : 'Destacar na home'}
                              aria-pressed={Boolean(item.featured)}
                              className={`${iconBtn} ${item.featured ? 'text-yellow-400 border-yellow-400/50' : 'hover:text-yellow-400'}`}
                            >
                              <Star size={13} fill={item.featured ? 'currentColor' : 'none'} />
                            </button>
                            <button type="button" onClick={() => setEdit(item.id)} title="Editar" aria-label="Editar" className={`${iconBtn} hover:text-[#E5C158]`}>
                              <Pencil size={13} />
                            </button>
                            <a
                              href={`/portfolio/${item.slug || item.id}`}
                              target="_blank"
                              rel="noreferrer"
                              title="Ver no site"
                              aria-label="Ver no site"
                              className={`hidden sm:flex ${iconBtn} hover:text-[#E5C158]`}
                            >
                              <ExternalLink size={13} />
                            </a>
                            <button onClick={() => handleDuplicate(item)} title="Duplicar" aria-label="Duplicar" className={`hidden sm:flex ${iconBtn} hover:text-[#E5C158]`}>
                              <Copy size={13} />
                            </button>
                            <button onClick={() => setToDelete(item)} title="Excluir" aria-label="Excluir" className={`${iconBtn} hover:text-[#F87171]`}>
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
          </DragDropContext>
        </div>
      )}

      {editorOpen && <PortfolioQuickEdit key={editParam} initial={editing} onClose={closeEditor} />}

      {toDelete && (
        <ConfirmDialog
          message={`Excluir "${toDelete.title}" do portfólio? Esta ação não pode ser desfeita.`}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  )
}
