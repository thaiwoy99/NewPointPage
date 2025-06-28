// @ts-nocheck

"use client";

import { useAppContext } from "@/context/AppWalletProvider";
import { motion } from "framer-motion";
import { Crown } from "lucide-react";

export default function TopThreeUsers() {
  const { topThreeUsers } = useAppContext();

  return (
    <div className="w-full max-w-md mx-auto mt-12">
      <h2 className="text-center text-2xl font-bold text-primary mb-6">🏆 Top 3 Users</h2>

      {/* Show loading if no top 3 users */}
      {topThreeUsers.length === 0 ? (
        <p className="text-center text-gray-500">Loading top players...</p>
      ) : (
        <div className="flex flex-col sm:grid sm:grid-cols-3 gap-4 items-center justify-center">
          {/* 🥈 2nd Place - Left (Stacked on mobile) */}
          {topThreeUsers[1] && (
            <motion.div
              key={'1'}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ scale: 1.1 }}
              className="relative p-4 rounded-lg text-center shadow-lg backdrop-blur-md transition-all duration-300 transform min-w-0 overflow-hidden 
                bg-black border border-gray-600 shadow-gray-600 w-full sm:w-auto"
              style={{ height: "140px" }}
            >
              <span className="block text-lg font-semibold text-white truncate w-full">{`${topThreeUsers[1].address.slice(0, 4)}...${topThreeUsers[1].address.slice(-4)}`}</span>
              <p className="text-green-400 font-bold text-2xl">{topThreeUsers[1].points.toLocaleString()}</p>
              <p className="text-gray-400 text-sm">🥈 2nd Place</p>
            </motion.div>
          )}

          {/* 🥇 1st Place - Center (Gold Color) */}
          {topThreeUsers[0] && (
            <motion.div
              key={'2'}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0 }}
              whileHover={{ scale: 1.1 }}
              className="relative p-4 rounded-lg text-center shadow-lg backdrop-blur-md transition-all duration-300 transform min-w-0 overflow-hidden 
                bg-gradient-to-b from-yellow-500/40 to-gray-900/40 border border-yellow-400 shadow-yellow-400 w-full sm:w-auto"
              style={{ height: "160px" }} // Taller height
            >
              {/* 👑 Animated Crown */}
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute top-[-20px] left-1/2 transform -translate-x-1/2"
              >
                <Crown className="w-8 h-8 text-yellow-400" />
              </motion.div>

              <span className="block text-lg font-semibold text-white truncate w-full">
               {`${topThreeUsers[0].address.slice(0, 4)}...${topThreeUsers[0].address.slice(-4)}`}
                </span>
              <p className="text-yellow-400 font-bold text-2xl">{topThreeUsers[0].points.toLocaleString()}</p>
              <p className="text-white text-sm">🥇 1st Place</p>
            </motion.div>
          )}

          {/* 🥉 3rd Place - Right (Stacked on mobile) */}
          {topThreeUsers[2] && (
            <motion.div
              key={'3'}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              whileHover={{ scale: 1.1 }}
              className="relative p-4 rounded-lg text-center shadow-lg backdrop-blur-md transition-all duration-300 transform min-w-0 overflow-hidden 
                bg-black border border-gray-600 shadow-gray-600 w-full sm:w-auto"
              style={{ height: "140px" }}
            >
              <span className="block text-lg font-semibold text-white truncate w-full">{`${topThreeUsers[2].address.slice(0, 4)}...${topThreeUsers[2].address.slice(-4)}`}</span>
              <p className="text-green-400 font-bold text-2xl">{topThreeUsers[2].points.toLocaleString()}</p>
              <p className="text-gray-400 text-sm">🥉 3rd Place</p>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
