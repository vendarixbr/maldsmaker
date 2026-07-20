import { NextResponse } from 'next/server'
import { getAdminState } from '@/lib/admin-db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    return NextResponse.json(await getAdminState())
  } catch (error) {
    console.error('Failed to load admin state', error)
    return NextResponse.json(
      { error: 'Nao foi possivel carregar os dados do admin.' },
      { status: 500 }
    )
  }
}