"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "../ui/button";
import { IoIosFlame } from "react-icons/io";
import { useUserWallet } from "@/context/user-wallet-provider";
import Link from "next/link";

const PointsBadge = () => {
  const { publicKey, connected } = useUserWallet();
  const [points, setPoints] = useState<number>(0);

  const apiKey = "7bK9pQ2mXv4tZ8rJ3w6nH5yL0sF8dG1cA4eT9uR2i";

  const fetchUserPoints = useCallback(async () => {
    try {
      const res = await fetch(
        `https://script.deserialize.xyz/api/user?walletAddress=${publicKey}&apiKey=${apiKey}`
      );

      console.log("Response status:", res.status, res.statusText);

      const text = await res.text(); // get raw text first
      console.log("Raw response text:", text);

      // Try parsing JSON only if content-type is JSON
      try {
        const data = JSON.parse(text);
        console.log(data);

        if (data?.totalPoints) {
          setPoints(data.totalPoints);
        }
      } catch (parseError) {
        console.error("Failed to parse JSON:", parseError);
      }
    } catch (error) {
      console.error("Error fetching points:", error);
    }
  }, [publicKey]);

  useEffect(() => {
    if (connected && publicKey) {
      fetchUserPoints();
    }
  }, [connected, publicKey, fetchUserPoints]);

  return (
    <Button className="h-fit px-2 py-1.5 md:pr-4 gap-2" variant="secondary">
      <Link href={"https://points.deserialize.xyz/"}>
        <span
          className={`size-7 rounded-full bg-secondary-foreground/40 flex items-center justify-center text-[18px] text-green-300 drop-shadow-[0_0_4px_#85eeab]`}
        >
          <IoIosFlame className="text-current" />
        </span>
      </Link>
      <div className="flex flex-col items-start text-xs">
        <span className="font-semibold">
          {connected ? points.toLocaleString() : ""}{" "}
          <span className="lg:visible invisible hidden lg:inline-block">
            Point{points > 1 || points == 0 ? "s" : ""}
          </span>
        </span>
      </div>
    </Button>
  );
};

export default PointsBadge;
