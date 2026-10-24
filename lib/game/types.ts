export type PlayerCombatState =
  | "idle" | "walking" | "running" | "attacking" | "heavy_attacking"
  | "dodging" | "blocking" | "parrying" | "taking_damage" | "stunned" | "dead"

export type EnemyKind = "crystal_mole" | "skeleton_warrior" | "skeleton_archer" | "elite_guard"
export type EnemyState = "idle" | "patrol" | "alert" | "chase" | "attack" | "recovery" | "stunned" | "return" | "dead"
