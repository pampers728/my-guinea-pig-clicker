export type DamageInput = {
  base: number
  attackBonus?: number
  skillMultiplier?: number
  defense?: number
  critical?: boolean
  criticalMultiplier?: number
  damageMultiplier?: number
}

export function calculateDamage(input: DamageInput) {
  const raw = (input.base + (input.attackBonus ?? 0)) * (input.skillMultiplier ?? 1)
  const critical = input.critical ? input.criticalMultiplier ?? 1.5 : 1
  const reduced = raw * critical * (input.damageMultiplier ?? 1) - (input.defense ?? 0)
  return Math.max(1, Math.floor(Math.min(reduced, 9999)))
}

export function isInAttackCone(
  origin: { x: number; z: number },
  target: { x: number; z: number },
  facing: { x: number; z: number },
  range: number,
  angleDegrees = 90,
) {
  const dx = target.x - origin.x
  const dz = target.z - origin.z
  const distance = Math.hypot(dx, dz)
  if (distance > range || distance === 0) return false
  const facingLength = Math.hypot(facing.x, facing.z) || 1
  const dot = (dx * facing.x + dz * facing.z) / (distance * facingLength)
  return dot >= Math.cos((angleDegrees * Math.PI) / 360)
}

export const combatConfig = {
  player: { maxHp: 100, maxStamina: 100, maxMana: 100, defense: 6 },
  attacks: {
    light: { base: 22, stamina: 0, range: 2.4, cooldown: 0.55, windup: 0.18, recovery: 0.32 },
    heavy: { base: 48, stamina: 30, range: 2.8, cooldown: 1.35, windup: 0.42, recovery: 0.55 },
    skill: { base: 38, mana: 20, range: 4.5, cooldown: 3 },
  },
}
