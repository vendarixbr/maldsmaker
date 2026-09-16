import sharp from 'sharp'

const MAX_DIMENSION = 1920

export interface OptimizedImage {
  data: Buffer
  contentType: string
}

/**
 * Otimiza a imagem para web: corrige rotação EXIF, limita a maior
 * dimensão a 1920px e recomprime. GIFs passam intactos (preserva animação).
 */
export async function optimizeImage(input: Buffer, mime: string): Promise<OptimizedImage> {
  if (mime === 'image/gif') {
    return { data: input, contentType: mime }
  }

  try {
    let pipeline = sharp(input, { animated: false }).rotate()

    const meta = await pipeline.metadata()
    if ((meta.width ?? 0) > MAX_DIMENSION || (meta.height ?? 0) > MAX_DIMENSION) {
      pipeline = pipeline.resize({
        width: MAX_DIMENSION,
        height: MAX_DIMENSION,
        fit: 'inside',
        withoutEnlargement: true,
      })
    }

    if (mime === 'image/jpeg') {
      return { data: await pipeline.jpeg({ quality: 82, mozjpeg: true }).toBuffer(), contentType: mime }
    }
    if (mime === 'image/png') {
      return { data: await pipeline.png({ compressionLevel: 9 }).toBuffer(), contentType: mime }
    }
    if (mime === 'image/webp') {
      return { data: await pipeline.webp({ quality: 82 }).toBuffer(), contentType: mime }
    }
    if (mime === 'image/avif') {
      return { data: await pipeline.avif({ quality: 70 }).toBuffer(), contentType: mime }
    }
    return { data: await pipeline.toBuffer(), contentType: mime }
  } catch (error) {
    console.warn('Otimização de imagem falhou, enviando original.', error)
    return { data: input, contentType: mime }
  }
}
