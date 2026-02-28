import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const serverSupabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const sessionId = url.searchParams.get('sessionId')
    if (!sessionId) return NextResponse.json({ error: 'sessionId required' }, { status: 400 })

    const { data: rows } = await serverSupabase.from('pending_invoices').select('payload').eq('id', sessionId).limit(1)
    const row = Array.isArray(rows) && rows[0]
    if (!row) return NextResponse.json({ error: 'not found' }, { status: 404 })
    const payload = typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload
    return NextResponse.json({ status: payload.status || 'pending' })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
