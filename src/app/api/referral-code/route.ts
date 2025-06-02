import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Validate custom code (alphanumeric, 3–10 characters)
const validateCustomCode = (code: string): boolean => {
  return /^[a-zA-Z0-9]{3,10}$/.test(code);
};

// // Validate Ethereum address
// const isValidWalletAddress = (address: string): boolean => {
//   return /^0x[a-fA-F0-9]{40}$/.test(address);
// };

export async function POST(request: Request) {
  try {
    const { walletAddress, customCode } = await request.json();

    if (!walletAddress) {
      return NextResponse.json(
        { error: "Invalid or missing wallet address" },
        { status: 400 }
      );
    }

    if (customCode && !validateCustomCode(customCode)) {
      return NextResponse.json(
        { error: "Custom code must be 3–10 alphanumeric characters" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { walletAddress },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate referral code
    const baseCode = customCode ? customCode.toUpperCase() : "DEX";
      //const referralCode = `${baseCode}-XYZ123`;
    // const referralCode = `${baseCode}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const referralCode = `${baseCode
      .toUpperCase()}`;

    // Check uniqueness
    const existing = await prisma.user.findUnique({
      where: { referralCode },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Referral code already exists" },
        { status: 409 }
      );
    }

    // Update user
    await prisma.user.update({
      where: { walletAddress },
      data: { referralCode },
      select: { id: true },
    });

    return NextResponse.json({ referralCode }, { status: 201 });
  } catch (error) {
    console.error("POST /api/referral-code error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
