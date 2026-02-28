#!/usr/bin/env node
;(async () => {
  const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args))
  const BASE = process.env.BASE_URL || 'http://localhost:3000'
  const USER_ID = process.env.TEST_USER_ID || 'test-user-1'
  const REWARD = Number(process.env.TEST_REWARD || 1)
  const ADMIN_TOKEN = process.env.AD_ADMIN_OVERRIDE_TOKEN || 'test-override'

  try {
    console.log('1) POST /api/ads/init')
    let res = await fetch(`${BASE}/api/ads/init`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: USER_ID, reward: REWARD }),
    })
    const init = await res.json()
    console.log('init ->', init)
    if (!init.sessionId || !init.sig) throw new Error('init failed')

    const { sessionId, sig } = init

    console.log('2) POST /api/ads/confirm (admin override)')
    res = await fetch(`${BASE}/api/ads/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, sig, adminOverrideToken: ADMIN_TOKEN }),
    })
    const confirm = await res.json()
    console.log('confirm ->', confirm)

    console.log('3) Poll /api/ads/status for up to 10s')
    for (let i = 0; i < 5; i++) {
      res = await fetch(`${BASE}/api/ads/status?sessionId=${encodeURIComponent(sessionId)}`)
      const stat = await res.json()
      console.log('status ->', stat)
      if (stat.status === 'confirmed') break
      await new Promise((r) => setTimeout(r, 2000))
    }

    console.log('Done')
  } catch (e) {
    console.error('Error during test:', e)
    process.exitCode = 1
  }
})()
