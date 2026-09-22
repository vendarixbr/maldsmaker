/**
 * Utilitário para detecção e formatação de URLs de vídeo (YouTube, Vimeo, MP4 direto).
 */

export interface VideoEmbedInfo {
  type: 'youtube' | 'vimeo' | 'direct' | 'unknown'
  embedUrl: string | null
  directUrl: string | null
  videoId: string | null
}

export function parseVideoUrl(rawUrl?: string | null): VideoEmbedInfo {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { type: 'unknown', embedUrl: null, directUrl: null, videoId: null }
  }

  const url = rawUrl.trim()

  // 1. YouTube (youtube.com/watch?v=..., youtu.be/..., youtube.com/shorts/..., youtube.com/embed/...)
  const ytMatch =
    url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1]
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`,
      directUrl: url,
      videoId,
    }
  }

  // 2. Vimeo (vimeo.com/123456789)
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?([0-9]+)/)
  if (vimeoMatch && vimeoMatch[1]) {
    const videoId = vimeoMatch[1]
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${videoId}?autoplay=1&title=0&byline=0&portrait=0`,
      directUrl: url,
      videoId,
    }
  }

  // 3. Arquivo de vídeo direto (.mp4, .webm, .mov)
  if (/\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(url)) {
    return {
      type: 'direct',
      embedUrl: null,
      directUrl: url,
      videoId: null,
    }
  }

  // Se começar com http(s), tenta como direct fallback se aplicável
  if (/^https?:\/\//i.test(url)) {
    return {
      type: 'unknown',
      embedUrl: null,
      directUrl: url,
      videoId: null,
    }
  }

  return { type: 'unknown', embedUrl: null, directUrl: null, videoId: null }
}
