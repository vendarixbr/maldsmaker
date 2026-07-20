import { NextResponse } from 'next/server'
import { applyAdminAction } from '@/lib/admin-db'
import type { AdminAction } from '@/lib/admin-store'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const action = await request.json() as AdminAction
    return NextResponse.json(await applyAdminAction(action))
  } catch (error) {
    console.error('Failed to mutate admin state', error)
    return NextResponse.json(
      { error: 'Nao foi possivel salvar os dados do admin.' },
      { status: 500 }
    )
  }
}