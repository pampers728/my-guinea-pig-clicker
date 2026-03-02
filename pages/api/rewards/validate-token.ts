import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { adToken, userId } = req.body

  if (!adToken || !userId) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    // Проверяем, не использовался ли токен ранее
    const { data: existingToken } = await supabase
      .from('used_ad_tokens')
      .select('token')
      .eq('token', adToken)
      .maybeSingle()

    if (existingToken) {
      return res.status(400).json({ 
        error: 'Token already used',
        isValid: false 
      })
    }

    // Проверяем дневные лимиты
    const today = new Date().toISOString().split('T')[0]
    const { count } = await supabase
      .from('user_rewards')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .gte('claimed_at', `${today}T00:00:00.000Z`)
      .lt('claimed_at', `${today}T23:59:59.999Z`)

    const dailyLimit = 3
    if ((count || 0) >= dailyLimit) {
      return res.status(400).json({ 
        error: 'Daily limit exceeded',
        isValid: false,
        usage: count,
        limit: dailyLimit
      })
    }

    // Токен валиден
    res.status(200).json({ 
      isValid: true,
      usage: count || 0,
      limit: dailyLimit
    })

  } catch (error) {
    console.error('Token validation error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
