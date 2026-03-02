"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import { useAntiCheat } from "@/hooks/useAntiCheat"
import { Badge } from "@/components/ui/badge"

export function BottomNavigation() {
  const pathname = usePathname()
  const { isBlocked, warnings, getStats } = useAntiCheat()

  const navItems = [
    { href: "/", icon: "🐹", label: "Главная" },
    { href: "/games", icon: "🎮", label: "Игры" },
    { href: "/shop", icon: "🛒", label: "Магазин" },
    { href: "/profile", icon: "👤", label: "Профиль" }
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-sm border-t border-gray-700 z-50">
      <div className="max-w-md mx-auto">
        {/* Компактный индикатор защиты */}
        {warnings > 0 && (
          <div className="px-4 py-1 bg-yellow-900/30 border-b border-yellow-500/20">
            <div className="flex items-center justify-center text-xs text-yellow-400">
              🛡️ Система защиты активна ({warnings} предупреждений)
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-4 gap-1 p-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button 
                variant={pathname === item.href ? "default" : "ghost"} 
                size="sm"
                className="w-full flex flex-col items-center space-y-1 h-auto py-2 relative"
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-xs">{item.label}</span>
                
                {/* Индикатор блокировки только если заблокирован */}
                {isBlocked && item.href === "/games" && (
                  <Badge className="absolute -top-1 -right-1 w-3 h-3 p-0 bg-red-600 text-[8px]">
                    !
                  </Badge>
                )}
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
