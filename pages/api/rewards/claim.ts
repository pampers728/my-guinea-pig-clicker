import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import { FORTUNE_WHEEL_PRIZES, DAILY_LIMITS } from '@/lib/prizes'
import { Prize } from '@/types/rewards'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { userId, adToken, type } = req.body

  if (!userId || !adToken) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    // 1. Проверяем токен рекламы (защита от читерства)
    const isValidToken = await validateAdToken(adToken)
    if (!isValidToken) {
      return res.status(400).json({ error: 'Invalid ad token' })
    }

    // 2. Проверяем дневные лимиты
    const today = new Date().toISOString().split('T')[0]
    const { data: todayRewards } = await supabase
      .from('user_rewards')
      .select('*')
      .eq('user_id', userId)
      .gte('claimed_at', `${today}T00:00:00.000Z`)
      .lt('claimed_at', `${today}T23:59:59.999Z`)

    const todayCount = todayRewards?.length || 0
    if (todayCount >= DAILY_LIMITS.fortune_wheel) {
      return res.status(400).json({ error: 'Daily limit exceeded' })
    }

    // 3. Выбираем случайный приз на основе вероятностей
    const selectedPrize = selectRandomPrize()

    // 4. Сохраняем награду в базе данных
    const { data: reward, error } = await supabase
      .from('user_rewards')
      .insert({
        user_id: userId,
        prize_id: selectedPrize.id,
        claimed_at: new Date().toISOString(),
        expires_at: selectedPrize.duration 
          ? new Date(Date.now() + selectedPrize.duration * 60 * 1000).toISOString()
          : null,
        is_active: true
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return res.status(500).json({ error: 'Failed to save reward' })
    }

    // 5. Обновляем баланс пользователя
    await updateUserBalance(userId, selectedPrize)

    // 6. Помечаем токен как использованный
    await markTokenAsUsed(adToken)

    res.status(200).json({ 
      success: true, 
      prize: selectedPrize,
      reward 
    })

  } catch (error) {
    console.error('Claim reward error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

async function validateAdToken(token: string): Promise<boolean> {
  // Проверяем, что токен не был использован ранее
  const { data } = await supabase
    .from('used_ad_tokens')
    .select('token')
    .eq('token', token)
    .single()

  return !data // Токен валиден, если его нет в базе использованных
}

async function markTokenAsUsed(token: string) {
  await supabase
    .from('used_ad_tokens')
    .insert({ 
      token, 
      used_at: new Date().toISOString() 
    })
}

function selectRandomPrize(): Prize {
  const random = Math.random() * 100
  let cumulative = 0

  for (const prize of FORTUNE_WHEEL_PRIZES) {
    cumulative += prize.probability
    if (random <= cumulative) {
      return prize
    }
  }

  // Fallback на последний приз
  return FORTUNE_WHEEL_PRIZES[FORTUNE_WHEEL_PRIZES.length - 1]
}

async function updateUserBalance(userId: string, prize: Prize) {
  const updates: any = {}

  switch (prize.type) {
    case 'carrots':
      updates.carrots = `carrots + ${prize.amount}`
      break
    case 'energy':
      updates.energy = `energy + ${prize.amount}`
      break
    case 'gt':
      updates.gt_tokens = `gt_tokens + ${prize.amount}`
      break
  }

  if (Object.keys(updates).length > 0) {
    await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
  }
}
