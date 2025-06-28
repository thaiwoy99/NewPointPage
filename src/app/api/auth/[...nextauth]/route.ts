/* eslint-disable @typescript-eslint/no-explicit-any */

import NextAuth from "next-auth";
import TwitterProvider from "next-auth/providers/twitter";
import { cookies } from "next/headers"; // Import cookies
import { PrismaClient } from "@prisma/client";
//import { NextResponse } from "next/server";

const prisma = new PrismaClient();

const handler = NextAuth({
  providers: [
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID as string,
      clientSecret: process.env.TWITTER_CLIENT_SECRET as string,
      version: "2.0", 
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session, token }: any) {
      session.user.twitterHandle = token.username;
      session.user.twitterId = token.sub;
      return session;
    },
    async jwt({ token, account, profile }: any) {
      if (account && profile) {
        token.username = profile.data.username; // Twitter handle
        token.sub = profile.data.id; // Twitter user ID
        console.log('handle', profile.data.username)
        console.log('id', profile.data.id)
        console.log('Profile Data', profile.data)
        console.log('Profiile img', profile.data.profile_image_url)
        console.log('name', profile.data.name)
      }

      // 🔹 Retrieve the wallet address from cookies
      const walletCookies = cookies();
      const walletCookiesResolved = await walletCookies;
      const walletAddress = walletCookiesResolved.get("walletAddress")?.value;
      
      if (walletAddress) {
        token.walletAddress = walletAddress;
        console.log("Wallet Address Auth:", walletAddress);

        if(profile.data.id && profile.data.id != ''){
          try {
          console.log("🔹 Updating Database with Twitter Handle...");
          await prisma.user.update({
            where: { walletAddress: walletAddress },
            data: { twitterUsername: profile.data.username, twitterId: profile.data.id, name: profile.data.name, profileImg: profile.data.profile_image_url },
          });
          console.log("✅ Database Updated Successfully!");
        } catch (error) {
          console.error("❌ Error Updating Database:", error);
        }
        }

        // Optional: Clear the cookie after reading
        // Optional: Clear the cookie after reading (not directly supported by ReadonlyRequestCookies)
        //console.warn("Deleting cookies is not supported in this context. Implement custom logic if needed.");
      } else {
        console.log("No wallet address found in cookies");
      }


      return token;
    },
  },
});

 export { handler as GET, handler as POST };





// import NextAuth from "next-auth";
// import TwitterProvider from "next-auth/providers/twitter";

// const handler = NextAuth({
//   providers: [
//     TwitterProvider({
//       clientId: process.env.TWITTER_CLIENT_ID as string,
//       clientSecret: process.env.TWITTER_CLIENT_SECRET as string,
//       version: "2.0",
//     }),
//   ],
//   secret: process.env.NEXTAUTH_SECRET,
//   callbacks: {
//     async jwt({ token, account, profile, request }: any) {
//       if (account && profile) {
//         token.username = profile.data.username; // Twitter handle
//         token.sub = profile.data.id; // Twitter user ID
//       }

//       // Extract walletAddress from request URL
//       if (request) {
//         const url = new URL(request.url);
//         const walletAddress = url.searchParams.get("walletAddress");
//         if (walletAddress) {
//           console.log('AUTH WAL', walletAddress)
//           token.walletAddress = walletAddress;
//         }else{
//           console.log('NO AUTH WAL')
//         }
//       }else{
//         console.log('NO AUTH REQ')
//       }

//       return token;
//     },
//     async session({ session, token }: any) {
//       session.user.twitterHandle = token.username;
//       session.user.twitterId = token.sub;
//       session.user.walletAddress = token.walletAddress; // Pass it to session
//       return session;
//     },
//   },
// });

// export { handler as GET, handler as POST };




