import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// Initialize Prisma client (singleton)
const prisma = new PrismaClient();

// Truncate wallet address (e.g., "0x1234567890abcdef1234567890abcdef12345678" → "0x1234...5678")
const truncateWalletAddress = (address: string): string => {
  if (address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// // Validate Ethereum address (basic check: 42 chars, starts with 0x)
// const isValidWalletAddress = (address: string): boolean => {
//   return /^0x[a-fA-F0-9]{40}$/.test(address);
// };

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

    // Fetch user with minimal required data
    const user = await prisma.user.findUnique({
      where: { walletAddress },
      select: {
        id: true,
        walletAddress: true,
        referralCode: true,
        defaultReferralPercentage: true,
        referrals: { select: { id: true } },
        referralSettings: {
          select: {
            referralEarnings: {
              select: { amount: true },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Calculate total earnings
    const earnings = user.referralSettings.reduce(
      (sum, ref) =>
        sum + ref.referralEarnings.reduce((s, e) => s + e.amount, 0),
      0
    );

    // Prepare response with truncated wallet address
    const response = {
      id: user.id,
      walletAddress: truncateWalletAddress(user.walletAddress),
      referralCode: user.referralCode,
      defaultReferralPercentage: user.defaultReferralPercentage ?? 0.3,
      earnings,
      referralsCount: user.referrals.length,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("GET /api/user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect(); // Ensure connection is closed
  }
}
