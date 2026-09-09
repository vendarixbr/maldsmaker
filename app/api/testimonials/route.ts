import { NextResponse } from 'next/server'
import { getPublicTestimonials } from '@/lib/admin-db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    return NextResponse.json(await getPublicTestimonials())
  } catch (error) {
    console.error('Failed to load testimonials', error)
    return NextResponse.json([], { status: 500 })
  }
}
