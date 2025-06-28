"use client";

import { useState } from "react";
import { useAppContext } from "@/context/AppWalletProvider";
import { Copy, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton Component
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Leaderboard() {
  const { leaderboardData, currentPage, totalPages, changePage, currentSeason, walletAddress, userTotalPoints, userRank, userDomains, isLoadingLeaderboard, seasonActivated, setShowUnlockModal } = useAppContext();
  //const currentSeason = 2;
  const [selectedSeason, setSelectedSeason] = useState(currentSeason); // Default to current season

  const handleCopy = (address: string) => {
    if (!address) return;
    navigator.clipboard.writeText(address)
      .then(() => toast.success("Wallet address copied!", { position: "top-right" }))
      .catch((error) => console.error("Failed to copy:", error));
  };

  // const filteredData = leaderboardData.filter((player) => player.season === selectedSeason);
  //const filteredData = leaderboardData;

  return (
    <div className="w-full max-w-5xl mx-auto mt-10 px-0 sm:px-6 py-6 text-white rounded-lg shadow-lg">
      {/* Season Filter Dropdown */}
      <div className="flex justify-end mb-4">
        <Select onValueChange={(value) => setSelectedSeason(Number(value))} defaultValue={String(currentSeason)}>
          <SelectTrigger className="w-[180px] bg-gray-800 border border-gray-700">
            <SelectValue placeholder={`Season ${currentSeason}`} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Seasons</SelectLabel>
              {[...Array(currentSeason + 1).keys()].map((season) => (
                <SelectItem key={season} value={String(season)}>
                  Season {season}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      
             
      {/* Leaderboard Table */}
      <Table>
        <TableCaption>Leaderboard for Season {selectedSeason}.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Rank</TableHead>
            <TableHead>Wallet Address</TableHead>
            <TableHead className="text-right">Total Points</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
            {walletAddress && (
              <TableRow key={walletAddress} className="bg-gray-900 text-yellow-400">
                <TableCell className="font-semibold">
                <div className="flex flex-col items-center">
                <span className="inline-flex items-center gap-x-1">
                #{userRank}
                </span>
    <span className="text-xs text-gray-400">(Me)</span>
  </div>
                  </TableCell>
                <TableCell className="flex items-center gap-2">
                  <div className="flex flex-col items-center">
                  <span className="truncate">{walletAddress.slice(0, 6)}...{walletAddress.slice(-6)}</span>
                  <span className="text-green-600">{userDomains[0]}</span>
                  </div>
                  <Copy className="w-4 h-4 cursor-pointer hover:text-blue-400" onClick={() => handleCopy(walletAddress)} />
                  {/* <ExternalLink className="w-4 h-4 cursor-pointer hover:text-green-400" /> */}
                </TableCell>
                <TableCell className="text-right font-bold">
                    {seasonActivated ? (
                    userTotalPoints.toLocaleString()
                    ) : (
                    <button
                      className="px-4 py-2 cursor-pointer border border-orange-500 text-orange-500 rounded-lg hover:bg-orange-500 hover:text-white transition"
                      onClick={() => {setShowUnlockModal(true), toast.info("Unlock Season 0 to view your points!", { position: "top-right" })}}
                    >
                      Unlock
                    </button>
                    )}
                  </TableCell>
              </TableRow>
            )}
            <>
            {isLoadingLeaderboard ? (
          // Show loading skeletons when data is loading
          [...Array(5)].map((_, index) => (
            <TableRow key={index} className="animate-pulse">
              <TableCell>
                <Skeleton className="h-5 w-10 bg-gray-700" />
              </TableCell>
              <TableCell className="flex items-center gap-2">
                <Skeleton className="h-5 w-32 bg-gray-700" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="h-5 w-12 bg-gray-700" />
              </TableCell>
            </TableRow>
          ))
        ) : (
          <>
          {leaderboardData.map((player) => (
            <>
            {/* <TableRow key={player.walletAddress} className="hover:bg-gray-800 transition"> */}
              <motion.tr 
              key={player.walletAddress}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="hover:bg-gray-800 transition"
            >
              <TableCell className="font-semibold text-green-400">#{player.rank}</TableCell>
              <TableCell className="flex items-center gap-2">
              {/* {player && player.domains && player.domains.length > 0 && (
                <span className="truncate">{player.walletAddress.slice(0, 6)}...{player.walletAddress.slice(-6)}</span>
              )} */}
                {player && player.domains && player.domains.length > 0 ? (
                  <div className="flex flex-col items-center">
                  <span className="truncate">{player.walletAddress.slice(0, 6)}...{player.walletAddress.slice(-6)}</span>
                  <span className="text-green-600">{player.domains[0]}</span>
                  </div>
                ):(
                  <span className="truncate">{player.walletAddress.slice(0, 6)}...{player.walletAddress.slice(-6)}</span>
                )}
                <Copy className="w-4 h-4 cursor-pointer hover:text-blue-400" onClick={() => handleCopy(player.walletAddress)} />
                {/* <ExternalLink className="w-4 h-4 cursor-pointer hover:text-green-400" /> */}
              </TableCell>
              <TableCell className="text-right font-bold">{player.amountUsd.toLocaleString()}</TableCell>
              </motion.tr>
            {/* </TableRow> */}
            </>
          ))}
          </>
          )}
          </>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={2}>Total Players</TableCell>
            <TableCell className="text-right">{leaderboardData.length}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
      

      {/* Pagination Controls */}
      <div className="flex justify-center items-center mt-6 space-x-4">
        <button
          onClick={() => changePage(currentPage - 1)}
          disabled={currentPage === 1}
          className={`flex items-center cursor-pointer gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            currentPage === 1 ? "opacity-50 cursor-not-allowed" : "bg-gray-800 hover:bg-gray-700"
          }`}
        >
          <ChevronLeft size={16} />
          Prev
        </button>

        <span className="text-sm font-semibold bg-gray-800 px-3 py-1 rounded-lg">
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={() => changePage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`flex items-center cursor-pointer gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "bg-gray-800 hover:bg-gray-700"
          }`}
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}




// "use client";

// import { useAppContext } from "@/context/AppContext";
// import { Copy, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
// import { useTheme } from "next-themes";
// import { motion } from "framer-motion";
// import { toast } from "sonner";
// import UserTableRow from "./UserTableRow";

// export default function Leaderboard() {
//   const { theme } = useTheme();
//   const { leaderboardData, currentPage, totalPages, changePage } = useAppContext();

//   const handleCopy = (address: string) => {
//     if (!address) return;
    
//     navigator.clipboard.writeText(address)
//       .then(() => {
//         toast.success("Wallet address copied to clipboard!", {
//           position: "top-right",
//           duration: 3000,
//         });
//       })
//       .catch((error) => console.error("Failed to copy:", error));
//   };


//   return (
//     <div className="w-full overflow-x-auto">
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//         className="w-full max-w-full sm:max-w-4xl mx-auto mt-20 py-4 md:py-6 transition-colors"
//       >
//         {/* Header */}
//         <div className="grid grid-cols-2 sm:grid-cols-3 text-gray-500 text-xs sm:text-sm pb-2 border-b border-gray-300 dark:border-gray-700">
//           <span className="text-left">Rank</span>
//           <span className="text-left hidden sm:block">Address</span>
//           <span className="text-right">Total points</span>
//         </div>

//         {/* Player List */}
//         <div className="mt-4 space-y-3">
//         <UserTableRow /> 
//           {leaderboardData.map((player, index) => (
//             <motion.div
//               key={player.walletAddress}
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.3, delay: index * 0.1 }}
//               whileHover={{
//                 scale: 1.05,
//                 boxShadow:
//                   theme === "dark"
//                     ? "0px 0px 15px rgba(30, 255, 30, 0.6)"
//                     : "0px 0px 15px rgba(30, 255, 30, 0.4)",
//               }}
//               className="flex flex-wrap sm:flex-nowrap items-center justify-between p-4 rounded-lg border transition-all cursor-pointer bg-gray-100 border-gray-300 hover:bg-gray-200 dark:bg-zinc-900 dark:border-gray-700 dark:hover:bg-gray-800"
//             >
//               {/* Rank */}
//               <span className="font-bold text-green-500 text-sm sm:text-base">#{player.rank}</span>

//               {/* Name + Address */}
//               <div className="flex flex-col text-left min-w-0">
//               <span className="font-semibold text-sm sm:text-base truncate">
//                   {player.walletAddress
//                       ? `${player.walletAddress.slice(0, 10)}...${player.walletAddress.slice(-10)}`
//                       : ""}
//               </span>

//                 <div className="flex items-center text-gray-500 text-xs sm:text-sm mt-1 space-x-2 truncate">
//                 <span className="truncate">
//                     {player.walletAddress
//                       ? `${player.walletAddress.slice(0, 4)}...${player.walletAddress.slice(-4)}`
//                       : ""}
//                   </span>
//                   <Copy
//                     className="w-4 h-4 cursor-pointer hover:text-[#1DB954]"
//                     onClick={() => handleCopy(player.walletAddress ?? '')}
//                   />
//                   <ExternalLink className="w-3 sm:w-4 h-3 sm:h-4 cursor-pointer hover:text-green-500" />
//                 </div>
//               </div>

//               {/* Points */}
//               <motion.span whileHover={{ scale: 1.1 }} className="text-sm sm:text-lg font-bold">
//                 {player.amountUsd && player.amountUsd.toLocaleString()}
//               </motion.span>
//             </motion.div>
//           ))}
//         </div>

//         {/* Pagination Controls */}
//         <div className="flex justify-center items-center mt-6 space-x-4">
//           <button
//             onClick={() => changePage(currentPage - 1)}
//             disabled={currentPage === 1}
//             className={`flex items-center cursor-pointer gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
//               currentPage === 1
//                 ? "opacity-50 cursor-not-allowed"
//                 : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
//             }`}
//           >
//             <ChevronLeft className="cursor-pointer" size={16} />
//             Prev
//           </button>

//           <span className="text-sm font-semibold bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-lg">
//             Page {currentPage} of {totalPages}
//           </span>

//           <button
//             onClick={() => changePage(currentPage + 1)}
//             disabled={currentPage === totalPages}
//             className={`flex items-center cursor-pointer gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
//               currentPage === totalPages
//                 ? "opacity-50"
//                 : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
//             }`}
//           >
//             Next
//             <ChevronRight className="cursor-pointer" size={16} />
//           </button>
//         </div>
//       </motion.div>
//       {/* <Button className="cursor-pointer" onClick={() => alert('DDD')}>Go to Page 1</Button> */}
//     </div>
//   );
// }
