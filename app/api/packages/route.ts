import { NextResponse } from "next/server"

export async function GET() {
  const packages = [
    {
      gtAmount: 10,
      prices: {
        stars: 5, // 10 GT = 5 Stars
        uah: 20,
        usd: 1,
      },
      popular: false,
    },
    {
      gtAmount: 50,
      prices: {
        stars: 20,
        uah: 80,
        usd: 3,
      },
      popular: false,
    },
    {
      gtAmount: 100,
      prices: {
        stars: 35,
        uah: 150,
        usd: 5,
      },
      popular: true,
    },
    {
      gtAmount: 500,
      prices: {
        stars: 150,
        uah: 700,
        usd: 20,
      },
      popular: false,
    },
    {
      gtAmount: 1000,
      prices: {
        stars: 280,
        uah: 1400,
        usd: 40,
      },
      popular: false,
    },
    {
      gtAmount: 5000,
      prices: {
        stars: 1300,
        uah: 6500,
        usd: 180,
      },
      popular: false,
    },
  ]

  return NextResponse.json({ packages })
}
