"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useWallet } from '@solana/wallet-adapter-react';
import "@solana/wallet-adapter-react-ui/styles.css";

interface Player {
  walletAddress: string; // ✅ Matches the data format
  twitterUsername: string | null; // ✅ Allows NULL values
  amountUsd: number; // ✅ Stores the user's USD amount
  rank: number; // ✅ User's rank in leaderboard
  domains: string[]; // ✅ Stores the user's domains
}

// ✅ Define Context Type
interface AppContextType {
  walletAddress: string | null;
  //isBackpackAvailable: boolean;
  connecting: boolean;
  connected: boolean;
  //tokenBalances: { symbol: string; balance: number }[]; // ✅ Defined token structure
  totalUsers: number | null;
  userRank: number | null; // ✅ Changed `any` to `number | null`
  userDomains: string[];
  userTotalPoints: number;
  leaderboardData: Player[];
  topThreeUsers: Player[];
  currentPage: number;
  currentSeason: number;
  totalPages: number;
  changePage: (page: number) => void;
  isLoadingLeaderboard: boolean;
  isLoadingDomains: boolean;
  isLoadingPoints: boolean;
  setCurrentSeason: (currentSeason: number | 0) => void;
  setTotalUsers: (totalUsers: number) => void;
  setUserRank: (rank: number | null) => void;
  setUserTotalPoints: (points: number) => void;
  setUserDomains: (domains: string[]) => void;
  setIsLoadingDomains: (isLoading: boolean) => void;
  setIsLoadingPoints: (isLoading: boolean) => void;
  isTwitterConnected: boolean;
  setIsTwitterConnected: (isTwitterConnected: boolean | false) => void;
  twitterUsername: string | null;
  setTwitterUsername: (twitterUsername: string | null) => void;
  seasonActivated: boolean;
  setSeasonActivated: (seasonActivated: boolean | false) => void;
  setIsLoadingLeaderboard: (isLoadingLeaderboard: boolean | false) => void;
  showUnlockModal: boolean
  setShowUnlockModal: (showUnlockModal: boolean) => void;
}

// Create the context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Custom hook to use the AppContext
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};

const playersPerPage = 10;

export default function AppWalletProvider({
  children,
}: {
  children: React.ReactNode;
}) {


  const { connecting, connected, publicKey } = useWallet();

  // State Variables
  const [userDomains, setUserDomains] = useState<string[]>([]);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [userTotalPoints, setUserTotalPoints] = useState<number>(0);
  const [leaderboardData, setLeaderboardData] = useState<Player[]>([]);
  const [topThreeUsers, setTopThreeUsers] = useState<Player[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(true);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [isLoadingDomains, setIsLoadingDomains] = useState(false);
  const [isLoadingPoints, setIsLoadingPoints] = useState(false);
  const [isTwitterConnected, setIsTwitterConnected] = useState(false);
  const [twitterUsername, setTwitterUsername] = useState<string | null>(null);
  const [seasonActivated, setSeasonActivated] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false)

  const [currentSeason, setCurrentSeason] = useState(0)

  // Get Wallet Address
  const walletAddress = publicKey?.toBase58() || null;

  // ✅ Function to Change Pages
  const changePage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // ✅ Fetch User Info (Points + Domains) from Our API
  async function fetchUserInfo(walletKey: string) {
    console.log('fetching info')
    try {
      setIsLoadingPoints(true);
      setIsLoadingDomains(true);

      // const response = await fetch(`/api/postgres/user-info?walletAddress=${walletKey}`);
      const response = await fetch(`/api/mysql/user-info?walletAddress=${walletKey}`);
      //console.log("twi dat", response);
      if (!response.ok) throw new Error("Failed to fetch user info");

      const dat = await response.json();

      console.log("twi dat", dat.twitterUsername);

      const data: { totalPoints: number; rank: number | null; domains: string[], twitterConnected: boolean, isActivated: boolean, twitterUsername: string } = dat;
      //console.log('Twitter Connect status', data.twitterConnected)
      // ✅ Update Points & Rank
      //console.log(`✅ User ${walletKey} Total Points:`, data.totalPoints);
      setIsTwitterConnected(data.twitterConnected)
      setUserTotalPoints(data.totalPoints);
      setUserRank(data.rank);
      setSeasonActivated(data.isActivated)
      setTwitterUsername(dat.twitterUsername)
      console.log('twitter username', data.twitterUsername)

      // ✅ Update User Domains
      //console.log(`✅ User ${walletKey} Domains:`, data.domains);
      setUserDomains(data.domains);
    } catch (error) {
      console.error("❌ Error fetching user info:", error);
      setUserTotalPoints(0);
      setUserDomains([]);
      setUserRank(null);
    } finally {
      setIsLoadingPoints(false);
      setIsLoadingDomains(false);
    }
  }


  // ✅ Fetch Top 3 Users
  useEffect(() => {
    const fetchTopThreeUsers = async () => {
      console.log("fetching info top three");
      try {
        // const response = await fetch(`/api/postgres/top-three-users`);
        const response = await fetch(`/api/mysql/top-three-users`);
        if (!response.ok) throw new Error("Failed to fetch top users");

        const data: Player[] = await response.json();
        setTopThreeUsers(data);
      } catch (error) {
        console.error("❌ Error fetching top users:", error);
      }
    };

    fetchTopThreeUsers();
  }, []);

  // ✅ Auto-detect Wallet & Fetch Data
  useEffect(() => {
    //const walletAddress = publicKey?.toBase58() || null;
    if (connected && walletAddress) {
      fetchUserInfo(walletAddress);
    }
  }, [connected, walletAddress]);

  // Fetch Leaderboard & Update Pages when `currentPage` changes
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setIsLoadingLeaderboard(true);
        const response = await fetch(`/api/mysql/user-boost?season=0&page=${currentPage}&limit=${playersPerPage}`);
        if (!response.ok) throw new Error("Failed to fetch leaderboard");

        const data: { totalPages: number; data: Player[], totalCount: number } = await response.json();
        console.log("🏆 Leaderboard Data:", data.data);

        setLeaderboardData(data.data);
        setTotalUsers(data.totalCount);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error("❌ Leaderboard fetch error:", error);
      } finally {
        setIsLoadingLeaderboard(false);
      }
    };

    fetchLeaderboard();
  }, [currentPage]);

  return (
    <AppContext.Provider
      value={{
        walletAddress,
        //isBackpackAvailable,
        connecting,
        connected,
        //tokenBalances,
        totalUsers,
        setTotalUsers,
        userDomains,
        setUserDomains,
        userRank,
        setUserRank,
        userTotalPoints,
        setUserTotalPoints,
        leaderboardData,
        topThreeUsers,
        currentPage,
        currentSeason,
        setCurrentSeason,
        totalPages,
        changePage,
        isLoadingLeaderboard,
        isLoadingDomains,
        setIsLoadingDomains,
        isLoadingPoints,
        setIsLoadingPoints,
        isTwitterConnected,
        setIsTwitterConnected,
        twitterUsername,
        setTwitterUsername,
        seasonActivated,
        setSeasonActivated,
        setIsLoadingLeaderboard,
        showUnlockModal,
        setShowUnlockModal,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}