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
  wsEndpoint: RPC_URL.replace("https", "wss"),
});
const tldParser = new TldParser(connection);

// Configuration constants
const MAX_SEASON = 5;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache TTL
const MAX_RETRIES = 3;
const RETRY_DELAY = 500; // 0.5s retry delay

// In-memory cache for domains
const domainCache = new Map<string, { domains: string[]; timestamp: number }>();

// Types
interface RankedUser {
  walletAddress: string;
  twitterUsername: string | null;
  domains: string[];
  amountUsd: number;
  points: number;
  activated: boolean;
  rank: number;
}

interface ApiResponse {
  page: number;
  limit: number;
  totalPages: number;
  totalCount: number;
  data: RankedUser[];
}

// Input validation schema with zod
const querySchema = z.object({
  season: z
    .string()
    .optional()
    .transform((val) => parseInt(val || "0", 10))
    .refine((val) => val >= 0 && val <= MAX_SEASON, {
      message: `Season must be between 0 and ${MAX_SEASON}`,
    }),
  page: z
    .string()
    .optional()
    .transform((val) => parseInt(val || "1", 10))
    .refine((val) => val >= 1, {
      message: "Page must be a positive number",
    }),
  limit: z
    .string()
    .optional()
    .transform((val) => parseInt(val || "10", 10))
    .refine((val) => val >= 1 && val <= 100, {
      message: "Limit must be between 1 and 100",
    }),
});

// Utility function for retrying Solana RPC calls
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
      console.warn(
        `Retry ${attempt}/${MAX_RETRIES} for ${operationName}:`,
        error
      );
      if (attempt < MAX_RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      }
    }
  }
  throw lastError;
}

export async function GET(req: Request) {
  const startTime = performance.now();
  try {
    const { searchParams } = new URL(req.url);

    // Validate query parameters
    const parsedParams = querySchema.safeParse({
      season: searchParams.get("season"),
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
    });

    if (!parsedParams.success) {
      return NextResponse.json(
        { error: parsedParams.error.issues[0].message },
        { status: 400 }
      );
    }

    const { season, page, limit } = parsedParams.data;
    const offset = (page - 1) * limit;

    // Construct dynamic season fields
    const seasonPointsField =
      season === 0 ? "amountUsd" : `season${season}Points`;
    const seasonActivatedField = `season${season}Activated`;

    // Fetch paginated users and total count concurrently
    const [paginatedUsers, totalCount] = await Promise.all([
      prisma.user.findMany({
        select: {
          walletAddress: true, // Explicitly select scalar string field
          twitterUsername: true, // Explicitly select scalar string or null field
          amountUsd: true,
          [seasonPointsField]: true,
          [seasonActivatedField]: true,
        },
        orderBy: { [seasonPointsField]: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.user.count(),
    ]);

    // Log paginatedUsers to debug structure
    console.log("paginatedUsers:", JSON.stringify(paginatedUsers, null, 2));

    const totalPages = Math.ceil(totalCount / limit);

    // Fetch domains for each user and assign ranks with type assertion
    const rankedUsers: RankedUser[] = await Promise.all(
      paginatedUsers.map(async (user: any, index) => {
        // Runtime validation for type safety
        const walletAddress =
          typeof user.walletAddress === "string" ? user.walletAddress : "";
        const twitterUsername =
          typeof user.twitterUsername === "string" ||
          user.twitterUsername === null
            ? user.twitterUsername
            : null;

        let domains: string[] = [];
        const cacheKey = walletAddress;

        // Check cache
        const cached = domainCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
          domains = [cached.domains[0]];
        } else {
          try {
            const fetchedDomains = await withRetry(
              () =>
                tldParser.getParsedAllUserDomains(new PublicKey(walletAddress)),
              `getParsedAllUserDomains for ${walletAddress}`
            );
            if (fetchedDomains.length > 0) {
              domains = [fetchedDomains[0].domain];
            }
            domainCache.set(cacheKey, { domains, timestamp: Date.now() });
          } catch (error) {
            console.error(
              `Error fetching domains for ${walletAddress}:`,
              error
            );
          }
        }

        return {
          walletAddress,
          twitterUsername,
          domains,
          amountUsd: Math.ceil(Number(user.amountUsd) || 0),
          points: Math.ceil(Number(user[seasonPointsField]) || 0),
          activated: user[seasonActivatedField] || false,
          rank: offset + index + 1,
        } as RankedUser; // Type assertion with runtime checks
      })
    );

    // Log performance
    const duration = performance.now() - startTime;
    console.log(
      `GET /api/mysql/user-info completed in ${duration.toFixed(2)}ms`
    );

    // Return response
    const response: ApiResponse = {
      page,
      limit,
      totalPages,
      totalCount,
      data: rankedUsers,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Error fetching user data:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: error.message ? 400 : 500 }
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

// // In-memory cache for domains
// const domainCache = new Map<string, { domains: string[]; timestamp: number }>();

// // Types
// interface RankedUser {
//   walletAddress: string;
//   twitterUsername: string | null;
//   domains: string[];
//   amountUsd: number;
//   points: number;
//   activated: boolean;
//   rank: number;
// }

// interface ApiResponse {
//   page: number;
//   limit: number;
//   totalPages: number;
//   totalCount: number;
//   data: RankedUser[];
// }

// // Input validation schema with zod
// const querySchema = z.object({
//   season: z
//     .string()
//     .optional()
//     .transform((val) => parseInt(val || "0", 10))
//     .refine((val) => val >= 0 && val <= MAX_SEASON, {
//       message: `Season must be between 0 and ${MAX_SEASON}`,
//     }),
//   page: z
//     .string()
//     .optional()
//     .transform((val) => parseInt(val || "1", 10))
//     .refine((val) => val >= 1, {
//       message: "Page must be a positive number",
//     }),
//   limit: z
//     .string()
//     .optional()
//     .transform((val) => parseInt(val || "10", 10))
//     .refine((val) => val >= 1 && val <= 100, {
//       message: "Limit must be between 1 and 100",
//     }),
// });

// // Utility function for retrying Solana RPC calls
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
//       console.warn(
//         `Retry ${attempt}/${MAX_RETRIES} for ${operationName}:`,
//         error
//       );
//       if (attempt < MAX_RETRIES) {
//         await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
//         continue;
//       }
//       throw error;
//     }
//   }
//   throw lastError;
// }

// export async function GET(req: Request) {
//   const startTime = performance.now();
//   try {
//     const { searchParams } = new URL(req.url);

//     // Validate query parameters
//     const parsedParams = querySchema.safeParse({
//       season: searchParams.get("season"),
//       page: searchParams.get("page"),
//       limit: searchParams.get("limit"),
//     });

//     if (!parsedParams.success) {
//       return NextResponse.json(
//         { error: parsedParams.error.issues[0].message },
//         { status: 400 }
//       );
//     }

//     const { season, page, limit } = parsedParams.data;
//     const offset = (page - 1) * limit;

//     // Construct dynamic season fields
//     const seasonPointsField =
//       season === 0 ? "amountUsd" : `season${season}Points`;
//     const seasonActivatedField = `season${season}Activated`;

//     // Fetch paginated users and total count concurrently
//     const [paginatedUsers, totalCount] = await Promise.all([
//       prisma.user.findMany({
//         select: {
//           walletAddress: true,
//           twitterUsername: true,
//           amountUsd: true,
//           [seasonPointsField]: true,
//           [seasonActivatedField]: true,
//         },
//         orderBy: { [seasonPointsField]: "desc" },
//         take: limit,
//         skip: offset,
//       }),
//       prisma.user.count(),
//     ]);

//     const totalPages = Math.ceil(totalCount / limit);

//     // Fetch domains for each user and assign ranks
//     const rankedUsers: RankedUser[] = await Promise.all(
//       paginatedUsers.map(async (user, index) => {
//         let domains = [];
//         const cacheKey = user.walletAddress;

//         // Check cache
//         const cached = domainCache.get(cacheKey);
//         if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
//           //domains = cached.domains;
//           domains.push(cached.domains[0]);
//           //console.log('cache', domains)
//         } else {
//           try {
//             const fetchedDomains = await withRetry(
//               () =>
//                 tldParser.getParsedAllUserDomains(
//                   new PublicKey(user.walletAddress)
//                 ),
//               `getParsedAllUserDomains for ${user.walletAddress}`
//             );
//             if (fetchedDomains.length > 0) {
//              // domains = [`[${fetchedDomains[0].domain}]`];
//               domains.push(fetchedDomains[0].domain);
//             }
//             domainCache.set(cacheKey, { domains, timestamp: Date.now() });
//           } catch (error) {
//             console.error(
//               `Error fetching domains for ${user.walletAddress}:`,
//               error
//             );
//           }
//         }

//         return {
//           walletAddress: user.walletAddress,
//           twitterUsername: user.twitterUsername,
//           domains,
//           amountUsd: Math.ceil(Number(user.amountUsd) || 0),
//           points: Math.ceil(Number(user[seasonPointsField]) || 0),
//           activated: user[seasonActivatedField] || false,
//           rank: offset + index + 1,
//         };
//       })
//     );

//     // Log performance
//     const duration = performance.now() - startTime;
//     console.log(
//       `GET /api/mysql/user-info completed in ${duration.toFixed(2)}ms`
//     );

//     // Return response
//     const response: ApiResponse = {
//       page,
//       limit,
//       totalPages,
//       totalCount,
//       data: rankedUsers,
//     };

//     return NextResponse.json(response);
//   } catch (error: any) {
//     console.error("Error fetching user data:", error);
//     return NextResponse.json(
//       { error: error.message || "Internal Server Error" },
//       { status: error.message ? 400 : 500 }
//     );
//   }
// }

// // Ensure Prisma disconnects on process termination
// process.on("SIGTERM", async () => {
//   await prisma.$disconnect();
// });

// import { NextResponse } from "next/server";
// import { PrismaClient } from "@prisma/client";
// import { TldParser } from "@onsol/tldparser";
// import { Connection, PublicKey } from "@solana/web3.js";

// // Singleton PrismaClient instance
// const prisma = new PrismaClient();

// // Solana connection and TldParser setup
// const RPC_URL =
//   "https://deserial-eclipse-d6a3.mainnet.eclipse.rpcpool.com/abd4da1d-fc0c-4fc6-91f9-87dab316d56d";
// const connection = new Connection(RPC_URL);
// const tldParser = new TldParser(connection);

// // Configuration constants
// const MAX_SEASON = 5;

// // Types
// interface RankedUser {
//   walletAddress: string;
//   twitterUsername: string | null;
//   domains: Array<string>;
//   amountUsd: number;
//   points: number;
//   activated: boolean;
//   rank: number;
// }

// interface ApiResponse {
//   page: number;
//   limit: number;
//   totalPages: number;
//   totalCount: number;
//   data: RankedUser[];
// }

// // Input validation schema
// const querySchema = {
//   season: (value: string | null) => {
//     const season = parseInt(value || "0", 10);
//     if (isNaN(season) || season < 0 || season > MAX_SEASON) {
//       throw new Error(
//         `Invalid season number. Must be between 0 and ${MAX_SEASON}.`
//       );
//     }
//     return season;
//   },
//   page: (value: string | null) => {
//     const page = parseInt(value || "1", 10);
//     if (isNaN(page) || page < 1) {
//       throw new Error("Page must be a positive number.");
//     }
//     return page;
//   },
//   limit: (value: string | null) => {
//     const limit = parseInt(value || "10", 10);
//     if (isNaN(limit) || limit < 1 || limit > 100) {
//       throw new Error("Limit must be between 1 and 100.");
//     }
//     return limit;
//   },
// };

// export async function GET(req: Request) {
//   try {
//     const { searchParams } = new URL(req.url);

//     // Validate query parameters
//     const season = querySchema.season(searchParams.get("season"));
//     const page = querySchema.page(searchParams.get("page"));
//     const limit = querySchema.limit(searchParams.get("limit"));
//     const offset = (page - 1) * limit;

//     // Construct dynamic season fields
//     const seasonPointsField =
//       season === 0 ? "amountUsd" : `season${season}Points`;
//     const seasonActivatedField = `season${season}Activated`;

//     // Fetch paginated users
//     const paginatedUsers = await prisma.user.findMany({
//       select: {
//         walletAddress: true,
//         twitterUsername: true,
//         amountUsd: true,
//         [seasonPointsField]: true,
//         [seasonActivatedField]: true,
//       },
//       orderBy: { [seasonPointsField]: "desc" },
//       take: limit,
//       skip: offset,
//     });

//     // Fetch total user count for pagination
//     const totalCount = await prisma.user.count();
//     const totalPages = Math.ceil(totalCount / limit);

//     // Fetch domains for each user and assign ranks
//     const rankedUsers: RankedUser[] = await Promise.all(
//       paginatedUsers.map(async (user, index) => {
//         let domains = [];
//         try {
//           const fetchedDomains = await tldParser.getParsedAllUserDomains(
//             new PublicKey(user.walletAddress)
//           );
//           if (fetchedDomains.length > 0) {
//             console.log(fetchedDomains[0].domain)

//             domains.push(fetchedDomains[0].domain);
//           }
//         } catch (error) {
//           console.error(
//             `Error fetching domains for ${user.walletAddress}:`,
//             error
//           );
//         }

//         return {
//           walletAddress: user.walletAddress,
//           twitterUsername: user.twitterUsername,
//           domains,
//           amountUsd: Math.ceil(Number(user.amountUsd) || 0),
//           points: Math.ceil(Number(user[seasonPointsField]) || 0),
//           activated: user[seasonActivatedField] || false,
//           rank: offset + index + 1,
//         };
//       })
//     );

//     // Return response
//     const response: ApiResponse = {
//       page,
//       limit,
//       totalPages,
//       totalCount,
//       data: rankedUsers,
//     };

//     return NextResponse.json(response);
//   } catch (error: any) {
//     console.error("Error fetching user data:", error);
//     return NextResponse.json(
//       { error: error.message || "Internal Server Error" },
//       { status: error.message ? 400 : 500 }
//     );
//   }
// }

// // @ts-nocheck

// import { NextResponse } from "next/server";
// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// export async function GET(req: Request) {
//   const { searchParams } = new URL(req.url);

//   // ✅ Parse & Validate Season Parameter (Default: 0)
//   let season = parseInt(searchParams.get("season") || "0", 10);
//   if (season < 0 || season > 5) {
//     return NextResponse.json({ error: "Invalid season number. Must be between 0 and 5." }, { status: 400 });
//   }

//   // ✅ Construct dynamic season fields
//   const seasonPointsField = season === 0 ? "amountUsd" : `season${season}Points`;
//   const seasonActivatedField = `season${season}Activated`;

//   // ✅ Get Pagination Params
//   const page = parseInt(searchParams.get("page") || "1", 10);
//   const limit = parseInt(searchParams.get("limit") || "10", 10);
//   const offset = (page - 1) * limit;

//   try {
//     // ✅ Fetch Users for the Given Season (Paginated)
//     const paginatedUsers = await prisma.user.findMany({
//       select: {
//         walletAddress: true,
//         twitterUsername: true, // Nullable
//         domains: true,
//         amountUsd: true,
//         [seasonPointsField]: true, // ✅ Dynamically select season points
//         [seasonActivatedField]: true, // ✅ Dynamically select season activation
//       },
//       orderBy: { [seasonPointsField]: "desc" }, // ✅ Order by selected season points
//       take: limit,
//       skip: offset,
//     });

//     // ✅ Fetch Total User Count for Pagination
//     const totalCount = await prisma.user.count();
//     const totalPages = Math.ceil(totalCount / limit);

//     // ✅ Assign Ranks Dynamically & Round amountUsd
//     const rankedUsers = paginatedUsers.map((user, index) => ({
//       walletAddress: user.walletAddress,
//       twitterUsername: user.twitterUsername,
//       domains: user.domains || [], // ✅ Include domains
//       amountUsd: Math.ceil(user.amountUsd), // 🔹 Round up to whole number
//       points: Math.ceil(user[seasonPointsField] || 0), // 🔹 Round season points
//       activated: user[seasonActivatedField] || false, // ✅ Include season activation status
//       rank: offset + index + 1,
//     }));

//     // ✅ Return Response (Same Structure as Before)
//     return NextResponse.json({
//       page,
//       limit,
//       totalPages,
//       totalCount,
//       data: rankedUsers,
//     });
//   } catch (error) {
//     console.error("❌ Error fetching user data:", error);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// import { NextResponse } from "next/server";
// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// export async function GET(req: Request) {
//   const { searchParams } = new URL(req.url);

//   // ✅ Get pagination params (default: page=1, limit=10)
//   const season = parseInt(searchParams.get("season") || "0", 5);
//   const page = parseInt(searchParams.get("page") || "1", 10);
//   const limit = parseInt(searchParams.get("limit") || "10", 10);
//   const offset = (page - 1) * limit; // Calculate offset

//   try {
//     // ✅ Fetch only paginated users (reduces DB load)
//     const paginatedUsers = await prisma.user.findMany({
//       select: {
//         walletAddress: true,
//         twitterUsername: true, // Nullable
//         amountUsd: true,
//       },
//       orderBy: { amountUsd: "desc" },
//       take: limit,
//       skip: offset,
//     });

//     // ✅ Fetch total user count for pagination
//     const totalCount = await prisma.user.count();
//     const totalPages = Math.ceil(totalCount / limit);

//     // ✅ Assign ranks dynamically and round amountUsd
//     const rankedUsers = paginatedUsers.map((user, index) => ({
//       ...user,
//       amountUsd: Math.ceil(user.amountUsd), // 🔹 Round up to the next whole number
//       rank: offset + index + 1, // Rank is now based on offset
//     }));

//     // ✅ Return response with ranking
//     return NextResponse.json({
//       page,
//       limit,
//       totalPages,
//       totalCount,
//       data: rankedUsers,
//     });
//   } catch (error) {
//     console.error("❌ Error fetching user data:", error);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   } finally {
//     await prisma.$disconnect();
//   }
// }
