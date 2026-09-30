import Image from "next/image"

type GameIconName = "carrot" | "gt" | "mining" | "booster"

const ICONS: Record<GameIconName, string> = {
  carrot: "/images/icon-carrot.png",
  gt: "/images/icon-gt-token.png",
  mining: "/images/icon-mining-crystal.png",
  booster: "/images/icon-booster.png",
}

export function GameIcon({ name, size = 24, className = "" }: { name: GameIconName; size?: number; className?: string }) {
  return <Image src={ICONS[name]} alt="" width={size} height={size} className={className} aria-hidden="true" />
}

export function CurrencyLabel({ name, children }: { name: GameIconName; children: React.ReactNode }) {
  return <span className="inline-flex items-center gap-1"><GameIcon name={name} size={16} />{children}</span>
}
