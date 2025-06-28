/* eslint-disable @typescript-eslint/no-explicit-any */
// import { SwapSDK } from "@deserialize/swap-sdk";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import CryptoJS from "crypto-js";
// import BN from "bn.js";
import { DYNAMIC_POINT_LIST } from "./constant";

// Utility for combining class names
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// HDR: SLEEP/DELAY
export const delay = async (time: number): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`Promise resolved after ${time} milliseconds`);
    }, time * 1000);
  });
};

// HDR: Split string in the middle
export const splitStringInMiddle = (
  str: string,
  visibleChars: number = 4
): string => {
  if (str.length <= visibleChars * 2) {
    return str;
  }
  const firstPart = str.slice(0, visibleChars);
  const secondPart = str.slice(-visibleChars);

  return `${firstPart}...${secondPart}`;
};

// HDR: Check token balance of address via dynamic import
const getTokenAccountAccount = async (
  token: PublicKey,
  address: PublicKey,
  programId: PublicKey,
  connection: Connection
): Promise<any /* Account */ | null> => {
  try {
    // Ensure this code only runs in the browser:
    if (typeof window === "undefined") {
      throw new Error("getTokenAccountAccount can only be run in the browser.");
    }

    // Dynamically import @solana/spl-token on the client side
    const splToken = await import("@solana/spl-token");
    const { getAssociatedTokenAddress, getAccount } = splToken;

    // Get the associated token account address for the user and the token mint
    const ATA = await getAssociatedTokenAddress(
      token,
      address,
      true,
      programId
    );
    const tokenAccount = await getAccount(
      connection,
      ATA,
      "confirmed",
      programId
    );

    return tokenAccount;
  } catch (error) {
    console.error("Error getting token account:", error);
    // console.log("token: ", token.toBase58());
    return null;
  }
};

const getNativeBalance = async (address: string, connection: Connection) => {
  const publicKey = new PublicKey(address);
  const bal = await connection.getBalance(publicKey);

  // Define your TokenAmount type accordingly or import it if available
  const res = {
    amount: bal.toString(),
    decimals: 9,
    uiAmount: bal / LAMPORTS_PER_SOL,
    uiAmountString: (bal / LAMPORTS_PER_SOL).toString(),
  };
  return res;
};

// HDR: Get token balance
export const getTokenBalance = async (
  token: string,
  _address: string | PublicKey,
  programId: PublicKey,
  connection: Connection
) => {
  const address = new PublicKey(_address);
  let balance = {
    amount: "0",
    decimals: 0,
    uiAmount: 0,
    uiAmountString: "0",
  };

  // Dynamically import NATIVE_MINT from @solana/spl-token
  const splToken = await import("@solana/spl-token");
  const { NATIVE_MINT } = splToken;

  // If token mint equals the native mint, return native SOL balance
  if (new PublicKey(token).equals(NATIVE_MINT)) {
    return await getNativeBalance(address.toBase58(), connection);
  }

  try {
    // Get the token account for the given token mint and address
    const tokenAccount = await getTokenAccountAccount(
      new PublicKey(token),
      address,
      programId,
      connection
    );

    if (tokenAccount) {
      const tokenBalance = await connection.getTokenAccountBalance(
        tokenAccount.address
      );
      // Assign the balance (converting BigInt to a decimal value if needed)
      balance = tokenBalance.value as any;
    }

    console.log("balance: ", balance);
    return balance;
  } catch (error) {
    console.error("Error in getTokenBalance:", error);
    return balance;
  }
};

// const QUEST_THRESHOLD: number = 500;

export const getPairPointRate = (tokenA: string, tokenB: string) => {
  return DYNAMIC_POINT_LIST.find(
    (fee) =>
      fee.tokens.find((t) => t === tokenA) &&
      fee.tokens.find((t) => t === tokenB)
  );
};

export const getDeserializePoint = (
  tokenA: string,
  tokenB: string,
  amountInUsd: number
) => {
  const defaultPointRate = 0.2;
  const pairPointRate = getPairPointRate(tokenA, tokenB);

  // console.log("pairPointRate?.feeRate : ", pairPointRate?.feeRate);
  if (pairPointRate?.feeRate === 0) {
    return 0;
  }
  const pointR = pairPointRate?.feeRate ?? defaultPointRate;

  return pointR * amountInUsd * 5;
};

export const setQuestBalance = async (
  address: string,
  amountInUsd: number,
  fromTokenString: string,
  toTokenString: string
) => {
  if (amountInUsd < 10) {
    console.log("Not setting the Boost because Amount not up to 10 dollars");
    return;
  }

  const questAmount = getDeserializePoint(
    fromTokenString,
    toTokenString,
    amountInUsd
  );

  // if (questAmount < QUEST_THRESHOLD) {
  //   return;
  // }

  const data = {
    userAddress: address,
    amount: questAmount,
  };

  // Create a consistent string representation
  const dataString = JSON.stringify(data);

  // Note: For client-side code, ensure your key is exposed via NEXT_PUBLIC_ prefix.
  // Keep in mind, this means the key is publicly available and should not be a true secret.
  // console.log("CryptoJS: ", CryptoJS);

  const toHash = `${dataString}${process.env.NEXT_PUBLIC_QUEST_KEY!}`;
  const hash = CryptoJS.MD5(toHash).toString(CryptoJS.enc.Hex);

  // Build the payload with the computed hash
  const body = {
    ...data,
    hash,
  };

  // Retry logic
  const MAX_RETRIES = 3;
  let retries = 0;
  let lastError;

  while (retries < MAX_RETRIES) {
    try {
      const res = await fetch("https://api.deserialize.xyz/setQuest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      // Check if response is ok (status in the range 200-299)
      if (!res.ok) {
        throw new Error(`Server responded with status: ${res.status}`);
      }

      const data = await res.json();
      // console.log("data: ", data);
      return data.amount as string;
    } catch (error) {
      lastError = error;
      console.log(`Attempt ${retries + 1} failed:`, error);
      retries++;

      // Optional: add exponential backoff
      if (retries < MAX_RETRIES) {
        const backoffTime = 1000 * Math.pow(2, retries - 1); // 1s, 2s, 4s...
        console.log(`Retrying in ${backoffTime}ms...`);
        await new Promise((resolve) => setTimeout(resolve, backoffTime));
      }
    }
  }

  console.log(`Failed after ${MAX_RETRIES} attempts:`, lastError);
  throw lastError; // Re-throw the last error after all retries have failed
};
export const getBoost = async (walletAddress: string) => {
  try {
    const res = await fetch(
      `https://api.deserialize.xyz/quest/${walletAddress}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await res.json();
    return data;
  } catch (error) {
    console.log(error);
  }
};

//HERE WE WILL START USING THE FUNCTIONS FROM OTHER BOOST

//INVARIANT
///GET BOOST CONFIG

export const getUnWrapEthTx = async (address: string) => {
  try {
    const res = await fetch(
      `https://api.deserialize.xyz/unWrapEth/${address}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    return data.transaction;
  } catch (error) {
    console.log(error);
  }
};
