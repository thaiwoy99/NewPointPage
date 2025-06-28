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
    let user = await prisma.user.findUnique({
      where: { walletAddress },
      select: { id: true, referralCode: true },
    });

    if (!user) {
      // Optionally, create the user here if you want
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // If user already has a referral code, return it
    if (user.referralCode) {
      return NextResponse.json(
        { referralCode: user.referralCode },
        { status: 200 }
      );
    }

    // Generate referral code
    let baseCode = customCode ? customCode.toUpperCase() : "DEX";
    let referralCode = baseCode;

    if (!customCode) {
      // Generate a random 4-character suffix
      const randomSuffix = Math.random()
        .toString(36)
        .substring(2, 6)
        .toUpperCase();
      referralCode = `${baseCode}-${randomSuffix}`;
    }

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
