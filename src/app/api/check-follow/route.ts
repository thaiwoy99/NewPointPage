// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma"; // Adjust based on your Prisma setup

// const DESERIALIZE_USER_ID = "1194654435198324736"; // Deserialize Twitter ID

// export async function GET(req: NextRequest) {
//   const { searchParams } = new URL(req.url);
//   const walletAddress = searchParams.get("walletAddress");

//   if (!walletAddress) {
//     return NextResponse.json({ error: "Missing wallet address" }, { status: 400 });
//   }

//   console.log(walletAddress)

//   // Get user's Twitter ID from DB
//   const user = await prisma.user.findUnique({
//     where: { walletAddress },
//     select: { twitterId: true },
//   });

//   console.log(user);

//   if (!user || !user.twitterId) {
//     return NextResponse.json({ error: "User not found or Twitter not linked" }, { status: 404 });
//   }

//   try {
//     // Check if user follows Deserialize
//     const response = await fetch(
//       `https://api.twitter.com/2/users/${user.twitterId}/following`,
//       { headers: { Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN as string}` } }
//     );
//     const data = await response.json();

//     console.log(data)

//     const isFollowing = data.data?.some((user: any) => user.id === DESERIALIZE_USER_ID);

//     return NextResponse.json({ follows: isFollowing }, { status: 200 });
//   } catch (error) {
//     console.error("Twitter API Error:", error);
//     return NextResponse.json({ error: "Twitter API error" }, { status: 500 });
//   }
// }

import { NextResponse } from "next/server";

const TWITTER_BEARER_TOKEN = 'AAAAAAAAAAAAAAAAAAAAAEMb0QEAAAAAvrtBg7kl8PDa4KXhOE4D%2FiGXCkg%3DDcREMgcxqjnb6yQ9UHgS0QxY4bJiGje3xNGlp1aNC8K8iBoQ1G';
const DESERIALIZE_USER_ID = "1194654435198324736"; // Deserialize Twitter ID

export async function GET(req: Request) {
  try {
    // Extract Twitter ID from query params
    const { searchParams } = new URL(req.url);
    const twitterId = searchParams.get("twitterId");

    if (!twitterId) {
      return NextResponse.json({ error: "Missing twitterId" }, { status: 400 });
    }

    // Call Twitter API to get the list of users the given user follows
    const url = `https://api.twitter.com/2/users/${twitterId}/following`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${TWITTER_BEARER_TOKEN}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data }, { status: response.status });
    }

    // Check if the user follows Deserialize
    const isFollowing = data.data?.some(
      (user: { id: string }) => user.id === DESERIALIZE_USER_ID
    );

    return NextResponse.json({ following: isFollowing });
  } catch (error) {
    console.error("Twitter API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

