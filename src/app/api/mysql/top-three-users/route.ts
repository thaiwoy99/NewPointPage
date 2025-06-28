// @ts-nocheck

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  // ✅ Parse & Validate Season Parameter (Default: 0)
  const season = parseInt(searchParams.get("season") || "0", 10);
  if (season < 0 || season > 5) {
    return NextResponse.json({ error: "Invalid season number. Must be between 0 and 5." }, { status: 400 });
  }

  // ✅ Construct dynamic season field
  const seasonPointsField = season === 0 ? "amountUsd" : `season${season}Points`;

  try {
    // ✅ Fetch top 3 users sorted by season points
    const topUsers = await prisma.user.findMany({
      select: {
        walletAddress: true,
        [seasonPointsField]: true,
      },
      orderBy: { [seasonPointsField]: "desc" },
      take: 3,
    });

    // ✅ Format response
    const formattedUsers = topUsers.map((user, index) => ({
      id: index + 1, // Assign ranking position
      name: `User ${index + 1}`, // Placeholder for username
      address: user.walletAddress,
      points: Math.round((user[seasonPointsField] as number) || 0), // Round to nearest whole number
      rank: index + 1,
      season, // ✅ Include season in response
    }));

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error("❌ Error fetching top users:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}


// import { NextResponse } from "next/server";
// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// // ✅ Fetch the Top 3 Users
// export async function GET() {
//   try {
//     // ✅ Fetch top 3 users sorted by `amountUsd` in descending order
//     const topUsers = await prisma.user.findMany({
//       select: { walletAddress: true, amountUsd: true },
//       orderBy: { amountUsd: "desc" },
//       take: 3,
//     });

//     // ✅ Format response
//     const formattedUsers = topUsers.map((user, index) => ({
//       id: index + 1, // Assign ranking position
//       name: `User ${index + 1}`, // Placeholder for username (can be updated)
//       address: user.walletAddress,
//       points: Math.round(user.amountUsd), // Round to nearest whole number
//       rank: index + 1,
//     }));

//     return NextResponse.json(formattedUsers);
//   } catch (error) {
//     console.error("❌ Error fetching top users:", error);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   } finally {
//     await prisma.$disconnect();
//   }
// }

