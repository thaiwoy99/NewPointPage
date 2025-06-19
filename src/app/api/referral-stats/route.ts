import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

    // Fetch user with stats data
    const user = await prisma.user.findUnique({
      where: { walletAddress },
      select: {
        referralPointsTotal: true,
        referrals: { select: { id: true } },
        referralSettings: {
          select: {
            status: true,
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

    // Calculate stats
    const earnings = user.referralSettings.reduce(
      (sum, ref) =>
        sum + ref.referralEarnings.reduce((s, e) => s + e.amount, 0),
      0
    );
    const pending = user.referralSettings
      .filter((ref) => ref.status === "PENDING")
      .reduce(
        (sum, ref) =>
          sum + ref.referralEarnings.reduce((s, e) => s + e.amount, 0),
        0
      );

    return NextResponse.json({
      referrals: user.referrals.length,
      referralPointsTotal: user.referralPointsTotal,
      earnings,
      pending,
    });
  } catch (error) {
    console.error("GET /api/referral-stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
