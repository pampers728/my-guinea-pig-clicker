import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

export type Database = {
  players: {
    user_id: string
    username: string
    score: number
    xp: number
    level: number
    carrots: number
    guinea_tokens: number
    telegram_stars: number
    total_clicks: number
    active_pig_id: string
    pigs: { id: string; rarity: string }[]
    referral_bonus: number
    referrals_count: number
    carrots_per_click_level: number
    max_energy_level: number
    task_progress: Record<string, any>
    accepted_terms: boolean
    last_seen: string
    created_at: string
    updated_at: string
  }
  miners: {
    id: string
    user_id: string
    miner_type: number
    level: number
    purchased_at: string
  }
  transactions: {
    id: string
    user_id: string
    type: 'purchase' | 'reward' | 'exchange'
    amount: number
    currency: 'GT' | 'STARS' | 'CARROTS'
    description: string
    created_at: string
  }
  pending_invoices: {
    id: string
    user_id: string
    payload: string
    amount: number
    currency: string
    pack_id: string
    created_at: string
  }
}
