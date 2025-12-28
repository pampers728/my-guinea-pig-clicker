import { NextResponse } from "next/server"

export async function GET() {
  const packages = [
    {
      gtAmount: 100,
      prices: {
        stars: 50, // 100 GT = 50 Stars (10 GT = 5 Stars)
        uah: 200, // ~5.5 USD
        usd: 6,
      },
      popular: false,
    },
    {
      gtAmount: 500,
      prices: {
        stars: 250,
        uah: 900,
        usd: 25,
      },
      popular: true,
    },
    {
      gtAmount: 1000,
      prices: {
        stars: 500,
        uah: 1700,
        usd: 47,
      },
      popular: false,
    },
    {
      gtAmount: 3000,
      prices: {
        stars: 1400,
        uah: 4800,
        usd: 133,
      },
      popular: false,
    },
    {
      gtAmount: 5000,
      prices: {
        stars: 2300,
        uah: 7800,
        usd: 217,
      },
      popular: false,
    },
    {
      gtAmount: 7000, // Максимальный пакет
      prices: {
        stars: 3200,
        uah: 10900,
        usd: 302,
      },
      popular: false,
    },
  ]

  return NextResponse.json({ packages })
}
