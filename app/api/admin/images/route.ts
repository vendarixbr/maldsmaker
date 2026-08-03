import { NextResponse } from 'next/server'
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { s3, S3_BUCKET, siteImageObjectKey, siteImagePublicUrl } from '@/lib/s3'
import { isSiteImageKey, MAX_SITE_IMAGE_BYTES } from '@/lib/site-images'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const key = formData.get('key')
    const file = formData.get('file')

    if (typeof key !== 'string' || !isSiteImageKey(key)) {
      return NextResponse.json({ error: 'Chave de imagem inválida.' }, { status: 400 })
    }

    if (!(file instanceof File) || !file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Envie um arquivo de imagem válido.' }, { status: 400 })
    }

    if (file.size > MAX_SITE_IMAGE_BYTES) {
      return NextResponse.json({ error: 'A imagem deve ter até 5MB.' }, { status: 413 })
    }

    const bytes = Buffer.from(await file.arrayBuffer())
    const updatedAt = Date.now()

    await s3.send(new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: siteImageObjectKey(key),
      Body: bytes,
      ContentType: file.type,
    }))

    return NextResponse.json({ key, url: siteImagePublicUrl(key, updatedAt) })
  } catch (error) {
    console.error('Failed to upload site image', error)
    return NextResponse.json({ error: 'Não foi possível enviar a imagem.' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const key = new URL(request.url).searchParams.get('key')

    if (!key || !isSiteImageKey(key)) {
      return NextResponse.json({ error: 'Chave de imagem inválida.' }, { status: 400 })
    }

    await s3.send(new DeleteObjectCommand({
      Bucket: S3_BUCKET,
      Key: siteImageObjectKey(key),
    }))

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Failed to reset site image', error)
    return NextResponse.json({ error: 'Não foi possível restaurar a imagem.' }, { status: 500 })
  }
}
