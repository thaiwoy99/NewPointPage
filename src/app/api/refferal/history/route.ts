import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Truncate wallet address for display (e.g., 0x1234...5678)
const truncateWalletAddress = (address: string): string => {
  if (address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get("walletAddress");

    if (!walletAddress) {
      return NextResponse.json(
        { error: "Invalid or missing wallet address" },
        { status: 400 }
      );
    }

    // Fetch user with referral history
    const user = await prisma.user.findUnique({
      where: { walletAddress },
      select: {
        referralSettings: {
          select: {
            id: true,
            createdAt: true,
            status: true,
            referralEarnings: {
              select: { amount: true },
            },
            referredUser: {
              select: { walletAddress: true },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Transform referrals into history data
    const history = user.referralSettings.map((referral) => ({
      id: referral.id,
      name: truncateWalletAddress(referral.referredUser.walletAddress),
      date: referral.createdAt.toISOString(),
      earnings: referral.referralEarnings.reduce((sum, e) => sum + e.amount, 0),
      status: referral.status,
    }));

    return NextResponse.json(history);
  } catch (error) {
    console.error("GET /api/referrals/history error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
