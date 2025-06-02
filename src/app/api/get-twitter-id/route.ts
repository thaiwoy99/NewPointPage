import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username"); // Twitter username

  if (!username) {
    return NextResponse.json({ error: "Missing username" }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://api.twitter.com/2/users/by/username/${username}`,
      {
        headers: { Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}` },
      }
    );
    const data = await response.json();

    if (data.data?.id) {
      return NextResponse.json({ twitterId: data.data.id }, { status: 200 });
    } else {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
  } catch (error) {
    console.error("Twitter API Error:", error);
    return NextResponse.json({ error: "Twitter API request failed" }, { status: 500 });
  }
}
