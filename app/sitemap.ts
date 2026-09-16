import type { MetadataRoute } from 'next'
import { getPublicPortfolio } from '@/lib/admin-db'
import { getSiteUrl } from '@/lib/site'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl()
  const items = await getPublicPortfolio().catch(() => [])

  return [
    {
      url: `${base}/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...items
      .filter(item => item.slug)
      .map(item => ({
        url: `${base}/portfolio/${item.slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      })),
  ]
}
