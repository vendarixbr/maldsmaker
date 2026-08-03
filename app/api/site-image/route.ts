import { NextResponse } from 'next/server'
import { ListObjectsV2Command } from '@aws-sdk/client-s3'
import { s3, S3_BUCKET, SITE_IMAGE_PREFIX, siteImagePublicUrl } from '@/lib/s3'

export const dynamic = 'force-dynamic'

export async function GET() {
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
    return NextResponse.json({}, { status: 500 })
  }
}
