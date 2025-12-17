import { NextResponse } from "next/server"

export async function GET() {
  const packages = [
    {
      gtAmount: 10,
      prices: {
        stars: 20,
        uah: 50,
        usd: 2, // Changed from 1.5 to 2
      },
      popular: false,
    },
    {
      gtAmount: 50,
      prices: {
        stars: 100,
        uah: 200,
        usd: 6,
      },
      popular: false,
    },
    {
      gtAmount: 100,
      prices: {
        stars: 200,
        uah: 400,
        usd: 12,
      },
      popular: true,
    },
    {
      gtAmount: 500,
      prices: {
        stars: 1000,
        uah: 1800,
        usd: 55,
      },
      popular: false,
    },
    {
      gtAmount: 1000,
      prices: {
        stars: 2000,
        uah: 3500,
        usd: 100,
      },
      popular: false,
    },
  ]

  return NextResponse.json({ packages })
}
