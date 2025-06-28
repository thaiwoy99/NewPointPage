"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Chart from "chart.js/auto";
import confetti from "canvas-confetti";
import QRCode from "qrcode";
import { Toaster, toast } from "react-hot-toast";
import { useAppContext } from "@/context/AppWalletProvider";
import { ActivationFlow } from "@/components/ActivationFlow";
import {
  Save,
  Award,
  Share2,
  ListFilter,
  TrendingUp,
  Users,
  DollarSign,
  Sparkles,
  LinkIcon,
  QrCode,
  Wallet,
  AlertCircle,
  CopyCheck,
  ChevronDown,
  CheckCircle,
  Zap,
  Clock,
} from "lucide-react";

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

interface FAQ {
  question: string;
  answer: string;
}

interface UserReferralData {
  referralCode: string | null;
  defaultReferralPercentage: number;
  referrals: number;
  referralPointsTotal: number;
  earnings: number;
  pending: number;
  points: number;
  isActivated?: boolean; // New field for activation status
}

// New interface for activation flow
interface ActivationState {
  step: "input" | "verifying" | "success" | "error";
  referralCode: string;
  ataVerified: boolean;
  error?: string;
}

const SkeletonLoader: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Enhanced background with subtle patterns */}
      <div className="absolute inset-0 bg-black">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(134,239,172,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(134,239,172,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(134,239,172,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(134,239,172,0.06),transparent_50%)]" />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-16 space-y-16">
        {/* Hero Skeleton */}
        <div className="text-center space-y-8">
          <div className="h-16 w-[500px] mx-auto bg-gradient-to-r from-gray-800/50 to-gray-700/50 animate-pulse rounded-2xl" />
          <div className="h-8 w-80 mx-auto bg-gradient-to-r from-gray-800/50 to-gray-700/50 animate-pulse rounded-xl" />
          <div className="h-16 w-96 mx-auto bg-gradient-to-r from-gray-800/50 to-gray-700/50 animate-pulse rounded-2xl" />
        </div>

        {/* Stats Skeleton */}
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

        {/* Chart Skeleton */}
        <div className="max-w-5xl mx-auto">
          <div className="h-80 bg-gradient-to-br from-gray-900/60 to-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl animate-pulse shadow-2xl" />
        </div>
      </div>
    </div>
  );
};

const ReferralDashboard: React.FC = () => {
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState(1);
  const [customCode, setCustomCode] = useState("");
  const [percentage, setPercentage] = useState<number>(0.001);
  const [showFAQ, setShowFAQ] = useState(false);
  const [userReferralData, setUserReferralData] =
    useState<UserReferralData | null>(null);
  const [history, setHistory] = useState<Referral[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  // New state for activation flow
  const [showActivationModal, setShowActivationModal] = useState(false);
  const [activationState, setActivationState] = useState<ActivationState>({
    step: "input",
    referralCode: "",
    ataVerified: false,
  });
  const [isActivated, setIsActivated] = useState(false);

  const { walletAddress, connecting, connected } = useAppContext();

  // Demo data
  const demoStats = {
    referrals: 0,
    earnings: 0,
    pending: 0,
    points: 0,
    referralPointsTotal: 0,
    isActivated: false,
  };
  const demoFAQs: FAQ[] = [
    {
      question: "How do referrals work?",
      answer:
        "Invite friends with your code to earn a percentage of their transactions on Deserialize.",
    },
    {
      question: "When are earnings paid?",
      answer:
        "Earnings are credited after referred users complete transactions.",
    },
  ];

  const isNewUser = !connected;
  const stats = isNewUser
    ? {
        referrals: 0,
        earnings: 0,
        pending: 0,
        points: 0,
        referralPointsTotal: 0,
        isActivated: false,
      }
    : userReferralData || demoStats;
  const historyData = isNewUser || history.length === 0 ? [] : history;
  const leaderboardData =
    isNewUser || leaderboard.length === 0 ? [] : leaderboard;
  const faqsData = faqs.length > 0 ? faqs : demoFAQs;

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      if (!connected || !walletAddress) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const userResponse = await fetch(
          `/api/user?walletAddress=${walletAddress}`
        );
        if (!userResponse.ok) {
          const errorData = await userResponse.json();
          throw new Error(errorData.error || "Failed to fetch user data");
        }
        const userData = await userResponse.json();

        const statsResponse = await fetch(
          `/api/referral-stats?walletAddress=${walletAddress}`
        );
        if (!statsResponse.ok) {
          const errorData = await statsResponse.json();
          throw new Error(errorData.error || "Failed to fetch stats");
        }
        const statsData = await statsResponse.json();

        console.log("Stats Data:", statsData);

        const historyResponse = await fetch(
          `/api/referrals/history?walletAddress=${walletAddress}`
        );
        let historyData: Referral[] = [];
        if (historyResponse.ok) {
          historyData = await historyResponse.json();
        } else {
          console.warn("No referral history data available");
        }

        const leaderboardResponse = await fetch("/api/referrals/leaderboard");
        let leaderboardData: LeaderboardEntry[] = [];
        if (leaderboardResponse.ok) {
          leaderboardData = await leaderboardResponse.json();
        } else {
          console.warn("No leaderboard data available");
        }

        const combinedData = {
          referralCode: userData.referralCode,
          defaultReferralPercentage: userData.defaultReferralPercentage / 100,
          referralPointsTotal: statsData.referralPointsTotal,
          referrals: statsData.referrals,
          earnings: statsData.earnings,
          pending: statsData.pending,
          points: connected ? 1250 + statsData.referrals * 50 : 0,
          isActivated: userData.isActivated || false, // New field
        };

        setUserReferralData(combinedData);
        setReferralCode(combinedData.referralCode);
        setPercentage(combinedData.defaultReferralPercentage);
        setIsActivated(combinedData.isActivated);
        setHistory(historyData);
        setLeaderboard(leaderboardData);
      } catch (error: any) {
        console.error("Failed to fetch data:", error);
        toast.custom((t) => (
          <div
            className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border ${
              t.visible ? "animate-enter" : "animate-leave"
            }`}
            style={{
              background: "linear-gradient(135deg, #86efac 0%, #22c55e 100%)",
              color: "#000",
              border: "1px solid rgba(134, 239, 172, 0.3)",
            }}
          >
            <AlertCircle size={22} color="#000" />
            <span className="font-medium">
              {error.message || "Failed to fetch data."}
            </span>
          </div>
        ));
        setUserReferralData({
          referralCode: null,
          defaultReferralPercentage: 0.001,
          referrals: demoStats.referrals,
          earnings: demoStats.earnings,
          pending: demoStats.pending,
          points: demoStats.points,
          referralPointsTotal: 0,
          isActivated: false,
        });
        setHistory([]);
        setLeaderboard([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [connected, walletAddress]);

  // Enhanced particle background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error("Canvas not found");
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error("Canvas context not available");
      return;
    }

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    interface Particle {
      x: number;
      y: number;
      radius?: number;
      length?: number;
      rotation?: number;
      vx: number;
      vy: number;
      opacity: number;
      type: "circle" | "line";
      wave: boolean;
      waveOffset: number;
      pulse: boolean;
      pulseScale: number;
    }

    const particles: Particle[] = Array.from({ length: 100 }, () => {
      const isCircle = Math.random() < 0.8;
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: isCircle ? Math.random() * 1.5 + 0.5 : undefined,
        length: !isCircle ? Math.random() * 2.5 + 1.5 : undefined,
        rotation: !isCircle ? Math.random() * Math.PI * 2 : undefined,
        vx: Math.random() * 0.4 - 0.2,
        vy: Math.random() * 0.4 - 0.2,
        opacity: Math.random() * 0.4 + 0.2,
        type: isCircle ? "circle" : "line",
        wave: Math.random() < 0.25 && isCircle,
        waveOffset: Math.random() * Math.PI * 2,
        pulse: Math.random() < 0.15 && isCircle,
        pulseScale: 1,
      };
    });

    let mouseX = 0,
      mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    canvas.addEventListener("mousemove", handleMouseMove);

    const animate = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connection lines with enhanced styling
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i],
            p2 = particles[j];
          const dx = p1.x - p2.x,
            dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            const gradient = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
            gradient.addColorStop(
              0,
              `rgba(134, 239, 172, ${0.3 * (1 - dist / 120)})`
            );
            gradient.addColorStop(
              1,
              `rgba(34, 197, 94, ${0.2 * (1 - dist / 120)})`
            );
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Update and draw particles with enhanced effects
      particles.forEach((p) => {
        // Enhanced mouse interaction
        const dx = mouseX - p.x,
          dy = mouseY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        let currentOpacity = p.opacity;
        if (dist < 180) {
          p.vx += (dx / dist) * 0.015;
          p.vy += (dy / dist) * 0.015;
          currentOpacity = Math.min(
            0.9,
            p.opacity + ((180 - dist) / 180) * 0.5
          );
        }

        // Update position with enhanced movement
        p.x += p.vx;
        p.y += p.vy;
        if (p.wave) {
          p.y += Math.sin(time / 1200 + p.waveOffset) * 0.8;
        }
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        p.vx = Math.max(-0.6, Math.min(0.6, p.vx));
        p.vy = Math.max(-0.6, Math.min(0.6, p.vy));

        // Enhanced pulse effect
        if (p.pulse) {
          p.pulseScale = 0.7 + Math.sin(time / 600) * 0.3;
        }

        // Draw particle with enhanced styling
        ctx.beginPath();
        if (p.type === "circle") {
          const radius = p.radius! * (p.pulse ? p.pulseScale : 1);
          ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);

          // Create radial gradient for glow effect
          const gradient = ctx.createRadialGradient(
            p.x,
            p.y,
            0,
            p.x,
            p.y,
            radius * 2
          );
          gradient.addColorStop(0, `rgba(134, 239, 172, ${currentOpacity})`);
          gradient.addColorStop(
            0.7,
            `rgba(134, 239, 172, ${currentOpacity * 0.5})`
          );
          gradient.addColorStop(1, `rgba(134, 239, 172, 0)`);

          ctx.fillStyle = gradient;
          ctx.fill();
        } else {
          const x2 = p.x + Math.cos(p.rotation!) * p.length!;
          const y2 = p.y + Math.sin(p.rotation!) * p.length!;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = `rgba(134, 239, 172, ${currentOpacity})`;
          ctx.lineWidth = 1.2;
          ctx.lineCap = "round";
          ctx.stroke();
        }
      });

      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);

    return () => canvas.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Chart setup
  useEffect(() => {
    if (isNewUser || isLoading || history.length === 0) return;
    const ctx = document.getElementById("earningsChart") as HTMLCanvasElement;
    if (!ctx) return;

    // Aggregate earnings by month
    const earningsByMonth: { [key: string]: number } = {};
    history.forEach((entry) => {
      const date = new Date(entry.date);
      const monthYear = date.toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
      earningsByMonth[monthYear] =
        (earningsByMonth[monthYear] || 0) + entry.earnings;
    });

    // Sort months chronologically
    const labels = Object.keys(earningsByMonth).sort((a, b) => {
      const dateA = new Date(`1 ${a}`);
      const dateB = new Date(`1 ${b}`);
      return dateA.getTime() - dateB.getTime();
    });
    const data = labels.map((label) => earningsByMonth[label]);

    const chart = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Earnings ($)",
            data,
            borderColor: "#86efac",
            backgroundColor: "rgba(134, 239, 172, 0.1)",
            pointBackgroundColor: "#86efac",
            pointBorderColor: "#86efac",
            pointRadius: 6,
            pointHoverRadius: 8,
            fill: true,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { labels: { color: "#e5e7eb" } },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { color: "#9ca3af" },
            grid: { color: "rgba(156, 163, 175, 0.1)" },
          },
          x: {
            ticks: { color: "#9ca3af" },
            grid: { color: "rgba(156, 163, 175, 0.1)" },
          },
        },
      },
    });

    return () => chart.destroy();
  }, [isNewUser, isLoading, history]);

  // QR code generation
  useEffect(() => {
    if (referralCode && !isLoading) {
      const appUrl =
        process.env.NEXT_PUBLIC_APP_URL || "https://www.deserialize.xyz/";
      QRCode.toCanvas(
        document.getElementById("qrCode"),
        `${appUrl}?ref=${referralCode}`,
        {
          width: 120,
          color: { dark: "#86efac", light: "#000000" },
        }
      );
    }
  }, [referralCode, isLoading]);

  // New activation functions
  const handleActivateReferral = async () => {
    if (!connected || !walletAddress) {
      toast.custom((t) => (
        <div
          className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border ${
            t.visible ? "animate-enter" : "animate-leave"
          }`}
          style={{
            background: "linear-gradient(135deg, #86efac 0%, #22c55e 100%)",
            color: "#000",
            border: "1px solid rgba(134, 239, 172, 0.3)",
          }}
        >
          <Wallet size={22} color="#000" />
          <span className="font-medium">
            Connect your wallet to activate referrals!
          </span>
        </div>
      ));
      return;
    }
    setShowActivationModal(true);
  };

  const processActivation = async () => {
    if (!activationState.referralCode.trim()) {
      setActivationState((prev) => ({
        ...prev,
        step: "error",
        error: "Please enter a referral code",
      }));
      return;
    }

    setActivationState((prev) => ({ ...prev, step: "verifying" }));

    try {
      // Simulate API call for referral code validation
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Simulate ATA verification
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock successful activation
      const response = await fetch("/api/referral/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress,
          referralCode: activationState.referralCode,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to activate referral");
      }

      setActivationState((prev) => ({
        ...prev,
        step: "success",
        ataVerified: true,
      }));

      setIsActivated(true);

      // Update user data
      if (userReferralData) {
        setUserReferralData((prev) =>
          prev ? { ...prev, isActivated: true } : null
        );
      }

      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#86efac", "#22c55e", "#16a34a"],
      });

      setTimeout(() => {
        setShowActivationModal(false);
        setActivationState({
          step: "input",
          referralCode: "",
          ataVerified: false,
        });
      }, 3000);
    } catch (error: any) {
      setActivationState((prev) => ({
        ...prev,
        step: "error",
        error: error.message || "Activation failed. Please try again.",
      }));
    }
  };

  const resetActivationModal = () => {
    setShowActivationModal(false);
    setActivationState({
      step: "input",
      referralCode: "",
      ataVerified: false,
    });
  };

  // Generate referral code
  const generateReferralCode = async () => {
    if (!connected || !walletAddress) {
      toast.custom((t) => (
        <div
          className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border ${
            t.visible ? "animate-enter" : "animate-leave"
          }`}
          style={{
            background: "hsl(var(--primary))",
            color: "hsl(var(--primary-foreground))",
            border: "1px solid hsl(var(--primary) / 0.3)",
          }}
        >
          <Wallet size={22} />
          <span className="font-medium">
            Connect your wallet to unlock the power of referrals!
          </span>
        </div>
      ));
      return;
    }

    // Remove the activation check - users can generate referral codes without ATA verification

    setIsLoading(true);
    try {
      const response = await fetch("/api/referral-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ walletAddress, customCode }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate referral code");
      }
      const { referralCode: newCode } = await response.json();
      setReferralCode(newCode);
      setShowModal(false);
      setModalStep(1);
      setCustomCode("");
      confetti({
        particleCount: 200,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#86efac", "#22c55e", "#16a34a"],
      });
      toast.custom((t) => (
        <div
          className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border ${
            t.visible ? "animate-enter" : "animate-leave"
          }`}
          style={{
            background: "linear-gradient(135deg, #86efac 0%, #22c55e 100%)",
            color: "#000",
            border: "1px solid rgba(134, 239, 172, 0.3)",
          }}
        >
          <Save size={22} color="#000" />
          <span className="font-medium">Referral code generated!</span>
        </div>
      ));
    } catch (error: any) {
      console.error("Failed to generate referral code:", error);
      toast.custom((t) => (
        <div
          className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border ${
            t.visible ? "animate-enter" : "animate-leave"
          }`}
          style={{
            background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
            color: "#000",
            border: "1px solid rgba(245, 158, 11, 0.3)",
          }}
        >
          <AlertCircle size={22} color="#000" />
          <span className="font-medium">
            {error.message || "Failed to generate referral code."}
          </span>
        </div>
      ));
    } finally {
      setIsLoading(false);
    }
  };

  // Save percentage
  const savePercentage = async () => {
    if (!connected || !walletAddress) {
      toast.custom((t) => (
        <div
          className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border ${
            t.visible ? "animate-enter" : "animate-leave"
          }`}
          style={{
            background: "linear-gradient(135deg, #86efac 0%, #22c55e 100%)",
            color: "#000",
            border: "1px solid rgba(134, 239, 172, 0.3)",
          }}
        >
          <Wallet size={22} color="#000" />
          <span className="font-medium">
            Connect your wallet to unlock the power of referrals!
          </span>
        </div>
      ));
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/user/percentage", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ walletAddress, percentage }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save percentage");
      }
      const { defaultReferralPercentage } = await response.json();
      setPercentage(defaultReferralPercentage);
      confetti({
        particleCount: 80,
        spread: 60,
        colors: ["#86efac", "#22c55e"],
      });
      toast.custom((t) => (
        <div
          className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border ${
            t.visible ? "animate-enter" : "animate-leave"
          }`}
          style={{
            background: "linear-gradient(135deg, #86efac 0%, #22c55e 100%)",
            color: "#000",
            border: "1px solid rgba(134, 239, 172, 0.3)",
          }}
        >
          <Save size={22} color="#000" />
          <span className="font-medium">Percentage saved!</span>
        </div>
      ));
    } catch (error: any) {
      console.error("Failed to save percentage:", error);
      toast.custom((t) => (
        <div
          className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border ${
            t.visible ? "animate-enter" : "animate-leave"
          }`}
          style={{
            background: "linear-gradient(135deg, #86efac 0%, #22c55e 100%)",
            color: "#000",
            border: "1px solid rgba(134, 239, 172, 0.3)",
          }}
        >
          <AlertCircle size={22} color="#000" />
          <span className="font-medium">
            {error.message || "Failed to save percentage."}
          </span>
        </div>
      ));
    } finally {
      setIsLoading(false);
    }
  };

  // Claim NFT
  const claimNFT = async () => {
    if (!connected || !walletAddress) {
      toast.custom((t) => (
        <div
          className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border ${
            t.visible ? "animate-enter" : "animate-leave"
          }`}
          style={{
            background: "linear-gradient(135deg, #86efac 0%, #22c55e 100%)",
            color: "#000",
            border: "1px solid rgba(134, 239, 172, 0.3)",
          }}
        >
          <Wallet size={22} color="#000" />
          <span className="font-medium">
            Connect your wallet to unlock the power of referrals!
          </span>
        </div>
      ));
      return;
    }

    toast.custom((t) => (
      <div
        className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border ${
          t.visible ? "animate-enter" : "animate-leave"
        }`}
        style={{
          background: "linear-gradient(135deg, #86efac 0%, #22c55e 100%)",
          color: "#000",
          border: "1px solid rgba(134, 239, 172, 0.3)",
        }}
      >
        <AlertCircle size={22} color="#000" />
        <span className="font-medium">NFT claim coming soon!</span>
      </div>
    ));
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.custom((t) => (
      <div
        className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border ${
          t.visible ? "animate-enter" : "animate-leave"
        }`}
        style={{
          background: "linear-gradient(135deg, #86efac 0%, #22c55e 100%)",
          color: "#000",
          border: "1px solid rgba(134, 239, 172, 0.3)",
        }}
      >
        <CopyCheck size={22} color="#000" />
        <span className="font-medium">Copied!</span>
      </div>
    ));
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setModalStep(1);
    setCustomCode("");
  };

  if (isLoading) {
    return <SkeletonLoader />;
  }

  return (
    <div className="min-h-screen bg-black mt-[80px] text-white relative overflow-hidden">
      {/* Enhanced background with professional gradients */}
      <div className="absolute inset-0 bg-black">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(134,239,172,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(134,239,172,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(134,239,172,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(134,239,172,0.06),transparent_50%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black/80" />
      </div>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "transparent",
            border: "none",
            boxShadow: "none",
          },
          duration: 4000,
        }}
      />

      <canvas ref={canvasRef} className="absolute inset-0 z-0 opacity-70" />

      {/* Enhanced floating orbs animation */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full blur-2xl"
            style={{
              width: `${120 + i * 20}px`,
              height: `${120 + i * 20}px`,
              background: `radial-gradient(circle, rgba(134, 239, 172, ${
                0.1 - i * 0.01
              }) 0%, rgba(34, 197, 94, ${
                0.05 - i * 0.005
              }) 50%, transparent 100%)`,
              left: `${15 + i * 12}%`,
              top: `${8 + i * 8}%`,
            }}
            animate={{
              x: [0, 120, 0],
              y: [0, -120, 0],
              scale: [1, 1.3, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 12 + i * 3,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: i * 2.5,
            }}
          />
        ))}
      </div>

      {/* Activation Status Banner */}
      {connected && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-20 container mx-auto px-6 pt-6"
        >
          <div
            className={`flex items-center justify-between p-4 rounded-2xl backdrop-blur-xl border shadow-xl ${
              isActivated
                ? "bg-green-900/40 border-green-400/30"
                : "bg-primary/20 border-primary/30"
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
                    : "ATA Verification Pending"}
                </p>
                <p className="text-sm text-gray-300">
                  {isActivated
                    ? "Your ATA tokens are verified and you can earn from referrals"
                    : "Verify your ATA tokens to unlock full referral benefits"}
                </p>
              </div>
            </div>
            {!isActivated && (
              <Button
                onClick={() => setShowActivationModal(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-6 py-2 rounded-xl transition-all duration-300 hover:scale-105"
              >
                <Zap className="w-4 h-4 mr-2" />
                Verify ATAs
              </Button>
            )}
          </div>
        </motion.div>
      )}

      <div className="relative z-10 container mx-auto px-6 py-16 space-y-20">
        {/* Enhanced Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-center space-y-12"
        >
          <div className="space-y-8">
            <div className="hidden">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-xl border border-gray-600/50 rounded-full text-gray-100 text-sm font-semibold shadow-2xl"
              >
                <Sparkles className="w-5 h-5" />
                Deserialize Referral Program
              </motion.div>
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
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
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl md:text-2xl text-gray-300 font-medium max-w-3xl mx-auto leading-relaxed"
            >
              You decide the fees we charge your referrals- we'll pay you 70% of
              it!!
            </motion.p>
          </div>

          {referralCode ? (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
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
                      className="flex-1 bg-gray-800/60 backdrop-blur-xl border-gray-600/50 text-gray-100 focus:border-primary focus:ring-primary/30 rounded-2xl px-6 py-4 text-lg font-medium shadow-xl"
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
                      className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-8 py-4 rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105"
                    >
                      <LinkIcon className="w-5 h-5 mr-2" />
                      Copy Link
                    </Button>
                  </div>

                  <div className="flex flex-wrap justify-center gap-4 hidden">
                    {["Twitter", "Telegram", "Discord"].map((platform) => (
                      <Button
                        key={platform}
                        variant="outline"
                        onClick={() =>
                          toast(`Share on ${platform} coming soon!`)
                        }
                        className="border-gray-600/50 bg-gray-800/40 backdrop-blur-xl text-gray-200 hover:bg-primary/10 hover:border-primary/50 hover:text-primary rounded-2xl px-6 py-3 font-medium transition-all duration-300"
                      >
                        {platform}
                      </Button>
                    ))}
                  </div>

                  <div className="flex flex-col items-center gap-6 pt-6 hidden">
                    <canvas id="qrCode" className="rounded-2xl shadow-2xl" />
                    <Button
                      onClick={() => toast.success("QR code downloaded!")}
                      variant="outline"
                      className="border-gray-600/50 bg-gray-800/40 backdrop-blur-xl text-gray-200 hover:bg-primary/10 hover:border-primary/50 hover:text-primary rounded-2xl px-6 py-3 font-medium transition-all duration-300"
                    >
                      <QrCode className="w-5 h-5 mr-2" />
                      Download QR
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="space-y-6"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => {
                    if (!connected || !walletAddress) {
                      toast.custom((t) => (
                        <div
                          className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border ${
                            t.visible ? "animate-enter" : "animate-leave"
                          }`}
                          style={{
                            background: "hsl(var(--primary))",
                            color: "hsl(var(--primary-foreground))",
                            border: "1px solid hsl(var(--primary) / 0.3)",
                          }}
                        >
                          <Wallet size={22} />
                          <span className="font-medium">
                            Connect your wallet to start earning from referrals!
                          </span>
                        </div>
                      ));
                      return;
                    }
                    setShowModal(true); // Always allow referral code generation
                  }}
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-xl px-12 py-6 rounded-3xl shadow-2xl transition-all duration-500 hover:shadow-primary/25"
                >
                  <Sparkles className="w-6 h-6 mr-3" />
                  Generate Referral Link
                </Button>
              </motion.div>
            </motion.div>
          )}
        </motion.section>

        {/* Enhanced Fee Percentage Section - Only show if activated */}
        {isActivated && (
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto"
          >
            <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-2xl border border-gray-700/50 rounded-3xl shadow-2xl overflow-hidden">
              <CardHeader className="pb-8">
                <CardTitle className="text-3xl text-center text-primary flex items-center justify-center gap-3 font-bold">
                  <TrendingUp className="w-8 h-8" />
                  Set how much fee we charge your referrals
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

                    <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                      <p className="text-gray-300 text-lg font-medium">
                        {isNewUser
                          ? "Set your earnings rate to kickstart referrals!"
                          : `If your referral trades $10,000, you'll earn $${(
                              10000 *
                              percentage *
                              0.7
                            ).toFixed(2)}`}
                      </p>

                      <motion.span
                        className="flex items-center gap-2 cursor-pointer text-primary border-primary/50 hover:border-primary transition-colors font-medium"
                        onClick={() => setIsOpen(!isOpen)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        View breakdown
                        <ChevronDown
                          className={`h-5 w-5 transition-transform duration-300 ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </motion.span>
                    </div>
                  </div>

                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-gradient-to-r from-gray-800/50 to-gray-700/30 backdrop-blur-xl rounded-2xl p-6 border border-gray-600/30"
                    >
                      <div className="flex items-center justify-center gap-6 text-sm">
                        <Badge
                          variant="outline"
                          className="border-primary/40 bg-primary/10 text-primary px-4 py-2 rounded-xl font-semibold"
                        >
                          {(percentage * 100).toFixed(2)}% fees = $
                          {(10000 * percentage).toFixed(2)}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="border-gray-500/40 bg-gray-600/10 text-gray-300 px-4 py-2 rounded-xl font-semibold"
                        >
                          Your Share: ${(10000 * percentage * 0.7).toFixed(2)}
                        </Badge>
                      </div>
                    </motion.div>
                  )}
                </div>

                <Button
                  onClick={savePercentage}
                  disabled={!referralCode}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold py-4 rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <Save className="w-5 h-5 mr-2" />
                  Save Percentage
                </Button>
              </CardContent>
            </Card>
          </motion.section>
        )}

        {/* Enhanced Stats Section */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
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
                  } rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden ${
                    !isActivated ? "opacity-60" : ""
                  }`}
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

          {/* Points Breakdown */}
          {!isNewUser && stats.points > 0 && isActivated && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto hidden"
            >
              <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 backdrop-blur-2xl border border-purple-400/30 rounded-3xl shadow-2xl overflow-hidden">
                <CardContent className="p-8">
                  <div className="text-center space-y-6">
                    <div className="flex items-center justify-center gap-3">
                      <Sparkles className="w-8 h-8 text-purple-400" />
                      <h3 className="text-2xl font-bold text-purple-400">
                        Points Breakdown
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center space-y-2">
                        <p className="text-gray-400 font-medium">Base Points</p>
                        <p className="text-2xl font-bold text-white">1,000</p>
                      </div>
                      <div className="text-center space-y-2">
                        <p className="text-gray-400 font-medium">
                          Referral Bonus
                        </p>
                        <p className="text-2xl font-bold text-white">
                          +{stats.referrals * 50}
                        </p>
                      </div>
                      <div className="text-center space-y-2">
                        <p className="text-gray-400 font-medium">
                          Activity Bonus
                        </p>
                        <p className="text-2xl font-bold text-white">+250</p>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-purple-500/10 to-purple-600/5 rounded-2xl p-4 mt-6">
                      <p className="text-gray-300 text-sm">
                        Earn points by referring friends, completing milestones,
                        and staying active. Points unlock exclusive rewards and
                        higher referral tiers!
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Enhanced Chart Section */}
          <div className="max-w-5xl mx-auto hidden">
            {isNewUser || history.length === 0 || !isActivated ? (
              <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-2xl border border-gray-700/50 rounded-3xl shadow-2xl">
                <CardContent className="p-16 text-center">
                  <TrendingUp className="w-20 h-20 text-gray-600 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-gray-300 mb-4">
                    {!isActivated ? "Activation Required" : "No Earnings Yet"}
                  </h3>
                  <p className="text-gray-400 mb-8 text-lg">
                    {!isActivated
                      ? "Activate your referral system to start tracking earnings!"
                      : "Share your referral code to see your earnings growth!"}
                  </p>
                  {!isActivated ? (
                    <Button
                      onClick={handleActivateReferral}
                      className="bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 font-bold px-8 py-4 rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105"
                    >
                      <Zap className="w-5 h-5 mr-2" />
                      Activate System
                    </Button>
                  ) : !referralCode ? (
                    <Button
                      onClick={() => {
                        if (!connected || !walletAddress) {
                          toast.custom((t) => (
                            <div
                              className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border ${
                                t.visible ? "animate-enter" : "animate-leave"
                              }`}
                              style={{
                                background:
                                  "linear-gradient(135deg, #86efac 0%, #22c55e 100%)",
                                color: "#000",
                                border: "1px solid rgba(134, 239, 172, 0.3)",
                              }}
                            >
                              <Wallet size={22} color="#000" />
                              <span className="font-medium">
                                Connect your wallet to start earning!
                              </span>
                            </div>
                          ));
                          return;
                        }
                        setShowModal(true);
                      }}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-8 py-4 rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105"
                    >
                      Generate Code Now
                    </Button>
                  ) : null}
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-2xl border border-gray-700/50 rounded-3xl shadow-2xl">
                <CardHeader className="pb-6">
                  <CardTitle className="text-2xl text-center font-bold text-white">
                    Earnings Over Time
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <canvas id="earningsChart" height="200" className="w-full" />
                </CardContent>
              </Card>
            )}
          </div>
        </motion.section>

        {/* Enhanced Leaderboard */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto"
        >
          <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-2xl border border-gray-700/50 rounded-3xl shadow-2xl overflow-hidden">
            <CardHeader className="pb-8">
              <CardTitle className="text-3xl text-primary flex items-center justify-center gap-3 font-bold">
                <Award className="w-8 h-8" />
                Top Referrers
              </CardTitle>
            </CardHeader>
            <CardContent className="px-10 pb-10">
              {isNewUser || leaderboardData.length === 0 ? (
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
                  {leaderboardData.map((entry, i) => (
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

        {/* Enhanced Referral History */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto"
        >
          <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-2xl border border-gray-700/50 rounded-3xl shadow-2xl overflow-hidden">
            <CardHeader className="pb-8">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <CardTitle className="text-3xl text-primary font-bold">
                  Referral History
                </CardTitle>
                <div className="flex gap-3">
                  {["Date", "Earnings"].map((filter) => (
                    <Button
                      key={filter}
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        toast.custom((t) => (
                          <div
                            className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border ${
                              t.visible ? "animate-enter" : "animate-leave"
                            }`}
                            style={{
                              background:
                                "linear-gradient(135deg, #86efac 0%, #22c55e 100%)",
                              color: "#000",
                              border: "1px solid rgba(134, 239, 172, 0.3)",
                            }}
                          >
                            <ListFilter size={22} color="#000" />
                            <span className="font-medium">
                              Sorting by {filter} coming soon!
                            </span>
                          </div>
                        ))
                      }
                      className="border-gray-600/50 bg-gray-800/40 backdrop-blur-xl text-gray-200 hover:bg-primary/10 hover:border-primary/50 hover:text-primary rounded-2xl px-4 py-2 font-medium transition-all duration-300"
                    >
                      <ListFilter className="w-4 h-4 mr-2" />
                      {filter}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-10 pb-10">
              {historyData.length === 0 || !isActivated ? (
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
                  {!isActivated ? (
                    <Button
                      onClick={handleActivateReferral}
                      className="bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 font-bold px-8 py-4 rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105"
                    >
                      <Zap className="w-5 h-5 mr-2" />
                      Activate System
                    </Button>
                  ) : !referralCode ? (
                    <Button
                      onClick={() => {
                        if (!connected || !walletAddress) {
                          toast.custom((t) => (
                            <div
                              className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border ${
                                t.visible ? "animate-enter" : "animate-leave"
                              }`}
                              style={{
                                background:
                                  "linear-gradient(135deg, #86efac 0%, #22c55e 100%)",
                                color: "#000",
                                border: "1px solid rgba(134, 239, 172, 0.3)",
                              }}
                            >
                              <Wallet size={22} color="#000" />
                              <span className="font-medium">
                                Connect your wallet to unlock the power of
                                referrals!
                              </span>
                            </div>
                          ));
                          return;
                        }
                        setShowModal(true);
                      }}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-8 py-4 rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105"
                    >
                      Generate Link
                    </Button>
                  ) : null}
                </div>
              ) : (
                <div className="space-y-4">
                  {historyData.map((entry, i) => (
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

      {/* Activation Flow Component */}
      <ActivationFlow
        isOpen={showActivationModal}
        onClose={() => setShowActivationModal(false)}
        onSuccess={() => {
          setIsActivated(true);
          if (userReferralData) {
            setUserReferralData((prev) =>
              prev ? { ...prev, isActivated: true } : null
            );
          }
          setShowActivationModal(false);
        }}
        walletAddress={walletAddress}
        connected={connected}
      />

      {/* Original Modal for generating referral codes */}
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-2xl border border-gray-700/50 rounded-3xl p-8 max-w-md w-full shadow-2xl"
          >
            {modalStep === 1 && (
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
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-xl"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default ReferralDashboard;

// "use client";

// import type React from "react";

// import { useState, useEffect, useRef } from "react";
// import { motion } from "framer-motion";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Slider } from "@/components/ui/slider";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import Chart from "chart.js/auto";
// import confetti from "canvas-confetti";
// import QRCode from "qrcode";
// import { Toaster, toast } from "react-hot-toast";
// import { useAppContext } from "@/context/AppWalletProvider";
// import {
//   Save,
//   Award,
//   Share2,
//   ListFilter,
//   TrendingUp,
//   Users,
//   DollarSign,
//   Sparkles,
//   LinkIcon,
//   QrCode,
//   Wallet,
//   AlertCircle,
//   CopyCheck,
//   ChevronDown,
// } from "lucide-react";

// interface Referral {
//   id: string;
//   name: string;
//   date: string;
//   earnings: number;
//   status: "PENDING" | "ACTIVE" | "INACTIVE";
// }

// interface LeaderboardEntry {
//   name: string;
//   referrals: number;
// }

// interface FAQ {
//   question: string;
//   answer: string;
// }

// interface UserReferralData {
//   referralCode: string | null;
//   defaultReferralPercentage: number;
//   referrals: number;
//   referralPointsTotal: number; // Optional for new users
//   earnings: number;
//   pending: number;
//   points: number;
// }

// const SkeletonLoader: React.FC = () => {
//   return (
//     <div className="min-h-screen bg-black text-white relative overflow-hidden">
//       {/* Enhanced background with subtle patterns */}
//       <div className="absolute inset-0 bg-black">
//         <div className="absolute inset-0 bg-[linear-gradient(rgba(134,239,172,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(134,239,172,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
//         <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(134,239,172,0.08),transparent_50%)]" />
//         <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(134,239,172,0.06),transparent_50%)]" />
//       </div>

//       <div className="relative z-10 container mx-auto px-6 py-16 space-y-16">
//         {/* Hero Skeleton */}
//         <div className="text-center space-y-8">
//           <div className="h-16 w-[500px] mx-auto bg-gradient-to-r from-gray-800/50 to-gray-700/50 animate-pulse rounded-2xl" />
//           <div className="h-8 w-80 mx-auto bg-gradient-to-r from-gray-800/50 to-gray-700/50 animate-pulse rounded-xl" />
//           <div className="h-16 w-96 mx-auto bg-gradient-to-r from-gray-800/50 to-gray-700/50 animate-pulse rounded-2xl" />
//         </div>

//         {/* Stats Skeleton */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
//           {[1, 2].map((i) => (
//             <div
//               key={i}
//               className="bg-gradient-to-br from-gray-900/60 to-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 shadow-2xl"
//             >
//               <div className="h-8 w-32 bg-gradient-to-r from-gray-700/50 to-gray-600/50 animate-pulse rounded-xl mb-6" />
//               <div className="h-12 w-24 bg-gradient-to-r from-gray-700/50 to-gray-600/50 animate-pulse rounded-xl" />
//             </div>
//           ))}
//         </div>

//         {/* Chart Skeleton */}
//         <div className="max-w-5xl mx-auto">
//           <div className="h-80 bg-gradient-to-br from-gray-900/60 to-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl animate-pulse shadow-2xl" />
//         </div>
//       </div>
//     </div>
//   );
// };

// const ReferralDashboard: React.FC = () => {
//   const [referralCode, setReferralCode] = useState<string | null>(null);
//   const [showModal, setShowModal] = useState(false);
//   const [modalStep, setModalStep] = useState(1);
//   const [customCode, setCustomCode] = useState("");
//   const [percentage, setPercentage] = useState<number>(0.001);
//   const [showFAQ, setShowFAQ] = useState(false);
//   const [userReferralData, setUserReferralData] =
//     useState<UserReferralData | null>(null);
//   const [history, setHistory] = useState<Referral[]>([]);
//   const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
//   const [faqs, setFaqs] = useState<FAQ[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const [isOpen, setIsOpen] = useState(false);

//   const { walletAddress, connecting, connected } = useAppContext();

//   // Demo data
//   const demoStats = { referrals: 0, earnings: 0, pending: 0, points: 0, referralPointsTotal: 0 };
//   const demoFAQs: FAQ[] = [
//     {
//       question: "How do referrals work?",
//       answer:
//         "Invite friends with your code to earn a percentage of their transactions on Deserialize.",
//     },
//     {
//       question: "When are earnings paid?",
//       answer:
//         "Earnings are credited after referred users complete transactions.",
//     },
//   ];

//   const isNewUser = !connected;
//   const stats = isNewUser
//     ? { referrals: 0, earnings: 0, pending: 0, points: 0, referralPointsTotal: 0 }
//     : userReferralData || demoStats;
//   const historyData = isNewUser || history.length === 0 ? [] : history;
//   const leaderboardData =
//     isNewUser || leaderboard.length === 0 ? [] : leaderboard;
//   const faqsData = faqs.length > 0 ? faqs : demoFAQs;

//   // Fetch data
//   useEffect(() => {
//     const fetchData = async () => {
//       if (!connected || !walletAddress) {
//         setIsLoading(false);
//         return;
//       }

//       setIsLoading(true);
//       try {
//         const userResponse = await fetch(
//           `/api/user?walletAddress=${walletAddress}`
//         );
//         if (!userResponse.ok) {
//           const errorData = await userResponse.json();
//           throw new Error(errorData.error || "Failed to fetch user data");
//         }
//         const userData = await userResponse.json();

//         const statsResponse = await fetch(
//           `/api/referral-stats?walletAddress=${walletAddress}`
//         );
//         if (!statsResponse.ok) {
//           const errorData = await statsResponse.json();
//           throw new Error(errorData.error || "Failed to fetch stats");
//         }
//         const statsData = await statsResponse.json();

//         console.log("Stats Data:", statsData);

//         const historyResponse = await fetch(
//           `/api/referrals/history?walletAddress=${walletAddress}`
//         );
//         let historyData: Referral[] = [];
//         if (historyResponse.ok) {
//           historyData = await historyResponse.json();
//         } else {
//           console.warn("No referral history data available");
//         }

//         const leaderboardResponse = await fetch("/api/referrals/leaderboard");
//         let leaderboardData: LeaderboardEntry[] = [];
//         if (leaderboardResponse.ok) {
//           leaderboardData = await leaderboardResponse.json();
//         } else {
//           console.warn("No leaderboard data available");
//         }

//         const combinedData = {
//           referralCode: userData.referralCode,
//           defaultReferralPercentage: userData.defaultReferralPercentage / 100,
//           referralPointsTotal: statsData.referralPointsTotal,
//           referrals: statsData.referrals,
//           earnings: statsData.earnings,
//           pending: statsData.pending,
//           points: connected ? 1250 + statsData.referrals * 50 : 0, // Hardcoded formula
//         };

//         setUserReferralData(combinedData);
//         setReferralCode(combinedData.referralCode);
//         setPercentage(combinedData.defaultReferralPercentage);
//         setHistory(historyData);
//         setLeaderboard(leaderboardData);
//       } catch (error: any) {
//         console.error("Failed to fetch data:", error);
//         toast.custom((t) => (
//           <div
//             className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border ${
//               t.visible ? "animate-enter" : "animate-leave"
//             }`}
//             style={{
//               background: "linear-gradient(135deg, #86efac 0%, #22c55e 100%)",
//               color: "#000",
//               border: "1px solid rgba(134, 239, 172, 0.3)",
//             }}
//           >
//             <AlertCircle size={22} color="#000" />
//             <span className="font-medium">
//               {error.message || "Failed to fetch data."}
//             </span>
//           </div>
//         ));
//         setUserReferralData({
//           referralCode: null,
//           defaultReferralPercentage: 0.001,
//           referrals: demoStats.referrals,
//           earnings: demoStats.earnings,
//           pending: demoStats.pending,
//           points: demoStats.points,
//           referralPointsTotal: 0, // Optional for new users
//         });
//         setHistory([]);
//         setLeaderboard([]);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchData();
//   }, [connected, walletAddress]);

//   // Enhanced particle background
//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) {
//       console.error("Canvas not found");
//       return;
//     }
//     const ctx = canvas.getContext("2d");
//     if (!ctx) {
//       console.error("Canvas context not available");
//       return;
//     }

//     canvas.width = window.innerWidth;
//     canvas.height = window.innerHeight;

//     interface Particle {
//       x: number;
//       y: number;
//       radius?: number;
//       length?: number;
//       rotation?: number;
//       vx: number;
//       vy: number;
//       opacity: number;
//       type: "circle" | "line";
//       wave: boolean;
//       waveOffset: number;
//       pulse: boolean;
//       pulseScale: number;
//     }

//     const particles: Particle[] = Array.from({ length: 100 }, () => {
//       const isCircle = Math.random() < 0.8;
//       return {
//         x: Math.random() * canvas.width,
//         y: Math.random() * canvas.height,
//         radius: isCircle ? Math.random() * 1.5 + 0.5 : undefined,
//         length: !isCircle ? Math.random() * 2.5 + 1.5 : undefined,
//         rotation: !isCircle ? Math.random() * Math.PI * 2 : undefined,
//         vx: Math.random() * 0.4 - 0.2,
//         vy: Math.random() * 0.4 - 0.2,
//         opacity: Math.random() * 0.4 + 0.2,
//         type: isCircle ? "circle" : "line",
//         wave: Math.random() < 0.25 && isCircle,
//         waveOffset: Math.random() * Math.PI * 2,
//         pulse: Math.random() < 0.15 && isCircle,
//         pulseScale: 1,
//       };
//     });

//     let mouseX = 0,
//       mouseY = 0;
//     const handleMouseMove = (e: MouseEvent) => {
//       mouseX = e.clientX;
//       mouseY = e.clientY;
//     };
//     canvas.addEventListener("mousemove", handleMouseMove);

//     const animate = (time: number) => {
//       ctx.clearRect(0, 0, canvas.width, canvas.height);

//       // Draw connection lines with enhanced styling
//       for (let i = 0; i < particles.length; i++) {
//         for (let j = i + 1; j < particles.length; j++) {
//           const p1 = particles[i],
//             p2 = particles[j];
//           const dx = p1.x - p2.x,
//             dy = p1.y - p2.y;
//           const dist = Math.sqrt(dx * dx + dy * dy);
//           if (dist < 120) {
//             ctx.beginPath();
//             ctx.moveTo(p1.x, p1.y);
//             ctx.lineTo(p2.x, p2.y);
//             const gradient = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
//             gradient.addColorStop(
//               0,
//               `rgba(134, 239, 172, ${0.3 * (1 - dist / 120)})`
//             );
//             gradient.addColorStop(
//               1,
//               `rgba(34, 197, 94, ${0.2 * (1 - dist / 120)})`
//             );
//             ctx.strokeStyle = gradient;
//             ctx.lineWidth = 0.8;
//             ctx.stroke();
//           }
//         }
//       }

//       // Update and draw particles with enhanced effects
//       particles.forEach((p) => {
//         // Enhanced mouse interaction
//         const dx = mouseX - p.x,
//           dy = mouseY - p.y;
//         const dist = Math.sqrt(dx * dx + dy * dy);
//         let currentOpacity = p.opacity;
//         if (dist < 180) {
//           p.vx += (dx / dist) * 0.015;
//           p.vy += (dy / dist) * 0.015;
//           currentOpacity = Math.min(
//             0.9,
//             p.opacity + ((180 - dist) / 180) * 0.5
//           );
//         }

//         // Update position with enhanced movement
//         p.x += p.vx;
//         p.y += p.vy;
//         if (p.wave) {
//           p.y += Math.sin(time / 1200 + p.waveOffset) * 0.8;
//         }
//         if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
//         if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
//         p.vx = Math.max(-0.6, Math.min(0.6, p.vx));
//         p.vy = Math.max(-0.6, Math.min(0.6, p.vy));

//         // Enhanced pulse effect
//         if (p.pulse) {
//           p.pulseScale = 0.7 + Math.sin(time / 600) * 0.3;
//         }

//         // Draw particle with enhanced styling
//         ctx.beginPath();
//         if (p.type === "circle") {
//           const radius = p.radius! * (p.pulse ? p.pulseScale : 1);
//           ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);

//           // Create radial gradient for glow effect
//           const gradient = ctx.createRadialGradient(
//             p.x,
//             p.y,
//             0,
//             p.x,
//             p.y,
//             radius * 2
//           );
//           gradient.addColorStop(0, `rgba(134, 239, 172, ${currentOpacity})`);
//           gradient.addColorStop(
//             0.7,
//             `rgba(134, 239, 172, ${currentOpacity * 0.5})`
//           );
//           gradient.addColorStop(1, `rgba(134, 239, 172, 0)`);

//           ctx.fillStyle = gradient;
//           ctx.fill();
//         } else {
//           const x2 = p.x + Math.cos(p.rotation!) * p.length!;
//           const y2 = p.y + Math.sin(p.rotation!) * p.length!;
//           ctx.moveTo(p.x, p.y);
//           ctx.lineTo(x2, y2);
//           ctx.strokeStyle = `rgba(134, 239, 172, ${currentOpacity})`;
//           ctx.lineWidth = 1.2;
//           ctx.lineCap = "round";
//           ctx.stroke();
//         }
//       });

//       requestAnimationFrame(animate);
//     };
//     requestAnimationFrame(animate);

//     return () => canvas.removeEventListener("mousemove", handleMouseMove);
//   }, []);

//   // Chart setup
//   useEffect(() => {
//     if (isNewUser || isLoading || history.length === 0) return;
//     const ctx = document.getElementById("earningsChart") as HTMLCanvasElement;
//     if (!ctx) return;

//     // Aggregate earnings by month
//     const earningsByMonth: { [key: string]: number } = {};
//     history.forEach((entry) => {
//       const date = new Date(entry.date);
//       const monthYear = date.toLocaleString("default", {
//         month: "short",
//         year: "numeric",
//       });
//       earningsByMonth[monthYear] =
//         (earningsByMonth[monthYear] || 0) + entry.earnings;
//     });

//     // Sort months chronologically
//     const labels = Object.keys(earningsByMonth).sort((a, b) => {
//       const dateA = new Date(`1 ${a}`);
//       const dateB = new Date(`1 ${b}`);
//       return dateA.getTime() - dateB.getTime();
//     });
//     const data = labels.map((label) => earningsByMonth[label]);

//     const chart = new Chart(ctx, {
//       type: "line",
//       data: {
//         labels,
//         datasets: [
//           {
//             label: "Earnings ($)",
//             data,
//             borderColor: "#86efac",
//             backgroundColor: "rgba(134, 239, 172, 0.1)",
//             pointBackgroundColor: "#86efac",
//             pointBorderColor: "#86efac",
//             pointRadius: 6,
//             pointHoverRadius: 8,
//             fill: true,
//             tension: 0.4,
//           },
//         ],
//       },
//       options: {
//         responsive: true,
//         plugins: {
//           legend: { labels: { color: "#e5e7eb" } },
//         },
//         scales: {
//           y: {
//             beginAtZero: true,
//             ticks: { color: "#9ca3af" },
//             grid: { color: "rgba(156, 163, 175, 0.1)" },
//           },
//           x: {
//             ticks: { color: "#9ca3af" },
//             grid: { color: "rgba(156, 163, 175, 0.1)" },
//           },
//         },
//       },
//     });

//     return () => chart.destroy();
//   }, [isNewUser, isLoading, history]);

//   // QR code generation
//   useEffect(() => {
//     if (referralCode && !isLoading) {
//       const appUrl =
//         process.env.NEXT_PUBLIC_APP_URL || "https://www.deserialize.xyz/";
//       QRCode.toCanvas(
//         document.getElementById("qrCode"),
//         `${appUrl}?ref=${referralCode}`,
//         {
//           width: 120,
//           color: { dark: "#86efac", light: "#000000" },
//         }
//       );
//     }
//   }, [referralCode, isLoading]);

//   // Generate referral code
//   const generateReferralCode = async () => {
//     if (!connected || !walletAddress) {
//       toast.custom((t) => (
//         <div
//           className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border ${
//             t.visible ? "animate-enter" : "animate-leave"
//           }`}
//           style={{
//             background: "linear-gradient(135deg, #86efac 0%, #22c55e 100%)",
//             color: "#000",
//             border: "1px solid rgba(134, 239, 172, 0.3)",
//           }}
//         >
//           <Wallet size={22} color="#000" />
//           <span className="font-medium">
//             Connect your wallet to unlock the power of referrals!
//           </span>
//         </div>
//       ));
//       return;
//     }

//     setIsLoading(true);
//     try {
//       const response = await fetch("/api/referral-code", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ walletAddress, customCode }),
//       });
//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || "Failed to generate referral code");
//       }
//       const { referralCode: newCode } = await response.json();
//       setReferralCode(newCode);
//       setShowModal(false);
//       setModalStep(1);
//       setCustomCode("");
//       confetti({
//         particleCount: 200,
//         spread: 80,
//         origin: { y: 0.6 },
//         colors: ["#86efac", "#22c55e", "#16a34a"],
//       });
//       toast.custom((t) => (
//         <div
//           className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border ${
//             t.visible ? "animate-enter" : "animate-leave"
//           }`}
//           style={{
//             background: "linear-gradient(135deg, #86efac 0%, #22c55e 100%)",
//             color: "#000",
//             border: "1px solid rgba(134, 239, 172, 0.3)",
//           }}
//         >
//           <Save size={22} color="#000" />
//           <span className="font-medium">Referral code generated!</span>
//         </div>
//       ));
//     } catch (error: any) {
//       console.error("Failed to generate referral code:", error);
//       toast.custom((t) => (
//         <div
//           className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border ${
//             t.visible ? "animate-enter" : "animate-leave"
//           }`}
//           style={{
//             background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
//             color: "#000",
//             border: "1px solid rgba(245, 158, 11, 0.3)",
//           }}
//         >
//           <AlertCircle size={22} color="#000" />
//           <span className="font-medium">
//             {error.message || "Failed to generate referral code."}
//           </span>
//         </div>
//       ));
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Save percentage
//   const savePercentage = async () => {
//     if (!connected || !walletAddress) {
//       toast.custom((t) => (
//         <div
//           className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border ${
//             t.visible ? "animate-enter" : "animate-leave"
//           }`}
//           style={{
//             background: "linear-gradient(135deg, #86efac 0%, #22c55e 100%)",
//             color: "#000",
//             border: "1px solid rgba(134, 239, 172, 0.3)",
//           }}
//         >
//           <Wallet size={22} color="#000" />
//           <span className="font-medium">
//             Connect your wallet to unlock the power of referrals!
//           </span>
//         </div>
//       ));
//       return;
//     }

//     setIsLoading(true);
//     try {
//       const response = await fetch("/api/user/percentage", {
//         method: "PATCH",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ walletAddress, percentage }),
//       });
//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || "Failed to save percentage");
//       }
//       const { defaultReferralPercentage } = await response.json();
//       setPercentage(defaultReferralPercentage);
//       confetti({
//         particleCount: 80,
//         spread: 60,
//         colors: ["#86efac", "#22c55e"],
//       });
//       toast.custom((t) => (
//         <div
//           className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border ${
//             t.visible ? "animate-enter" : "animate-leave"
//           }`}
//           style={{
//             background: "linear-gradient(135deg, #86efac 0%, #22c55e 100%)",
//             color: "#000",
//             border: "1px solid rgba(134, 239, 172, 0.3)",
//           }}
//         >
//           <Save size={22} color="#000" />
//           <span className="font-medium">Percentage saved!</span>
//         </div>
//       ));
//     } catch (error: any) {
//       console.error("Failed to save percentage:", error);
//       toast.custom((t) => (
//         <div
//           className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border ${
//             t.visible ? "animate-enter" : "animate-leave"
//           }`}
//           style={{
//             background: "linear-gradient(135deg, #86efac 0%, #22c55e 100%)",
//             color: "#000",
//             border: "1px solid rgba(134, 239, 172, 0.3)",
//           }}
//         >
//           <AlertCircle size={22} color="#000" />
//           <span className="font-medium">
//             {error.message || "Failed to save percentage."}
//           </span>
//         </div>
//       ));
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Claim NFT
//   const claimNFT = async () => {
//     if (!connected || !walletAddress) {
//       toast.custom((t) => (
//         <div
//           className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border ${
//             t.visible ? "animate-enter" : "animate-leave"
//           }`}
//           style={{
//             background: "linear-gradient(135deg, #86efac 0%, #22c55e 100%)",
//             color: "#000",
//             border: "1px solid rgba(134, 239, 172, 0.3)",
//           }}
//         >
//           <Wallet size={22} color="#000" />
//           <span className="font-medium">
//             Connect your wallet to unlock the power of referrals!
//           </span>
//         </div>
//       ));
//       return;
//     }

//     toast.custom((t) => (
//       <div
//         className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border ${
//           t.visible ? "animate-enter" : "animate-leave"
//         }`}
//         style={{
//           background: "linear-gradient(135deg, #86efac 0%, #22c55e 100%)",
//           color: "#000",
//           border: "1px solid rgba(134, 239, 172, 0.3)",
//         }}
//       >
//         <AlertCircle size={22} color="#000" />
//         <span className="font-medium">NFT claim coming soon!</span>
//       </div>
//     ));
//   };

//   // Copy to clipboard
//   const copyToClipboard = (text: string) => {
//     navigator.clipboard.writeText(text);
//     toast.custom((t) => (
//       <div
//         className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border ${
//           t.visible ? "animate-enter" : "animate-leave"
//         }`}
//         style={{
//           background: "linear-gradient(135deg, #86efac 0%, #22c55e 100%)",
//           color: "#000",
//           border: "1px solid rgba(134, 239, 172, 0.3)",
//         }}
//       >
//         <CopyCheck size={22} color="#000" />
//         <span className="font-medium">Copied!</span>
//       </div>
//     ));
//   };

//   // Close modal
//   const closeModal = () => {
//     setShowModal(false);
//     setModalStep(1);
//     setCustomCode("");
//   };

//   if (isLoading) {
//     return <SkeletonLoader />;
//   }

//   return (
//     <div className="min-h-screen bg-black mt-[80px] text-white relative overflow-hidden">
//       {/* Enhanced background with professional gradients */}
//       <div className="absolute inset-0 bg-black">
//         <div className="absolute inset-0 bg-[linear-gradient(rgba(134,239,172,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(134,239,172,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
//         <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(134,239,172,0.08),transparent_50%)]" />
//         <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(134,239,172,0.06),transparent_50%)]" />
//         <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black/80" />
//       </div>

//       <Toaster
//         position="bottom-right"
//         toastOptions={{
//           style: {
//             background: "transparent",
//             border: "none",
//             boxShadow: "none",
//           },
//           duration: 4000,
//         }}
//       />

//       <canvas ref={canvasRef} className="absolute inset-0 z-0 opacity-70" />

//       {/* Enhanced floating orbs animation */}
//       <div className="absolute inset-0 z-0 overflow-hidden">
//         {[...Array(8)].map((_, i) => (
//           <motion.div
//             key={i}
//             className="absolute rounded-full blur-2xl"
//             style={{
//               width: `${120 + i * 20}px`,
//               height: `${120 + i * 20}px`,
//               background: `radial-gradient(circle, rgba(134, 239, 172, ${
//                 0.1 - i * 0.01
//               }) 0%, rgba(34, 197, 94, ${
//                 0.05 - i * 0.005
//               }) 50%, transparent 100%)`,
//               left: `${15 + i * 12}%`,
//               top: `${8 + i * 8}%`,
//             }}
//             animate={{
//               x: [0, 120, 0],
//               y: [0, -120, 0],
//               scale: [1, 1.3, 1],
//               rotate: [0, 180, 360],
//             }}
//             transition={{
//               duration: 12 + i * 3,
//               repeat: Number.POSITIVE_INFINITY,
//               ease: "easeInOut",
//               delay: i * 2.5,
//             }}
//           />
//         ))}
//       </div>

//       <div className="relative z-10 container mx-auto px-6 py-16 space-y-20">
//         {/* Enhanced Hero Section */}
//         <motion.section
//           initial={{ opacity: 0, y: 40 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 1, ease: "easeOut" }}
//           className="text-center space-y-12"
//         >
//           <div className="space-y-8">
//             <div className="hidden">
//               <motion.div
//                 initial={{ scale: 0.8, opacity: 0 }}
//                 animate={{ scale: 1, opacity: 1 }}
//                 transition={{ duration: 0.6, delay: 0.3 }}
//                 className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-xl border border-gray-600/50 rounded-full text-gray-100 text-sm font-semibold shadow-2xl"
//               >
//                 <Sparkles className="w-5 h-5" />
//                 Deserialize Referral Program
//               </motion.div>
//             </div>

//             <motion.h1
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.8, delay: 0.2 }}
//               className="text-4xl md:text-8xl font-black bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent leading-tight"
//             >
//               Earn on{" "}
//               <span className="bg-gradient-to-r from-[#86efac] via-[#22c55e] to-[#16a34a] bg-clip-text text-transparent">
//                 Deserialize
//               </span>
//             </motion.h1>

//             <motion.p
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.8, delay: 0.4 }}
//               className="text-xl md:text-2xl text-gray-300 font-medium max-w-3xl mx-auto leading-relaxed"
//             >
//               You decide the fees we charge your referrals- we'll pay you 70% of
//               it!!
//             </motion.p>
//           </div>

//           {referralCode ? (
//             <motion.div
//               initial={{ opacity: 0, y: 30 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.8, duration: 0.8 }}
//               className="max-w-3xl mx-auto"
//             >
//               <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-2xl border border-gray-700/50 rounded-3xl p-10 space-y-8 shadow-2xl">
//                 <h3 className="text-3xl font-bold text-[#86efac] flex items-center justify-center gap-3">
//                   <Share2 className="w-8 h-8" />
//                   Share Your Referral
//                 </h3>

//                 <div className="space-y-6">
//                   <div className="flex flex-col sm:flex-row gap-4">
//                     <Input
//                       value={`${
//                         process.env.NEXT_PUBLIC_APP_URL ||
//                         "https://www.deserialize.xyz"
//                       }/?ref=${referralCode}`}
//                       readOnly
//                       className="flex-1 bg-gray-800/60 backdrop-blur-xl border-gray-600/50 text-gray-100 focus:border-[#86efac] focus:ring-[#86efac]/30 rounded-2xl px-6 py-4 text-lg font-medium shadow-xl"
//                     />
//                     <Button
//                       onClick={() =>
//                         copyToClipboard(
//                           `${
//                             process.env.NEXT_PUBLIC_APP_URL ||
//                             "https://www.deserialize.xyz"
//                           }/?ref=${referralCode}`
//                         )
//                       }
//                       className="bg-gradient-to-r from-[#86efac] to-[#22c55e] text-black hover:from-[#86efac]/90 hover:to-[#22c55e]/90 font-bold px-8 py-4 rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105"
//                     >
//                       <LinkIcon className="w-5 h-5 mr-2" />
//                       Copy Link
//                     </Button>
//                   </div>

//                   <div className="flex flex-wrap justify-center gap-4 hidden">
//                     {["Twitter", "Telegram", "Discord"].map((platform) => (
//                       <Button
//                         key={platform}
//                         variant="outline"
//                         onClick={() =>
//                           toast(`Share on ${platform} coming soon!`)
//                         }
//                         className="border-gray-600/50 bg-gray-800/40 backdrop-blur-xl text-gray-200 hover:bg-[#86efac]/10 hover:border-[#86efac]/50 hover:text-[#86efac] rounded-2xl px-6 py-3 font-medium transition-all duration-300"
//                       >
//                         {platform}
//                       </Button>
//                     ))}
//                   </div>

//                   <div className="flex flex-col items-center gap-6 pt-6 hidden">
//                     <canvas id="qrCode" className="rounded-2xl shadow-2xl" />
//                     <Button
//                       onClick={() => toast.success("QR code downloaded!")}
//                       variant="outline"
//                       className="border-gray-600/50 bg-gray-800/40 backdrop-blur-xl text-gray-200 hover:bg-[#86efac]/10 hover:border-[#86efac]/50 hover:text-[#86efac] rounded-2xl px-6 py-3 font-medium transition-all duration-300"
//                     >
//                       <QrCode className="w-5 h-5 mr-2" />
//                       Download QR
//                     </Button>
//                   </div>
//                 </div>
//               </div>
//             </motion.div>
//           ) : (
//             <motion.div
//               initial={{ opacity: 0, scale: 0.9 }}
//               animate={{ opacity: 1, scale: 1 }}
//               transition={{ delay: 0.6, duration: 0.8 }}
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//             >
//               <Button
//                 onClick={() => {
//                   if (!connected || !walletAddress) {
//                     toast.custom((t) => (
//                       <div
//                         className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border ${
//                           t.visible ? "animate-enter" : "animate-leave"
//                         }`}
//                         style={{
//                           background:
//                             "linear-gradient(135deg, #86efac 0%, #22c55e 100%)",
//                           color: "#000",
//                           border: "1px solid rgba(134, 239, 172, 0.3)",
//                         }}
//                       >
//                         <Wallet size={22} color="#000" />
//                         <span className="font-medium">
//                           Connect your wallet to start earning from referrals!
//                         </span>
//                       </div>
//                     ));
//                     return;
//                   }
//                   setShowModal(true);
//                 }}
//                 size="lg"
//                 className="bg-gradient-to-r from-[#86efac] via-[#22c55e] to-[#16a34a] text-black hover:from-[#86efac]/90 hover:via-[#22c55e]/90 hover:to-[#16a34a]/90 font-bold text-xl px-12 py-6 rounded-3xl shadow-2xl transition-all duration-500 hover:shadow-[#86efac]/25"
//               >
//                 <Sparkles className="w-6 h-6 mr-3" />
//                 Generate Referral Link
//               </Button>
//             </motion.div>
//           )}
//         </motion.section>

//         {/* Enhanced Fee Percentage Section */}
//         <motion.section
//           initial={{ opacity: 0, y: 40 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.8 }}
//           className="max-w-3xl mx-auto"
//         >
//           <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-2xl border border-gray-700/50 rounded-3xl shadow-2xl overflow-hidden">
//             <CardHeader className="pb-8">
//               <CardTitle className="text-3xl text-center text-[#86efac] flex items-center justify-center gap-3 font-bold">
//                 <TrendingUp className="w-8 h-8" />
//                 Set how much fee we charge your referrals
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-8 px-10 pb-10">
//               <div className="space-y-8">
//                 <div className="relative">
//                   <Slider
//                     value={[percentage * 100]}
//                     onValueChange={(value) => setPercentage(value[0] / 100)}
//                     min={0.05}
//                     max={1}
//                     step={0.001}
//                     className="w-full h-3"
//                   />
//                   <div className="flex justify-between text-sm text-gray-400 mt-3">
//                     <span>0.05%</span>
//                     <span>1.0%</span>
//                   </div>
//                 </div>

//                 <div className="text-center space-y-6">
//                   <div className="text-5xl font-black text-[#86efac] tracking-tight">
//                     {(percentage * 100).toFixed(3)}%
//                   </div>

//                   <div className="flex flex-col md:flex-row items-center justify-center gap-4">
//                     <p className="text-gray-300 text-lg font-medium">
//                       {isNewUser
//                         ? "Set your earnings rate to kickstart referrals!"
//                         : `If your referral trades $10,000, you'll earn $${(
//                             10000 *
//                             percentage *
//                             0.7
//                           ).toFixed(2)}`}
//                     </p>

//                     <motion.span
//                       className="flex items-center gap-2 cursor-pointer text-[#86efac] border-b border-[#86efac]/50 hover:border-[#86efac] transition-colors font-medium"
//                       onClick={() => setIsOpen(!isOpen)}
//                       whileHover={{ scale: 1.05 }}
//                       whileTap={{ scale: 0.95 }}
//                     >
//                       View breakdown
//                       <ChevronDown
//                         className={`h-5 w-5 transition-transform duration-300 ${
//                           isOpen ? "rotate-180" : ""
//                         }`}
//                       />
//                     </motion.span>
//                   </div>
//                 </div>

//                 {isOpen && (
//                   <motion.div
//                     initial={{ opacity: 0, height: 0 }}
//                     animate={{ opacity: 1, height: "auto" }}
//                     exit={{ opacity: 0, height: 0 }}
//                     transition={{ duration: 0.3 }}
//                     className="bg-gradient-to-r from-gray-800/50 to-gray-700/30 backdrop-blur-xl rounded-2xl p-6 border border-gray-600/30"
//                   >
//                     <div className="flex items-center justify-center gap-6 text-sm">
//                       <Badge
//                         variant="outline"
//                         className="border-[#86efac]/40 bg-[#86efac]/10 text-[#86efac] px-4 py-2 rounded-xl font-semibold"
//                       >
//                         {(percentage * 100).toFixed(2)}% fees = $
//                         {(10000 * percentage).toFixed(2)}
//                       </Badge>
//                       <Badge
//                         variant="outline"
//                         className="border-gray-500/40 bg-gray-600/10 text-gray-300 px-4 py-2 rounded-xl font-semibold"
//                       >
//                         Your Share: ${(10000 * percentage * 0.7).toFixed(2)}
//                       </Badge>
//                     </div>
//                   </motion.div>
//                 )}
//               </div>

//               <Button
//                 onClick={savePercentage}
//                 disabled={!referralCode}
//                 className="w-full bg-gradient-to-r from-[#86efac] to-[#22c55e] text-black hover:from-[#86efac]/90 hover:to-[#22c55e]/90 font-bold py-4 rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
//               >
//                 <Save className="w-5 h-5 mr-2" />
//                 Save Percentage
//               </Button>
//             </CardContent>
//           </Card>
//         </motion.section>

//         {/* Enhanced Stats Section */}
//         <motion.section
//           initial={{ opacity: 0, y: 40 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.8 }}
//           className="space-y-12"
//         >
//           <h2 className="text-4xl md:text-5xl font-black text-center bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
//             Your Referral Stats
//           </h2>

//           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
//             {[
//               {
//                 label: "Total Referrals",
//                 value: isNewUser ? "0" : stats.referrals.toString(),
//                 icon: Users,
//                 color: "text-blue-400",
//                 bgColor: "from-blue-500/20 to-blue-600/10",
//                 borderColor: "border-blue-400/30",
//               },
//               {
//                 label: "Total Earnings",
//                 value: isNewUser ? "$0" : `$${stats.earnings}`,
//                 icon: DollarSign,
//                 color: "text-[#86efac]",
//                 bgColor: "from-[#86efac]/20 to-[#22c55e]/10",
//                 borderColor: "border-[#86efac]/30",
//               },
//               {
//                 label: "Referral Points",
//                 value: isNewUser
//                   ? "0"
//                   : `${stats.referralPointsTotal.toLocaleString()}`,
//                 icon: Sparkles,
//                 color: "text-purple-400",
//                 bgColor: "from-purple-500/20 to-purple-600/10",
//                 borderColor: "border-purple-400/30",
//               },
//             ].map((stat, i) => (
//               <motion.div
//                 key={i}
//                 initial={{ scale: 0.8, opacity: 0 }}
//                 whileInView={{ scale: 1, opacity: 1 }}
//                 whileHover={{ scale: 1.05, y: -5 }}
//                 transition={{ duration: 0.6, delay: i * 0.2 }}
//               >
//                 <Card
//                   className={`bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-2xl border ${stat.borderColor} rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden`}
//                 >
//                   <CardContent className="p-8">
//                     <div className="flex items-center gap-6">
//                       <div
//                         className={`p-4 rounded-2xl bg-gradient-to-br ${stat.bgColor} shadow-xl`}
//                       >
//                         <stat.icon className={`w-8 h-8 ${stat.color}`} />
//                       </div>
//                       <div className="space-y-2">
//                         <p className="text-sm text-gray-400 font-semibold uppercase tracking-wider">
//                           {stat.label}
//                         </p>
//                         <p className="text-3xl font-black text-white">
//                           {stat.value}
//                         </p>
//                       </div>
//                     </div>
//                   </CardContent>
//                 </Card>
//               </motion.div>
//             ))}
//           </div>

//           {/* Points Breakdown */}
//           {!isNewUser && stats.points > 0 && (
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.6 }}
//               className="max-w-4xl mx-auto hidden"
//             >
//               <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 backdrop-blur-2xl border border-purple-400/30 rounded-3xl shadow-2xl overflow-hidden">
//                 <CardContent className="p-8">
//                   <div className="text-center space-y-6">
//                     <div className="flex items-center justify-center gap-3">
//                       <Sparkles className="w-8 h-8 text-purple-400" />
//                       <h3 className="text-2xl font-bold text-purple-400">
//                         Points Breakdown
//                       </h3>
//                     </div>
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                       <div className="text-center space-y-2">
//                         <p className="text-gray-400 font-medium">Base Points</p>
//                         <p className="text-2xl font-bold text-white">1,000</p>
//                       </div>
//                       <div className="text-center space-y-2">
//                         <p className="text-gray-400 font-medium">
//                           Referral Bonus
//                         </p>
//                         <p className="text-2xl font-bold text-white">
//                           +{stats.referrals * 50}
//                         </p>
//                       </div>
//                       <div className="text-center space-y-2">
//                         <p className="text-gray-400 font-medium">
//                           Activity Bonus
//                         </p>
//                         <p className="text-2xl font-bold text-white">+250</p>
//                       </div>
//                     </div>
//                     <div className="bg-gradient-to-r from-purple-500/10 to-purple-600/5 rounded-2xl p-4 mt-6">
//                       <p className="text-gray-300 text-sm">
//                         Earn points by referring friends, completing milestones,
//                         and staying active. Points unlock exclusive rewards and
//                         higher referral tiers!
//                       </p>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             </motion.div>
//           )}

//           {/* Enhanced Chart Section */}
//           <div className="max-w-5xl mx-auto hidden">
//             {isNewUser || history.length === 0 ? (
//               <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-2xl border border-gray-700/50 rounded-3xl shadow-2xl">
//                 <CardContent className="p-16 text-center">
//                   <TrendingUp className="w-20 h-20 text-gray-600 mx-auto mb-6" />
//                   <h3 className="text-2xl font-bold text-gray-300 mb-4">
//                     No Earnings Yet
//                   </h3>
//                   <p className="text-gray-400 mb-8 text-lg">
//                     Share your referral code to see your earnings growth!
//                   </p>
//                   {!referralCode && (
//                     <Button
//                       onClick={() => {
//                         if (!connected || !walletAddress) {
//                           toast.custom((t) => (
//                             <div
//                               className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border ${
//                                 t.visible ? "animate-enter" : "animate-leave"
//                               }`}
//                               style={{
//                                 background:
//                                   "linear-gradient(135deg, #86efac 0%, #22c55e 100%)",
//                                 color: "#000",
//                                 border: "1px solid rgba(134, 239, 172, 0.3)",
//                               }}
//                             >
//                               <Wallet size={22} color="#000" />
//                               <span className="font-medium">
//                                 Connect your wallet to start earning!
//                               </span>
//                             </div>
//                           ));
//                           return;
//                         }
//                         setShowModal(true);
//                       }}
//                       className="bg-gradient-to-r from-[#86efac] to-[#22c55e] text-black hover:from-[#86efac]/90 hover:to-[#22c55e]/90 font-bold px-8 py-4 rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105"
//                     >
//                       Generate Code Now
//                     </Button>
//                   )}
//                 </CardContent>
//               </Card>
//             ) : (
//               <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-2xl border border-gray-700/50 rounded-3xl shadow-2xl">
//                 <CardHeader className="pb-6">
//                   <CardTitle className="text-2xl text-center font-bold text-white">
//                     Earnings Over Time
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent className="p-8">
//                   <canvas id="earningsChart" height="200" className="w-full" />
//                 </CardContent>
//               </Card>
//             )}
//           </div>
//         </motion.section>

//         {/* Enhanced Leaderboard */}
//         <motion.section
//           initial={{ opacity: 0, y: 40 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.8 }}
//           className="max-w-3xl mx-auto"
//         >
//           <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-2xl border border-gray-700/50 rounded-3xl shadow-2xl overflow-hidden">
//             <CardHeader className="pb-8">
//               <CardTitle className="text-3xl text-center text-[#86efac] flex items-center justify-center gap-3 font-bold">
//                 <Award className="w-8 h-8" />
//                 Top Referrers
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="px-10 pb-10">
//               {isNewUser || leaderboardData.length === 0 ? (
//                 <div className="text-center py-12">
//                   <Award className="w-16 h-16 text-gray-600 mx-auto mb-6" />
//                   <h3 className="text-xl font-bold text-gray-300 mb-4">
//                     Be the First Top Referrer!
//                   </h3>
//                   <p className="text-gray-400 text-lg">
//                     Invite friends to climb the leaderboard.
//                   </p>
//                 </div>
//               ) : (
//                 <div className="space-y-4">
//                   {leaderboardData.map((entry, i) => (
//                     <motion.div
//                       key={i}
//                       initial={{ x: 60, opacity: 0 }}
//                       whileInView={{ x: 0, opacity: 1 }}
//                       whileHover={{ scale: 1.02, x: 10 }}
//                       transition={{ duration: 0.6, delay: i * 0.1 }}
//                       className="flex items-center gap-6 p-6 bg-gradient-to-r from-gray-800/60 to-gray-700/40 backdrop-blur-xl rounded-2xl border-l-4 border-[#86efac] shadow-xl"
//                     >
//                       <div className="w-12 h-12 bg-gradient-to-br from-[#86efac]/30 to-[#22c55e]/20 backdrop-blur-xl rounded-full flex items-center justify-center text-[#86efac] font-black text-lg shadow-xl">
//                         {i + 1}
//                       </div>
//                       <div className="flex-1">
//                         <p className="font-bold text-white text-lg">
//                           {entry.name}
//                         </p>
//                         <p className="text-gray-300 font-medium">
//                           {entry.referrals} referrals
//                         </p>
//                       </div>
//                     </motion.div>
//                   ))}
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </motion.section>

//         {/* Enhanced Referral History */}
//         <motion.section
//           initial={{ opacity: 0, y: 40 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.8 }}
//           className="max-w-5xl mx-auto"
//         >
//           <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-2xl border border-gray-700/50 rounded-3xl shadow-2xl overflow-hidden">
//             <CardHeader className="pb-8">
//               <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
//                 <CardTitle className="text-3xl text-[#86efac] font-bold">
//                   Referral History
//                 </CardTitle>
//                 <div className="flex gap-3">
//                   {["Date", "Earnings"].map((filter) => (
//                     <Button
//                       key={filter}
//                       variant="outline"
//                       size="sm"
//                       onClick={() =>
//                         toast.custom((t) => (
//                           <div
//                             className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border ${
//                               t.visible ? "animate-enter" : "animate-leave"
//                             }`}
//                             style={{
//                               background:
//                                 "linear-gradient(135deg, #86efac 0%, #22c55e 100%)",
//                               color: "#000",
//                               border: "1px solid rgba(134, 239, 172, 0.3)",
//                             }}
//                           >
//                             <ListFilter size={22} color="#000" />
//                             <span className="font-medium">
//                               Sorting by {filter} coming soon!
//                             </span>
//                           </div>
//                         ))
//                       }
//                       className="border-gray-600/50 bg-gray-800/40 backdrop-blur-xl text-gray-200 hover:bg-[#86efac]/10 hover:border-[#86efac]/50 hover:text-[#86efac] rounded-2xl px-4 py-2 font-medium transition-all duration-300"
//                     >
//                       <ListFilter className="w-4 h-4 mr-2" />
//                       {filter}
//                     </Button>
//                   ))}
//                 </div>
//               </div>
//             </CardHeader>
//             <CardContent className="px-10 pb-10">
//               {historyData.length === 0 ? (
//                 <div className="text-center py-16">
//                   <Users className="w-20 h-20 text-gray-600 mx-auto mb-6" />
//                   <h3 className="text-2xl font-bold text-gray-300 mb-4">
//                     No Referrals Yet
//                   </h3>
//                   <p className="text-gray-400 mb-8 text-lg">
//                     Invite friends to start building your referral history!
//                   </p>
//                   {!referralCode && (
//                     <Button
//                       onClick={() => {
//                         if (!connected || !walletAddress) {
//                           toast.custom((t) => (
//                             <div
//                               className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border ${
//                                 t.visible ? "animate-enter" : "animate-leave"
//                               }`}
//                               style={{
//                                 background:
//                                   "linear-gradient(135deg, #86efac 0%, #22c55e 100%)",
//                                 color: "#000",
//                                 border: "1px solid rgba(134, 239, 172, 0.3)",
//                               }}
//                             >
//                               <Wallet size={22} color="#000" />
//                               <span className="font-medium">
//                                 Connect your wallet to unlock the power of
//                                 referrals!
//                               </span>
//                             </div>
//                           ));
//                           return;
//                         }
//                         setShowModal(true);
//                       }}
//                       className="bg-gradient-to-r from-[#86efac] to-[#22c55e] text-black hover:from-[#86efac]/90 hover:to-[#22c55e]/90 font-bold px-8 py-4 rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105"
//                     >
//                       Generate Link
//                     </Button>
//                   )}
//                 </div>
//               ) : (
//                 <div className="space-y-4">
//                   {historyData.map((entry, i) => (
//                     <motion.div
//                       key={i}
//                       initial={{ x: 60, opacity: 0 }}
//                       whileInView={{ x: 0, opacity: 1 }}
//                       whileHover={{ scale: 1.02, x: 10 }}
//                       transition={{ duration: 0.6, delay: i * 0.1 }}
//                       className="flex items-center gap-6 p-6 bg-gradient-to-r from-gray-800/60 to-gray-700/40 backdrop-blur-xl rounded-2xl border-l-4 border-[#86efac] shadow-xl"
//                     >
//                       <div className="w-12 h-12 bg-gradient-to-br from-[#86efac]/30 to-[#22c55e]/20 backdrop-blur-xl rounded-full flex items-center justify-center text-[#86efac] font-black text-lg shadow-xl">
//                         {i + 1}
//                       </div>
//                       <div className="flex-1">
//                         <p className="font-bold text-white text-lg">
//                           {entry.name}
//                         </p>
//                         <p className="text-gray-300 font-medium">
//                           {entry.date}
//                         </p>
//                         <p className="text-gray-300 font-medium">
//                           ${entry.earnings}
//                         </p>
//                       </div>
//                     </motion.div>
//                   ))}
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </motion.section>
//       </div>
//     </div>
//   );
// };

// export default ReferralDashboard;

// "use client";

// import type React from "react";

// import { useState, useEffect, useRef } from "react";
// import { motion } from "framer-motion";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Slider } from "@/components/ui/slider";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import {
//   Accordion,
//   AccordionContent,
//   AccordionItem,
//   AccordionTrigger,
// } from "@/components/ui/accordion";
// import Chart from "chart.js/auto";
// import confetti from "canvas-confetti";
// import QRCode from "qrcode";
// import { Toaster, toast } from "react-hot-toast";
// import { useAppContext } from "@/context/AppWalletProvider";
// import {
//   X,
//   HelpCircle,
//   Save,
//   Award,
//   Share2,
//   ListFilter,
//   TrendingUp,
//   Users,
//   DollarSign,
//   Clock,
//   Sparkles,
//   LinkIcon,
//   QrCode,
//   Wallet,
//   AlertCircle,
//   CopyCheck,
//   ChevronDown,
// } from "lucide-react";

// interface Referral {
//   id: string;
//   name: string;
//   date: string;
//   earnings: number;
//   status: "PENDING" | "ACTIVE" | "INACTIVE";
// }

// interface LeaderboardEntry {
//   name: string;
//   referrals: number;
// }

// interface FAQ {
//   question: string;
//   answer: string;
// }

// interface UserReferralData {
//   referralCode: string | null;
//   defaultReferralPercentage: number;
//   referrals: number;
//   earnings: number;
//   pending: number;
// }

// const SkeletonLoader: React.FC = () => {
//   return (
//     <div className="min-h-screen bg-gray-950 text-white relative overflow-hidden">
//       {/* Animated background */}
//       <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
//         <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(134,239,172,0.1),transparent_50%)]" />
//       </div>

//       <div className="relative z-10 container mx-auto px-4 py-12 space-y-12">
//         {/* Hero Skeleton */}
//         <div className="text-center space-y-6">
//           <div className="h-12 w-96 mx-auto bg-gray-800 animate-pulse rounded-lg" />
//           <div className="h-6 w-64 mx-auto bg-gray-800 animate-pulse rounded-lg" />
//           <div className="h-14 w-80 mx-auto bg-gray-800 animate-pulse rounded-lg" />
//         </div>

//         {/* Stats Skeleton */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
//           {[1, 2, 3].map((i) => (
//             <div
//               key={i}
//               className="bg-gray-900/50 border border-gray-800 rounded-xl p-6"
//             >
//               <div className="h-6 w-24 bg-gray-800 animate-pulse rounded mb-4" />
//               <div className="h-8 w-16 bg-gray-800 animate-pulse rounded" />
//             </div>
//           ))}
//         </div>

//         {/* Chart Skeleton */}
//         <div className="max-w-4xl mx-auto">
//           <div className="h-64 bg-gray-900/50 border border-gray-800 rounded-xl animate-pulse" />
//         </div>
//       </div>
//     </div>
//   );
// };

// const ReferralDashboard: React.FC = () => {
//   const [referralCode, setReferralCode] = useState<string | null>(null);
//   const [showModal, setShowModal] = useState(false);
//   const [modalStep, setModalStep] = useState(1);
//   const [customCode, setCustomCode] = useState("");
//   const [percentage, setPercentage] = useState<number>(0.001);
//   const [showFAQ, setShowFAQ] = useState(false);
//   const [userReferralData, setUserReferralData] =
//     useState<UserReferralData | null>(null);
//   const [history, setHistory] = useState<Referral[]>([]);
//   const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
//   const [faqs, setFaqs] = useState<FAQ[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const [isOpen, setIsOpen] = useState(false);

//   const { walletAddress, connecting, connected } = useAppContext();

//   // Demo data
//   const demoStats = { referrals: 5, earnings: 50, pending: 10 };
//   const demoFAQs: FAQ[] = [
//     {
//       question: "How do referrals work?",
//       answer:
//         "Invite friends with your code to earn a percentage of their transactions on Deserialize.",
//     },
//     {
//       question: "When are earnings paid?",
//       answer:
//         "Earnings are credited after referred users complete transactions.",
//     },
//   ];

//   const isNewUser = !connected;
//   const stats = isNewUser
//     ? { referrals: 0, earnings: 0, pending: 0 }
//     : userReferralData || demoStats;
//   const historyData = isNewUser || history.length === 0 ? [] : history;
//   const leaderboardData =
//     isNewUser || leaderboard.length === 0 ? [] : leaderboard;
//   const faqsData = faqs.length > 0 ? faqs : demoFAQs;

//   // Fetch data
//   useEffect(() => {
//     const fetchData = async () => {
//       if (!connected || !walletAddress) {
//         setIsLoading(false);
//         return;
//       }

//       setIsLoading(true);
//       try {
//         const userResponse = await fetch(
//           `/api/user?walletAddress=${walletAddress}`
//         );
//         if (!userResponse.ok) {
//           const errorData = await userResponse.json();
//           throw new Error(errorData.error || "Failed to fetch user data");
//         }
//         const userData = await userResponse.json();

//         const statsResponse = await fetch(
//           `/api/referral-stats?walletAddress=${walletAddress}`
//         );
//         if (!statsResponse.ok) {
//           const errorData = await statsResponse.json();
//           throw new Error(errorData.error || "Failed to fetch stats");
//         }
//         const statsData = await statsResponse.json();

//         const historyResponse = await fetch(
//           `/api/referrals/history?walletAddress=${walletAddress}`
//         );
//         let historyData: Referral[] = [];
//         if (historyResponse.ok) {
//           historyData = await historyResponse.json();
//         } else {
//           console.warn("No referral history data available");
//         }

//         const leaderboardResponse = await fetch("/api/referrals/leaderboard");
//         let leaderboardData: LeaderboardEntry[] = [];
//         if (leaderboardResponse.ok) {
//           leaderboardData = await leaderboardResponse.json();
//         } else {
//           console.warn("No leaderboard data available");
//         }

//         const combinedData = {
//           referralCode: userData.referralCode,
//           defaultReferralPercentage: userData.defaultReferralPercentage / 100,
//           referrals: statsData.referrals,
//           earnings: statsData.earnings,
//           pending: statsData.pending,
//         };

//         setUserReferralData(combinedData);
//         setReferralCode(combinedData.referralCode);
//         setPercentage(combinedData.defaultReferralPercentage);
//         setHistory(historyData);
//         setLeaderboard(leaderboardData);
//       } catch (error: any) {
//         console.error("Failed to fetch data:", error);
//         toast.custom((t) => (
//           <div
//             className={`flex items-center gap-2 px-4 py-2 rounded-md shadow-md ${
//               t.visible ? "animate-enter" : "animate-leave"
//             }`}
//             style={{ background: "#86efac", color: "#000" }}
//           >
//             <AlertCircle size={20} color="#000" />
//             <span>{error.message || "Failed to fetch data."}</span>
//           </div>
//         ));
//         setUserReferralData({
//           referralCode: null,
//           defaultReferralPercentage: 0.001,
//           referrals: demoStats.referrals,
//           earnings: demoStats.earnings,
//           pending: demoStats.pending,
//         });
//         setHistory([]);
//         setLeaderboard([]);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchData();
//   }, [connected, walletAddress]);

//   // Enhanced particle background
//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) {
//       console.error("Canvas not found");
//       return;
//     }
//     const ctx = canvas.getContext("2d");
//     if (!ctx) {
//       console.error("Canvas context not available");
//       return;
//     }

//     canvas.width = window.innerWidth;
//     canvas.height = window.innerHeight;

//     interface Particle {
//       x: number;
//       y: number;
//       radius?: number;
//       length?: number;
//       rotation?: number;
//       vx: number;
//       vy: number;
//       opacity: number;
//       type: "circle" | "line";
//       wave: boolean;
//       waveOffset: number;
//       pulse: boolean;
//       pulseScale: number;
//     }

//     const particles: Particle[] = Array.from({ length: 120 }, () => {
//       const isCircle = Math.random() < 0.7;
//       return {
//         x: Math.random() * canvas.width,
//         y: Math.random() * canvas.height,
//         radius: isCircle ? Math.random() * 2 + 1 : undefined,
//         length: !isCircle ? Math.random() * 3 + 2 : undefined,
//         rotation: !isCircle ? Math.random() * Math.PI * 2 : undefined,
//         vx: Math.random() * 0.5 - 0.25,
//         vy: Math.random() * 0.5 - 0.25,
//         opacity: Math.random() * 0.6 + 0.3,
//         type: isCircle ? "circle" : "line",
//         wave: Math.random() < 0.2 && isCircle,
//         waveOffset: Math.random() * Math.PI * 2,
//         pulse: Math.random() < 0.1 && isCircle,
//         pulseScale: 1,
//       };
//     });

//     let mouseX = 0,
//       mouseY = 0;
//     const handleMouseMove = (e: MouseEvent) => {
//       mouseX = e.clientX;
//       mouseY = e.clientY;
//     };
//     canvas.addEventListener("mousemove", handleMouseMove);

//     const animate = (time: number) => {
//       ctx.clearRect(0, 0, canvas.width, canvas.height);

//       // Draw connection lines
//       for (let i = 0; i < particles.length; i++) {
//         for (let j = i + 1; j < particles.length; j++) {
//           const p1 = particles[i],
//             p2 = particles[j];
//           const dx = p1.x - p2.x,
//             dy = p1.y - p2.y;
//           const dist = Math.sqrt(dx * dx + dy * dy);
//           if (dist < 100) {
//             ctx.beginPath();
//             ctx.moveTo(p1.x, p1.y);
//             ctx.lineTo(p2.x, p2.y);
//             ctx.strokeStyle = `rgba(134, 239, 172, ${0.4 * (1 - dist / 100)})`;
//             ctx.lineWidth = 0.5;
//             ctx.stroke();
//           }
//         }
//       }

//       // Update and draw particles
//       particles.forEach((p) => {
//         // Mouse interaction
//         const dx = mouseX - p.x,
//           dy = mouseY - p.y;
//         const dist = Math.sqrt(dx * dx + dy * dy);
//         let currentOpacity = p.opacity;
//         if (dist < 150) {
//           p.vx += (dx / dist) * 0.02;
//           p.vy += (dy / dist) * 0.02;
//           currentOpacity = Math.min(
//             0.9,
//             p.opacity + ((150 - dist) / 150) * 0.4
//           );
//         }

//         // Update position
//         p.x += p.vx;
//         p.y += p.vy;
//         if (p.wave) {
//           p.y += Math.sin(time / 1000 + p.waveOffset) * 0.5;
//         }
//         if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
//         if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
//         p.vx = Math.max(-0.5, Math.min(0.5, p.vx));
//         p.vy = Math.max(-0.5, Math.min(0.5, p.vy));

//         // Pulse effect
//         if (p.pulse) {
//           p.pulseScale = 0.8 + Math.sin(time / 500) * 0.2;
//         }

//         // Draw particle
//         ctx.beginPath();
//         if (p.type === "circle") {
//           ctx.arc(
//             p.x,
//             p.y,
//             p.radius! * (p.pulse ? p.pulseScale : 1),
//             0,
//             Math.PI * 2
//           );
//           ctx.fillStyle = `rgba(134, 239, 172, ${currentOpacity})`;
//           ctx.fill();
//         } else {
//           const x2 = p.x + Math.cos(p.rotation!) * p.length!;
//           const y2 = p.y + Math.sin(p.rotation!) * p.length!;
//           ctx.moveTo(p.x, p.y);
//           ctx.lineTo(x2, y2);
//           ctx.strokeStyle = `rgba(134, 239, 172, ${currentOpacity})`;
//           ctx.lineWidth = 1;
//           ctx.stroke();
//         }
//       });

//       requestAnimationFrame(animate);
//     };
//     requestAnimationFrame(animate);

//     return () => canvas.removeEventListener("mousemove", handleMouseMove);
//   }, []);

//   // Chart setup
//   useEffect(() => {
//     if (isNewUser || isLoading || history.length === 0) return;
//     const ctx = document.getElementById("earningsChart") as HTMLCanvasElement;
//     if (!ctx) return;

//     // Aggregate earnings by month
//     const earningsByMonth: { [key: string]: number } = {};
//     history.forEach((entry) => {
//       const date = new Date(entry.date);
//       const monthYear = date.toLocaleString("default", {
//         month: "short",
//         year: "numeric",
//       });
//       earningsByMonth[monthYear] =
//         (earningsByMonth[monthYear] || 0) + entry.earnings;
//     });

//     // Sort months chronologically
//     const labels = Object.keys(earningsByMonth).sort((a, b) => {
//       const dateA = new Date(`1 ${a}`);
//       const dateB = new Date(`1 ${b}`);
//       return dateA.getTime() - dateB.getTime();
//     });
//     const data = labels.map((label) => earningsByMonth[label]);

//     const chart = new Chart(ctx, {
//       type: "line",
//       data: {
//         labels,
//         datasets: [
//           {
//             label: "Earnings ($)",
//             data,
//             borderColor: "#86efac",
//             backgroundColor: "rgba(134, 239, 172, 0.1)",
//             pointBackgroundColor: "#86efac",
//             pointBorderColor: "#86efac",
//             pointRadius: 6,
//             pointHoverRadius: 8,
//             fill: true,
//             tension: 0.4,
//           },
//         ],
//       },
//       options: {
//         responsive: true,
//         plugins: {
//           legend: { labels: { color: "#e5e7eb" } },
//         },
//         scales: {
//           y: {
//             beginAtZero: true,
//             ticks: { color: "#9ca3af" },
//             grid: { color: "rgba(156, 163, 175, 0.1)" },
//           },
//           x: {
//             ticks: { color: "#9ca3af" },
//             grid: { color: "rgba(156, 163, 175, 0.1)" },
//           },
//         },
//       },
//     });

//     return () => chart.destroy();
//   }, [isNewUser, isLoading, history]);

//   // QR code generation
//   useEffect(() => {
//     if (referralCode && !isLoading) {
//       const appUrl =
//         process.env.NEXT_PUBLIC_APP_URL || "https://www.deserialize.xyz/";
//       QRCode.toCanvas(
//         document.getElementById("qrCode"),
//         `${appUrl}?ref=${referralCode}`,
//         {
//           width: 120,
//           color: { dark: "#86efac", light: "#000000" },
//         }
//       );
//     }
//   }, [referralCode, isLoading]);

//   // Generate referral code
//   const generateReferralCode = async () => {
//     if (!connected || !walletAddress) {
//       toast.custom((t) => (
//         <div
//           className={`flex items-center gap-2 px-4 py-2 rounded-md shadow-md ${
//             t.visible ? "animate-enter" : "animate-leave"
//           }`}
//           style={{ background: "#86efac", color: "#000" }}
//         >
//           <Wallet size={20} color="#000" />
//           <span>Connect your wallet to unlock the power of referrals!</span>
//         </div>
//       ));
//       return;
//     }

//     setIsLoading(true);
//     try {
//       const response = await fetch("/api/referral-code", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ walletAddress, customCode }),
//       });
//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || "Failed to generate referral code");
//       }
//       const { referralCode: newCode } = await response.json();
//       setReferralCode(newCode);
//       setShowModal(false);
//       setModalStep(1);
//       setCustomCode("");
//       confetti({
//         particleCount: 150,
//         spread: 70,
//         origin: { y: 0.6 },
//         colors: ["#86efac"],
//       });
//       toast.custom((t) => (
//         <div
//           className={`flex items-center gap-2 px-4 py-2 rounded-md shadow-md ${
//             t.visible ? "animate-enter" : "animate-leave"
//           }`}
//           style={{ background: "#86efac", color: "#000" }}
//         >
//           <Save size={20} color="#000" />
//           <span>Referral code generated!</span>
//         </div>
//       ));
//     } catch (error: any) {
//       console.error("Failed to generate referral code:", error);
//       toast.custom((t) => (
//         <div
//           className={`flex items-center gap-2 px-4 py-2 rounded-md shadow-md ${
//             t.visible ? "animate-enter" : "animate-leave"
//           }`}
//           style={{ background: "#FFA500", color: "#000" }}
//         >
//           <AlertCircle size={20} color="#000" />
//           <span>{error.message || "Failed to generate referral code."}</span>
//         </div>
//       ));
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Save percentage
//   const savePercentage = async () => {
//     if (!connected || !walletAddress) {
//       toast.custom((t) => (
//         <div
//           className={`flex items-center gap-2 px-4 py-2 rounded-md shadow-md ${
//             t.visible ? "animate-enter" : "animate-leave"
//           }`}
//           style={{ background: "#86efac", color: "#000" }}
//         >
//           <Wallet size={20} color="#000" />
//           <span>Connect your wallet to unlock the power of referrals!</span>
//         </div>
//       ));
//       return;
//     }

//     setIsLoading(true);
//     try {
//       const response = await fetch("/api/user/percentage", {
//         method: "PATCH",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ walletAddress, percentage }),
//       });
//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || "Failed to save percentage");
//       }
//       const { defaultReferralPercentage } = await response.json();
//       setPercentage(defaultReferralPercentage);
//       confetti({
//         particleCount: 50,
//         spread: 50,
//         colors: ["#86efac"],
//       });
//       toast.custom((t) => (
//         <div
//           className={`flex items-center gap-2 px-4 py-2 rounded-md shadow-md ${
//             t.visible ? "animate-enter" : "animate-leave"
//           }`}
//           style={{ background: "#86efac", color: "#000" }}
//         >
//           <Save size={20} color="#000" />
//           <span>Percentage saved!</span>
//         </div>
//       ));
//     } catch (error: any) {
//       console.error("Failed to save percentage:", error);
//       toast.custom((t) => (
//         <div
//           className={`flex items-center gap-2 px-4 py-2 rounded-md shadow-md ${
//             t.visible ? "animate-enter" : "animate-leave"
//           }`}
//           style={{ background: "#86efac", color: "#000" }}
//         >
//           <AlertCircle size={20} color="#000" />
//           <span>{error.message || "Failed to save percentage."}</span>
//         </div>
//       ));
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Claim NFT
//   const claimNFT = async () => {
//     if (!connected || !walletAddress) {
//       toast.custom((t) => (
//         <div
//           className={`flex items-center gap-2 px-4 py-2 rounded-md shadow-md ${
//             t.visible ? "animate-enter" : "animate-leave"
//           }`}
//           style={{ background: "#86efac", color: "#000" }}
//         >
//           <Wallet size={20} color="#000" />
//           <span>Connect your wallet to unlock the power of referrals!</span>
//         </div>
//       ));
//       return;
//     }

//     toast.custom((t) => (
//       <div
//         className={`flex items-center gap-2 px-4 py-2 rounded-md shadow-md ${
//           t.visible ? "animate-enter" : "animate-leave"
//         }`}
//         style={{ background: "#86efac", color: "#000" }}
//       >
//         <AlertCircle size={20} color="#000" />
//         <span>NFT claim coming soon!</span>
//       </div>
//     ));
//   };

//   // Copy to clipboard
//   const copyToClipboard = (text: string) => {
//     navigator.clipboard.writeText(text);
//     toast.custom((t) => (
//       <div
//         className={`flex items-center gap-2 px-4 py-2 rounded-md shadow-md ${
//           t.visible ? "animate-enter" : "animate-leave"
//         }`}
//         style={{ background: "#86efac", color: "#000" }}
//       >
//         <CopyCheck size={20} color="#000" />
//         <span>Copied!</span>
//       </div>
//     ));
//   };

//   // Close modal
//   const closeModal = () => {
//     setShowModal(false);
//     setModalStep(1);
//     setCustomCode("");
//   };

//   if (isLoading) {
//     return <SkeletonLoader />;
//   }

//   return (
//     <div className="min-h-screen bg-black mt-[80px] text-white relative overflow-hidden">
//       {/* Pure dark background with subtle grid pattern */}
//       <div className="absolute inset-0 bg-black">
//         <div className="absolute inset-0 bg-[linear-gradient(rgba(134,239,172,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(134,239,172,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
//         <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(134,239,172,0.05),transparent_70%)]" />
//       </div>

//       <Toaster
//         position="bottom-right"
//         toastOptions={{
//           style: {
//             background: "#1f2937",
//             color: "#f3f4f6",
//             border: "1px solid #374151",
//           },
//           duration: 3000,
//         }}
//       />

//       <canvas ref={canvasRef} className="absolute inset-0 z-0 opacity-60" />

//       {/* Floating orbs animation */}
//       <div className="absolute inset-0 z-0 overflow-hidden">
//         {[...Array(6)].map((_, i) => (
//           <motion.div
//             key={i}
//             className="absolute w-32 h-32 rounded-full bg-gradient-to-r from-[#86efac]/10 to-[#22c55e]/5 blur-xl"
//             animate={{
//               x: [0, 100, 0],
//               y: [0, -100, 0],
//               scale: [1, 1.2, 1],
//             }}
//             transition={{
//               duration: 10 + i * 2,
//               repeat: Number.POSITIVE_INFINITY,
//               ease: "easeInOut",
//               delay: i * 2,
//             }}
//             style={{
//               left: `${20 + i * 15}%`,
//               top: `${10 + i * 10}%`,
//             }}
//           />
//         ))}
//       </div>

//       <div className="relative z-10 container mx-auto px-4 py-12 space-y-16">
//         {/* Hero Section */}
//         <motion.section
//           initial={{ opacity: 0, y: 30 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.8 }}
//           className="text-center space-y-8"
//         >
//           <div className="space-y-4">
//             <div className="hidden">
//               <motion.div
//                 initial={{ scale: 0.9 }}
//                 animate={{ scale: 1 }}
//                 transition={{ duration: 0.5, delay: 0.2 }}
//                 className="inline-flex items-center gap-2 px-4 py-2 bg-[#86efac]/10 border border-[#86efac]/20 rounded-full text-[#86efac] text-sm font-medium"
//               >
//                 <Sparkles className="w-4 h-4" />
//                 Deserialize Referral Program
//               </motion.div>
//             </div>

//             <h1 className="text-2xl md:text-7xl font-bold bg-gradient-to-r  from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
//               Earn on{" "}
//               <span className="bg-gradient-to-r from-[#86efac] to-[#22c55e] bg-clip-text text-transparent">
//                 Deserialize
//               </span>
//             </h1>
//             <p className="text-base text-xl">
//               You decide the fees we charge your referrals- we’ll pay you 70% of
//               it!!
//             </p>

//             <motion.p
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: 0.5 }}
//               className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed hidden"
//             >
//               {isNewUser
//                 ? "Start by generating your unique referral code to invite friends and earn rewards!"
//                 : `Your referrals have earned you $${stats.earnings} so far!`}
//             </motion.p>
//           </div>

//           {referralCode ? (
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.7 }}
//               className="max-w-2xl mx-auto"
//             >
//               <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 space-y-6">
//                 <h3 className="text-2xl font-semibold text-[#86efac] flex items-center gap-2">
//                   <Share2 className="w-6 h-6" />
//                   Share Your Referral
//                 </h3>

//                 <div className="space-y-4">
//                   <div className="flex flex-col sm:flex-row gap-3">
//                     <Input
//                       value={`${
//                         process.env.NEXT_PUBLIC_APP_URL ||
//                         "https://www.deserialize.xyz"
//                       }/?ref=${referralCode}`}
//                       readOnly
//                       className="flex-1 bg-gray-800/50 border-gray-700 text-gray-200 focus:border-[#86efac] focus:ring-[#86efac]/20"
//                     />
//                     <Button
//                       onClick={() =>
//                         copyToClipboard(
//                           `${
//                             process.env.NEXT_PUBLIC_APP_URL ||
//                             "https://www.deserialize.xyz"
//                           }/?ref=${referralCode}`
//                         )
//                       }
//                       className="bg-[#86efac] text-black hover:bg-[#86efac]/90 font-medium px-6"
//                     >
//                       <LinkIcon className="w-4 h-4 mr-2" />
//                       Copy Link
//                     </Button>
//                   </div>

//                   <div className="flex flex-wrap justify-center gap-3 hidden">
//                     {["Twitter", "Telegram", "Discord"].map((platform) => (
//                       <Button
//                         key={platform}
//                         variant="outline"
//                         onClick={() =>
//                           toast(`Share on ${platform} coming soon!`)
//                         }
//                         className="border-gray-700 text-gray-300 hover:bg-[#86efac]/10 hover:border-[#86efac]/50 hover:text-[#86efac]"
//                       >
//                         {platform}
//                       </Button>
//                     ))}
//                   </div>

//                   <div className="flex flex-col items-center gap-4 pt-4 hidden">
//                     <canvas id="qrCode" className="rounded-lg" />
//                     <Button
//                       onClick={() => toast.success("QR code downloaded!")}
//                       variant="outline"
//                       className="border-gray-700 text-gray-300 hover:bg-[#86efac]/10 hover:border-[#86efac]/50 hover:text-[#86efac]"
//                     >
//                       <QrCode className="w-4 h-4 mr-2" />
//                       Download QR
//                     </Button>
//                   </div>
//                 </div>
//               </div>
//             </motion.div>
//           ) : (
//             <motion.div
//               whileHover={{ scale: 1.02 }}
//               whileTap={{ scale: 0.98 }}
//               animate={{ scale: [1, 1.02, 1] }}
//               transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
//             >
//               <Button
//                 onClick={() => {
//                   if (!connected || !walletAddress) {
//                     toast.custom((t) => (
//                       <div
//                         className={`flex items-center gap-2 px-4 py-2 rounded-md shadow-md ${
//                           t.visible ? "animate-enter" : "animate-leave"
//                         }`}
//                         style={{ background: "#86efac", color: "#000" }}
//                       >
//                         <Wallet size={20} color="#000" />
//                         <span>
//                           Connect your wallet to start earning from referrals!
//                         </span>
//                       </div>
//                     ));
//                     return;
//                   }
//                   setShowModal(true);
//                 }}
//                 size="lg"
//                 className="bg-gradient-to-r from-[#86efac] to-[#22c55e] text-black hover:from-[#86efac]/90 hover:to-[#22c55e]/90 font-semibold text-lg px-8 py-4 rounded-xl shadow-lg shadow-[#86efac]/25"
//               >
//                 <Sparkles className="w-5 h-5 mr-2" />
//                 Generate Referral Link
//               </Button>
//             </motion.div>
//           )}
//         </motion.section>

//         {/* Fee Percentage Section */}
//         <motion.section
//           initial={{ opacity: 0, y: 30 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6 }}
//           className="max-w-2xl mx-auto"
//         >
//           <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800">
//             <CardHeader>
//               <CardTitle className="text-xl text-center text-[#86efac] flex items-center justify-center gap-2">
//                 <TrendingUp className="w-6 h-6" />
//                 Set how much fee we charge your referrals
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               <div className="space-y-4">
//                 <Slider
//                   value={[percentage * 100]}
//                   onValueChange={(value) => setPercentage(value[0] / 100)}
//                   min={0.05}
//                   max={1}
//                   step={0.001}
//                   className="w-full"
//                 />

//                 <div className="text-center space-y-2">
//                   <div className="text-3xl font-bold text-[#86efac]">
//                     {(percentage * 100).toFixed(3)}%
//                   </div>

//                   {/* <div className="flex items-center justify-center gap-4 text-sm">
//                     <Badge
//                       variant="outline"
//                       className="border-[#86efac]/30 text-[#86efac]"
//                     >
//                       {(percentage * 100).toFixed(2)}% fees = $
//                       {(10000 * percentage).toFixed(2)}
//                     </Badge>
//                     <Badge
//                       variant="outline"
//                       className="border-gray-600 text-gray-400"
//                     >
//                       Your Share: ${(10000 * percentage * 0.7).toFixed(2)}
//                     </Badge>
//                   </div> */}

//                   <div className="flex flex-col md:flex-row">
//                     <p className="text-gray-400 w-fit flex-row">
//                       {isNewUser
//                         ? "Set your earnings rate to kickstart referrals!"
//                         : `If your referral trades $10,000, you'll earn $${(
//                             10000 *
//                             percentage *
//                             0.7
//                           ).toFixed(2)}`}
//                     </p>

//                     <span
//                       className="w-fit content-center mt-3 ml-15 md:mt-0 md:ml-3 flex items-center gap-1 cursor-pointer text-sm text-green-400 border-b"
//                       // style={{ textDecoration: "underline" }}
//                       onClick={() => setIsOpen(!isOpen)}
//                     >
//                       View breakdown
//                       <ChevronDown
//                         className={`h-5 w-5 transition-transform duration-200 ${
//                           isOpen ? "rotate-180" : ""
//                         }`}
//                         style={{ display: "inline" }}
//                       />
//                     </span>
//                   </div>
//                 </div>

//                 {isOpen && (
//                   <div className="mt-4 p-4 mx-auto rounded-md">
//                     <div className="flex items-center justify-center gap-4 text-sm">
//                       {/* <Badge
//                       variant="outline"
//                       className="border-[#86efac]/30 text-[#86efac]"
//                     >
//                       Gross: ${(10000 * percentage).toFixed(2)}
//                     </Badge> */}
//                       <Badge
//                         variant="outline"
//                         className="border-[#86efac]/30 text-[#86efac]"
//                       >
//                         {(percentage * 100).toFixed(2)}% fees = $
//                         {(10000 * percentage).toFixed(2)}
//                       </Badge>
//                       <Badge
//                         variant="outline"
//                         className="border-gray-600 text-gray-400"
//                       >
//                         Your Share: ${(10000 * percentage * 0.7).toFixed(2)}
//                         {/* Net (70%): ${(10000 * percentage * 0.7).toFixed(2)} */}
//                       </Badge>
//                     </div>
//                   </div>
//                 )}
//               </div>

//               <Button
//                 onClick={savePercentage}
//                 disabled={!referralCode}
//                 className="w-full bg-[#86efac] text-black hover:bg-[#86efac]/90 font-medium"
//               >
//                 <Save className="w-4 h-4 mr-2" />
//                 Save Percentage
//               </Button>
//             </CardContent>
//           </Card>
//         </motion.section>

//         {/* Stats Section */}
//         <motion.section
//           initial={{ opacity: 0, y: 30 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6 }}
//           className="space-y-8"
//         >
//           <h2 className="text-3xl font-bold text-center">
//             Your Referral Stats
//           </h2>

//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
//             {[
//               {
//                 label: "Total Referrals",
//                 value: isNewUser ? "0" : stats.referrals.toString(),
//                 icon: Users,
//                 color: "text-blue-400",
//                 bgColor: "bg-blue-400/10",
//               },
//               {
//                 label: "Total Earnings",
//                 value: isNewUser ? "$0" : `$${stats.earnings}`,
//                 icon: DollarSign,
//                 color: "text-[#86efac]",
//                 bgColor: "bg-[#86efac]/10",
//               },
//               // {
//               //   label: "Pending Earnings",
//               //   value: isNewUser ? "$0" : `$${stats.pending}`,
//               //   icon: Clock,
//               //   color: "text-yellow-400",
//               //   bgColor: "bg-yellow-400/10",
//               // },
//             ].map((stat, i) => (
//               <motion.div
//                 key={i}
//                 initial={{ scale: 0.9, opacity: 0 }}
//                 whileInView={{ scale: 1, opacity: 1 }}
//                 whileHover={{ scale: 1.02 }}
//                 transition={{ duration: 0.5, delay: i * 0.1 }}
//               >
//                 <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800 hover:border-gray-700 transition-colors">
//                   <CardContent className="p-6">
//                     <div className="flex items-center gap-4">
//                       <div className={`p-3 rounded-xl ${stat.bgColor}`}>
//                         <stat.icon className={`w-6 h-6 ${stat.color}`} />
//                       </div>
//                       <div>
//                         <p className="text-sm text-gray-400 font-medium">
//                           {stat.label}
//                         </p>
//                         <p className="text-2xl font-bold">{stat.value}</p>
//                       </div>
//                     </div>
//                   </CardContent>
//                 </Card>
//               </motion.div>
//             ))}
//           </div>

//           {/* Chart */}
//           <div className="max-w-4xl mx-auto hidden">
//             {isNewUser || history.length === 0 ? (
//               <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800">
//                 <CardContent className="p-12 text-center">
//                   <TrendingUp className="w-16 h-16 text-gray-600 mx-auto mb-4" />
//                   <h3 className="text-xl font-semibold text-gray-400 mb-2">
//                     No Earnings Yet
//                   </h3>
//                   <p className="text-gray-500 mb-6">
//                     Share your referral code to see your earnings growth!
//                   </p>
//                   {!referralCode && (
//                     <Button
//                       onClick={() => {
//                         if (!connected || !walletAddress) {
//                           toast.custom((t) => (
//                             <div
//                               className={`flex items-center gap-2 px-4 py-2 rounded-md shadow-md ${
//                                 t.visible ? "animate-enter" : "animate-leave"
//                               }`}
//                               style={{ background: "#86efac", color: "#000" }}
//                             >
//                               <Wallet size={20} color="#000" />
//                               <span>Connect your wallet to start earning!</span>
//                             </div>
//                           ));
//                           return;
//                         }
//                         setShowModal(true);
//                       }}
//                       className="bg-[#86efac] text-black hover:bg-[#86efac]/90"
//                     >
//                       Generate Code Now
//                     </Button>
//                   )}
//                 </CardContent>
//               </Card>
//             ) : (
//               <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800">
//                 <CardHeader>
//                   <CardTitle className="text-xl text-center">
//                     Earnings Over Time
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <canvas id="earningsChart" height="200" className="w-full" />
//                 </CardContent>
//               </Card>
//             )}
//           </div>
//         </motion.section>

//         {/* Leaderboard */}
//         <motion.section
//           initial={{ opacity: 0, y: 30 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6 }}
//           className="max-w-2xl mx-auto"
//         >
//           <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800">
//             <CardHeader>
//               <CardTitle className="text-2xl text-center text-[#86efac] flex items-center justify-center gap-2">
//                 <Award className="w-6 h-6" />
//                 Top Referrers
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               {isNewUser || leaderboardData.length === 0 ? (
//                 <div className="text-center py-8">
//                   <Award className="w-12 h-12 text-gray-600 mx-auto mb-4" />
//                   <h3 className="text-lg font-semibold text-gray-400 mb-2">
//                     Be the First Top Referrer!
//                   </h3>
//                   <p className="text-gray-500">
//                     Invite friends to climb the leaderboard.
//                   </p>
//                 </div>
//               ) : (
//                 <div className="space-y-3">
//                   {leaderboardData.map((entry, i) => (
//                     <motion.div
//                       key={i}
//                       initial={{ x: 50, opacity: 0 }}
//                       whileInView={{ x: 0, opacity: 1 }}
//                       transition={{ duration: 0.5, delay: i * 0.1 }}
//                       className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg border-l-4 border-[#86efac]"
//                     >
//                       <div className="w-8 h-8 bg-[#86efac]/20 rounded-full flex items-center justify-center text-[#86efac] font-bold">
//                         {i + 1}
//                       </div>
//                       <div className="flex-1">
//                         <p className="font-medium">{entry.name}</p>
//                         <p className="text-sm text-gray-400">
//                           {entry.referrals} referrals
//                         </p>
//                       </div>
//                     </motion.div>
//                   ))}
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </motion.section>

//         {/* Referral History */}
//         <motion.section
//           initial={{ opacity: 0, y: 30 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6 }}
//           className="max-w-4xl mx-auto"
//         >
//           <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800">
//             <CardHeader>
//               <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
//                 <CardTitle className="text-2xl text-[#86efac]">
//                   Referral History
//                 </CardTitle>
//                 <div className="flex gap-2">
//                   {["Date", "Earnings"].map((filter) => (
//                     <Button
//                       key={filter}
//                       variant="outline"
//                       size="sm"
//                       onClick={() =>
//                         toast.custom((t) => (
//                           <div
//                             className={`flex items-center gap-2 px-4 py-2 rounded-md shadow-md ${
//                               t.visible ? "animate-enter" : "animate-leave"
//                             }`}
//                             style={{ background: "#86efac", color: "#000" }}
//                           >
//                             <ListFilter size={20} color="#000" />
//                             <span>Sorting by {filter} coming soon!</span>
//                           </div>
//                         ))
//                       }
//                       className="border-gray-700 text-gray-300 hover:bg-[#86efac]/10 hover:border-[#86efac]/50"
//                     >
//                       <ListFilter className="w-4 h-4 mr-1" />
//                       {filter}
//                     </Button>
//                   ))}
//                 </div>
//               </div>
//             </CardHeader>
//             <CardContent>
//               {historyData.length === 0 ? (
//                 <div className="text-center py-12">
//                   <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
//                   <h3 className="text-xl font-semibold text-gray-400 mb-2">
//                     No Referrals Yet
//                   </h3>
//                   <p className="text-gray-500 mb-6">
//                     Invite friends to start building your referral history!
//                   </p>
//                   {!referralCode && (
//                     <Button
//                       onClick={() => {
//                         if (!connected || !walletAddress) {
//                           toast.custom((t) => (
//                             <div
//                               className={`flex items-center gap-2 px-4 py-2 rounded-md shadow-md ${
//                                 t.visible ? "animate-enter" : "animate-leave"
//                               }`}
//                               style={{ background: "#86efac", color: "#000" }}
//                             >
//                               <Wallet size={20} color="#000" />
//                               <span>
//                                 Connect your wallet to unlock the power of
//                                 referrals!
//                               </span>
//                             </div>
//                           ));
//                           return;
//                         }
//                         setShowModal(true);
//                       }}
//                       className="bg-[#86efac] text-black hover:bg-[#86efac]/90"
//                     >
//                       Generate Link
//                     </Button>
//                   )}
//                 </div>
//               ) : (
//                 <div className="space-y-3">
//                   {historyData.map((entry) => (
//                     <motion.div
//                       key={entry.id}
//                       initial={{ height: 0, opacity: 0 }}
//                       animate={{ height: "auto", opacity: 1 }}
//                       transition={{ duration: 0.5 }}
//                       className={`p-4 rounded-lg border-l-4 ${
//                         entry.status === "ACTIVE"
//                           ? "bg-[#86efac]/5 border-[#86efac]"
//                           : "bg-gray-800/30 border-gray-600"
//                       }`}
//                     >
//                       <div className="flex justify-between items-start">
//                         <div>
//                           <p className="font-medium">{entry.name}</p>
//                           <p className="text-sm text-gray-400">
//                             Joined {new Date(entry.date).toLocaleDateString()}
//                           </p>
//                         </div>
//                         <div className="text-right">
//                           <p className="font-semibold text-[#86efac]">
//                             ${entry.earnings}
//                           </p>
//                           <Badge
//                             variant={
//                               entry.status === "ACTIVE"
//                                 ? "default"
//                                 : "secondary"
//                             }
//                             className={
//                               entry.status === "ACTIVE"
//                                 ? "bg-[#86efac]/20 text-[#86efac]"
//                                 : ""
//                             }
//                           >
//                             {entry.status}
//                           </Badge>
//                         </div>
//                       </div>
//                     </motion.div>
//                   ))}
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </motion.section>

//         {/* Rewards Section */}
//         <motion.section
//           initial={{ opacity: 0, y: 30 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6 }}
//           className="max-w-2xl mx-auto"
//         >
//           <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800">
//             <CardHeader>
//               <CardTitle className="text-2xl text-center text-[#86efac] flex items-center justify-center gap-2">
//                 <Award className="w-6 h-6" />
//                 Rewards & Milestones
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               <div className="text-center space-y-4">
//                 <p className="text-gray-400">
//                   {isNewUser
//                     ? "Make your first referral to unlock rewards!"
//                     : `${stats.referrals}/5 Referrals for Bronze Badge`}
//                 </p>

//                 <div className="w-full bg-gray-800 rounded-full h-3">
//                   <motion.div
//                     initial={{ width: 0 }}
//                     animate={{
//                       width: `${Math.min((stats.referrals / 5) * 100, 100)}%`,
//                     }}
//                     transition={{ duration: 1, delay: 0.5 }}
//                     className="bg-gradient-to-r from-[#86efac] to-[#22c55e] h-3 rounded-full"
//                   />
//                 </div>

//                 <div className="flex justify-between text-sm text-gray-500">
//                   <span>0</span>
//                   <span>5 referrals</span>
//                 </div>
//               </div>

//               <Button
//                 onClick={claimNFT}
//                 disabled={stats.referrals < 5}
//                 className={`w-full font-medium ${
//                   stats.referrals >= 5
//                     ? "bg-gradient-to-r from-[#86efac] to-[#22c55e] text-black hover:from-[#86efac]/90 hover:to-[#22c55e]/90"
//                     : "bg-gray-800 text-gray-500 cursor-not-allowed"
//                 }`}
//               >
//                 <Award className="w-4 h-4 mr-2" />
//                 {stats.referrals >= 5
//                   ? "Claim Bronze NFT"
//                   : "Bronze NFT Locked"}
//               </Button>
//             </CardContent>
//           </Card>
//         </motion.section>
//       </div>

//       {/* Modal */}
//       {showModal && (
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           exit={{ opacity: 0 }}
//           className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
//         >
//           <motion.div
//             initial={{ scale: 0.9, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             exit={{ scale: 0.9, opacity: 0 }}
//             className="w-full max-w-md"
//           >
//             <Card className="bg-gray-900 border-gray-800 relative">
//               <Button
//                 onClick={closeModal}
//                 variant="ghost"
//                 size="sm"
//                 className="absolute top-4 right-4 text-gray-400 hover:text-white"
//               >
//                 <X className="w-4 h-4" />
//               </Button>

//               {modalStep === 1 && (
//                 <motion.div
//                   initial={{ x: -20, opacity: 0 }}
//                   animate={{ x: 0, opacity: 1 }}
//                   transition={{ duration: 0.3 }}
//                 >
//                   <CardHeader className="text-center space-y-4">
//                     <div className="w-16 h-16 bg-[#86efac]/20 rounded-full flex items-center justify-center mx-auto">
//                       <Sparkles className="w-8 h-8 text-[#86efac]" />
//                     </div>
//                     <CardTitle className="text-2xl">
//                       Start Earning with Referrals!
//                     </CardTitle>
//                   </CardHeader>
//                   <CardContent className="space-y-6">
//                     <p className="text-gray-400 text-center">
//                       Invite friends and earn a percentage of their transactions
//                       on Deserialize.
//                     </p>
//                     <Button
//                       onClick={() => setModalStep(2)}
//                       className="w-full bg-[#86efac] text-black hover:bg-[#86efac]/90 font-medium"
//                     >
//                       Continue
//                     </Button>
//                   </CardContent>
//                 </motion.div>
//               )}

//               {modalStep === 2 && (
//                 <motion.div
//                   initial={{ x: 20, opacity: 0 }}
//                   animate={{ x: 0, opacity: 1 }}
//                   transition={{ duration: 0.3 }}
//                 >
//                   <CardHeader className="text-center">
//                     <CardTitle className="text-2xl">
//                       Customize Your Code
//                     </CardTitle>
//                   </CardHeader>
//                   <CardContent className="space-y-6">
//                     <div className="space-y-2">
//                       <Input
//                         value={customCode}
//                         onChange={(e) => setCustomCode(e.target.value)}
//                         placeholder="Enter custom referral code (optional)"
//                         className="bg-gray-800 border-gray-700 text-white focus:border-[#86efac] focus:ring-[#86efac]/20"
//                       />
//                       <p className="text-sm text-gray-400">
//                         {customCode
//                           ? "Custom code available!"
//                           : "Leave empty for auto-generated code, or enter 3-10 alphanumeric characters"}
//                       </p>
//                     </div>
//                     <Button
//                       onClick={generateReferralCode}
//                       className="w-full bg-[#86efac] text-black hover:bg-[#86efac]/90 font-medium"
//                     >
//                       Generate Referral Code
//                     </Button>
//                   </CardContent>
//                 </motion.div>
//               )}
//             </Card>
//           </motion.div>
//         </motion.div>
//       )}

//       {/* FAQ Button */}
//       <motion.div
//         initial={{ scale: 0 }}
//         animate={{ scale: 1 }}
//         whileHover={{ scale: 1.1 }}
//         className="fixed bottom-6 right-6 z-40"
//       >
//         <Button
//           onClick={() => setShowFAQ(!showFAQ)}
//           className="bg-[#86efac] text-black hover:bg-[#86efac]/90 rounded-full w-14 h-14 shadow-lg shadow-[#86efac]/25"
//         >
//           <HelpCircle className="w-6 h-6" />
//         </Button>
//       </motion.div>

//       {/* FAQ Panel */}
//       {showFAQ && (
//         <motion.div
//           initial={{ opacity: 0, y: 20, scale: 0.95 }}
//           animate={{ opacity: 1, y: 0, scale: 1 }}
//           exit={{ opacity: 0, y: 20, scale: 0.95 }}
//           className="fixed bottom-24 right-6 w-80 max-w-[calc(100vw-3rem)] z-40"
//         >
//           <Card className="bg-gray-900 border-gray-800 shadow-xl">
//             <CardHeader>
//               <CardTitle className="text-lg text-[#86efac]">
//                 Frequently Asked Questions
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <Accordion type="single" collapsible>
//                 {faqsData.map((faq, i) => (
//                   <AccordionItem
//                     key={i}
//                     value={`item-${i}`}
//                     className="border-gray-800"
//                   >
//                     <AccordionTrigger className="text-[#86efac] hover:text-[#86efac]/80">
//                       {faq.question}
//                     </AccordionTrigger>
//                     <AccordionContent className="text-gray-400">
//                       {faq.answer}
//                     </AccordionContent>
//                   </AccordionItem>
//                 ))}
//               </Accordion>
//             </CardContent>
//           </Card>
//         </motion.div>
//       )}
//     </div>
//   );
// };

// export default ReferralDashboard;
