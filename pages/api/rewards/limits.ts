import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { userId } = req.query

  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' })
  }

  try {
    const today = new Date().toISOString().split('T')[0]
    
    // Получаем все награды пользователя за сегодня
    const { data: todayRewards, count } = await supabase
      .from('user_rewards')
      .select('prize_id', { count: 'exact' })
      .eq('user_id', userId)
      .gte('claimed_at', `${today}T00:00:00.000Z`)
      .lt('claimed_at', `${today}T23:59:59.999Z`)

    const usage = {
      fortune_wheel: count || 0,
      free_carrots: todayRewards?.filter(r => r.prize_id.includes('carrots')).length || 0,
      free_energy: todayRewards?.filter(r => r.prize_id.includes('energy')).length || 0
    }

    res.status(200).json({ 
      usage,
      limits: {
        fortune_wheel: 3,
        free_carrots: 1,
        free_energy: 1
      }
    })

  } catch (error) {
    console.error('Get limits error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
