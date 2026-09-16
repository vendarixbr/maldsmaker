import { NextResponse } from 'next/server'
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import {
  s3,
  S3_BUCKET,
  PORTFOLIO_IMAGE_PREFIX,
  portfolioImageObjectKey,
  portfolioImagePublicUrl,
  getS3ConfigStatus,
} from '@/lib/s3'
import { MAX_PORTFOLIO_IMAGE_BYTES } from '@/lib/data'
import { optimizeImage } from '@/lib/image'

export const dynamic = 'force-dynamic'

const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
}

function s3NotConfiguredResponse() {
  const { missing } = getS3ConfigStatus()
  console.error('S3 não configurado. Variáveis ausentes:', missing.join(', '))
  return NextResponse.json(
    { error: `Storage S3 não configurado. Verifique: ${missing.join(', ')}` },
    { status: 500 }
  )
}

function isValidItemId(id: string): boolean {
  return /^[a-zA-Z0-9-_]{1,80}$/.test(id)
}

/**
 * POST — upload de imagem do portfólio (capa ou galeria).
 * FormData: itemId, file. Retorna { id, url, key }.
 */
export async function POST(request: Request) {
  const { configured } = getS3ConfigStatus()
  if (!configured) return s3NotConfiguredResponse()

  try {
    const formData = await request.formData()
    const itemId = formData.get('itemId')
    const file = formData.get('file')

    if (typeof itemId !== 'string' || !isValidItemId(itemId)) {
      return NextResponse.json({ error: 'ID do item inválido.' }, { status: 400 })
    }

    if (!(file instanceof File) || !file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Envie um arquivo de imagem válido.' }, { status: 400 })
    }

    if (file.size > MAX_PORTFOLIO_IMAGE_BYTES) {
      return NextResponse.json({ error: 'A imagem deve ter até 8MB.' }, { status: 413 })
    }

    const ext = EXT_BY_MIME[file.type] ?? 'jpg'
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
    const objectKey = portfolioImageObjectKey(itemId, filename)

    const bytes = Buffer.from(await file.arrayBuffer())
    const optimized = await optimizeImage(bytes, file.type)
    await s3.send(new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: objectKey,
      Body: optimized.data,
      ContentType: optimized.contentType,
      CacheControl: 'public, max-age=31536000, immutable',
    }))

    return NextResponse.json({
      id: `img-${Date.now()}`,
      url: portfolioImagePublicUrl(objectKey),
      key: objectKey,
    })
  } catch (error) {
    console.error('Failed to upload portfolio image', error)
    return NextResponse.json({ error: 'Não foi possível enviar a imagem.' }, { status: 500 })
  }
}

/**
 * DELETE — remove imagem do portfólio.
 * Query: ?itemId=<id>&key=portfolio/<id>/arquivo.jpg
 */
export async function DELETE(request: Request) {
  const { configured } = getS3ConfigStatus()
  if (!configured) return s3NotConfiguredResponse()

  try {
    const params = new URL(request.url).searchParams
    const itemId = params.get('itemId') ?? ''
    const key = params.get('key') ?? ''

    if (!isValidItemId(itemId)) {
      return NextResponse.json({ error: 'ID do item inválido.' }, { status: 400 })
    }

    const expectedPrefix = `${PORTFOLIO_IMAGE_PREFIX}${itemId}/`
    if (!key.startsWith(expectedPrefix) || key.includes('..')) {
      return NextResponse.json({ error: 'Chave de imagem inválida.' }, { status: 400 })
    }

    await s3.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: key }))

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Failed to delete portfolio image', error)
    return NextResponse.json({ error: 'Não foi possível excluir a imagem.' }, { status: 500 })
  }
}
