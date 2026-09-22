import { S3Client } from '@aws-sdk/client-s3'

function pickEnv(...names: string[]): string | undefined {
  for (const name of names) {
    const value = process.env[name]
    if (value !== undefined && value !== '') return value
  }
  return undefined
}

function sanitizeEndpoint(raw: string | undefined): string | undefined {
  if (!raw) return undefined
  const trimmed = raw.trim().replace(/\/+$/, '')
  if (!trimmed) return undefined
  // O .env antigo vinha com o bucket no fim do endpoint
  // (ex: https://<account>.r2.cloudflarestorage.com/malds).
  // Endpoint S3/R2 deve ser só o origin, sem path do bucket.
  try {
    const url = new URL(trimmed)
    if (url.pathname && url.pathname !== '/') {
      return url.origin
    }
    return trimmed
  } catch {
    return trimmed
  }
}

const rawEndpoint = pickEnv('AWS_ENDPOINT', 'S3_ENDPOINT')
const endpoint = sanitizeEndpoint(rawEndpoint)

const region = pickEnv('AWS_REGION', 'S3_REGION') || 'auto'
const forcePathStyle =
  pickEnv('AWS_S3_FORCE_PATH_STYLE', 'S3_FORCE_PATH_STYLE') === 'true'

const accessKeyId = pickEnv('AWS_ACCESS_KEY_ID', 'S3_ACCESS_KEY_ID') ?? ''
const secretAccessKey =
  pickEnv('AWS_SECRET_ACCESS_KEY', 'S3_SECRET_ACCESS_KEY') ?? ''

const globalForS3 = globalThis as unknown as { s3?: S3Client }

export const s3 =
  globalForS3.s3 ??
  new S3Client({
    endpoint,
    region,
    forcePathStyle,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  })

if (process.env.NODE_ENV !== 'production') globalForS3.s3 = s3

export const S3_BUCKET = pickEnv('AWS_S3_BUCKET', 'S3_BUCKET') ?? ''

const PUBLIC_URL_BASE = (pickEnv('AWS_S3_PUBLIC_URL', 'S3_PUBLIC_URL') ?? '').replace(/\/$/, '')

export const SITE_IMAGE_PREFIX = 'site-images/'

export const PROJECT_IMAGE_PREFIX = 'projects/'

export const PORTFOLIO_IMAGE_PREFIX = 'portfolio/'

export const TESTIMONIAL_IMAGE_PREFIX = 'testimonials/'

export function portfolioImageObjectKey(itemId: string, filename: string): string {
  const safeItem = itemId.replace(/[^a-zA-Z0-9-_]/g, '_').slice(0, 80) || 'sem-id'
  const safeFile = filename.replace(/[^a-zA-Z0-9-_.]/g, '_').slice(0, 120) || 'imagem'
  return `${PORTFOLIO_IMAGE_PREFIX}${safeItem}/${safeFile}`
}

export function portfolioImagePublicUrl(objectKey: string): string {
  return `${PUBLIC_URL_BASE}/${objectKey}`
}

export function projectImageObjectKey(projectId: string, filename: string): string {
  const safeProject = projectId.replace(/[^a-zA-Z0-9-_]/g, '_').slice(0, 80) || 'sem-id'
  const safeFile = filename.replace(/[^a-zA-Z0-9-_.]/g, '_').slice(0, 120) || 'imagem'
  return `${PROJECT_IMAGE_PREFIX}${safeProject}/${safeFile}`
}

export function projectImagePublicUrl(objectKey: string): string {
  return `${PUBLIC_URL_BASE}/${objectKey}`
}

export function testimonialImageObjectKey(itemId: string, filename: string): string {
  const safeItem = itemId.replace(/[^a-zA-Z0-9-_]/g, '_').slice(0, 80) || 'sem-id'
  const safeFile = filename.replace(/[^a-zA-Z0-9-_.]/g, '_').slice(0, 120) || 'imagem'
  return `${TESTIMONIAL_IMAGE_PREFIX}${safeItem}/${safeFile}`
}

export function testimonialImagePublicUrl(objectKey: string): string {
  return `${PUBLIC_URL_BASE}/${objectKey}`
}

/** Extrai a object key (`projects/...`) de uma URL pública do bucket. */
export function projectKeyFromPublicUrl(url: string): string | null {
  const marker = `${PROJECT_IMAGE_PREFIX}`
  const idx = url.indexOf(marker)
  if (idx === -1) return null
  const key = url.slice(idx).split('?')[0]
  if (!key.startsWith(marker) || key.includes('..')) return null
  return key
}

export function isS3Configured(): boolean {
  return Boolean(S3_BUCKET && accessKeyId && secretAccessKey && endpoint && PUBLIC_URL_BASE)
}

export function getS3ConfigStatus(): { configured: boolean; missing: string[] } {
  const missing: string[] = []
  if (!S3_BUCKET) missing.push('AWS_S3_BUCKET')
  if (!accessKeyId) missing.push('AWS_ACCESS_KEY_ID')
  if (!secretAccessKey) missing.push('AWS_SECRET_ACCESS_KEY')
  if (!endpoint) missing.push('AWS_ENDPOINT')
  if (!PUBLIC_URL_BASE) missing.push('AWS_S3_PUBLIC_URL')
  return { configured: missing.length === 0, missing }
}

export function siteImageObjectKey(slotKey: string): string {
  return `${SITE_IMAGE_PREFIX}${slotKey}`
}

export function siteImagePublicUrl(slotKey: string, version: number): string {
  return `${PUBLIC_URL_BASE}/${siteImageObjectKey(slotKey)}?v=${version}`
}
