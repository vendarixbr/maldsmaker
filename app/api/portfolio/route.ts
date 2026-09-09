import { NextResponse } from 'next/server'
import { getPublicPortfolio } from '@/lib/admin-db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    return NextResponse.json(await getPublicPortfolio())
  } catch (error) {
    console.error('Failed to load portfolio', error)
    return NextResponse.json([], { status: 500 })
  }
}
