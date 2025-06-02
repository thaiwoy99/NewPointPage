import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Validate Ethereum address
// const isValidWalletAddress = (address: string): boolean => {
//   return /^0x[a-fA-F0-9]{40}$/.test(address);
// };

export async function PATCH(request: Request) {
  try {
    const { walletAddress, percentage } = await request.json();

    if (!walletAddress) {
      return NextResponse.json(
        { error: "Invalid or missing wallet address" },
        { status: 400 }
      );
    }

    if (
      typeof percentage !== "number" ||
      percentage < 0.0005 ||
      percentage > 1
    ) {
      return NextResponse.json(
        { error: "Percentage must be between 0.05% and 1%" },
        { status: 400 }
      );
    }

    // Update percentage
    const user = await prisma.user.update({
      where: { walletAddress },
      data: { defaultReferralPercentage: percentage },
      select: { defaultReferralPercentage: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      defaultReferralPercentage: user.defaultReferralPercentage,
    });
  } catch (error) {
    console.error("PATCH /api/user/percentage error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
