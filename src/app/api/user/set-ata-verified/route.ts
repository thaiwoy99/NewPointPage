import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { walletAddress } = await request.json();

    if (!walletAddress) {
      return NextResponse.json(
        { error: "Invalid or missing wallet address" },
        { status: 400 }
      );
    }

    // Update user's ATA verification status
    const user = await prisma.user.upsert({
      where: { walletAddress },
      update: { ataVerified: true },
      create: {
        walletAddress,
        ataVerified: true,
        defaultReferralPercentage: 0.3,
        referralPointsTotal: 0,
      },
      select: {
        id: true,
        walletAddress: true,
        ataVerified: true,
      },
    });

    return NextResponse.json({
      success: true,
      ataVerified: user.ataVerified,
    });
  } catch (error) {
    console.error("POST /api/user/set-ata-verified error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
