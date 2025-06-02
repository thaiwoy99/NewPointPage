import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { walletAddress } = await req.json();

    if (!walletAddress) {
      return NextResponse.json({ error: "Missing wallet address" }, { status: 400 });
    }

    // Store walletAddress in a cookie for later retrieval in NextAuth
    const response = NextResponse.json({ success: true });
    response.cookies.set("walletAddress", walletAddress, {
      httpOnly: true,  // More secure
      secure: process.env.NODE_ENV === "production" ? true : false, // Allow on localhost
      //secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 5,  // 5 minutes expiry
    });

    return response;
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
