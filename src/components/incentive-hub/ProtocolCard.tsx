"use client";
import Image from "next/image";
import CountUp from "react-countup";
import * as Tooltip from "@radix-ui/react-tooltip";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Gift, Loader2 } from "lucide-react";
import { useState } from "react";
import { useAppContext } from "@/context/AppWalletProvider";
import { FaXTwitter } from "react-icons/fa6";
import { FaCheckCircle } from "react-icons/fa";
import { signIn, signOut } from "next-auth/react";

type Props = {
  name: string;
  logo: string;
  points?: number;
  rank?: number;
  description?: string;
  extra?: Record<string, { value: string | number; url?: string }>;
  comingSoon?: boolean;
  isNew?: boolean;
  requiresTwitter?: boolean;
  twitterUsername?: string | null;
};

export function ProtocolCard({
  name,
  logo,
  points,
  rank,
  description,
  extra,
  comingSoon,
  requiresTwitter,
}: Props) {
  const { rankColor, tooltipText } = getRankMeta(rank ?? 0);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);

  const {
    showUnlockModal,
    setShowUnlockModal,
    isTwitterConnected,
    twitterUsername,
    walletAddress,
  } = useAppContext();

  function formatKeyLabel(key: string): string {
    return key
      .replace(/([a-z])([A-Z0-9])/g, "$1 $2")
      .replace(/([0-9])([a-zA-Z])/g, "$1 $2")
      .replace(/^./, (str) => str.toUpperCase());
  }

  // This Chunks extra entries into groups of 3 for desktop carousel
  const chunkArray = <T,>(array: T[], size: number): T[][] => {
    const result = [];
    for (let i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size));
    }
    return result;
  };

  const extraEntries = extra ? Object.entries(extra) : [];
  const itemsPerPage = 3;
  const chunks = chunkArray(extraEntries, itemsPerPage);
  const totalPages = chunks.length;

  const handlePrev = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 0));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
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
    signIn("twitter");
    setLoading(false);
  }

  return (
    <motion.div
      className={cn(
        "relative rounded-2xl border cursor-pointer p-6 bg-white/60 dark:bg-zinc-900/50",
        "shadow-md transition-all duration-300 overflow-hidden group",
        "hover:scale-[1.02] hover:shadow-2xl flex flex-col justify-between",
        "h-[230px]" // Fixed height of 220px
      )}
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Coming Soon Overlay */}
      {comingSoon && (
        <Tooltip.Provider>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <motion.div
                className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(134,239,172,0.15),_rgba(39,39,42,0.4))] z-10 flex flex-col items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                aria-label="Coming Soon Protocol"
              >
                <motion.div
                  className="flex items-center gap-2"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: [0.9, 1.05, 0.9] }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    ease: "easeInOut",
                  }}
                >
                  <Gift className="h-8 w-8 text-[#86efac]" />
                  <h3
                    className={cn(
                      "text-base sm:text-3xl font-bold bg-gradient-to-r from-[#86efac] to-[#6ee7b7] bg-clip-text text-transparent"
                    )}
                  >
                    Coming Soon
                  </h3>
                </motion.div>
                <p className="text-sm text-zinc-400 mt-2">
                  Exciting rewards await!
                </p>
              </motion.div>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                side="top"
                className="z-50 rounded-md bg-zinc-800 px-3 py-1 text-xs text-white shadow-md"
              >
                Stay tuned for this protocol!
                <Tooltip.Arrow className="fill-zinc-800" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>
      )}

      {/* Floating Rank Badge with Tooltip */}
      {!comingSoon && (
        <Tooltip.Provider>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <span
                className={cn(
                  "absolute top-4 right-4 text-xs font-bold py-1 px-2 rounded-md bg-opacity-90 text-white cursor-default",
                  rankColor
                )}
              >
                Rank #{rank}
              </span>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                side="top"
                className="z-50 rounded-md bg-zinc-800 px-3 py-1 text-xs text-white shadow-md"
              >
                {tooltipText}
                <Tooltip.Arrow className="fill-zinc-800" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>
      )}

      {/* Logo + Protocol Info */}
      <div className="flex items-center gap-4 mb-4">
        <Image
          src={logo}
          alt={`${name} logo`}
          width={48}
          height={48}
          className="rounded-md border border-white/30 shadow-sm"
        />
        <div>
          <h2 className="text-xl font-bold text-zinc-200">{name}</h2>
          {description && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Animated Points */}
      {!comingSoon && points && (
        <div>
          <p className="text-zinc-500 text-sm">Points</p>
          <motion.p
            className="text-base font-extrabold tracking-tight text-black dark:text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {Number.isInteger(points) ? (
              <CountUp end={points} duration={1.2} separator="," />
            ) : (
              points.toLocaleString()
            )}
          </motion.p>
        </div>
      )}

      {/* {requiresTwitter &&
        !twitterUsername &&
        !(requiresTwitter && !twitterUsername) && ( */}
      {requiresTwitter && !twitterUsername && (
        <Dialog>
          <DialogTrigger asChild>
            <Button
              className={cn(
                "w-full rounded-xl bg-transparent border border-zinc-600",
                "text-sm font-medium text-zinc-200 hover:bg-[#86efac] hover:text-zinc-900",
                "transition-colors duration-200 focus-visible:outline-none",
                "focus-visible:ring-2 focus-visible:ring-[#86efac]/60"
              )}
            >
              Connect Twitter
            </Button>
          </DialogTrigger>
          <DialogContent
            className={cn(
              "p-0 bg-zinc-900/50 backdrop-blur-md border border-zinc-700 shadow-2xl",
              "w-full h-full sm:max-w-2xl sm:h-auto sm:rounded-2xl",
              "text-zinc-200 animate-fade"
            )}
          >
            <DialogHeader>
              {/* <DialogTitle className="text-lg font-semibold flex justify-between items-center">
                Connect Your Twitter (X)
              </DialogTitle> */}
            </DialogHeader>

            {/* ✅ TASK 1: Connect Twitter */}
            <div className="flex items-center justify-between p-4 rounded-lg shadow-sm transition hover:shadow-lg">
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
                  disabled={loading}
                  className={cn(
                    "bg-[#86efac] hover:bg-[#86efac] cursor-pointer text-white font-semibold px-4 py-2 rounded-md shadow-md transition",
                    loading
                      ? "cursor-not-allowed opacity-70"
                      : "hover:scale-105"
                  )}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Connecting...
                    </div>
                  ) : (
                    "Connect"
                  )}
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Extra Section: Modal Trigger */}
      {!comingSoon && extra && !(requiresTwitter && !twitterUsername) && (
        <Dialog>
          <DialogTrigger asChild>
            <Button
              className={cn(
                "w-full rounded-xl bg-transparent border border-zinc-600",
                "text-sm font-medium text-zinc-200 hover:bg-[#86efac] hover:text-zinc-900",
                "transition-colors duration-200 focus-visible:outline-none",
                "focus-visible:ring-2 focus-visible:ring-[#86efac]/60"
              )}
            >
              Show More
            </Button>
          </DialogTrigger>
          <DialogContent
            className={cn(
              "p-0 bg-zinc-900/50 backdrop-blur-md border border-zinc-700 shadow-2xl",
              "w-full h-full sm:max-w-2xl sm:h-auto sm:rounded-2xl",
              "text-zinc-200 animate-fade"
            )}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative flex flex-col p-6 sm:p-8"
            >
              {/* Modal Header: Logo + Name */}
              <div className="flex items-center gap-4 mb-6">
                <Image
                  src={logo}
                  alt={`${name} logo`}
                  width={64}
                  height={64}
                  className="rounded-lg border border-zinc-600 shadow-md"
                />
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-zinc-200">
                    {name}
                  </h2>
                  {description && (
                    <p className="text-sm text-zinc-400 mt-1">{description}</p>
                  )}
                </div>
              </div>

              {/* Extra Details */}
              <div className="grid gap-4">
                <h3 className="text-lg font-semibold text-[#86efac]">
                  Your Contributions
                </h3>
                {/* Mobile: Vertical list with Y-scrolling */}
                <div className="max-sm:max-h-full max-sm:overflow-y-auto max-sm:pr-4">
                  <div className="grid gap-3">
                    {extraEntries.length <= itemsPerPage ? (
                      // For ≤ 3 items, display vertically on all devices
                      extraEntries.map(([key, { value, url }]) => (
                        <motion.div
                          key={key}
                          className="flex items-center justify-between p-4 rounded-xl bg-zinc-800/50 border border-zinc-700 shadow-sm"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div>
                            <span className="text-sm text-zinc-400">
                              {formatKeyLabel(key)}
                            </span>
                            <p className="text-base font-semibold text-zinc-200">
                              {typeof value === "number"
                                ? value.toLocaleString()
                                : value}
                            </p>
                          </div>
                          {url ? (
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Badge
                                className={cn(
                                  "bg-gradient-to-r from-[#86efac] to-[#6ee7b7] text-zinc-900",
                                  "hover:from-[#6ee7b7] hover:to-[#4ade80] transition-all duration-200",
                                  "px-3 py-1 text-xs font-medium flex items-center gap-1"
                                )}
                              >
                                <Gift className="w-4 h-4" />
                                Earn More
                              </Badge>
                            </a>
                          ) : (
                            <Badge
                              className={cn(
                                "bg-gradient-to-r from-[#86efac] to-[#6ee7b7] text-zinc-900",
                                "hover:from-[#6ee7b7] hover:to-[#4ade80] transition-all duration-200",
                                "px-3 py-1 text-xs font-medium flex items-center gap-1"
                              )}
                            >
                              <Gift className="w-4 h-4" />
                              Earn More
                            </Badge>
                          )}
                        </motion.div>
                      ))
                    ) : (
                      // Desktop: Carousel for > 3 items; Mobile: Vertical list
                      <>
                        <div className="sm:hidden grid gap-3">
                          {extraEntries.map(([key, { value, url }]) => (
                            <motion.div
                              key={key}
                              className="flex items-center justify-between p-4 rounded-xl bg-zinc-800/50 border border-zinc-700 shadow-sm"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <div>
                                <span className="text-sm text-zinc-400">
                                  {formatKeyLabel(key)}
                                </span>
                                <p className="text-base font-semibold text-zinc-200">
                                  {typeof value === "number"
                                    ? value.toLocaleString()
                                    : value}
                                </p>
                              </div>
                              {url ? (
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Badge
                                    className={cn(
                                      "bg-gradient-to-r from-[#86efac] to-[#6ee7b7] text-zinc-900",
                                      "hover:from-[#6ee7b7] hover:to-[#4ade80] transition-all duration-200",
                                      "px-3 py-1 text-xs font-medium flex items-center gap-1"
                                    )}
                                  >
                                    <Gift className="w-4 h-4" />
                                    Earn More
                                  </Badge>
                                </a>
                              ) : (
                                <Badge
                                  className={cn(
                                    "bg-gradient-to-r from-[#86efac] to-[#6ee7b7] text-zinc-900",
                                    "hover:from-[#6ee7b7] hover:to-[#4ade80] transition-all duration-200",
                                    "px-3 py-1 text-xs font-medium flex items-center gap-1"
                                  )}
                                >
                                  <Gift className="w-4 h-4" />
                                  Earn More
                                </Badge>
                              )}
                            </motion.div>
                          ))}
                        </div>
                        <div className="hidden sm:flex sm:items-center sm:gap-4">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={handlePrev}
                            disabled={currentPage === 0}
                            className={cn(
                              "text-zinc-400 cursor-pointer hover:text-[#86efac] hover:bg-zinc-700/50",
                              currentPage === 0 &&
                                "opacity-50 cursor-not-allowed"
                            )}
                          >
                            <ChevronLeft className="h-6 w-6" />
                          </Button>
                          <motion.div
                            className="flex-1 grid gap-3"
                            key={currentPage}
                            initial={{ x: 100, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -100, opacity: 0 }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                          >
                            {chunks[currentPage].map(
                              ([key, { value, url }]) => (
                                <motion.div
                                  key={key}
                                  className="flex items-center justify-between p-4 rounded-xl bg-zinc-800/50 border border-zinc-700 shadow-sm"
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.3 }}
                                >
                                  <div>
                                    <span className="text-sm text-zinc-400">
                                      {formatKeyLabel(key)}
                                    </span>
                                    <p className="text-base font-semibold text-zinc-200">
                                      {typeof value === "number"
                                        ? value.toLocaleString()
                                        : value}
                                    </p>
                                  </div>
                                  {url ? (
                                    <a
                                      href={url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <Badge
                                        className={cn(
                                          "bg-gradient-to-r from-[#86efac] to-[#6ee7b7] text-zinc-900",
                                          "hover:from-[#6ee7b7] hover:to-[#4ade80] transition-all duration-200",
                                          "px-3 py-1 text-xs font-medium flex items-center gap-1"
                                        )}
                                      >
                                        <Gift className="w-4 h-4" />
                                        Earn More
                                      </Badge>
                                    </a>
                                  ) : (
                                    <Badge
                                      className={cn(
                                        "bg-gradient-to-r from-[#86efac] to-[#6ee7b7] text-zinc-900",
                                        "hover:from-[#6ee7b7] hover:to-[#4ade80] transition-all duration-200",
                                        "px-3 py-1 text-xs font-medium flex items-center gap-1"
                                      )}
                                    >
                                      <Gift className="w-4 h-4" />
                                      Earn More
                                    </Badge>
                                  )}
                                </motion.div>
                              )
                            )}
                          </motion.div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleNext}
                            disabled={currentPage === totalPages - 1}
                            className={cn(
                              "text-zinc-400 cursor-pointer hover:text-[#86efac] hover:bg-zinc-700/50",
                              currentPage === totalPages - 1 &&
                                "opacity-50 cursor-not-allowed"
                            )}
                          >
                            <ChevronRight className="h-6 w-6" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Decorative Background */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-transparent via-white/5 to-transparent z-[-1]" />
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </motion.div>
  );
}

function getRankMeta(rank: number) {
  if (rank <= 10) {
    return {
      rankColor: "bg-gradient-to-r from-yellow-400 to-orange-500",
      tooltipText: "Top 10 – Elite Tier",
    };
  } else if (rank <= 50) {
    return {
      rankColor: "bg-gradient-to-r from-[#86efac] to-[#6ee7b7]",
      tooltipText: "Top 50 – Advanced Tier",
    };
  } else {
    return {
      rankColor: "bg-zinc-700",
      tooltipText: "Community Tier – Keep going",
    };
  }
}
