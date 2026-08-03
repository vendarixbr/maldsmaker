'use client'

import Image, { type ImageProps } from 'next/image'
import { useSiteImageOverrides } from '@/lib/site-image-context'
import { getFallbackSrc } from '@/lib/site-images'

type SiteImageProps = Omit<ImageProps, 'src'> & { imageKey: string }

export function SiteImage({ imageKey, ...imgProps }: SiteImageProps) {
  const { overrides } = useSiteImageOverrides()
  const src = overrides[imageKey] ?? getFallbackSrc(imageKey) ?? ''

  return <Image src={src} {...imgProps} />
}
