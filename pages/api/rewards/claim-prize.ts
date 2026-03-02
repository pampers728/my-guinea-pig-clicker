import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Конфигурация призов
const PRIZES = [
  { id: 1, label: "+50-500 🥕", type: "carrots", min: 50, max: 500, prob: 25 },
  { id: 2, label: "+500-2500 🥕", type: "carrots", min: 500, max: 2500, prob: 25 },
  { id: 3, label: "+100-300 Energy", type: "energy", min: 100, max: 300, prob: 13 },
  { id: 4, label: "+300-1000 Energy", type: "energy", min: 300, max: 1000, prob: 12 },
  { id: 5, label: "Auto-tap 30m", type: "autotap", duration: 30, prob: 5 },
  { id: 6, label: "Auto-tap 60m", type: "autotap", duration: 60, prob: 2 },
  { id: 7, label: "x2 Boost 30m", type: "booster", duration: 30, prob: 7 },
  { id: 8, label: "x2 Boost 60m", type: "booster", duration: 60, prob: 3 },
  { id: 9, label: "+0.01-0.03 GT", type: "gt", min: 0.01, max: 0.03, prob: 5 },
  { id: 10, label: "+0.05-0.1 GT", type: "gt", min: 0.05, max: 0.1, prob: 3 },
]

function selectRandomPrize() {
  const totalProb = PRIZES.reduce((sum, prize) => sum + prize.prob, 0)
  let random = Math.random() * totalProb
  
  for (const prize of PRIZES) {
    random -= prize.prob
    if (random <= 0) return prize
  }
  
  return PRIZES[0] // fallback
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { userId, adToken } = req.body

  if (!userId || !adToken) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    // 1. Проверяем токен еще раз
    const { data: existingToken } = await supabase
      .from('used_ad_tokens')
      .select('token')
      .eq('token', adToken)
      .maybeSingle()

    if (existingToken) {
      return res.status(400).json({ error: 'Token already used' })
    }

    // 2. Проверяем дневные лимиты
    const today = new Date().toISOString().split('T')[0]
    const { count } = await supabase
      .from('user_rewards')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .gte('claimed_at', `${today}T00:00:00.000Z`)
      .lt('claimed_at', `${today}T23:59:59.999Z`)

    if ((count || 0) >= 3) {
      return res.status(400).json({ error: 'Daily limit exceeded' })
    }

    // 3. Выбираем случайный приз
    const selectedPrize = selectRandomPrize()
    
    // 4. Вычисляем количество
    let amount = 0
    if (selectedPrize.min && selectedPrize.max) {
      amount = Math.floor(Math.random() * (selectedPrize.max - selectedPrize.min + 1)) + selectedPrize.min
    } else if (selectedPrize.duration) {
      amount = selectedPrize.duration
    }

    // 5. Сохраняем награду
    const expiresAt = selectedPrize.duration 
      ? new Date(Date.now() + selectedPrize.duration * 60 * 1000).toISOString()
      : null

    const { data: reward, error: rewardError } = await supabase
      .from('user_rewards')
      .insert({ 
        user_id: userId,
        prize_id: `${selectedPrize.type}_${selectedPrize.id}`,
        claimed_at: new Date().toISOString(),
        expires_at: expiresAt,
        is_active: true
      })
      .select()
      .single()

    if (rewardError) {
      console.error('Reward save error:', rewardError)
      return res.status(500).json({ error: 'Failed to save reward' })
    }

    // 6. Обновляем баланс пользователя
    if (selectedPrize.type === 'carrots' || selectedPrize.type === 'energy' || selectedPrize.type === 'gt') {
      const updateField = selectedPrize.type === 'gt' ? 'gt_tokens' : selectedPrize.type
      
      const { data: currentUser } = await supabase
        .from('users')
        .select(updateField)
        .eq('id', userId)
        .single()

      if (currentUser) {
        const currentValue = currentUser[updateField] || 0
        await supabase
          .from('users')
          .update({ [updateField]: currentValue + amount })
          .eq('id', userId)
      }
    }

    // 7. Помечаем токен как использованный
    await supabase
      .from('used_ad_tokens')
      .insert({ 
        token: adToken,
        used_at: new Date().toISOString()
      })

    res.status(200).json({ 
      success: true,
      prize: { 
        ...selectedPrize,
        amount 
      },
      reward
    })

  } catch (error) {
    console.error('Claim prize error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
