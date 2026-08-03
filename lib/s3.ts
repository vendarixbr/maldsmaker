import { S3Client } from '@aws-sdk/client-s3'

const globalForS3 = globalThis as unknown as { s3?: S3Client }

export const s3 =
  globalForS3.s3 ??
  new S3Client({
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION || 'auto',
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID ?? '',
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? '',
    },
  })

if (process.env.NODE_ENV !== 'production') globalForS3.s3 = s3

export const S3_BUCKET = process.env.S3_BUCKET ?? ''

const PUBLIC_URL_BASE = (process.env.S3_PUBLIC_URL ?? '').replace(/\/$/, '')

export const SITE_IMAGE_PREFIX = 'site-images/'

export function siteImageObjectKey(slotKey: string): string {
  return `${SITE_IMAGE_PREFIX}${slotKey}`
}

export function siteImagePublicUrl(slotKey: string, version: number): string {
  return `${PUBLIC_URL_BASE}/${siteImageObjectKey(slotKey)}?v=${version}`
}
