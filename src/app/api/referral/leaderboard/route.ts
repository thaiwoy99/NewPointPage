import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Truncate wallet address for display (e.g., 0x1234...5678)
const truncateWalletAddress = (address: string): string => {
  if (address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export async function GET() {
  try {
    // Fetch top 10 users by referral count
    const users = await prisma.user.findMany({
      select: {
        walletAddress: true,
        _count: {
          select: { referrals: true },
        },
      },
      orderBy: {
        referrals: {
          _count: "desc",
        },
      },
      take: 10,
    });

    // Only include users with more than 0 referrals
    const leaderboard = users
      .filter((user) => user._count.referrals > 0)
      .map((user) => ({
        name: truncateWalletAddress(user.walletAddress),
        referrals: user._count.referrals,
      }));

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error("GET /api/referrals/leaderboard error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
