import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

export async function POST() {
  const supabase = await createClient()

  // Read Authorization header (Bearer token) OR fall back to cookie session
  const authHeader = (await headers()).get('authorization') ?? ''
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null

  const {
    data: { user },
    error: userErr,
  } = token
    ? await supabase.auth.getUser(token)
    : await supabase.auth.getUser()

  if (userErr || !user) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    )
  }

  // Prevent duplicate seeding
  const { data: existing, error: checkErr } = await supabase
    .from('documents')
    .select('id')
    .eq('user_id', user.id)
    .limit(1)

  if (checkErr) {
    return NextResponse.json(
      { error: checkErr.message },
      { status: 500 }
    )
  }

  if (existing && existing.length > 0) {
    return NextResponse.json({ message: 'Documents already seeded' })
  }

  const starterDocs = [
    { title: 'Will / Trust', category: 'Legal' },
    { title: 'Power of Attorney', category: 'Legal' },
    { title: 'Advance Medical Directive', category: 'Legal' },
    { title: 'Life Insurance Policy', category: 'Financial' },
    { title: 'Banking Summary', category: 'Financial' },
    { title: 'IDs & Key Information', category: 'Personal' },
    { title: 'Service Record (DD-214)', category: 'Service' },
  ]

  const inserts = starterDocs.map((doc) => ({
    user_id: user.id,
    title: doc.title,
    category: doc.category,
    status: 'pending',
  }))

  const { error: insertErr } = await supabase
    .from('documents')
    .insert(inserts)

  if (insertErr) {
    return NextResponse.json(
      { error: insertErr.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}




