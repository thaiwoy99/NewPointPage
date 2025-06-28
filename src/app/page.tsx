// "use client";

// import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
// import { useWalletMultiButton } from '@solana/wallet-adapter-base-ui';
// import { useConnection, useWallet } from "@solana/wallet-adapter-react";
// import { useWalletModal } from '@solana/wallet-adapter-react-ui';

// export default function Home() {

//   const { connection } = useConnection();
//   const { publicKey } = useWallet();
//   const { setVisible } = useWalletModal();

//   const { connected } = useWallet();

//   const handleClick = () => {
//     if (!connected) {
//       setVisible(true);
//     } else {
//       console.log("Wallet already connected!");
//     }
//   };

//   // const { buttonState, onConnect, onDisconnect, publicKey, walletIcon, walletName } = useWalletMultiButton({
//   //   onSelectWallet() {
//   //       //setModalVisible(true);
//   //   },
//   // });

//   return (
//     <main className="flex items-center justify-center min-h-screen">
//       <div className="border hover:border-slate-900 rounded">
//         <WalletMultiButton style={{}} />
//         <div>{publicKey?.toBase58()}</div>

//         <button
//       onClick={handleClick}
//       style={{
//         padding: '10px 20px',
//         backgroundColor: '#007bff',
//         color: 'white',
//         border: 'none',
//         borderRadius: '5px',
//         cursor: 'pointer',
//       }}
//     >
//       {connected ? 'Wallet Connected' : 'Connect Wallet'}
//     </button>
//       </div>
//     </main>
//   );
// }

"use client";

import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RefreshCcw, BadgePercent } from "lucide-react";
import { motion } from "framer-motion";
import Leaderboard from "@/components/Leaderboard";
import TopThreeUsers from "@/components/TopThreeUsers";
import WalletCard from "@/components/WalletCard";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function DeserializeExpedition() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="relative min-h-screen mt-18 flex flex-col items-center justify-center px-6 bg-black text-foreground overflow-hidden">
      {/* 🔥 Animated Background Glow Effect */}
      <motion.div
        animate={{ opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute inset-0 bg-zinc-500/10 blur-3xl"
      />

      {/* ✨ Floating Particles Effect */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 0, scale: 0.5 }}
            animate={{
              opacity: [0.1, 0.5, 0.1],
              y: [-10, 10, -10],
              scale: [0.8, 1, 0.8],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
            className="absolute w-2 h-2 bg-green-400 rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* 🔥 Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mt-24 relative z-10"
      >
        {/* 🔥 Glowing Title with Fixes */}
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          whileHover={{ scale: 1.05 }}
          className="relative text-4xl md:text-5xl font-bold tracking-wide text-transparent 
      bg-clip-text bg-gradient-to-r from-green-400 via-green-300 to-green-400 
      shadow-lg"
        >
          Deserialize Rewards
          {/* 🔥 FIXED: Shine Effect (Now Clickable) */}
          <motion.span
            className="absolute inset-0 bg-white/10 rounded-full blur-lg -z-10 pointer-events-none"
            animate={{ x: [-100, 100] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        </motion.h1>

        {/* 📝 Description */}
        <p className="text-muted-foreground mt-3 max-w-full md:max-w-2xl mx-auto">
          Each season, new currents rise, bringing fresh ways to earn. Dive in
          and claim what&apos;s yours; every action pulls you closer.
          {/* Earn rewards as you trade, provide liquidity, and take part in exclusive Deserialize campaigns. The more you engage, the more points you score! */}
        </p>

        {/* 🔥 FIXED: Clickable "Learn More" Link */}

        <motion.button
          onClick={() => setDialogOpen(true)}
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.3 }}
          className="text-green-400 cursor-pointer underline mt-4 inline-block font-semibold hover:text-yellow-300 transition-all"
        >
          Learn more ↗
        </motion.button>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Terms of Use</DialogTitle>
              {/* <DialogDescription>
                Here are the terms of use for Deserialize Quest. Please read them carefully before proceeding.
              </DialogDescription> */}
              {/* <DialogDescription>
                Each season, new currents rise, bringing fresh ways to earn. Dive in and claim what's yours; every action pulls you closer.
              </DialogDescription> */}
              <DialogDescription className="text-base">
                We reserve the right to update point calculations at any time.
                Terms apply.
              </DialogDescription>
              <DialogDescription className="mx-auto">
                Deserialize everything
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                onClick={() => setDialogOpen(false)}
                className="bg-green-500 hover:bg-green-600"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* 🔥 Cards Section */}
      <div className="flex flex-col md:flex-row items-center gap-6 mt-10 w-full max-w-4xl">
        {/* 🔥 Cards Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row items-start gap-6 mt-10 w-full max-w-4xl"
        >
          <WalletCard />

          {/* POINTS INFO CARD */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full md:w-1/2"
          >
            <Card
              className="relative border border-green-500/40 rounded-xl p-6 shadow-lg transition-transform duration-300 
      hover:scale-105 hover:shadow-green-400/50 bg-black 
      overflow-hidden"
            >
              {/* 🔥 Glowing Background Animation (FIXED) */}
              <motion.div
                animate={{ opacity: [0.1, 0.4, 0.1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute inset-0 bg-green-500/20 blur-xl rounded-full -z-10 pointer-events-none"
              />

              <h3 className="text-lg font-semibold text-green-300 flex items-center gap-2">
                How to Earn Points
                <BadgePercent className="w-5 h-5 text-yellow-400 animate-pulse" />
              </h3>

              <p className="text-gray-400 text-sm mt-2">
                You&apos;re gliding through S0-your points are stacking. Keep
                swapping with Deserialize, you&apos;re already making waves but
                the end is near.
                <a
                  href="https://deserialize.xyz/"
                  className="ml-2 text-green-400 underline text-sm mt-2 inline-block hover:text-green-300 transition-all"
                >
                  Learn more ↗
                </a>
              </p>

              {/* 🔥 List of Earning Methods (Now Clickable) */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.a
                      href="https://deserialize.xyz/"
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.1, color: "#22c55e" }}
                      className="flex items-center gap-2 text-gray-300 hover:text-green-400 cursor-pointer transition-all p-2 rounded-lg bg-gray-800 shadow-md"
                    >
                      <RefreshCcw className="w-5 h-5 text-green-400" />
                      Swap Tokens
                    </motion.a>
                  </TooltipTrigger>
                  <TooltipContent>
                    Earn points by swapping tokens
                  </TooltipContent>
                </Tooltip>

                {/* <Tooltip>
            <TooltipTrigger asChild>
              <motion.a 
              href="https://deserialize.xyz/" 
              target="_blank" 
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1, color: "#22c55e" }} 
              className="flex items-center gap-2 text-gray-300 hover:text-green-400 cursor-pointer transition-all p-2 rounded-lg bg-gray-800 shadow-md"
              >
              <BadgePercent className="w-5 h-5 text-green-400" />
              Provide Liquidity
              </motion.a>
            </TooltipTrigger>
            <TooltipContent>Earn rewards by providing liquidity</TooltipContent>
            </Tooltip> */}

                {/* <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div
                      whileHover={{ scale: 1.1, color: "#22c55e" }}
                      className="flex items-center gap-2 text-gray-300 hover:text-green-400 cursor-pointer transition-all p-2 rounded-lg bg-gray-800 shadow-md"
                    >
                      <Users className="w-5 h-5 text-green-400" />
                      Referral Program
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent>Refer friends and earn bonus points coming soon</TooltipContent>
                </Tooltip> */}
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </div>

      <div className="w-full relative pointer-events-auto">
        <TopThreeUsers />
        <Leaderboard />
      </div>
    </div>
  );
}
