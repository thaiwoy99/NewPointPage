"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Save,
  Award,
  Share2,
  TrendingUp,
  Users,
  DollarSign,
  Sparkles,
  LinkIcon,
  Wallet,
  AlertCircle,
  CopyCheck,
  CheckCircle,
  Zap,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { useAppContext } from "@/context/AppWalletProvider";
import { ActivationFlow } from "@/components/ActivationFlow";

// Types
interface Referral {
  id: string;
  name: string;
  date: string;
  earnings: number;
  status: "PENDING" | "ACTIVE" | "INACTIVE";
}

interface LeaderboardEntry {
  name: string;
  referrals: number;
}

interface UserReferralData {
  referralCode: string | null;
  defaultReferralPercentage: number;
  referrals: number;
  referralPointsTotal: number;
  earnings: number;
  pending: number;
  points: number;
  ataVerified: boolean;
}

// Demo data
const demoStats = {
  referrals: 0,
  earnings: 0,
  pending: 0,
  points: 0,
  referralPointsTotal: 0,
  ataVerified: false,
};

const SkeletonLoader: React.FC = () => (
  <div className="min-h-screen bg-black text-white relative overflow-hidden">
    <div className="absolute inset-0 bg-black">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(134,239,172,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(134,239,172,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(134,239,172,0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(134,239,172,0.06),transparent_50%)]" />
    </div>

    <div className="relative z-10 container mx-auto px-6 py-16 space-y-16">
      <div className="text-center space-y-8">
        <div className="h-16 w-[500px] mx-auto bg-gradient-to-r from-gray-800/50 to-gray-700/50 animate-pulse rounded-2xl" />
        <div className="h-8 w-80 mx-auto bg-gradient-to-r from-gray-800/50 to-gray-700/50 animate-pulse rounded-xl" />
        <div className="h-16 w-96 mx-auto bg-gradient-to-r from-gray-800/50 to-gray-700/50 animate-pulse rounded-2xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="bg-gradient-to-br from-gray-900/60 to-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 shadow-2xl"
          >
            <div className="h-8 w-32 bg-gradient-to-r from-gray-700/50 to-gray-600/50 animate-pulse rounded-xl mb-6" />
            <div className="h-12 w-24 bg-gradient-to-r from-gray-700/50 to-gray-600/50 animate-pulse rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

const ReferralDashboard: React.FC = () => {
  // State
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [customCode, setCustomCode] = useState("");
  const [percentage, setPercentage] = useState<number>(0.001);
  const [userReferralData, setUserReferralData] =
    useState<UserReferralData | null>(null);
  const [history, setHistory] = useState<Referral[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showActivationModal, setShowActivationModal] = useState(false);

  // Context
  const { walletAddress, connected } = useAppContext();

  // Canvas ref for background
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Check if user is new (not connected)
  const isNewUser = !connected;
  const stats = isNewUser ? demoStats : userReferralData || demoStats;
  const isActivated = stats.ataVerified;

  // Fetch data function - moved out of useEffect so it can be called from anywhere
  const fetchData = async () => {
    if (!connected || !walletAddress) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Fetch user data
      const userResponse = await fetch(
        `/api/user?walletAddress=${walletAddress}`
      );
      if (!userResponse.ok) {
        throw new Error("Failed to fetch user data");
      }
      const userData = await userResponse.json();

      // Fetch stats
      const statsResponse = await fetch(
        `/api/referral-stats?walletAddress=${walletAddress}`
      );
      if (!statsResponse.ok) {
        throw new Error("Failed to fetch stats");
      }
      const statsData = await statsResponse.json();

      // Fetch history
      const historyResponse = await fetch(
        `/api/referrals/history?walletAddress=${walletAddress}`
      );
      let historyData: Referral[] = [];
      if (historyResponse.ok) {
        historyData = await historyResponse.json();
      }

      // Fetch leaderboard
      const leaderboardResponse = await fetch("/api/referral/leaderboard");
      let leaderboardData: LeaderboardEntry[] = [];
      if (leaderboardResponse.ok) {
        leaderboardData = await leaderboardResponse.json();
      }

      const combinedData: UserReferralData = {
        referralCode: userData.referralCode,
        defaultReferralPercentage: userData.defaultReferralPercentage,
        referralPointsTotal: statsData.referralPointsTotal,
        referrals: statsData.referrals,
        earnings: statsData.earnings,
        pending: statsData.pending,
        points: 0,
        ataVerified: userData.ataVerified || false,
      };

      setUserReferralData(combinedData);
      setReferralCode(combinedData.referralCode || null);
      setPercentage(combinedData.defaultReferralPercentage);
      setHistory(historyData);
      setLeaderboard(leaderboardData);
    } catch (error: any) {
      console.error("Failed to fetch data:", error);
      toast.error(error.message || "Failed to fetch data");
      setUserReferralData({
        referralCode: null,
        defaultReferralPercentage: 0.001,
        referrals: 0,
        earnings: 0,
        pending: 0,
        points: 0,
        referralPointsTotal: 0,
        ataVerified: false,
      });
      setHistory([]);
      setLeaderboard([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on mount and when wallet changes
  useEffect(() => {
    fetchData();
  }, [connected, walletAddress]);

  // Background animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      opacity: number;
    }> = Array.from({ length: 50 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: Math.random() * 0.4 - 0.2,
      vy: Math.random() * 0.4 - 0.2,
      opacity: Math.random() * 0.4 + 0.2,
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(134, 239, 172, ${p.opacity})`;
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    animate();
  }, []);

  // Generate referral code
  const generateReferralCode = async () => {
    if (!connected || !walletAddress) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!isActivated) {
      toast.error("ATA verification required. Please verify your ATAs first.");
      setShowActivationModal(true);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/referral-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress, customCode }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate referral code");
      }

      const { referralCode: newCode } = await response.json();

      // Refresh all user data to get the updated referral code and other data
      await fetchData();

      setShowModal(false);
      setCustomCode("");

      toast.success("Referral code generated successfully!");
    } catch (error: any) {
      console.error("Failed to generate referral code:", error);
      toast.error(error.message || "Failed to generate referral code");
    } finally {
      setIsLoading(false);
    }
  };

  // Save percentage
  const savePercentage = async () => {
    if (!connected || !walletAddress) {
      toast.error("Please connect your wallet first");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/user/percentage", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress, percentage }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save percentage");
      }

      // Refresh user data to get the updated percentage
      await fetchData();

      toast.success("Percentage saved successfully!");
    } catch (error: any) {
      console.error("Failed to save percentage:", error);
      toast.error(error.message || "Failed to save percentage");
    } finally {
      setIsLoading(false);
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setCustomCode("");
  };

  if (isLoading) {
    return <SkeletonLoader />;
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-black">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(134,239,172,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(134,239,172,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(134,239,172,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(134,239,172,0.06),transparent_50%)]" />
      </div>

      <canvas ref={canvasRef} className="absolute inset-0 z-0 opacity-70" />

      {/* Activation Status Banner */}
      {connected && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="container mx-auto px-6 pt-6 my-24 hidden"
        >
          <div
            className={`flex items-center justify-between p-4 rounded-2xl backdrop-blur-xl border shadow-xl ${
              isActivated
                ? "bg-green-900/40 border-green-400/30"
                : "bg-orange-900/40 border-orange-400/30"
            }`}
          >
            <div className="flex items-center gap-3">
              {isActivated ? (
                <CheckCircle className="w-6 h-6 text-green-400" />
              ) : (
                <Clock className="w-6 h-6 text-orange-400" />
              )}
              <div>
                <p
                  className={`font-semibold ${
                    isActivated ? "text-green-400" : "text-orange-400"
                  }`}
                >
                  {isActivated
                    ? "ATA Tokens Verified"
                    : "ATA Verification Required"}
                </p>
                <p className="text-sm text-gray-300">
                  {isActivated
                    ? "Your ATA tokens are verified and you can earn from referrals"
                    : "Verify your ATA tokens to unlock referral benefits"}
                </p>
              </div>
            </div>
            {!isActivated && (
              <Button
                onClick={() => setShowActivationModal(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-6 py-2 rounded-xl"
              >
                <Zap className="w-4 h-4 mr-2" />
                Verify ATAs
              </Button>
            )}
          </div>
        </motion.div>
      )}

      <div className="relative z-10 container mx-auto px-6 py-16 space-y-20 mt-24">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-12"
        >
          <div className="space-y-8">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-8xl font-black bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent leading-tight"
            >
              Earn on{" "}
              <span className="bg-gradient-to-r from-primary via-primary to-primary bg-clip-text text-transparent">
                Deserialize
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl md:text-2xl text-gray-300 font-medium max-w-3xl mx-auto leading-relaxed"
            >
              You decide the fees we charge your referrals - we'll pay you 70%
              of it!
            </motion.p>
          </div>

          {referralCode ? (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto"
            >
              <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-2xl border border-gray-700/50 rounded-3xl p-10 space-y-8 shadow-2xl">
                <h3 className="text-3xl font-bold text-primary flex items-center justify-center gap-3">
                  <Share2 className="w-8 h-8" />
                  Share Your Referral
                </h3>

                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Input
                      value={`${
                        process.env.NEXT_PUBLIC_APP_URL ||
                        "https://www.deserialize.xyz"
                      }/?ref=${referralCode}`}
                      readOnly
                      className="flex-1 bg-gray-800/60 backdrop-blur-xl border-gray-600/50 text-gray-100 focus:border-primary focus:ring-primary/30 rounded-2xl px-6 py-4 text-lg font-medium"
                    />
                    <Button
                      onClick={() =>
                        copyToClipboard(
                          `${
                            process.env.NEXT_PUBLIC_APP_URL ||
                            "https://www.deserialize.xyz"
                          }/?ref=${referralCode}`
                        )
                      }
                      className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-8 py-4 rounded-2xl"
                    >
                      <LinkIcon className="w-5 h-5 mr-2" />
                      Copy Link
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <Button
                onClick={() => {
                  if (!connected || !walletAddress) {
                    toast.error("Please connect your wallet first");
                    return;
                  }

                  if (!isActivated) {
                    toast.error(
                      "ATA verification required. Please verify your ATAs first."
                    );
                    setShowActivationModal(true);
                    return;
                  }

                  setShowModal(true);
                }}
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-xl px-12 py-6 rounded-3xl shadow-2xl"
              >
                <Sparkles className="w-6 h-6 mr-3" />
                {!connected
                  ? "Connect Wallet to Start"
                  : !isActivated
                  ? "Verify ATAs First"
                  : "Generate Referral Link"}
              </Button>

              {connected && !isActivated && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-gray-400 text-center max-w-md mx-auto"
                >
                  You need to verify your ATA tokens before you can generate
                  referral links and start earning.
                </motion.p>
              )}
            </motion.div>
          )}
        </motion.section>

        {/* Fee Percentage Section - Only show if activated */}
        {isActivated && (
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-2xl border border-gray-700/50 rounded-3xl shadow-2xl">
              <CardHeader className="pb-8">
                <CardTitle className="text-3xl text-center text-primary flex items-center justify-center gap-3 font-bold">
                  <TrendingUp className="w-8 h-8" />
                  Set Your Referral Fee
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8 px-10 pb-10">
                <div className="space-y-8">
                  <div className="relative">
                    <Slider
                      value={[percentage * 100]}
                      onValueChange={(value) => setPercentage(value[0] / 100)}
                      min={0.05}
                      max={1}
                      step={0.001}
                      className="w-full h-3"
                    />
                    <div className="flex justify-between text-sm text-gray-400 mt-3">
                      <span>0.05%</span>
                      <span>1.0%</span>
                    </div>
                  </div>

                  <div className="text-center space-y-6">
                    <div className="text-5xl font-black text-primary tracking-tight">
                      {(percentage * 100).toFixed(3)}%
                    </div>
                    <p className="text-gray-300 text-lg font-medium">
                      {isNewUser
                        ? "Set your earnings rate to kickstart referrals!"
                        : `If your referral trades $10,000, you'll earn $${(
                            10000 *
                            percentage *
                            0.7
                          ).toFixed(2)}`}
                    </p>
                  </div>
                </div>

                <Button
                  onClick={savePercentage}
                  disabled={!referralCode}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold py-4 rounded-2xl"
                >
                  <Save className="w-5 h-5 mr-2" />
                  Save Percentage
                </Button>
              </CardContent>
            </Card>
          </motion.section>
        )}

        {/* Stats Section */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          <h2 className="text-4xl md:text-5xl font-black text-center bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Your Referral Stats
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                label: "Total Referrals",
                value: isNewUser ? "0" : stats.referrals.toString(),
                icon: Users,
                color: "text-blue-400",
                bgColor: "from-blue-500/20 to-blue-600/10",
                borderColor: "border-blue-400/30",
              },
              {
                label: "Total Earnings",
                value: isNewUser ? "$0" : `$${stats.earnings}`,
                icon: DollarSign,
                color: "text-primary",
                bgColor: "from-primary/20 to-primary/10",
                borderColor: "border-primary/30",
              },
              {
                label: "Referral Points",
                value: isNewUser
                  ? "0"
                  : `${stats.referralPointsTotal.toLocaleString()}`,
                icon: Sparkles,
                color: "text-purple-400",
                bgColor: "from-purple-500/20 to-purple-600/10",
                borderColor: "border-purple-400/30",
              },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
              >
                <Card
                  className={`bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-2xl border ${
                    stat.borderColor
                  } rounded-3xl shadow-2xl ${!isActivated ? "opacity-60" : ""}`}
                >
                  <CardContent className="p-8">
                    <div className="flex items-center gap-6">
                      <div
                        className={`p-4 rounded-2xl bg-gradient-to-br ${stat.bgColor} shadow-xl`}
                      >
                        <stat.icon className={`w-8 h-8 ${stat.color}`} />
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-400 font-semibold uppercase tracking-wider">
                          {stat.label}
                        </p>
                        <p className="text-3xl font-black text-white">
                          {isActivated ? stat.value : "---"}
                        </p>
                      </div>
                    </div>
                    {!isActivated && (
                      <div className="mt-4 text-center">
                        <Badge
                          variant="outline"
                          className="border-orange-400/40 bg-orange-400/10 text-orange-400 px-3 py-1 rounded-lg text-xs"
                        >
                          Activation Required
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Leaderboard */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-2xl border border-gray-700/50 rounded-3xl shadow-2xl">
            <CardHeader className="pb-8">
              <CardTitle className="text-3xl text-primary flex items-center justify-center gap-3 font-bold">
                <Award className="w-8 h-8" />
                Top Referrers
              </CardTitle>
            </CardHeader>
            <CardContent className="px-10 pb-10">
              {leaderboard.length === 0 ? (
                <div className="text-center py-12">
                  <Award className="w-16 h-16 text-gray-600 mx-auto mb-6" />
                  <h3 className="text-xl font-bold text-gray-300 mb-4">
                    Be the First Top Referrer!
                  </h3>
                  <p className="text-gray-400 text-lg">
                    {!isActivated
                      ? "Activate your referrals to compete for the top spot."
                      : "Invite friends to climb the leaderboard."}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {leaderboard.map((entry, i) => (
                    <motion.div
                      key={i}
                      initial={{ x: 60, opacity: 0 }}
                      whileInView={{ x: 0, opacity: 1 }}
                      whileHover={{ scale: 1.02, x: 10 }}
                      transition={{ duration: 0.6, delay: i * 0.1 }}
                      className="flex items-center gap-6 p-6 bg-gradient-to-r from-gray-800/60 to-gray-700/40 backdrop-blur-xl rounded-2xl border-l-4 border-primary shadow-xl"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-primary/30 to-primary/20 backdrop-blur-xl rounded-full flex items-center justify-center text-primary font-black text-lg shadow-xl">
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-white text-lg">
                          {entry.name}
                        </p>
                        <p className="text-gray-300 font-medium">
                          {entry.referrals} referrals
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.section>

        {/* Referral History */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="max-w-5xl mx-auto"
        >
          <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-2xl border border-gray-700/50 rounded-3xl shadow-2xl">
            <CardHeader className="pb-8">
              <CardTitle className="text-3xl text-primary font-bold">
                Referral History
              </CardTitle>
            </CardHeader>
            <CardContent className="px-10 pb-10">
              {history.length === 0 || !isActivated ? (
                <div className="text-center py-16">
                  <Users className="w-20 h-20 text-gray-600 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-gray-300 mb-4">
                    {!isActivated ? "Activation Required" : "No Referrals Yet"}
                  </h3>
                  <p className="text-gray-400 mb-8 text-lg">
                    {!isActivated
                      ? "Activate your referral system to start tracking your referral history!"
                      : "Invite friends to start building your referral history!"}
                  </p>
                  {!isActivated && (
                    <Button
                      onClick={() => setShowActivationModal(true)}
                      className="bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 font-bold px-8 py-4 rounded-2xl"
                    >
                      <Zap className="w-5 h-5 mr-2" />
                      Activate System
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((entry, i) => (
                    <motion.div
                      key={i}
                      initial={{ x: 60, opacity: 0 }}
                      whileInView={{ x: 0, opacity: 1 }}
                      whileHover={{ scale: 1.02, x: 10 }}
                      transition={{ duration: 0.6, delay: i * 0.1 }}
                      className="flex items-center gap-6 p-6 bg-gradient-to-r from-gray-800/60 to-gray-700/40 backdrop-blur-xl rounded-2xl border-l-4 border-primary shadow-xl"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-primary/30 to-primary/20 backdrop-blur-xl rounded-full flex items-center justify-center text-primary font-black text-lg shadow-xl">
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-white text-lg">
                          {entry.name}
                        </p>
                        <p className="text-gray-300 font-medium">
                          {entry.date}
                        </p>
                        <p className="text-gray-300 font-medium">
                          ${entry.earnings}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.section>
      </div>

      {/* Activation Flow */}
      <ActivationFlow
        isOpen={showActivationModal}
        onClose={() => setShowActivationModal(false)}
        onSuccess={async () => {
          // Refresh all user data after successful ATA verification
          await fetchData();
          setShowActivationModal(false);
        }}
        walletAddress={walletAddress}
        connected={connected}
      />

      {/* Referral Code Generation Modal */}
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-2xl border border-gray-700/50 rounded-3xl p-8 max-w-md w-full shadow-2xl"
          >
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-white">
                  Generate Referral Code
                </h3>
                <p className="text-gray-300">
                  Create your unique referral code to start earning from
                  referrals.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Custom Code (Optional)
                  </label>
                  <Input
                    value={customCode}
                    onChange={(e) => setCustomCode(e.target.value)}
                    placeholder="Enter custom code or leave blank for auto-generation"
                    className="bg-gray-800/60 backdrop-blur-xl border-gray-600/50 text-gray-100 focus:border-primary focus:ring-primary/30 rounded-xl px-4 py-3"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={closeModal}
                  variant="outline"
                  className="flex-1 border-gray-600/50 bg-gray-800/40 text-gray-200 hover:bg-gray-700/40 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={generateReferralCode}
                  disabled={isLoading}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-xl"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default ReferralDashboard;
