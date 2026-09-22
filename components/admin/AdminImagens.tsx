'use client'

import { useRef, useState } from 'react'
import { Upload, RotateCcw, AlertCircle, Image as ImageIcon, Users, ArrowRight, Camera } from 'lucide-react'
import { SiteImage } from '@/components/site/SiteImage'
import { useSiteImageOverrides } from '@/lib/site-image-context'
import { MAX_SITE_IMAGE_BYTES } from '@/lib/site-images'
import { useAdmin } from '@/lib/admin-context'
import { ConfirmDialog } from '@/components/admin/admin-ui'

/** Imagens verdadeiramente globais do site — o resto (fotos de portfólio e de depoimentos) tem tela própria. */
const GENERAL_SLOTS = [
  { key: 'logo', label: 'Logotipo', description: 'Aparece no cabeçalho e no rodapé do site.' },
  { key: 'leonardo-claquete', label: 'Foto do Diretor Criativo', description: 'Usada na seção "Nossa Essência", sobre a Malds Maker.' },
  { key: 'nauta-studio', label: 'Nauta Estúdio — Foto Principal', description: 'Foto de destaque da seção "Nauta Estúdio".' },
]

function formatMaxSize() {
  return `${Math.round(MAX_SITE_IMAGE_BYTES / (1024 * 1024))}MB`
}

function ImageSlotCard({ slotKey, label, description }: { slotKey: string; label: string; description?: string }) {
  const { overrides, setOverride, clearOverride } = useSiteImageOverrides()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [confirmReset, setConfirmReset] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const hasOverride = Boolean(overrides[slotKey])

  const handlePick = () => inputRef.current?.click()

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setError('')

    if (!file.type.startsWith('image/')) {
      setError('Envie um arquivo de imagem.')
      return
    }
    if (file.size > MAX_SITE_IMAGE_BYTES) {
      setError(`A imagem deve ter até ${formatMaxSize()}.`)
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('key', slotKey)
      formData.append('file', file)

      const response = await fetch('/api/admin/images', { method: 'POST', body: formData })
      const payload = await response.json() as { key?: string; url?: string; error?: string }

      if (!response.ok || !payload.url) {
        throw new Error(payload.error || 'Falha ao enviar imagem')
      }

      setOverride(slotKey, payload.url)
    } catch (err) {
      console.error(err)
      setError('Não foi possível enviar a imagem. Tente novamente.')
    } finally {
      setUploading(false)
    }
  }

  const handleReset = async () => {
    setConfirmReset(false)
    setError('')
    try {
      const response = await fetch(`/api/admin/images?key=${encodeURIComponent(slotKey)}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Falha ao restaurar imagem')
      clearOverride(slotKey)
    } catch (err) {
      console.error(err)
      setError('Não foi possível restaurar a imagem padrão.')
    }
  }

  return (
    <div className="flex flex-col gap-3 p-4 bg-[#111111] border border-[rgba(255,255,255,0.14)] rounded-xl">
      <div
        className="relative w-full overflow-hidden rounded-lg bg-[#161616]"
        style={{ aspectRatio: '4/3' }}
      >
        <SiteImage
          imageKey={slotKey}
          alt={label}
          fill
          className="object-cover"
          sizes="280px"
        />
        {uploading && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.6)' }}
          >
            <span
              className="w-6 h-6 border-2 rounded-full animate-spin"
              style={{ borderColor: 'rgba(201,168,76,0.3)', borderTopColor: '#C9A84C' }}
            />
          </div>
        )}
        {hasOverride && (
          <span
            className="absolute top-2 right-2 font-mono-mm text-[9px] px-2 py-0.5 rounded font-bold"
            style={{ background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.4)', color: '#4ADE80' }}
          >
            PERSONALIZADA
          </span>
        )}
      </div>

      <div>
        <p className="font-display font-semibold text-sm text-[#FFFFFF] leading-snug">{label}</p>
        {description && (
          <p className="font-mono-mm text-[10px] text-[#94A3B8] mt-1 leading-relaxed">{description}</p>
        )}
      </div>

      {error && (
        <p className="flex items-center gap-1.5 font-mono-mm text-[10px] tracking-[0.06em] text-[#F87171]">
          <AlertCircle size={12} />
          {error}
        </p>
      )}

      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFile}
        />
        <button
          onClick={handlePick}
          disabled={uploading}
          className="flex-1 flex items-center justify-center gap-2 h-10 px-3 font-mono-mm text-xs tracking-[0.08em] font-semibold bg-[#161616] border border-[rgba(255,255,255,0.16)] hover:border-[#C9A84C] text-[#F3F4F6] hover:text-[#E5C158] transition-all rounded-lg disabled:opacity-50"
        >
          <Upload size={14} />
          TROCAR
        </button>
        {hasOverride && (
          <button
            onClick={() => setConfirmReset(true)}
            disabled={uploading}
            aria-label="Restaurar imagem padrão"
            className="flex items-center justify-center h-10 w-10 shrink-0 font-mono-mm text-xs bg-[#161616] border border-[rgba(255,255,255,0.16)] hover:border-[#F87171] text-[#CBD5E1] hover:text-[#F87171] transition-all rounded-lg disabled:opacity-50"
          >
            <RotateCcw size={14} />
          </button>
        )}
      </div>

      {confirmReset && (
        <ConfirmDialog
          message={`Restaurar "${label}" para a imagem padrão? A foto enviada será removida.`}
          onConfirm={handleReset}
          onCancel={() => setConfirmReset(false)}
        />
      )}
    </div>
  )
}

export function AdminImagens() {
  const { setActiveSection } = useAdmin()

  return (
    <div className="flex flex-col gap-8 max-w-5xl">
      <div>
        <h1 className="font-display font-semibold text-2xl text-[#FFFFFF]">Imagens do Site</h1>
        <p className="font-mono-mm text-xs tracking-[0.08em] mt-1 font-semibold text-[#E5C158]">
          MALDS MAKER ADMIN
        </p>
        <p className="font-display text-sm mt-2 text-[#CBD5E1]" style={{ lineHeight: 1.6 }}>
          Aqui ficam só as imagens gerais do site — as que não pertencem a um projeto ou depoimento específico.
          A mudança aparece no site assim que o upload terminar.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="font-mono-mm text-[11px] tracking-[0.14em] font-semibold text-[#E5C158] flex items-center gap-2">
          <ImageIcon size={13} /> IMAGENS GERAIS
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {GENERAL_SLOTS.map(slot => (
            <ImageSlotCard key={slot.key} slotKey={slot.key} label={slot.label} description={slot.description} />
          ))}
        </div>
      </div>

      <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-4 bg-[#111111] border border-[rgba(255,255,255,0.12)] rounded-xl">
        <div className="flex-1">
          <p className="font-display font-semibold text-sm text-white">
            Procurando a foto de um projeto ou de um depoimento?
          </p>
          <p className="font-mono-mm text-[10px] text-[#94A3B8] mt-1 leading-relaxed">
            Fotos de capa/galeria do portfólio e fotos de clientes nos depoimentos são enviadas direto na página de cada item, para ficar sempre claro qual foto pertence a qual projeto ou pessoa.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => setActiveSection('portfolio')}
            className="flex items-center gap-2 h-10 px-4 font-mono-mm text-[11px] font-semibold rounded-lg text-[#F3F4F6] hover:border-[#C9A84C] hover:text-[#E5C158] transition-colors"
            style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.16)' }}
          >
            <Camera size={14} />
            PORTFÓLIO
            <ArrowRight size={13} />
          </button>
          <button
            onClick={() => setActiveSection('depoimentos')}
            className="flex items-center gap-2 h-10 px-4 font-mono-mm text-[11px] font-semibold rounded-lg text-[#F3F4F6] hover:border-[#C9A84C] hover:text-[#E5C158] transition-colors"
            style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.16)' }}
          >
            <Users size={14} />
            DEPOIMENTOS
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}
