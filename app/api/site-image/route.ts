import { NextResponse } from 'next/server'
import { ListObjectsV2Command } from '@aws-sdk/client-s3'
import { s3, S3_BUCKET, SITE_IMAGE_PREFIX, siteImagePublicUrl, getS3ConfigStatus } from '@/lib/s3'

export const dynamic = 'force-dynamic'

export async function GET() {
  const { configured, missing } = getS3ConfigStatus()
  if (!configured) {
    console.warn('S3 não configurado, retornando manifesto vazio. Ausentes:', missing.join(', '))
    return NextResponse.json({})
  }

  try {
    const result = await s3.send(new ListObjectsV2Command({
      Bucket: S3_BUCKET,
      Prefix: SITE_IMAGE_PREFIX,
    }))

    const manifest: Record<string, string> = {}
    for (const obj of result.Contents ?? []) {
      if (!obj.Key || !obj.LastModified) continue
      const slotKey = obj.Key.slice(SITE_IMAGE_PREFIX.length)
      if (!slotKey) continue
      manifest[slotKey] = siteImagePublicUrl(slotKey, obj.LastModified.getTime())
    }

    return NextResponse.json(manifest)
  } catch (error) {
    console.error('Failed to load site image manifest', error)
    // Retorna {} em vez de 500 para o site continuar usando as imagens fallback
    return NextResponse.json({})
  }
}
