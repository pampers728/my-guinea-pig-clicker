import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const serverSupabase = createClient(supabaseUrl, supabaseServiceKey)

async function verifyWithNetwork(verifyUrl: string, payload: any) {
  try {
    const res = await fetch(verifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) return false
    const data = await res.json()
    // Expect network-specific response, adapt as needed
    return data && data.verified === true
  } catch (e) {
    return false
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const sessionId = body.sessionId as string | undefined
    const sig = body.sig as string | undefined
    const networkProof = body.networkProof

    if (!sessionId || !sig) return NextResponse.json({ error: 'missing parameters' }, { status: 400 })

    const secret = process.env.AD_SESSION_SECRET || 'change_this_in_env'
    const expected = crypto.createHmac('sha256', secret).update(sessionId).digest('hex')
    if (expected !== sig) return NextResponse.json({ error: 'invalid signature' }, { status: 403 })

    // retrieve pending session
    const { data: rows } = await serverSupabase.from('pending_invoices').select('*').eq('id', sessionId).limit(1)
    const row = Array.isArray(rows) && rows[0]
    if (!row) return NextResponse.json({ error: 'session not found' }, { status: 404 })

    // attempt server-side verification with network if configured
    const networkVerifyUrl = process.env.AD_NETWORK_VERIFY_URL
    let verified = false
    if (networkVerifyUrl && networkProof) {
      verified = await verifyWithNetwork(networkVerifyUrl, { sessionId, proof: networkProof })
    }

    // fallback: if networkVerifyUrl not set, require an admin override token
    if (!verified) {
      const adminOverride = body.adminOverrideToken
      if (!adminOverride || adminOverride !== process.env.AD_ADMIN_OVERRIDE_TOKEN) {
        return NextResponse.json({ error: 'verification failed' }, { status: 403 })
      }
      verified = true
    }

    if (verified) {
      // mark session confirmed
      await serverSupabase.from('pending_invoices').update({ payload: JSON.stringify({ ...JSON.parse(row.payload), status: 'confirmed' }) }).eq('id', sessionId)

      // credit user: add a transaction and update player's balance (example updates `guinea_tokens`)
      const reward = Number(row.amount) || 1
      await serverSupabase.from('transactions').insert({
        id: crypto.randomUUID(),
        user_id: row.user_id,
        type: 'reward',
        amount: reward,
        currency: 'GT',
        description: 'Ad watch reward',
      })

      // update player's balance (increment `guinea_tokens`)
      const { data: player } = await serverSupabase.from('players').select('guinea_tokens').eq('user_id', row.user_id).single()
      const current = (player && Number((player as any).guinea_tokens)) || 0
      await serverSupabase.from('players').update({ guinea_tokens: current + reward }).eq('user_id', row.user_id)

      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: 'not verified' }, { status: 403 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
