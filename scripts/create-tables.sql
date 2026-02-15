-- Guinea Pig Clicker Database Schema
-- Create tables for players, miners, and transactions

-- Players table
CREATE TABLE IF NOT EXISTS players (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  username TEXT DEFAULT 'Player',
  score BIGINT DEFAULT 0,
  xp BIGINT DEFAULT 0,
  level INTEGER DEFAULT 1,
  carrots BIGINT DEFAULT 0,
  guinea_tokens BIGINT DEFAULT 0,
  telegram_stars BIGINT DEFAULT 0,
  total_clicks BIGINT DEFAULT 0,
  active_pig_id TEXT DEFAULT 'white_basic',
  pigs JSONB DEFAULT '[]'::jsonb,
  referral_bonus BIGINT DEFAULT 0,
  referrals_count INTEGER DEFAULT 0,
  carrots_per_click_level INTEGER DEFAULT 1,
  max_energy_level INTEGER DEFAULT 1,
  current_energy INTEGER DEFAULT 1000,
  task_progress JSONB DEFAULT '{}'::jsonb,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_terms BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Miners table
CREATE TABLE IF NOT EXISTS miners (
  id BIGSERIAL PRIMARY KEY,
  player_id BIGINT REFERENCES players(id) ON DELETE CASCADE,
  miner_type INTEGER NOT NULL, -- 1-12 for different miner types
  level INTEGER DEFAULT 1, -- 1-5
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table for tracking GT purchases
CREATE TABLE IF NOT EXISTS transactions (
  id BIGSERIAL PRIMARY KEY,
  player_id BIGINT REFERENCES players(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL, -- 'purchase_gt', 'exchange_carrots', 'referral_bonus'
  amount BIGINT NOT NULL,
  currency TEXT, -- 'XTR', 'UAH', 'USD', 'carrots'
  telegram_payment_id TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pending invoices table (for anti-duplicate payments)
CREATE TABLE IF NOT EXISTS pending_invoices (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  payload TEXT UNIQUE NOT NULL,
  pack_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_players_user_id ON players(user_id);
CREATE INDEX IF NOT EXISTS idx_miners_player_id ON miners(player_id);
CREATE INDEX IF NOT EXISTS idx_transactions_player_id ON transactions(player_id);
CREATE INDEX IF NOT EXISTS idx_pending_invoices_user_id ON pending_invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_players_score ON players(score DESC);
CREATE INDEX IF NOT EXISTS idx_players_updated_at ON players(updated_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON players
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies (Row Level Security)
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE miners ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_invoices ENABLE ROW LEVEL SECURITY;

-- Allow service role to do everything
CREATE POLICY "Service role can do everything on players" ON players
  FOR ALL USING (true);

CREATE POLICY "Service role can do everything on miners" ON miners
  FOR ALL USING (true);

CREATE POLICY "Service role can do everything on transactions" ON transactions
  FOR ALL USING (true);

CREATE POLICY "Service role can do everything on pending_invoices" ON pending_invoices
  FOR ALL USING (true);
