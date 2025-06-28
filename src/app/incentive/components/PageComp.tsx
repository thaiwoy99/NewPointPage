"use client";
import { useEffect, useState } from "react";
import { getAllProtocolStats } from "@/lib/getProtocols";
import { ProtocolCard } from "@/components/incentive-hub/ProtocolCard";
import { useAppContext } from "@/context/AppWalletProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Star, Twitter, Wallet, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type ProtocolStats = {
  name: string;
  logo: string;
  points?: number;
  rank?: number;
  description?: string;
  extra?: Record<string, { value: string | number; url: string }>;
  comingSoon?: boolean;
  isNew?: boolean;
  requiresTwitter?: boolean;
};

type TurboTapData = {
  data: { name: string; address: string; points: number | null; rank: number }[];
  leaderboardByTaps: { name: string; address: string; points: number | null; rank: number }[];
};

type DeserializeData = {
  totalPoints: number;
  partnersPoints: number;
  rank: number;
};

const LoadingSkeleton = () => (
  <div className="w-full flex flex-col px-6 py-2 mt-32">
    <div className="w-full max-w-7xl mx-auto px-1 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col lg:flex-row lg:justify-between gap-6">
        {/* Left Section Skeleton */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-2 sm:px-0">
          <div className="w-full max-w-[650px] min-h-[150px] h-auto rounded-lg bg-zinc-800 p-4 sm:p-6 flex flex-col">
            <div className="h-8 w-40 bg-zinc-700 rounded animate-pulse mx-auto mb-6"></div>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="w-full md:flex-1 bg-zinc-700 bg-opacity-50 p-4 rounded-lg">
                <div className="h-6 w-24 bg-zinc-700 rounded animate-pulse mx-auto mb-4"></div>
                <div className="space-y-4">
                  <div className="h-4 w-20 bg-zinc-700 rounded animate-pulse mx-auto"></div>
                  <div className="h-6 w-32 bg-zinc-700 rounded animate-pulse mx-auto"></div>
                  <div className="h-4 w-20 bg-zinc-700 rounded animate-pulse mx-auto"></div>
                  <div className="h-6 w-32 bg-zinc-700 rounded animate-pulse mx-auto"></div>
                </div>
              </div>
              <div className="w-full md:flex-1 bg-zinc-700 bg-opacity-50 p-4 rounded-lg">
                <div className="h-6 w-24 bg-zinc-700 rounded animate-pulse mx-auto mb-4"></div>
                <div className="space-y-4">
                  <div className="h-4 w-20 bg-zinc-700 rounded animate-pulse mx-auto"></div>
                  <div className="h-6 w-32 bg-zinc-700 rounded animate-pulse mx-auto"></div>
                  <div className="h-4 w-20 bg-zinc-700 rounded animate-pulse mx-auto"></div>
                  <div className="h-6 w-32 bg-zinc-700 rounded animate-pulse mx-auto"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Right Section Skeleton */}
        <div className="w-full lg:w-1/2 flex flex-col gap-4 px-2 sm:px-0">
          <div className="h-8 w-40 bg-zinc-700 rounded animate-pulse mx-auto mb-6"></div>
          <div className="grid gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-zinc-700 bg-opacity-50 p-4 rounded-lg">
                  <div className="h-4 w-24 bg-zinc-700 rounded animate-pulse mx-auto mb-2"></div>
                  <div className="h-8 w-16 bg-zinc-700 rounded animate-pulse mx-auto"></div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="bg-zinc-700 bg-opacity-50 p-4 rounded-lg flex justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-6 w-6 bg-zinc-700 rounded-full animate-pulse"></div>
                    <div>
                      <div className="h-4 w-32 bg-zinc-700 rounded animate-pulse"></div>
                      <div className="h-3 w-24 bg-zinc-700 rounded animate-pulse mt-2"></div>
                    </div>
                  </div>
                  <div className="h-5 w-5 bg-zinc-700 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
    <main className="p-6 grid gap-6 mt-12 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
      <div className="h-8 w-40 bg-zinc-700 rounded animate-pulse mx-auto mb-6 col-span-full"></div>
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-zinc-700 bg-opacity-50 p-4 rounded-lg">
          <div className="h-6 w-32 bg-zinc-700 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-48 bg-zinc-700 rounded animate-pulse"></div>
        </div>
      ))}
    </main>
  </div>
);

// const ConnectWalletPrompt = () => {
//  // const { connectWallet } = useAppContext(); 
//   return (
//     <div className="w-full min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-zinc-900 animate-fade">
//       <div className="max-w-md w-full bg-zinc-800 rounded-lg shadow-lg p-6 sm:p-8 text-center">
//         <Wallet className="h-12 w-12 text-[#86efac] mx-auto mb-4" />
//         <h2 className="text-2xl sm:text-3xl font-bold text-zinc-200 mb-4">
//           Connect Your Wallet
//         </h2>
//         <p className="text-zinc-400 text-sm sm:text-base mb-6">
//           Unlock your personalized dashboard by connecting your wallet. Track your Turbo Tap stats, Deserialize points, and explore Eclipse Dapps!
//         </p>
//         <button
//          // onClick={connectWallet} 
//           className="bg-[#86efac] hidden text-white font-semibold cursor-pointer py-2 px-4 rounded-lg hover:bg-[#86efac] transition-all duration-300 flex items-center justify-center mx-auto"
//         >
//           <Wallet className="h-5 w-5 mr-2" />
//           Connect Wallet
//         </button>
//       </div>
//     </div>
//   );
// };

export default function DashboardPage() {
  const { walletAddress, connecting, connected, twitterUsername } = useAppContext();

  const [data, setData] = useState<ProtocolStats[]>([]);
  const [turboTapData, setTurboTapData] = useState<TurboTapData>({ data: [], leaderboardByTaps: [] });
  const [deserializeData, setDeserializeData] = useState<DeserializeData | null>({ totalPoints: 0, partnersPoints: 0, rank: 0 });
  const [loading, setLoading] = useState(true);
  const [turboTapLoading, setTurboTapLoading] = useState(true);
  const [deserializeLoading, setDeserializeLoading] = useState(true);
  const [turboTapError, setTurboTapError] = useState<string | null>(null);
  const [deserializeError, setDeserializeError] = useState<string | null>(null);
  const [isPageLoading, setIsPageLoading] = useState(true);

  const API_KEY = "7bK9pQ2mXv4tZ8rJ3w6nH5yL0sF8dG1cA4eT9uR2i";

  useEffect(() => {
     const fetchProtocolData = async () => {
       const protocolData = await getAllProtocolStats(walletAddress, twitterUsername);
       setData(protocolData);
    };
    
    if (!walletAddress || connecting || !connected) {
      setLoading(false);
      setTurboTapLoading(false);
      setDeserializeLoading(false);
      setIsPageLoading(false);
      setDeserializeData(null)
      fetchProtocolData();
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setTurboTapLoading(true);
      setDeserializeLoading(true);
      setIsPageLoading(true);
      try {
        // Fetch Protocol Stats
        const protocolData = await getAllProtocolStats(walletAddress, twitterUsername);
        setData(protocolData);

        // Fetch Turbo Tap Data
        const turboTapResponse = await fetch(
          `https://script.deserialize.xyz/api/userByWallet?walletAddress=${walletAddress}&apiKey=${API_KEY}`
        );
        if (!turboTapResponse.ok) throw new Error("Failed to fetch Turbo Tap data");
        const turboTapResult = await turboTapResponse.json();
        setTurboTapData(turboTapResult);
        setTurboTapError(null);

        // Fetch Deserialize Data
        const deserializeResponse = await fetch(
          `https://script.deserialize.xyz/api/user?walletAddress=${walletAddress}&apiKey=${API_KEY}`
        );
        if (!deserializeResponse.ok) throw new Error("Failed to fetch Deserialize data");
        const deserializeResult = await deserializeResponse.json();
        setDeserializeData(deserializeResult);
        setDeserializeError(null);
      } catch (err) {
        if (err instanceof Error) {
          setTurboTapError(err.message);
          setDeserializeError(err.message);
        } else {
          setTurboTapError("An unknown error occurred");
          setDeserializeError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
        setTurboTapLoading(false);
        setDeserializeLoading(false);
        setIsPageLoading(false);
      }
    };

    fetchData();
  }, [walletAddress, connecting, connected]);

  // if (!walletAddress || connecting) {
  //   return <ConnectWalletPrompt />;
  // }

  if (isPageLoading || connecting) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="w-full flex flex-col px-6 py-2 mt-32">
      <div className="w-full max-w-7xl mx-auto px-1 sm:px-6 lg:px-8 py-6">
        {/* Main container: Switch to column on smaller screens */}
        <div className="flex flex-col lg:flex-row lg:justify-between gap-6">
          {/* Left Section: Turbo Tap Stats */}

          <div className="w-full lg:w-1/2 px-2 sm:px-0">
            <div
              className={cn(
                "flex flex-col justify-between gap-4 rounded-2xl p-6 shadow-md relative overflow-hidden lg:h-[300px] lg:gap-7",
                "bg-gradient-to-br from-[#86efac] via-[#6ee7b7] to-[#4ade80]"
              )}
              style={{
                backgroundImage: `
        linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.1) 75%, transparent 75%, transparent),
        linear-gradient(to bottom right, #86efac, #4ade80)
      `,
                backgroundSize: "20px 20px, cover",
              }}
            >
              {/* Confetti Background */}
              <div className="absolute inset-0 z-0">
                <div className="confetti confetti-1 bg-yellow-400"></div>
                <div className="confetti confetti-2 bg-pink-400"></div>
                <div className="confetti confetti-3 bg-blue-400"></div>
                <div className="confetti confetti-4 bg-purple-400"></div>
                <div className="confetti confetti-5 bg-yellow-400"></div>
                <div className="confetti confetti-6 bg-pink-400"></div>
                <div className="confetti confetti-7 bg-blue-400"></div>
                <div className="confetti confetti-8 bg-purple-400"></div>
                <div className="confetti confetti-9 bg-yellow-400"></div>
                <div className="confetti confetti-10 bg-pink-400"></div>
                <div className="confetti confetti-11 bg-blue-400"></div>
                <div className="confetti confetti-12 bg-purple-400"></div>
              </div>

              {/* Card Content */}
              <h2 className="text-2xl md:text-3xl font-extrabold text-black leading-tight">
                Incentive Hub
              </h2>

              <div>
                <p className="text-sm md:text-base font-semibold pb-2 text-zinc-900">
                  Deserialize presents you her Incentive Aggregator
                </p>
                <div className="flex items-center">
                  <p className="text-sm md:text-base font-medium pb-2 text-zinc-800 mr-2">
                    Monitor your progress across the Eclipse ecosystem in one
                    place
                  </p>
                  <div className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-green-600">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
                <p className="text-sm md:text-base font-semibold text-zinc-700">
                  🎉 Start Your Journey Today! 🎉
                </p>
              </div>

              <a
                href="#eclipse-dapps"
                className={cn(
                  "self-start rounded-lg z-0 bg-black px-4 py-2 text-white font-semibold",
                  "transition-colors cursor-pointer duration-200 hover:bg-zinc-800"
                )}
              >
                Explore Now
              </a>

              {/* Confetti Animation Styles */}
              <style jsx>{`
                .confetti {
                  position: absolute;
                  width: 8px;
                  height: 8px;
                  opacity: 0.7;
                  animation: fall linear infinite;
                }

                .confetti-1 {
                  left: 5%;
                  animation-duration: 3s;
                  animation-delay: 0s;
                }
                .confetti-2 {
                  left: 15%;
                  animation-duration: 4s;
                  animation-delay: 0.5s;
                }
                .confetti-3 {
                  left: 25%;
                  animation-duration: 3.5s;
                  animation-delay: 1s;
                }
                .confetti-4 {
                  left: 35%;
                  animation-duration: 4.5s;
                  animation-delay: 1.5s;
                }
                .confetti-5 {
                  left: 45%;
                  animation-duration: 3s;
                  animation-delay: 2s;
                }
                .confetti-6 {
                  left: 55%;
                  animation-duration: 4s;
                  animation-delay: 0.8s;
                }
                .confetti-7 {
                  left: 65%;
                  animation-duration: 3.5s;
                  animation-delay: 1.2s;
                }
                .confetti-8 {
                  left: 75%;
                  animation-duration: 4.5s;
                  animation-delay: 2.5s;
                }
                .confetti-9 {
                  left: 85%;
                  animation-duration: 3s;
                  animation-delay: 0.3s;
                }
                .confetti-10 {
                  left: 90%;
                  animation-duration: 4s;
                  animation-delay: 1.8s;
                }
                .confetti-11 {
                  left: 95%;
                  animation-duration: 3.5s;
                  animation-delay: 0.7s;
                }
                .confetti-12 {
                  left: 10%;
                  animation-duration: 4.5s;
                  animation-delay: 2.2s;
                }

                @keyframes fall {
                  0% {
                    transform: translateY(-100%) rotate(0deg);
                    opacity: 0.7;
                  }
                  100% {
                    transform: translateY(100vh) rotate(360deg);
                    opacity: 0;
                  }
                }
              `}</style>
            </div>
          </div>

          {/* Left Section: Turbo Tap Stats */}
          <div className="w-full hidden lg:w-1/2 flex items-center justify-center px-2 sm:px-0">
            <div className="w-full max-w-[650px] min-h-[150px] h-auto rounded-lg shadow-md overflow-hidden bg-zinc-800 p-4 sm:p-6 flex flex-col animate-fade">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-zinc-200 text-center mb-4 sm:mb-6 relative">
                Turbo Tap Stats
                <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-[#86efac] rounded"></span>
              </h2>
              {turboTapLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : turboTapError ? (
                <div className="text-red-400 text-center">
                  Error: {turboTapError}
                </div>
              ) : (
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Data Card */}
                  <div className="w-full md:flex-1 bg-zinc-700 bg-opacity-50 p-3 sm:p-4 rounded-lg border border-zinc-600 transition-all duration-300 hover:bg-opacity-80 hover:scale-105">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-600 bg-[#86efac] bg-opacity-75 px-3 py-1 rounded-full text-center mb-3 sm:mb-4">
                      Data
                    </h3>
                    <div className="space-y-3 sm:space-y-4 text-center">
                      <div>
                        <span className="text-[#86efac] text-xs sm:text-sm font-medium block">
                          Name
                        </span>
                        <span className="text-zinc-200 text-sm sm:text-base font-semibold">
                          {turboTapData.data[0]?.name || "N/A"}
                        </span>
                      </div>
                      <div>
                        {/* <span className="text-[#86efac] text-xs sm:text-sm font-medium block">Points</span> */}
                        <span className="text-zinc-200 text-base sm:text-lg font-bold flex items-center justify-center">
                          {/* <svg
                            className="w-4 h-4 sm:w-5 sm:h-5 mr-1 text-yellow-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                          </svg> */}
                          <p className="flex items-center gap-2 px-3 py-1 bg-orange-600/20 text-orange-300 rounded-full text-xs">
                            <AlertTriangle className="w-4 h-4" />
                            Points exported to safe environment by Eclipse
                          </p>
                          {/* <span className="inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-[#86efac] bg-opacity-20 text-[#86efac] border border-[#86efac]">
                            Points exported to safe environment by Eclipse
                            </span> */}
                          {/* {turboTapData.data[0]?.points ?? 0} */}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#86efac] text-xs sm:text-sm font-medium block">
                          Rank
                        </span>
                        <span className="text-zinc-200 text-base sm:text-lg font-bold flex items-center justify-center">
                          <svg
                            className="w-4 h-4 sm:w-5 sm:h-5 mr-1 text-yellow-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"></path>
                          </svg>
                          {turboTapData.data[0]?.rank || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Leaderboard by Taps Card */}
                  <div className="w-full md:flex-1 bg-zinc-700 bg-opacity-50 p-3 sm:p-4 rounded-lg border border-zinc-600 transition-all duration-300 hover:bg-opacity-80 hover:scale-105">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-600 bg-[#86efac] bg-opacity-75 px-3 py-1 rounded-full text-center mb-3 sm:mb-4">
                      Leaderboard by Taps
                    </h3>
                    <div className="space-y-3 sm:space-y-4 text-center">
                      <div>
                        <span className="text-[#86efac] text-xs sm:text-sm font-medium block">
                          Name
                        </span>
                        <span className="text-zinc-200 text-sm sm:text-base font-semibold">
                          {turboTapData.leaderboardByTaps[0]?.name || "N/A"}
                        </span>
                      </div>
                      <div>
                        {/* <span className="text-[#86efac] text-xs sm:text-sm font-medium block">Points</span> */}
                        <span className="text-zinc-200 text-base sm:text-lg font-bold flex items-center justify-center">
                          {/* <svg
                            className="w-4 h-4 sm:w-5 sm:h-5 mr-1 text-yellow-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                          </svg> */}
                          <p className="flex items-center gap-2 px-3 py-1 bg-orange-600/20 text-orange-300 rounded-full text-xs">
                            <AlertTriangle className="w-4 h-4" />
                            Points exported to safe environment by Eclipse
                          </p>
                          {/* {turboTapData.leaderboardByTaps[0]?.points ?? 0} */}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#86efac] text-xs sm:text-sm font-medium block">
                          Rank
                        </span>
                        <span className="text-zinc-200 text-base sm:text-lg font-bold flex items-center justify-center">
                          <svg
                            className="w-4 h-4 sm:w-5 sm:h-5 mr-1 text-yellow-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"></path>
                          </svg>
                          {turboTapData.leaderboardByTaps[0]?.rank || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="w-full lg:w-1/2 flex flex-col gap-2 px-2 sm:px-0 lg:h-[300px] lg:overflow-y-none">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-zinc-200 text-center mb-2 sm:mb-4 relative">
              Deserialize Stats
              <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-[#86efac] rounded"></span>
            </h2>
            {deserializeLoading ? (
              <div className="flex items-center justify-center h-16">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#86efac]"></div>
              </div>
            ) : deserializeError ? (
              <div className="text-red-400 text-center text-sm">
                Error: {deserializeError}
              </div>
            ) : (
              <div className="grid gap-2">
                {/* Points Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <Card className="border border-zinc-600 bg-zinc-800 bg-opacity-50 text-zinc-200 rounded-lg transition-all duration-300 hover:bg-opacity-80 hover:scale-105 animate-fade">
                    <CardHeader className="pb-1">
                      <CardTitle className="text-[10px] sm:text-xs font-medium text-[#86efac] flex items-center justify-center">
                        <Star className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-yellow-400" />
                        Swap Points
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-base sm:text-lg font-bold text-zinc-200 text-center">
                        {deserializeData ? deserializeData.totalPoints || 0 : 0}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border border-zinc-600 bg-zinc-800 bg-opacity-50 text-zinc-200 rounded-lg transition-all duration-300 hover:bg-opacity-80 hover:scale-105 animate-fade">
                    <CardHeader className="pb-1">
                      <CardTitle className="text-[10px] sm:text-xs font-medium text-[#86efac] flex items-center justify-center">
                        <Star className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-yellow-400" />
                        Partners Points
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-base sm:text-lg font-bold text-zinc-200 text-center">
                        {deserializeData
                          ? deserializeData.partnersPoints || 0
                          : 0}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border border-zinc-600 bg-zinc-800 bg-opacity-50 text-zinc-200 rounded-lg transition-all duration-300 hover:bg-opacity-80 hover:scale-105 animate-fade">
                    <CardHeader className="pb-1">
                      <CardTitle className="text-[10px] sm:text-xs font-medium text-[#86efac] flex items-center justify-center">
                        <Star className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-yellow-400" />
                        Your Rank
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-base sm:text-lg font-bold text-zinc-200 text-center">
                        {deserializeData
                          ? deserializeData.rank || "N/A"
                          : "N/A"}
                      </p>
                    </CardContent>
                  </Card>
                </div>
                {/* Action Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Card className="border border-zinc-600 cursor-pointer bg-zinc-800 bg-opacity-50 text-zinc-200 rounded-lg transition-all duration-300 hover:bg-opacity-80 hover:scale-105 animate-fade">
                    <a
                      href="https://x.com/intent/follow?screen_name=Deserialize_"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2 sm:p-3"
                    >
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <Twitter className="h-4 w-4 sm:h-5 sm:w-5 text-[#86efac]" />
                        <div>
                          <p className="font-semibold text-xs sm:text-sm">
                            Follow on Twitter(X)
                          </p>
                          <p className="text-[10px] sm:text-xs text-zinc-400">
                            Stay updated with us
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 text-zinc-400" />
                    </a>
                  </Card>
                  <Card className="border border-zinc-600 cursor-pointer bg-zinc-800 bg-opacity-50 text-zinc-200 rounded-lg transition-all duration-300 hover:bg-opacity-80 hover:scale-105 animate-fade">
                    <a
                      href="https://discord.gg/Fy9PVgBr"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2 sm:p-3"
                    >
                      <div>
                        <p className="font-semibold text-xs sm:text-sm">
                          Join Our Discord
                        </p>
                        <p className="text-[10px] sm:text-xs text-zinc-400">
                          Claim early serializer role
                        </p>
                      </div>
                      <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 text-zinc-400" />
                    </a>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <main className="px-1 py-6 sm:px-6 sm:py-6 grid gap-6 mt-12 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        <h2
          id="eclipse-dapps"
          className="text-lg sm:text-xl md:text-2xl font-bold text-zinc-200 text-center mb-4 sm:mb-6 relative col-span-full"
        >
          Eclipse Dapps
          <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-[#86efac] rounded"></span>
        </h2>
        {loading ? (
          <div className="col-span-full flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#86efac]"></div>
          </div>
        ) : (
          data.map((protocol) => (
            <ProtocolCard key={protocol.name} {...protocol} />
          ))
        )}
      </main>
    </div>
  );
}