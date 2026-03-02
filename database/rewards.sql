import React, { useState } from 'react';

// Таблица для наград пользователей
CREATE TABLE user_rewards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  prize_id TEXT NOT NULL,
  claimed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

// Таблица для отслеживания использованных токенов рекламы
CREATE TABLE used_ad_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  token TEXT UNIQUE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

// Индексы для оптимизации
CREATE INDEX idx_user_rewards_user_id ON user_rewards(user_id);
CREATE INDEX idx_user_rewards_claimed_at ON user_rewards(claimed_at);
CREATE INDEX idx_used_ad_tokens_token ON used_ad_tokens(token);
