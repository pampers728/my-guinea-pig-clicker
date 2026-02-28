import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const serverSupabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const user_id = body.user_id as string | undefined
    const reward = body.reward ?? 1

    if (!user_id) return NextResponse.json({ error: 'user_id required' }, { status: 400 })

    const sessionId = uuidv4()
    const secret = process.env.AD_SESSION_SECRET || 'change_this_in_env'
    const sig = crypto.createHmac('sha256', secret).update(sessionId).digest('hex')

    // store pending session in Supabase pending_invoices table
    const payload = {
      ad_session: true,
      network: body.network ?? 'unknown',
      status: 'pending',
    }

    await serverSupabase.from('pending_invoices').insert({
      id: sessionId,
      user_id,
      payload: JSON.stringify(payload),
      amount: reward,
      currency: 'GT',
      pack_id: null,
    })

    return NextResponse.json({ sessionId, sig })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
