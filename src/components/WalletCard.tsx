"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAppContext } from "@/context/AppWalletProvider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Wallet, Star, AlertTriangle} from "lucide-react";
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Badge } from "@/components/ui/badge";
import { signIn, signOut } from "next-auth/react";
import { FaCheckCircle } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// ✅ Utility Function: Truncate Wallet Address
const truncateWallet = (address: string) => {
  if (!address) return "";
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
};

// ✅ Extend Window Type to Include xnft
// declare global {
//   interface Window {
//     xnft?: {
//       solana: {
//         connect: () => Promise<void>;
//         publicKey: {
//           toString: () => string;
//         };
//       };
//     };
//   }
// }



export default function WalletCard() {
  const { connected, walletAddress, totalUsers, userTotalPoints, userRank, userDomains, isTwitterConnected, seasonActivated, connecting, isLoadingDomains, isLoadingPoints, showUnlockModal, setShowUnlockModal } = useAppContext();
  const { setVisible } = useWalletModal();
  //const { connected, publicKey, connect, select } = useWallet();
  const [isModalOpen2, setIsModalOpen2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  //const [followed, setFollowed] = useState(localStorage.getItem("followedDeserialize") === "true");
  const [checking, setChecking] = useState(false);
  const [hasClicked, setHasClicked] = useState(false);


  useEffect(() => {
    // Check if the user has already clicked before
    const storedClick = localStorage.getItem("followedDeserialize");
    if (storedClick === "true") {
      setHasClicked(true);
    }
  }, []);

  const handleFollowClick = () => {
    localStorage.setItem("followedDeserialize", "true");
    setHasClicked(true);
  };

  const checkFollowStatus = async () => {
    if (!walletAddress) {
      toast.error("Wallet address not found!", {position: "top-right"});
      return;
    }

    if (!hasClicked) {
      toast.error("You must click 'Follow' first!", {position: "top-right"});
      return;
    }

    setChecking(true);

    try {
      const response = await fetch("/api/updateSeason0", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress }),
      });

      if (response.ok) {
        toast.success("Season 0 Activated!", {position: "top-right"});
        // Reload the page after a short delay to allow toast to show
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        toast.error("Failed to update status.", {position: "top-right"});
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Something went wrong!", {position: "top-right"});
    } finally {
      setChecking(false);
    }
  };

  async function connectTwitter() {
    if (!walletAddress) return;
    setLoading(true); // Start loading

    // Step 1: Sign out any existing session
    await signOut({ redirect: false });

    // 🔹 Store walletAddress in cookies via API
    await fetch("/api/auth/set-wallet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ walletAddress }),
    });

    // Redirect to Twitter authentication
    //signIn("twitter", { callbackUrl: `/?walletAddress=${walletAddress}` });
    signIn("twitter");
    setLoading(false);
  }


  const handleClick = () => {
    if (!connected && !connecting) {
      setVisible(true); // Open the modal if not connected
    } else {
      console.log("Wallet already connected!");
      // Optionally, add disconnect logic here
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full md:w-1/2"
    >
      <Card
        className="relative border border-green-500/40 rounded-xl p-6 text-center shadow-lg 
          transition-transform duration-300 hover:scale-105 hover:shadow-green-500/50 
          bg-black overflow-hidden"
      >
        {/* 🔥 Glowing Background Animation */}
        <motion.div
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute inset-0 bg-green-500/20 blur-xl rounded-full -z-10 pointer-events-none"
        />

        <h2 className="text-lg font-semibold text-gray-300">
          MY <span className="text-green-400">SEASON 0 POINT</span>
        </h2>

        { isLoadingPoints || isLoadingDomains || connecting ? (
           <motion.div
           initial={{ opacity: 0.5 }}
           animate={{ opacity: 1 }}
           transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
           className="mt-4 space-y-3"
         >
           {/* Wallet Address Skeleton */}
           <div className="flex items-center justify-center gap-2">
             <motion.div
               className="w-24 h-6 bg-gray-700 rounded-full shadow-md"
               animate={{ opacity: [0.4, 1, 0.4] }}
               transition={{ duration: 1.5, repeat: Infinity }}
             ></motion.div>
             <motion.div
               className="w-4 h-4 bg-yellow-500 rounded-full"
               animate={{ opacity: [0.4, 1, 0.4] }}
               transition={{ duration: 1.5, repeat: Infinity }}
             ></motion.div>
           </div>
       
           {/* Points Skeleton */}
           <div className="flex items-center justify-center gap-2">
             {/* <p className="text-gray-500">Total Points:</p> */}
             <motion.div
               className="w-12 h-6 bg-gray-700 rounded-md shadow-md"
               animate={{ opacity: [0.4, 1, 0.4] }}
               transition={{ duration: 1.5, repeat: Infinity }}
             ></motion.div>
           </div>
       
           {/* Domains Skeleton */}
           <div className="mt-2">
             {/* <h3 className="text-sm font-semibold text-green-400">Owned Domains</h3> */}
             <ul className="space-y-1">
               <motion.li
                 className="w-32 h-5 bg-gray-700 rounded-lg shadow-md"
                 animate={{ opacity: [0.4, 1, 0.4] }}
                 transition={{ duration: 1.5, repeat: Infinity }}
               ></motion.li>
               <motion.li
                 className="w-28 h-5 bg-gray-700 rounded-lg shadow-md"
                 animate={{ opacity: [0.4, 1, 0.4] }}
                 transition={{ duration: 1.5, repeat: Infinity }}
               ></motion.li>
             </ul>
           </div>
         </motion.div>
         ) : (
          <>
        {connected && walletAddress ? (
          <div className="mt-4 space-y-3">
            
            {/* 🔥 Truncated Wallet Address with Badge */}
            <div className="flex flex-col items-center justify-center gap-2">
              {/* <p className="px-3 py-1 bg-green-600/20 text-green-300 rounded-full text-xs shadow-md">
                {truncateWallet(walletAddress)}
              </p> */}
                <p className="flex items-center gap-2 px-3 py-1 bg-orange-600/20 text-orange-300 rounded-full text-xs shadow-md">
                  <AlertTriangle className="w-4 h-4" />
                   Points are recalculated at regular intervals
                </p>
              {/* <Star className="text-yellow-400 w-4 h-4 animate-pulse" /> */}
              <ul className="text-gray-300 text-sm space-y-1">
                  {userDomains.slice(0, 2).map((domain, index) => (
                    <li key={index} className="px-3 py-1 rounded-lg text-gray-200 shadow-md">
                      {domain}
                    </li>
                  ))}
                </ul>
            </div>

            {/* 🏆 Total Points Display with Warning Indicator */}
            <p className="text-gray-500 flex items-center justify-center gap-2">
              {/* Total Points: */}
              {seasonActivated &&
              <span
                className={`font-bold px-2 py-1 rounded-md shadow-md ${seasonActivated
                    ? "bg-gradient-to-r from-green-800 to-green-600 text-white"
                    : "border border-yellow-500 text-yellow-400 bg-transparent"
                  }`}
              >
                {userTotalPoints.toLocaleString()}
              </span>
              }

              {/* Warning Badge for Activation */}
              {!seasonActivated && (
                <Dialog open={isModalOpen2 || showUnlockModal} onOpenChange={(isOpen) => { setShowUnlockModal(isOpen); setIsModalOpen2(isOpen); }}>
                  <DialogTrigger asChild>
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1 border-yellow-500 text-yellow-500 cursor-pointer px-6 py-3 text-sm"
                      onClick={() => setIsModalOpen2(true)}
                    >
                      <AlertTriangle className="w-3 h-3" />
                      Activate Now
                    </Badge>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-800 text-white p-6 rounded-lg shadow-lg outline-none border-none focus:outline-none focus:border-none">
                    <DialogHeader>
                      <DialogTitle className="text-lg font-semibold flex justify-between items-center">
                        Connect Your Twitter (X)
                      </DialogTitle>
                    </DialogHeader>

                    <p className="text-gray-300 text-sm mt-2">
                      Complete these tasks to activate your points and gain full access.
                    </p>

                    {/* ✅ TASK 1: Connect Twitter */}
                    <div className="flex items-center justify-between p-4 bg-gray-800 border border-gray-700 rounded-lg shadow-sm transition hover:shadow-lg">
                      <div className="flex items-center gap-3">

                        <span className="text-white">Connect Your</span>
                        <FaXTwitter className="text-blue-400 w-5 h-5" />
                        <span className="text-white">Account</span>
                      </div>
                      {isTwitterConnected ? (
                        <FaCheckCircle className="text-green-400 w-5 h-5" />
                      ) : (
                        <Button
                          onClick={connectTwitter}
                          disabled={loading} // Disable button when loading
                          className={`bg-[#86efac] hover:bg-[#86efac] cursor-pointer text-white font-semibold px-4 py-2 rounded-md shadow-md transition ${loading ? "cursor-not-allowed opacity-70" : "hover:scale-105"
                            }`}
                        >
                          {loading ? (
                            <div className="flex items-center gap-2">
                              <Loader2 className="w-5 h-5 animate-spin" /> {/* Spinning icon */}
                              Connecting...
                            </div>
                          ) : (
                            "Connect"
                          )}
                        </Button>
                      )}
                    </div>

                    {/* ✅ TASK 2: Follow Deserialize */}
                    <div className="flex items-center justify-between p-4 bg-gray-800 border border-gray-700 rounded-lg shadow-sm transition hover:shadow-lg">
      {/* Task Description */}
      <div className="flex items-center gap-3">
        <span className="text-white">Follow Deserialize on</span>
        <FaXTwitter className="text-blue-400 w-6 h-6" />
      </div>

      {/* Buttons Section */}
      <div className="flex items-center gap-2">
        {isFollowing ? (
          <FaCheckCircle className="text-green-400 w-6 h-6" />
        ) : (
          <>
            <a
              href="https://x.com/intent/follow?screen_name=Deserialize_"
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleFollowClick} // Track Click
              className="bg-[#86efac] hover:bg-[#86efac] text-white px-4 py-2 rounded-md font-semibold shadow-md transition hover:scale-105"
            >
              Follow
            </a>
            <button
              onClick={checkFollowStatus}
              disabled={checking}
              className={`border border-[#86efac] cursor-pointer px-4 py-2 rounded-md font-semibold shadow-sm transition text-ellipsis overflow-hidden whitespace-nowrap ${
              checking ? "bg-gray-600 text-gray-400 cursor-not-allowed" : "text-[#86efac] hover:bg-[#86efac] hover:text-white"
              }`}
              style={{ maxWidth: "100%" }}
            >
              {checking ? "Checking..." : "Check Status"}
            </button>
          </>
        )}
      </div>
    </div>
                  </DialogContent>
                  
                </Dialog>
              )}
            </p>

            {/* 🌍 Display Domains (if available) */}
            {userDomains.length > 0 ? (
              <div className="mt-2 hidden">
                <h3 className="text-sm font-semibold text-green-400">Owned Domains</h3>
                <ul className="text-gray-300 text-sm space-y-1">
                  {userDomains.slice(0, 2).map((domain, index) => (
                    <li key={index} className="px-3 py-1 bg-gray-700 rounded-lg text-gray-200 shadow-md">
                      {domain}
                    </li>
                  ))}
                </ul>
                {userDomains.length > 2 && (
                  <p className="text-xs text-gray-400 mt-1">+{userDomains.length - 2} more</p>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No domains found</p>
            )}
          </div>
        ) : (
          // No Wallet Connected: Show Connect Button
              <Button onClick={handleClick} className="mt-4 px-6 py-2 border cursor-pointer border-green-400 bg-transparent text-green-400 
                hover:bg-green-500 hover:text-black transition-all duration-300 shadow-md">
                <Wallet className="mr-2 w-4 h-4" />
                Unlock Rewards
              </Button>
        )}
        </>
        )}

        {/* 🔥 Rank & Referral Section */}
        <div className="flex justify-between text-muted-foreground mt-4 text-xs">
            {isLoadingPoints || isLoadingDomains || connecting ? (
            <motion.span
              className="flex items-center gap-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
            >
              Your rank - 
              <motion.span
              className="text-green-400 font-semibold flex gap-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                staggerChildren: 0.2,
              }}
              >
              <motion.span
                className="w-1 h-1 bg-green-400 rounded-full"
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <motion.span
                className="w-1 h-1 bg-green-400 rounded-full"
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
              />
              <motion.span
                className="w-1 h-1 bg-green-400 rounded-full"
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
              />
              </motion.span>
            </motion.span>
            ) : (
            <span>
              Your rank - <span className="text-green-400 font-semibold">{userRank ?? 0}<span className="text-gray-500 text-lg"> / </span> <span className="text-gray-500">{totalUsers}</span></span>
            </span>
            )}
          {/* <span>Referral -</span> */}
        </div>
      </Card>
    </motion.div>
  );
}
