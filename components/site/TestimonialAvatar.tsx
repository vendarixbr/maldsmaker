'use client'

import { SiteImage } from '@/components/site/SiteImage'
import { isSiteImageKey } from '@/lib/site-images'

function initials(name: string): string {
  const letters = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('')
  return letters || '?'
}

interface TestimonialAvatarProps {
  imageUrl?: string
  imageKey?: string
  name: string
  sizePx?: number
}

/** Foto real do cliente (upload) > slot de imagem do site > iniciais do nome. */
export function TestimonialAvatar({ imageUrl, imageKey, name, sizePx = 44 }: TestimonialAvatarProps) {
  if (imageUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={imageUrl} alt={name} className="absolute inset-0 w-full h-full object-cover" />
  }

  if (imageKey && isSiteImageKey(imageKey)) {
    return <SiteImage imageKey={imageKey} alt={name} fill className="object-cover" sizes={`${sizePx}px`} />
  }

  return (
    <div
      className="absolute inset-0 w-full h-full flex items-center justify-center font-display font-bold"
      style={{ background: 'rgba(201,168,76,0.18)', color: '#E5C158', fontSize: sizePx * 0.38 }}
    >
      {initials(name)}
    </div>
  )
}
