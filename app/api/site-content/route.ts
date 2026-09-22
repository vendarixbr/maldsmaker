import { NextResponse } from 'next/server'
import { getPublicHomeContent, getPublicSettings } from '@/lib/admin-db'
import { DEFAULT_HOME_CONTENT, DEFAULT_SITE_SETTINGS } from '@/lib/data'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const [settings, home] = await Promise.all([getPublicSettings(), getPublicHomeContent()])
    return NextResponse.json({ settings, home })
  } catch (error) {
    console.error('Failed to load site content', error)
    return NextResponse.json({ settings: DEFAULT_SITE_SETTINGS, home: DEFAULT_HOME_CONTENT }, { status: 500 })
  }
}
