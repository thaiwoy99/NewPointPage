import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { TldParser } from "@onsol/tldparser";
import { Connection, PublicKey } from "@solana/web3.js";
import { z } from "zod";

// Singleton PrismaClient instance
const prisma = new PrismaClient();

// Solana connection and TldParser setup
const RPC_URL =
  "https://deserial-eclipse-d6a3.mainnet.eclipse.rpcpool.com/abd4da1d-fc0c-4fc6-91f9-87dab316d56d";
const connection = new Connection(RPC_URL, {
  commitment: "confirmed",
  wsEndpoint: RPC_URL.replace("https", "wss"), // Optimize for faster confirmations
});
const tldParser = new TldParser(connection);

// Configuration constants
const MAX_SEASON = 5;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache TTL
const MAX_RETRIES = 3;
const RETRY_DELAY = 500; // 0.5s retry delay

// Caches
const userCache = new Map<string, { data: UserResponse; timestamp: number }>();
const domainCache = new Map<string, { domains: string[]; timestamp: number }>();

// Types
interface UserResponse {
  walletAddress: string;
  totalPoints: number;
  rank: number | null;
  season: number;
  twitterConnected: boolean;
  twitterUsername: string | null;
  isActivated: boolean;
  domains: string[];
}

// Input validation schema
const querySchema = z.object({
  walletAddress: z
    .string({ invalid_type_error: "walletAddress must be a string" })
    .min(1, "walletAddress is required")
    .refine((val) => val !== "null", {
      message: "walletAddress cannot be 'null'",
    }),
  season: z
    .string()
    .nullable()
    .transform((val) =>
      val === null || val === undefined ? 0 : parseInt(val, 10)
    )
    .refine((val) => val >= 0 && val <= MAX_SEASON, {
      message: `Season must be between 0 and ${MAX_SEASON}`,
    }),
});

// Utility function to get dynamic field names
const getSeasonFields = (season: number) => ({
  pointsField: season === 0 ? "amountUsd" : `season${season}Points`,
  activatedField:
    season === 0 ? "season0Activated" : `season${season}Activated`,
});

// Utility function for retrying operations
async function withRetry<T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (
        error instanceof Error &&
        (error.message.includes("P1001") || error.message.includes("timeout"))
      ) {
        console.warn(
          `Retry ${attempt}/${MAX_RETRIES} for ${operationName}:`,
          error
        );
        if (attempt < MAX_RETRIES) {
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
          continue;
        }
      }
      throw error;
    }
  }
  throw lastError;
}

// Main GET handler
export async function GET(req: Request) {
  const startTime = performance.now();
  try {
    // Parse and validate query parameters
    const { searchParams } = new URL(req.url);
    const rawWalletAddress = searchParams.get("walletAddress");
    const rawSeason = searchParams.get("season");

    const parsedParams = querySchema.safeParse({
      walletAddress: rawWalletAddress,
      season: rawSeason,
    });

    if (!parsedParams.success) {
      console.error("Validation error:", parsedParams.error.issues);
      return NextResponse.json(
        { error: parsedParams.error.issues[0].message },
        { status: 400 }
      );
    }

    const { walletAddress, season } = parsedParams.data;
    const { pointsField, activatedField } = getSeasonFields(season);
    const cacheKey = `${walletAddress}:${season}`;

    // Check user cache
    const cached = userCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log(`Cache hit for ${cacheKey}`);
      return NextResponse.json(cached.data);
    }

    // Fetch user data with retry
    let userData = await withRetry(
      () =>
        prisma.user.findUnique({
          where: { walletAddress },
          select: {
            walletAddress: true,
            twitterUsername: true,
            [pointsField]: true,
            [activatedField]: true,
          },
        }),
      "findUnique"
    );

    // Handle new user creation
    if (!userData) {
      userData = await withRetry(
        () =>
          prisma.user.create({
            data: {
              walletAddress,
              [pointsField]: 0,
              [activatedField]: false,
              updatedAt: new Date(),
            },
            select: {
              walletAddress: true,
              twitterUsername: true,
              [pointsField]: true,
              [activatedField]: true,
            },
          }),
        "create"
      );
    }

    // Calculate rank concurrently with domain fetching
    const userPoints = (Number(userData[pointsField])) || 0;
    const rankPromise =
      userPoints > 0
        ? withRetry(
            () =>
              prisma.user
                .count({
                  where: { [pointsField]: { gt: userPoints } },
                })
                .then((count) => count + 1),
            "count"
          )
        : Promise.resolve(null);

    // Fetch domains
    let domains: string[] = [];
    const domainCacheKey = walletAddress;
    const cachedDomains = domainCache.get(domainCacheKey);
    if (cachedDomains && Date.now() - cachedDomains.timestamp < CACHE_TTL) {
      domains = cachedDomains.domains;
    } else {
      try {
        const fetchedDomains = await withRetry(
          () => tldParser.getParsedAllUserDomains(new PublicKey(walletAddress)),
          `getParsedAllUserDomains for ${walletAddress}`
        );
        if (fetchedDomains.length > 0) {
          domains = [fetchedDomains[0].domain];
        }
        domainCache.set(domainCacheKey, { domains, timestamp: Date.now() });
      } catch (error) {
        console.error(`Error fetching domains for ${walletAddress}:`, error);
      }
    }

    // Await rank calculation
    const rank = await rankPromise;

    // Prepare response
    const response: UserResponse = {
      walletAddress,
      totalPoints: Math.round(userPoints as number),
      rank,
      season,
      twitterConnected: !!userData.twitterUsername,
      twitterUsername:
        typeof userData.twitterUsername === "string" ||
        userData.twitterUsername === null
          ? userData.twitterUsername
          : null,
      isActivated:
        typeof userData[activatedField] === "boolean"
          ? userData[activatedField]
          : false,
      domains,
    };

    // Store in user cache
    userCache.set(cacheKey, { data: response, timestamp: Date.now() });

    // Log performance
    const duration = performance.now() - startTime;
    console.log(
      `GET /api/mysql/user-info completed in ${duration.toFixed(2)}ms`
    );

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching user info:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Ensure Prisma disconnects on process termination
process.on("SIGTERM", async () => {
  await prisma.$disconnect();
});

// import { NextResponse } from "next/server";
// import { PrismaClient } from "@prisma/client";
// import { TldParser } from "@onsol/tldparser";
// import { Connection, PublicKey } from "@solana/web3.js";
// import { z } from "zod";

// // Singleton PrismaClient instance
// const prisma = new PrismaClient();

// // Solana connection and TldParser setup
// const RPC_URL =
//   "https://deserial-eclipse-d6a3.mainnet.eclipse.rpcpool.com/abd4da1d-fc0c-4fc6-91f9-87dab316d56d";
// const connection = new Connection(RPC_URL, {
//   commitment: "confirmed",
//   wsEndpoint: RPC_URL.replace("https", "wss"), // Optimize for faster confirmations
// });
// const tldParser = new TldParser(connection);

// // Configuration constants
// const MAX_SEASON = 5;
// const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache TTL
// const MAX_RETRIES = 3;
// const RETRY_DELAY = 500; // 0.5s retry delay

// // Caches
// const userCache = new Map<string, { data: UserResponse; timestamp: number }>();
// const domainCache = new Map<string, { domains: string[]; timestamp: number }>();

// // Types
// interface UserResponse {
//   walletAddress: string;
//   totalPoints: number;
//   rank: number | null;
//   season: number;
//   twitterConnected: boolean;
//   twitterUsername: string | null;
//   isActivated: boolean;
//   domains: string[];
// }

// // Input validation schema
// const querySchema = z.object({
//   walletAddress: z
//     .string({ invalid_type_error: "walletAddress must be a string" })
//     .min(1, "walletAddress is required")
//     .refine((val) => val !== "null", {
//       message: "walletAddress cannot be 'null'",
//     }),
//   season: z
//     .string()
//     .nullable()
//     .transform((val) =>
//       val === null || val === undefined ? 0 : parseInt(val, 10)
//     )
//     .refine((val) => val >= 0 && val <= MAX_SEASON, {
//       message: `Season must be between 0 and ${MAX_SEASON}`,
//     }),
// });

// // Utility function to get dynamic field names
// const getSeasonFields = (season: number) => ({
//   pointsField: season === 0 ? "amountUsd" : `season${season}Points`,
//   activatedField:
//     season === 0 ? "season0Activated" : `season${season}Activated`,
// });

// // Utility function for retrying operations
// async function withRetry<T>(
//   operation: () => Promise<T>,
//   operationName: string
// ): Promise<T> {
//   let lastError: unknown;
//   for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
//     try {
//       return await operation();
//     } catch (error) {
//       lastError = error;
//       if (
//         error instanceof Error &&
//         (error.message.includes("P1001") || error.message.includes("timeout"))
//       ) {
//         console.warn(
//           `Retry ${attempt}/${MAX_RETRIES} for ${operationName}:`,
//           error
//         );
//         if (attempt < MAX_RETRIES) {
//           await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
//           continue;
//         }
//       }
//       throw error;
//     }
//   }
//   throw lastError;
// }

// // Main GET handler
// export async function GET(req: Request) {
//   const startTime = performance.now();
//   try {
//     // Parse and validate query parameters
//     const { searchParams } = new URL(req.url);
//     const rawWalletAddress = searchParams.get("walletAddress");
//     const rawSeason = searchParams.get("season");

//     const parsedParams = querySchema.safeParse({
//       walletAddress: rawWalletAddress,
//       season: rawSeason,
//     });

//     if (!parsedParams.success) {
//       console.error("Validation error:", parsedParams.error.issues);
//       return NextResponse.json(
//         { error: parsedParams.error.issues[0].message },
//         { status: 400 }
//       );
//     }

//     const { walletAddress, season } = parsedParams.data;
//     const { pointsField, activatedField } = getSeasonFields(season);
//     const cacheKey = `${walletAddress}:${season}`;

//     // Check user cache
//     const cached = userCache.get(cacheKey);
//     if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
//       console.log(`Cache hit for ${cacheKey}`);
//       return NextResponse.json(cached.data);
//     }

//     // Fetch user data with retry
//     let userData = await withRetry(
//       () =>
//         prisma.user.findUnique({
//           where: { walletAddress },
//           select: {
//             walletAddress: true,
//             twitterUsername: true,
//             [pointsField]: true,
//             [activatedField]: true,
//           },
//         }),
//       "findUnique"
//     );

//     // Handle new user creation
//     if (!userData) {
//       userData = await withRetry(
//         () =>
//           prisma.user.create({
//             data: {
//               walletAddress,
//               [pointsField]: 0,
//               [activatedField]: false,
//               updatedAt: new Date(),
//             },
//             select: {
//               walletAddress: true,
//               twitterUsername: true,
//               [pointsField]: true,
//               [activatedField]: true,
//             },
//           }),
//         "create"
//       );
//     }

//     // Calculate rank concurrently with domain fetching
//     const userPoints = userData[pointsField] || 0;
//     const rankPromise =
//       userPoints > 0
//         ? withRetry(
//             () =>
//               prisma.user
//                 .count({
//                   where: { [pointsField]: { gt: userPoints } },
//                 })
//                 .then((count) => count + 1),
//             "count"
//           )
//         : Promise.resolve(null);

//     // Fetch domains
//     //let domains: string[] = [];
//     let domains = [];
//     const domainCacheKey = walletAddress;
//     const cachedDomains = domainCache.get(domainCacheKey);
//     if (cachedDomains && Date.now() - cachedDomains.timestamp < CACHE_TTL) {
//       //domains = cachedDomains.domains;
//       domains.push(cached.domains[0]);
//     } else {
//       try {
//         const fetchedDomains = await withRetry(
//           () => tldParser.getParsedAllUserDomains(new PublicKey(walletAddress)),
//           `getParsedAllUserDomains for ${walletAddress}`
//         );
//         if (fetchedDomains.length > 0) {
//           // domains = [`[${fetchedDomains[0].domain}]`];
//           domains.push(fetchedDomains[0].domain);
//         }
//         domainCache.set(domainCacheKey, { domains, timestamp: Date.now() });
//       } catch (error) {
//         console.error(`Error fetching domains for ${walletAddress}:`, error);
//       }
//     }

//     // Await rank calculation
//     const rank = await rankPromise;

//     // Prepare response
//     const response: UserResponse = {
//       walletAddress,
//       totalPoints: Math.round(userPoints),
//       rank,
//       season,
//       twitterConnected: !!userData.twitterUsername,
//       twitterUsername: userData.twitterUsername || null,
//       isActivated: userData[activatedField] || false,
//       domains,
//     };

//     // Store in user cache
//     userCache.set(cacheKey, { data: response, timestamp: Date.now() });

//     // Log performance
//     const duration = performance.now() - startTime;
//     console.log(
//       `GET /api/mysql/user-info completed in ${duration.toFixed(2)}ms`
//     );

//     return NextResponse.json(response);
//   } catch (error) {
//     console.error("Error fetching user info:", error);
//     return NextResponse.json(
//       { error: "Internal Server Error" },
//       { status: 500 }
//     );
//   }
// }

// // Ensure Prisma disconnects on process termination
// process.on("SIGTERM", async () => {
//   await prisma.$disconnect();
// });

// // @ts-nocheck

// import { NextResponse } from "next/server";
// import { PrismaClient } from "@prisma/client";
// import { z } from "zod";

// // Singleton PrismaClient instance
// const prisma = new PrismaClient();

// // Configuration constants
// const MAX_SEASON = 5;
// const CACHE_TTL = 60 * 1000; // 1 minute cache TTL
// const MAX_RETRIES = 3;
// const RETRY_DELAY = 1000; // 1 second

// // Input validation schema
// const querySchema = z.object({
//   walletAddress: z
//     .string({ invalid_type_error: "walletAddress must be a string" })
//     .min(1, "walletAddress is required")
//     .refine((val) => val !== "null", {
//       message: "walletAddress cannot be 'null'",
//     }),
//   season: z
//     .string()
//     .nullable() // Allow null explicitly
//     .transform((val) =>
//       val === null || val === undefined ? 0 : parseInt(val, 10)
//     )
//     .refine((val) => val >= 0 && val <= MAX_SEASON, {
//       message: `Season must be between 0 and ${MAX_SEASON}`,
//     }),
// });

// // Cache for user data
// const cache: Map<string, { data: any; timestamp: number }> = new Map();

// // Types
// interface UserResponse {
//   walletAddress: string;
//   totalPoints: number;
//   rank: number | null;
//   season: number;
//   twitterConnected: boolean;
//   twitterUsername: string | null;
//   isActivated: boolean;
//   domains: string[];
// }

// // Utility function to get dynamic field names
// const getSeasonFields = (season: number) => ({
//   pointsField: season === 0 ? "amountUsd" : `season${season}Points`,
//   activatedField:
//     season === 0 ? "season0Activated" : `season${season}Activated`,
// });

// // Utility function for retrying Prisma queries
// async function withRetry<T>(
//   operation: () => Promise<T>,
//   operationName: string
// ): Promise<T> {
//   let lastError: unknown;
//   for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
//     try {
//       return await operation();
//     } catch (error) {
//       lastError = error;
//       if (error instanceof Error && error.message.includes("P1001")) {
//         console.warn(
//           `Retry ${attempt}/${MAX_RETRIES} for ${operationName} due to P1001 error`
//         );
//         if (attempt < MAX_RETRIES) {
//           await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
//           continue;
//         }
//       }
//       throw error;
//     }
//   }
//   throw lastError;
// }

// // Main GET handler
// export async function GET(req: Request) {
//   try {
//     // Parse and validate query parameters
//     const { searchParams } = new URL(req.url);
//     const rawWalletAddress = searchParams.get("walletAddress");
//     const rawSeason = searchParams.get("season");

//     // Log incoming parameters for debugging
//     console.log("Incoming query params:", {
//       walletAddress: rawWalletAddress,
//       season: rawSeason,
//     });

//     const parsedParams = querySchema.safeParse({
//       walletAddress: rawWalletAddress,
//       season: rawSeason,
//     });

//     if (!parsedParams.success) {
//       console.error("Validation error:", parsedParams.error.issues);
//       return NextResponse.json(
//         { error: parsedParams.error.issues[0].message },
//         { status: 400 }
//       );
//     }

//     const { walletAddress, season } = parsedParams.data;
//     const { pointsField, activatedField } = getSeasonFields(season);

//     // Check cache
//     const cacheKey = `${walletAddress}:${season}`;
//     const cached = cache.get(cacheKey);
//     if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
//       return NextResponse.json(cached.data);
//     }

//     // Fetch user data with retry
//     let userData = await withRetry(
//       () =>
//         prisma.user.findUnique({
//           where: { walletAddress },
//           select: {
//             walletAddress: true,
//             twitterUsername: true,
//             domains: true,
//             [pointsField]: true,
//             [activatedField]: true,
//           },
//         }),
//       "findUnique"
//     );

//     // Handle new user creation
//     if (!userData) {
//       userData = await withRetry(
//         () =>
//           prisma.user.create({
//             data: {
//               walletAddress,
//               [pointsField]: 0,
//               [activatedField]: false,
//               updatedAt: new Date(),
//             },
//             select: {
//               walletAddress: true,
//               twitterUsername: true,
//               domains: true,
//               [pointsField]: true,
//               [activatedField]: true,
//             },
//           }),
//         "create"
//       );
//     }

//     // Calculate rank by counting users with higher points
//     const userPoints = userData[pointsField] || 0;
//     const rank =
//       userPoints > 0
//         ? await withRetry(
//             () =>
//               prisma.user
//                 .count({
//                   where: {
//                     [pointsField]: { gt: userPoints },
//                   },
//                 })
//                 .then((count) => count + 1),
//             "count"
//           )
//         : null;

//     // Prepare response
//     const response: UserResponse = {
//       walletAddress,
//       totalPoints: Math.round(userPoints),
//       rank,
//       season,
//       twitterConnected: !!userData.twitterUsername,
//       twitterUsername: userData.twitterUsername || null,
//       isActivated: userData[activatedField] || false,
//       domains: userData.domains || [],
//     };

//     // Store in cache
//     cache.set(cacheKey, { data: response, timestamp: Date.now() });

//     return NextResponse.json(response);
//   } catch (error) {
//     console.error("Error fetching user info:", error);
//     return NextResponse.json(
//       { error: "Internal Server Error" },
//       { status: 500 }
//     );
//   }
// }

// // Ensure Prisma disconnects on process termination
// process.on("SIGTERM", async () => {
//   await prisma.$disconnect();
// });

// // @ts-nocheck

// import { NextResponse } from "next/server";
// import { PrismaClient } from "@prisma/client";
// import { TldParser } from "@onsol/tldparser";
// import { Connection, PublicKey } from "@solana/web3.js";

// const prisma = new PrismaClient();
// const RPC_URL = "https://mainnetbeta-rpc.eclipse.xyz";
// const connection = new Connection(RPC_URL);

// interface Domain {
//   domain: string;
// }

// // ✅ Fetch User Points, Rank, Activation Status & Domains
// export async function GET(req: Request) {
//   const { searchParams } = new URL(req.url);
//   const walletAddress = searchParams.get("walletAddress");
//   const season = parseInt(searchParams.get("season") || "0", 10);

//   if (!walletAddress) {
//     return NextResponse.json(
//       { error: "Missing walletAddress parameter" },
//       { status: 400 }
//     );
//   }
//   if (season < 0 || season > 5) {
//     return NextResponse.json(
//       { error: "Invalid season number. Must be between 0 and 5." },
//       { status: 400 }
//     );
//   }

//   // ✅ Dynamic Field Selection for Season
//   const seasonPointsField =
//     season === 0 ? "amountUsd" : `season${season}Points`;
//   const seasonActivatedField =
//     season === 0 ? "season0Activated" : `season${season}Activated`;

//   try {
//     // ✅ Fetch all users sorted by season-based points in descending order
//     const allUsers = await prisma.user.findMany({
//       select: {
//         walletAddress: true,
//         twitterUsername: true,
//         domains: true,
//         [seasonPointsField]: true,
//         [seasonActivatedField]: true,
//       },
//       orderBy: { [seasonPointsField]: "desc" },
//     });

//     // ✅ Find user and calculate rank dynamically
//     const userIndex = allUsers.findIndex(
//       (user) => user.walletAddress === walletAddress
//     );
//     let userData = userIndex !== -1 ? allUsers[userIndex] : null;

//     if (!userData || userIndex === -1) {
//       // User not found, create a new user with default values
//       userData = await prisma.user.create({
//         data: {
//           walletAddress,
//           [seasonPointsField]: 0,
//           [seasonActivatedField]: false,
//           updatedAt: new Date(),
//         },
//       });
//       //allUsers.push(userData); // Add the new user to the list for ranking purposes

//       const totalPoints = 0;
//       const rank = 0;
//       const twitterConnected = false;
//       const twitterUsername = null;
//       const isActivated = false;
//       const domains = [];

//       return NextResponse.json({
//         walletAddress,
//         totalPoints,
//         rank,
//         season,
//         twitterConnected,
//         twitterUsername,
//         isActivated, // ✅ Season activation status
//         domains: domains, // ✅ Domains from DB
//         //domains: userDomains,
//       });
//     }
//     const totalPoints = userData
//       ? Math.round(userData[seasonPointsField] || 0)
//       : 0;
//     const rank = userIndex !== -1 ? userIndex + 1 : null;
//     const twitterConnected = userData?.twitterUsername !== null;
//     const twitterUsername = userData?.twitterUsername || null;
//     const isActivated = userData
//       ? userData[seasonActivatedField] || false
//       : false;
//     const domains = userData?.domains || [];

//     // ✅ Return Combined User Data
//     return NextResponse.json({
//       walletAddress,
//       totalPoints,
//       rank,
//       season,
//       twitterConnected,
//       twitterUsername,
//       isActivated, // ✅ Season activation status
//       domains: domains, // ✅ Domains from DB
//       //domains: userDomains,
//     });
//   } catch (error) {
//     console.error("❌ Error fetching user info:", error);
//     return NextResponse.json(
//       { error: "Internal Server Error" },
//       { status: 500 }
//     );
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// // ✅ Return Combined User Data
//   return NextResponse.json({
//     walletAddress,
//     totalPoints: 0,
//     rank: 0,
//     season,
//     twitterConnected: false,
//     twitterUsername: null,
//     isActivated: false, // ✅ Season activation status
//     domains: null, // ✅ Domains from DB
//     //domains: userDomains,
//   });

// import { NextResponse } from "next/server";
// import { PrismaClient } from "@prisma/client";
// import { TldParser } from "@onsol/tldparser";
// import { Connection, PublicKey } from "@solana/web3.js";

// const prisma = new PrismaClient();
// const RPC_URL = "https://mainnetbeta-rpc.eclipse.xyz";
// const connection = new Connection(RPC_URL);

// interface Domain {
//   domain: string;
// }

// // ✅ Fetch User Points & Domains API
// export async function GET(req: Request) {
//   const { searchParams } = new URL(req.url);
//   const walletAddress = searchParams.get("walletAddress");

//   if (!walletAddress) {
//     return NextResponse.json({ error: "Missing walletAddress parameter" }, { status: 400 });
//   }

//   try {
//     // ✅ Fetch all users sorted by `amountUsd` in descending order
//     const allUsers = await prisma.user.findMany({
//       select: { walletAddress: true, amountUsd: true },
//       orderBy: { amountUsd: "desc" },
//     });

//     // ✅ Find user and calculate rank dynamically
//     const userIndex = allUsers.findIndex((user) => user.walletAddress === walletAddress);
//     const userData = userIndex !== -1 ? allUsers[userIndex] : null;
//     const amountUsd = userData ? Math.round(userData.amountUsd) : 0; // Round to nearest whole number
//     const rank = userIndex !== -1 ? userIndex + 1 : null;

//     // ✅ Fetch Owned Domains from Solana
//     const parser = new TldParser(connection);
//     let userDomains: string[] = [];

//     try {
//       const domains: Domain[] = await parser.getParsedAllUserDomains(new PublicKey(walletAddress));
//       userDomains = domains.map((d) => d.domain);
//     } catch (domainError) {
//       console.error("❌ Error fetching domains:", domainError);
//       userDomains = [];
//     }

//     // ✅ Return Combined User Data
//     return NextResponse.json({
//       walletAddress,
//       totalPoints: amountUsd,
//       rank,
//       domains: userDomains,
//     });
//   } catch (error) {
//     console.error("❌ Error fetching user info:", error);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   } finally {
//     await prisma.$disconnect();
//   }
// }
