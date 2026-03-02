import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { FortuneWheel } from '@/components/FortuneWheel'
import { useRewards } from '@/hooks/useRewards'
import { DAILY_LIMITS } from '@/lib/prizes'
import { Prize } from '@/types/rewards'

interface WatchAdButtonProps {
  userId: string
  onRewardClaimed?: (prize: Prize) => void
}

export function WatchAdButton({ userId, onRewardClaimed }: WatchAdButtonProps) {
  const [adWindow, setAdWindow] = useState<Window | null>(null)
  const [showWheel, setShowWheel] = useState(false)
  const [pendingAdToken, setPendingAdToken] = useState<string | null>(null)
  
  const { loading, dailyUsage, claimReward } = useRewards(userId)

  const canWatchAd = dailyUsage.fortune_wheel < DAILY_LIMITS.fortune_wheel

  const handleWatchAd = () => {
    if (!canWatchAd) {
      alert('Вы достигли дневного лимита просмотров рекламы!')
      return
    }

    // Открываем рекламу
    const adUrl = process.env.NEXT_PUBLIC_AD_URL || 'https://www.effectivegatecpm.com/p0h1yedy?key=557943eaa83bcaa2d505bcac1a5a9005'
    const newWindow = window.open(adUrl, '_blank', 'width=800,height=600')
    setAdWindow(newWindow)

    // Симулируем получение токена после просмотра рекламы
    // В реальном приложении это должно прийти от рекламной сети
    setTimeout(() => {
      if (newWindow && !newWindow.closed) {
        const mockAdToken = `ad_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        setPendingAdToken(mockAdToken)
        setShowWheel(true)
        newWindow.close()
      }
    }, 10000) // 10 секунд для демонстрации
  }

  const handleSpin = async (): Promise<Prize> => {
    if (!pendingAdToken) {
      throw new Error('Нет токена рекламы')
    }

    try {
      const prize = await claimReward(pendingAdToken)
      setPendingAdToken(null)
      setShowWheel(false)
      
      if (onRewardClaimed) {
        onRewardClaimed(prize)
      }
      
      return prize
    } catch (error) {
      console.error('Error claiming reward:', error)
      throw error
    }
  }

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (adWindow && !adWindow.closed) {
        adWindow.close()
      }
    }
  }, [adWindow])

  if (showWheel) {
    return (
      <div className="flex flex-col items-center gap-4 p-6 bg-card rounded-lg border">
        <h3 className="text-xl font-bold text-center">Колесо фортуны</h3>
        <p className="text-muted-foreground text-center">
          Крутите колесо и по��учите награду!
        </p>
        <FortuneWheel 
          onSpin={handleSpin}
          loading={loading}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-card rounded-lg border">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Смотреть рекламу</h3>
        <p className="text-muted-foreground text-sm mb-4">
          Посмотрите рекламу и получите награду в колесе фортуны
        </p>
        <div className="text-xs text-muted-foreground">
          Использовано сегодня: {dailyUsage.fortune_wheel} / {DAILY_LIMITS.fortune_wheel}
        </div>
      </div>
      
      <Button 
        onClick={handleWatchAd}
        disabled={!canWatchAd || loading}
        size="lg"
        className="min-w-40"
      >
        {loading ? 'Загрузка...' : canWatchAd ? 'Смотреть рекламу' : 'Лимит исче��пан'}
      </Button>
    </div>
  )
}
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { useState } from 'react';
import { useUser } from '../lib/auth';

const sb = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const AD_URL = process.env.NEXT_PUBLIC_AD_LINK!;

export default function WatchAdButton() {
  const user = useUser();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    window.open(AD_URL, '_blank'); // Open ad in a new tab
    setLoading(true);

    // Wait for ad confirmation (this part needs to be implemented based on your ad network)
    const adToken = await confirmAdView(); // Implement this function to get the ad token

    const resp = await fetch('/api/reward', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, adToken }),
    });

    const json = await resp.json();
    setLoading(false);
    if (json.ok) {
      alert('Вы получили морковки!');
    } else {
      alert('Ошибка: ' + json.error);
    }
  };

  return (
    <button onClick={handleClick} disabled={loading}>
      Смотреть рекламу
    </button>
  );
}

// Function to confirm ad view and get ad token
async function confirmAdView() {
  // Implement the logic to confirm the ad view and return the ad token
  // This might involve listening for a callback or a webhook from the ad network
  return 'полученный_токен'; // Replace with actual token retrieval logic
}
