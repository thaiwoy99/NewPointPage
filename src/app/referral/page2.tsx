"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Chart from "chart.js/auto";
import confetti from "canvas-confetti";
import QRCode from "qrcode";
import { Toaster, toast } from "react-hot-toast";
import { useAppContext } from "@/context/AppWalletProvider";
import {
  X,
  HelpCircle,
  Wallet,
  CopyCheck,
  Save,
  Download,
  Award,
  Share2,
  ListFilter,
  AlertCircle,
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
  earnings: number;
  pending: number;
}

const SkeletonLoader: React.FC = () => {
  return (
    <div className="w-full max-w-full min-h-screen mt-30 bg-background text-foreground relative overflow-x-hidden">
      <canvas className="absolute inset-0 z-[-10] opacity-60 w-full" />

      {/* Hero Section Skeleton */}
      <section className="w-full py-12 px-4 sm:px-6 text-center">
        <div className="h-10 w-3/4 mx-auto bg-gray-300 animate-pulse rounded" />
        <div className="h-6 w-1/2 mx-auto mt-4 bg-gray-300 animate-pulse rounded" />
        <div className="h-12 w-64 mx-auto mt-6 bg-gray-300 animate-pulse rounded" />
      </section>

      {/* Referral Percentage Skeleton */}
      <section className="w-full py-12 px-4 sm:px-6">
        <div className="h-8 w-48 mx-auto bg-gray-300 animate-pulse rounded" />
        <div className="w-full max-w-md mx-auto mt-4">
          <div className="h-2 w-full bg-gray-300 animate-pulse rounded" />
          <div className="h-4 w-16 mx-auto mt-2 bg-gray-300 animate-pulse rounded" />
          <div className="h-4 w-3/4 mx-auto mt-2 bg-gray-300 animate-pulse rounded" />
          <div className="h-10 w-32 mx-auto mt-4 bg-gray-300 animate-pulse rounded" />
        </div>
      </section>

      {/* Referral Stats Skeleton */}
      <section className="w-full py-12 px-4 sm:px-6">
        <div className="h-8 w-48 mx-auto bg-gray-300 animate-pulse rounded" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl mx-auto mt-4">
          {[1, 2, 3].map((i) => (
            <Card
              key={i}
              className="bg-muted border-[#86efac] shadow-none min-w-[120px] w-full"
            >
              <CardHeader className="p-2">
                <div className="h-6 w-3/4 mx-auto bg-gray-300 animate-pulse rounded" />
              </CardHeader>
              <CardContent className="p-4">
                <div className="h-6 w-1/2 mx-auto bg-gray-300 animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-8 w-full max-w-2xl mx-auto">
          <div className="h-48 w-full bg-gray-300 animate-pulse rounded" />
        </div>
        <div className="h-6 w-32 mx-auto mt-8 bg-gray-300 animate-pulse rounded" />
        <div className="w-full max-w-md mx-auto mt-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-muted p-2 rounded-lg mb-2 border-l-4 border-[#86efac]"
            >
              <div className="h-4 w-3/4 bg-gray-300 animate-pulse rounded" />
            </div>
          ))}
        </div>
      </section>

      {/* Referral History Skeleton */}
      <section className="w-full py-12 px-4 sm:px-6">
        <div className="h-8 w-48 mx-auto bg-gray-300 animate-pulse rounded" />
        <div className="flex flex-wrap justify-center gap-4 mb-4 mt-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-10 w-24 bg-gray-300 animate-pulse rounded"
            />
          ))}
        </div>
        <div className="w-full max-w-2xl mx-auto">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-muted p-4 rounded-lg mb-2 border-l-4 border-[#86efac]"
            >
              <div className="h-4 w-3/4 bg-gray-300 animate-pulse rounded mb-2" />
              <div className="h-4 w-1/2 bg-gray-300 animate-pulse rounded" />
            </div>
          ))}
        </div>
      </section>

      {/* Rewards Skeleton */}
      <section className="w-full py-12 px-4 sm:px-6">
        <div className="h-8 w-48 mx-auto bg-gray-300 animate-pulse rounded" />
        <div className="w-full max-w-md mx-auto mt-4">
          <div className="h-4 w-3/4 mx-auto bg-gray-300 animate-pulse rounded" />
          <div className="h-2 w-full mt-2 bg-gray-300 animate-pulse rounded" />
          <div className="h-10 w-32 mx-auto mt-4 bg-gray-300 animate-pulse rounded" />
        </div>
      </section>

      {/* FAQ Button Skeleton */}
      <div className="fixed bottom-4 right-4">
        <div className="h-12 w-12 bg-gray-300 animate-pulse rounded-full" />
      </div>
    </div>
  );
};

const ReferralDashboard: React.FC = () => {
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState(1);
  const [customCode, setCustomCode] = useState("");
  const [percentage, setPercentage] = useState<number>(0.001); // 0.1%
  const [showFAQ, setShowFAQ] = useState(false);
  const [userReferralData, setUserReferralData] =
    useState<UserReferralData | null>(null);
  const [history, setHistory] = useState<Referral[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { walletAddress, connecting, connected } = useAppContext();

  // Hardcoded demo data (only for stats and FAQs)
  const demoStats = { referrals: 5, earnings: 50, pending: 10 };
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

  // Set isNewUser based on wallet connection
  const isNewUser = !connected;

  // Computed stats, history, leaderboard, and FAQs
  const stats = isNewUser
    ? { referrals: 0, earnings: 0, pending: 0 }
    : userReferralData || demoStats;
  const historyData = isNewUser || history.length === 0 ? [] : history;
  const leaderboardData =
    isNewUser || leaderboard.length === 0 ? [] : leaderboard;
  const faqsData = faqs.length > 0 ? faqs : demoFAQs;

  // Fetch user referral data, history, and leaderboard
  useEffect(() => {
    const fetchData = async () => {
      if (!connected || !walletAddress) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Fetch user data (referralCode, defaultReferralPercentage)
        const userResponse = await fetch(
          `/api/user?walletAddress=${walletAddress}`
        );
        if (!userResponse.ok) {
          const errorData = await userResponse.json();
          throw new Error(errorData.error || "Failed to fetch user data");
        }
        const userData = await userResponse.json();

        // Fetch referral stats (referrals, earnings, pending)
        const statsResponse = await fetch(
          `/api/referral-stats?walletAddress=${walletAddress}`
        );
        if (!statsResponse.ok) {
          const errorData = await statsResponse.json();
          throw new Error(errorData.error || "Failed to fetch stats");
        }
        const statsData = await statsResponse.json();

        // Fetch referral history
        const historyResponse = await fetch(
          `/api/referrals/history?walletAddress=${walletAddress}`
        );
        let historyData: Referral[] = [];
        if (historyResponse.ok) {
          historyData = await historyResponse.json();
        } else {
          console.warn("No referral history data available");
        }

        // Fetch leaderboard
        const leaderboardResponse = await fetch("/api/referrals/leaderboard");
        let leaderboardData: LeaderboardEntry[] = [];
        if (leaderboardResponse.ok) {
          leaderboardData = await leaderboardResponse.json();
        } else {
          console.warn("No leaderboard data available");
        }

        // Combine user and stats data
        const combinedData = {
          referralCode: userData.referralCode,
          defaultReferralPercentage: userData.defaultReferralPercentage/100,
          referrals: statsData.referrals,
          earnings: statsData.earnings,
          pending: statsData.pending,
        };

        setUserReferralData(combinedData);
        setReferralCode(combinedData.referralCode);
        setPercentage(combinedData.defaultReferralPercentage);
        setHistory(historyData);
        setLeaderboard(leaderboardData);
      } catch (error: any) {
        console.error("Failed to fetch data:", error);
        toast.custom((t) => (
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-md shadow-md ${
              t.visible ? "animate-enter" : "animate-leave"
            }`}
            style={{ background: "#86efac", color: "#000" }}
          >
            <AlertCircle size={20} color="#000" />
            <span>{error.message || "Failed to fetch data."}</span>
          </div>
        ));
        // Fallback to demo stats only for user data
        setUserReferralData({
          referralCode: null,
          defaultReferralPercentage: 0.001,
          referrals: demoStats.referrals,
          earnings: demoStats.earnings,
          pending: demoStats.pending,
        });
        setHistory([]);
        setLeaderboard([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [connected, walletAddress]);

  // Enhanced particle background animation
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

    const particles: Particle[] = Array.from({ length: 120 }, () => {
      const isCircle = Math.random() < 0.7;
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: isCircle ? Math.random() * 2 + 1 : undefined,
        length: !isCircle ? Math.random() * 3 + 2 : undefined,
        rotation: !isCircle ? Math.random() * Math.PI * 2 : undefined,
        vx: Math.random() * 0.5 - 0.25,
        vy: Math.random() * 0.5 - 0.25,
        opacity: Math.random() * 0.6 + 0.3,
        type: isCircle ? "circle" : "line",
        wave: Math.random() < 0.2 && isCircle,
        waveOffset: Math.random() * Math.PI * 2,
        pulse: Math.random() < 0.1 && isCircle,
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

      // Draw connection lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i],
            p2 = particles[j];
          const dx = p1.x - p2.x,
            dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(134, 239, 172, ${0.4 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Update and draw particles
      particles.forEach((p) => {
        // Mouse interaction
        const dx = mouseX - p.x,
          dy = mouseY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        let currentOpacity = p.opacity;
        if (dist < 150) {
          p.vx += (dx / dist) * 0.02;
          p.vy += (dy / dist) * 0.02;
          currentOpacity = Math.min(
            0.9,
            p.opacity + ((150 - dist) / 150) * 0.4
          );
        }

        // Update position
        p.x += p.vx;
        p.y += p.vy;
        if (p.wave) {
          p.y += Math.sin(time / 1000 + p.waveOffset) * 0.5;
        }
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        p.vx = Math.max(-0.5, Math.min(0.5, p.vx));
        p.vy = Math.max(-0.5, Math.min(0.5, p.vy));

        // Pulse effect
        if (p.pulse) {
          p.pulseScale = 0.8 + Math.sin(time / 500) * 0.2;
        }

        // Draw particle
        ctx.beginPath();
        if (p.type === "circle") {
          ctx.arc(
            p.x,
            p.y,
            p.radius! * (p.pulse ? p.pulseScale : 1),
            0,
            Math.PI * 2
          );
          ctx.fillStyle = `rgba(134, 239, 172, ${currentOpacity})`;
          ctx.fill();
        } else {
          const x2 = p.x + Math.cos(p.rotation!) * p.length!;
          const y2 = p.y + Math.sin(p.rotation!) * p.length!;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = `rgba(134, 239, 172, ${currentOpacity})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });

      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);

    return () => canvas.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Chart.js setup (using history data)
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
            backgroundColor: "#86efac",
            pointBackgroundColor: "#86efac",
            fill: false,
          },
        ],
      },
      options: {
        scales: {
          y: { beginAtZero: true, ticks: { color: "#fff" } },
          x: { ticks: { color: "#fff" } },
        },
        plugins: { legend: { labels: { color: "#fff" } } },
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
          width: 100,
          color: { dark: "#86efac", light: "#000" },
        }
      );
    }
  }, [referralCode, isLoading]);

  // Generate referral code
  const generateReferralCode = async () => {
    if (!connected || !walletAddress) {
      toast.custom((t) => (
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-md shadow-md ${
            t.visible ? "animate-enter" : "animate-leave"
          }`}
          style={{ background: "#86efac", color: "#000" }}
        >
          <Wallet size={20} color="#000" />
          <span>Connect your wallet to unlock the power of referrals!</span>
        </div>
      ));
      return;
    }

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
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#86efac"],
      });
      toast.custom((t) => (
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-md shadow-md ${
            t.visible ? "animate-enter" : "animate-leave"
          }`}
          style={{ background: "#86efac", color: "#000" }}
        >
          <Save size={20} color="#000" />
          <span>Referral code generated!</span>
        </div>
      ));
    } catch (error: any) {
      console.error("Failed to generate referral code:", error);
      toast.custom((t) => (
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-md shadow-md ${
            t.visible ? "animate-enter" : "animate-leave"
          }`}
          style={{ background: "#FFA500", color: "#000" }}
        >
          <AlertCircle size={20} color="#000" />
          <span>{error.message || "Failed to generate referral code."}</span>
        </div>
      ));
    } finally {
      setIsLoading(false);
    }
  };

  // Save referral percentage
  const savePercentage = async () => {
    if (!connected || !walletAddress) {
      toast.custom((t) => (
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-md shadow-md ${
            t.visible ? "animate-enter" : "animate-leave"
          }`}
          style={{ background: "#86efac", color: "#000" }}
        >
          <Wallet size={20} color="#000" />
          <span>Connect your wallet to unlock the power of referrals!</span>
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
        particleCount: 50,
        spread: 50,
        colors: ["#86efac"],
      });
      toast.custom((t) => (
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-md shadow-md ${
            t.visible ? "animate-enter" : "animate-leave"
          }`}
          style={{ background: "#86efac", color: "#000" }}
        >
          <Save size={20} color="#000" />
          <span>Percentage saved!</span>
        </div>
      ));
    } catch (error: any) {
      console.error("Failed to save percentage:", error);
      toast.custom((t) => (
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-md shadow-md ${
            t.visible ? "animate-enter" : "animate-leave"
          }`}
          style={{ background: "#86efac", color: "#000" }}
        >
          <AlertCircle size={20} color="#000" />
          <span>{error.message || "Failed to save percentage."}</span>
        </div>
      ));
    } finally {
      setIsLoading(false);
    }
  };

  // Claim NFT (placeholder)
  const claimNFT = async () => {
    if (!connected || !walletAddress) {
      toast.custom((t) => (
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-md shadow-md ${
            t.visible ? "animate-enter" : "animate-leave"
          }`}
          style={{ background: "#86efac", color: "#000" }}
        >
          <Wallet size={20} color="#000" />
          <span>Connect your wallet to unlock the power of referrals!</span>
        </div>
      ));
      return;
    }

    toast.custom((t) => (
      <div
        className={`flex items-center gap-2 px-4 py-2 rounded-md shadow-md ${
          t.visible ? "animate-enter" : "animate-leave"
        }`}
        style={{ background: "#86efac", color: "#000" }}
      >
        <AlertCircle size={20} color="#000" />
        <span>NFT claim coming soon!</span>
      </div>
    ));
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.custom((t) => (
      <div
        className={`flex items-center gap-2 px-4 py-2 rounded-md shadow-md ${
          t.visible ? "animate-enter" : "animate-leave"
        }`}
        style={{ background: "#86efac", color: "#000" }}
      >
        <CopyCheck size={20} color="#000" />
        <span>Copied!</span>
      </div>
    ));
  };

  // Close modal handler
  const closeModal = () => {
    setShowModal(false);
    setModalStep(1);
    setCustomCode("");
  };

  // Render skeleton while loading
  if (isLoading) {
    return <SkeletonLoader />;
  }

  return (
    <div className="w-full max-w-full min-h-screen mt-30 bg-background text-foreground relative overflow-x-hidden">
      <style jsx global>{`
        .animate-enter {
          animation: enter 0.3s ease-out;
        }
        .animate-leave {
          animation: leave 0.3s ease-in;
        }
        @keyframes enter {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes leave {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(20px);
          }
        }
      `}</style>
      <Toaster
        position="bottom-left"
        toastOptions={{
          style: { background: "#86efac", color: "#000" },
          duration: 2000,
        }}
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-[-10] opacity-60 w-full"
      />

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full py-12 px-4 sm:px-6 text-center"
      >
        <h2 className="text-4xl font-bold mb-4">
          {isNewUser ? "Earn on Deserialize!" : "Earn on Deserialize!"}
        </h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-muted-foreground mb-6"
        >
          {isNewUser
            ? "Start by generating your unique referral code to invite friends!"
            : `Your referrals have earned you $${stats.earnings}!`}
        </motion.p>
        {referralCode ? (
          // <div className="flex flex-col sm:flex-row justify-center items-center gap-4 w-full max-w-md mx-auto">
          //   <Input
          //     value={referralCode}
          //     readOnly
          //     className="bg-muted text-foreground border-2 border-[#86efac] focus:ring-[#86efac] w-full"
          //   />
          //   <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          //     <Button
          //       onClick={() => copyToClipboard(referralCode)}
          //       className="bg-[#86efac] text-black hover:bg-[#86efac]/90 shadow-none w-full sm:w-auto"
          //     >
          //       Copy Code
          //     </Button>
          //   </motion.div>
          // </div>

          <section className="w-full py-12 px-4 sm:px-6">
            <motion.h3
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-2xl font-bold mb-4 text-center"
            >
              Share Your Referral
            </motion.h3>
            <div className="flex flex-col items-center gap-4 w-full max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
                <Input
                  value={`${
                    process.env.NEXT_PUBLIC_APP_URL ||
                    "https://www.deserialize.xyz"
                  }/?ref=${referralCode}`}
                  readOnly
                  className="bg-muted text-foreground border-2 border-[#86efac] focus:ring-[#86efac] w-full"
                />
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={() =>
                      copyToClipboard(
                        `${
                          process.env.NEXT_PUBLIC_APP_URL ||
                          "https://www.deserialize.xyz"
                        }/?ref=${referralCode}`
                      )
                    }
                    className="bg-[#86efac] text-black hover:bg-[#86efac]/90 shadow-none w-full sm:w-auto"
                  >
                    Copy Link
                  </Button>
                </motion.div>
              </div>
              <div className="flex flex-wrap justify-center gap-4">
                {["Twitter", "Telegram", "Discord"].map((platform) => (
                  <motion.div
                    key={platform}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="outline"
                      onClick={() =>
                        toast.custom((t) => (
                          <div
                            className={`flex items-center gap-2 px-4 py-2 rounded-md shadow-md ${
                              t.visible ? "animate-enter" : "animate-leave"
                            }`}
                            style={{ background: "#86efac", color: "#000" }}
                          >
                            <Share2 size={20} color="#000" />
                            <span>Share on {platform} coming soon!</span>
                          </div>
                        ))
                      }
                      className="text-[#86efac] border-[#86efac] hover:bg-[#86efac]/20 shadow-none"
                    >
                      {platform}
                    </Button>
                  </motion.div>
                ))}
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <canvas id="qrCode" className="mt-4" />
                <motion.div className="mx-auto" whileHover={{ scale: 1.05 }}>
                  <Button
                    onClick={() =>
                      toast.custom((t) => (
                        <div
                          className={`flex items-center gap-2 px-4 py-2 rounded-md shadow-md ${
                            t.visible ? "animate-enter" : "animate-leave"
                          }`}
                          style={{ background: "#86efac", color: "#000" }}
                        >
                          <Download size={20} color="#000" />
                          <span>QR code downloaded!</span>
                        </div>
                      ))
                    }
                    className="bg-[#86efac] text-black hover:bg-[#86efac]/90 mt-2 shadow-none w-full sm:w-auto"
                  >
                    Download QR
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </section>
        ) : (
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <Button
              onClick={() => {
                if (!connected || !walletAddress) {
                  toast.custom((t) => (
                    <div
                      className={`flex items-center gap-2 px-4 py-2 rounded-md shadow-md ${
                        t.visible ? "animate-enter" : "animate-leave"
                      }`}
                      style={{ background: "#86efac", color: "#000" }}
                    >
                      <Wallet size={20} color="#000" />
                      <span>
                        Connect your wallet to start earning from referrals!
                      </span>
                    </div>
                  ));
                  return;
                }
                setShowModal(true);
              }}
              className="bg-[#86efac] text-black hover:bg-[#86efac]/90 text-lg px-6 py-3 shadow-none"
            >
              {isNewUser ? "Generate Referral Link!" : "Generate Referral Link"}
            </Button>
          </motion.div>
        )}
      </motion.section>

      {/* Modal for Code Generation */}
      {showModal && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4"
        >
          <Card className="bg-muted w-full max-w-[calc(100vw-2rem)] sm:max-w-md border-[#86efac] shadow-none relative">
            <Button
              onClick={closeModal}
              className="absolute top-2 right-2 bg-transparent text-[#86efac] hover:bg-[#86efac]/20 rounded-full w-8 h-8 flex items-center justify-center shadow-none"
            >
              <X size={16} />
            </Button>
            {modalStep === 1 && (
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <CardHeader>
                  <CardTitle className="text-2xl">
                    Start Earning with Referrals!
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6">
                    Invite friends and earn a percentage of their transactions.
                  </p>
                  <motion.div whileHover={{ scale: 1.05 }}>
                    <Button
                      onClick={() => setModalStep(2)}
                      className="bg-[#86efac] text-black hover:bg-[#86efac]/90 shadow-none w-full"
                    >
                      Next
                    </Button>
                  </motion.div>
                </CardContent>
              </motion.div>
            )}
            {modalStep === 2 && (
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <CardHeader>
                  <CardTitle className="text-2xl">
                    Customize Your Code
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Input
                    value={customCode}
                    onChange={(e) => setCustomCode(e.target.value)}
                    placeholder="Enter referral code"
                    className="bg-muted text-foreground border-2 border-[#86efac] focus:ring-[#86efac] mb-4 w-full"
                  />
                  <p className="text-muted-foreground mb-4">
                    {customCode
                      ? "Code available!"
                      : "Referral code must be (3–10 alphanumeric characters)."}
                  </p>
                  <motion.div whileHover={{ scale: 1.05 }}>
                    <Button
                      onClick={generateReferralCode}
                      className="bg-[#86efac] text-black hover:bg-[#86efac]/90 shadow-none w-full"
                    >
                      Generate Code
                    </Button>
                  </motion.div>
                </CardContent>
              </motion.div>
            )}
          </Card>
        </motion.div>
      )}

      {/* Referral Percentage Configuration */}
      <section className="w-full py-12 px-4 sm:px-6">
        <motion.h3
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-2xl font-bold mb-4 text-center"
        >
          Set Fee Percentage
        </motion.h3>
        <div className="w-full max-w-md mx-auto">
          <Slider
            value={[percentage * 100]}
            onValueChange={(value) => setPercentage(value[0] / 100)}
            min={0.05}
            max={1}
            step={0.001}
            className="w-full"
          />
          <div className="text-[#86efac] text-sm text-center mt-2">
            {(percentage * 100).toFixed(2)}%
          </div>
          {/* there should be a div badge on the left of this, info bg color, but
          should be a badge div,the badge will display the gross and net
          breakdown earning, because they only take 70% of their set fee */}
          <motion.p
            key={percentage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-muted-foreground mt-2 text-center"
          >
            {isNewUser
              ? "Set Your Earnings Rate to Kickstart Referrals!"
              : `If your referral trades $10000, you’ll earn $${(
                  100 * percentage
                ).toFixed(2)}.`}
          </motion.p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={savePercentage}
              disabled={!referralCode}
              className="bg-[#86efac] text-black hover:bg-[#86efac]/90 mt-4 shadow-none w-full sm:w-auto"
            >
              Save Percentage
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Referral Stats and Analytics */}
      <section className="w-full py-12 px-4 sm:px-6">
        <motion.h3
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-2xl font-bold mb-4 text-center"
        >
          Your Referral Stats
        </motion.h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl mx-auto">
          {isNewUser
            ? [
                { label: "Referrals", value: "0 – Invite Now!" },
                { label: "Total Earnings", value: "$0 – Start Today!" },
                {
                  label: "Pending Earnings",
                  value: "$0 – Earn on Deserialize!",
                },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0.9, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.5, delay: i * 0.2 }}
                >
                  <Card className="bg-muted border-[#86efac] shadow-none min-w-[120px] w-full">
                    <CardHeader className="p-2">
                      <CardTitle className="text-center text-muted-foreground text-sm sm:text-base truncate">
                        {stat.label}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 text-center text-sm sm:text-base font-bold truncate line-clamp-1">
                      {stat.value}
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            : [
                { label: "Referrals", value: stats.referrals },
                { label: "Total Earnings", value: `$${stats.earnings}` },
                { label: "Pending Earnings", value: `$${stats.pending}` },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0.9, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.5, delay: i * 0.2 }}
                >
                  <Card className="bg-muted border-[#86efac] shadow-none min-w-[120px] w-full">
                    <CardHeader className="p-2">
                      <CardTitle className="text-center text-muted-foreground text-sm sm:text-base truncate">
                        {stat.label}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 text-center text-sm sm:text-base font-bold truncate line-clamp-1">
                      {stat.value}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mt-8 w-full max-w-2xl mx-auto"
        >
          {isNewUser || history.length === 0 ? (
            <Card className="bg-muted border-[#86efac] shadow-none text-center">
              <CardContent className="p-6">
                <p className="text-muted-foreground mb-4">
                  No Earnings Yet – Share Your Code to See Growth!
                </p>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={() => {
                      if (!connected || !walletAddress) {
                        toast.custom((t) => (
                          <div
                            className={`flex items-center gap-2 px-4 py-2 rounded-md shadow-md ${
                              t.visible ? "animate-enter" : "animate-leave"
                            } ${t.visible ? "animate-enter" : "animate-leave"}`}
                            style={{ background: "#86efac", color: "#000" }}
                          >
                            <Wallet size={20} color="#000" />
                            <span>Connect your wallet to start earning!</span>
                          </div>
                        ));
                        return;
                      }
                      setShowModal(true);
                    }}
                    className={`bg-[#86efac] text-black hover:bg-[#86efac]/90 shadow-none ${
                      referralCode && "hidden"
                    }`}
                  >
                    Generate Code Now
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          ) : (
            <canvas id="earningsChart" height="200" className="w-full" />
          )}
        </motion.div>
        <motion.h4
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-xl font-bold mt-8 mb-4 text-center"
        >
          Top Referrers
        </motion.h4>
        <div className="w-full max-w-md mx-auto">
          {isNewUser || leaderboardData.length === 0 ? (
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-muted p-4 rounded-lg border-l-4 border-[#86efac] text-center"
            >
              <p className="text-muted-foreground mb-2">
                Be the First Top Referrer!
              </p>
              <p>Invite friends to climb the leaderboard.</p>
            </motion.div>
          ) : (
            leaderboardData.map((entry, i) => (
              <motion.div
                key={i}
                initial={{ x: 50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: i * 0.2 }}
                className="bg-muted p-2 rounded-lg mb-2 border-l-4 border-[#86efac]"
              >
                {entry.name}: {entry.referrals} referrals
              </motion.div>
            ))
          )}
        </div>
      </section>

      {/* Referral Link Sharing Tools */}
      {/* {referralCode && (
        <section className="w-full py-12 px-4 sm:px-6">
          <motion.h3
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-2xl font-bold mb-4 text-center"
          >
            Share Your Referral
          </motion.h3>
          <div className="flex flex-col items-center gap-4 w-full max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
              <Input
                value={`${
                  process.env.NEXT_PUBLIC_APP_URL ||
                  "https://www.deserialize.xyz"
                }/?ref=${referralCode}`}
                readOnly
                className="bg-muted text-foreground border-2 border-[#86efac] focus:ring-[#86efac] w-full"
              />
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() =>
                    copyToClipboard(
                      `${
                        process.env.NEXT_PUBLIC_APP_URL ||
                        "https://www.deserialize.xyz"
                      }/?ref=${referralCode}`
                    )
                  }
                  className="bg-[#86efac] text-black hover:bg-[#86efac]/90 shadow-none w-full sm:w-auto"
                >
                  Copy Link
                </Button>
              </motion.div>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              {["Twitter", "Telegram", "Discord"].map((platform) => (
                <motion.div
                  key={platform}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    onClick={() =>
                      toast.custom((t) => (
                        <div
                          className={`flex items-center gap-2 px-4 py-2 rounded-md shadow-md ${
                            t.visible ? "animate-enter" : "animate-leave"
                          }`}
                          style={{ background: "#86efac", color: "#000" }}
                        >
                          <Share2 size={20} color="#000" />
                          <span>Share on {platform} coming soon!</span>
                        </div>
                      ))
                    }
                    className="text-[#86efac] border-[#86efac] hover:bg-[#86efac]/20 shadow-none"
                  >
                    {platform}
                  </Button>
                </motion.div>
              ))}
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <canvas id="qrCode" className="mt-4" />
              <motion.div whileHover={{ scale: 1.05 }}>
                <Button
                  onClick={() =>
                    toast.custom((t) => (
                      <div
                        className={`flex items-center gap-2 px-4 py-2 rounded-md shadow-md ${
                          t.visible ? "animate-enter" : "animate-leave"
                        }`}
                        style={{ background: "#86efac", color: "#000" }}
                      >
                        <Download size={20} color="#000" />
                        <span>QR code downloaded!</span>
                      </div>
                    ))
                  }
                  className="bg-[#86efac] text-black hover:bg-[#86efac]/90 mt-2 shadow-none w-full sm:w-auto"
                >
                  Download QR
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>
      )} */}

      {/* Referral History */}
      <section className="w-full py-12 px-4 sm:px-6">
        <motion.h3
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-2xl font-bold mb-4 text-center"
        >
          Referral History
        </motion.h3>
        <div className="flex flex-wrap justify-center gap-4 mb-4">
          {["Date", "Earnings"].map((filter) => (
            <motion.div key={filter} whileHover={{ scale: 1.05 }}>
              <Button
                variant="outline"
                onClick={() =>
                  toast.custom((t) => (
                    <div
                      className={`flex items-center gap-2 px-4 py-2 rounded-md shadow-md ${
                        t.visible ? "animate-enter" : "animate-leave"
                      }`}
                      style={{ background: "#86efac", color: "#000" }}
                    >
                      <ListFilter size={20} color="#000" />
                      <span>Sorting by {filter} coming soon!</span>
                    </div>
                  ))
                }
                className="text-[#86efac] border-[#86efac] hover:bg-[#86efac]/20 shadow-none"
              >
                Sort by {filter}
              </Button>
            </motion.div>
          ))}
        </div>
        <div className="w-full max-w-2xl mx-auto">
          {historyData.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-muted p-4 rounded-lg border-l-4 border-[#86efac] text-center"
            >
              <p className="text-muted-foreground mb-2">
                No Referrals Yet – Invite Friends to Start!
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => {
                    if (!connected || !walletAddress) {
                      toast.custom((t) => (
                        <div
                          className={`flex items-center gap-2 px-4 py-2 rounded-md shadow-md ${
                            t.visible ? "animate-enter" : "animate-leave"
                          } ${t.visible ? "animate-enter" : "animate-leave"}`}
                          style={{ background: "#86efac", color: "#000" }}
                        >
                          <Wallet size={20} color="#000" />
                          <span>
                            Connect your wallet to unlock the power of
                            referrals!
                          </span>
                        </div>
                      ));
                      return;
                    }
                    setShowModal(true);
                  }}
                  className={`bg-[#86efac] text-black hover:bg-[#86efac]/90 shadow-none ${
                    referralCode && "hidden"
                  }`}
                >
                  Get Your Code
                </Button>
              </motion.div>
            </motion.div>
          ) : (
            historyData.map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                transition={{ duration: 0.5 }}
                className={`bg-muted p-4 rounded-lg mb-2 border-l-4 ${
                  entry.status === "ACTIVE"
                    ? "border-[#86efac]"
                    : "border-muted"
                }`}
              >
                <p>
                  {entry.name} - Joined{" "}
                  {new Date(entry.date).toLocaleDateString()}
                </p>
                <p>
                  Earnings: ${entry.earnings} ({entry.status})
                </p>
              </motion.div>
            ))
          )}
        </div>
      </section>

      {/* Web3 Incentives */}
      <section className="w-full py-12 px-4 sm:px-6">
        <motion.h3
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-2xl font-bold mb-4 text-center"
        >
          Rewards & Milestones
        </motion.h3>
        <div className="w-full max-w-md mx-auto">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-muted-foreground mb-2"
          >
            {isNewUser
              ? "Make Your First Referral to Unlock Rewards!"
              : `${stats.referrals}/5 Referrals for Bronze Badge`}
          </motion.p>
          <div className="bg-muted h-2 rounded-lg">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(stats.referrals / 5) * 100}%` }}
              transition={{ duration: 1 }}
              className="bg-[#86efac] h-2 rounded-lg"
            />
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            animate={{ scale: stats.referrals >= 5 ? [1, 1.05, 1] : 1 }}
            transition={{
              repeat: stats.referrals >= 5 ? Infinity : 0,
              duration: 1.5,
            }}
          >
            <Button
              onClick={claimNFT}
              className="bg-[#86efac] text-black hover:bg-[#86efac]/90 mt-4 shadow-none w-full sm:w-auto"
              disabled={stats.referrals < 5}
            >
              Claim Bronze NFT
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Help and Support */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        className="fixed bottom-4 right-4"
      >
        <Button
          onClick={() => setShowFAQ(!showFAQ)}
          className="bg-[#86efac] text-black hover:bg-[#86efac]/90 rounded-full p-4 shadow-none"
        >
          <HelpCircle size={24} />
        </Button>
      </motion.div>
      {showFAQ && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-16 right-4 bg-muted p-4 rounded-lg w-full max-w-[calc(100vw-2rem)] sm:max-w-sm border-[#86efac] shadow-none"
        >
          <Accordion type="single" collapsible>
            {faqsData.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-[#86efac]">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      )}
    </div>
  );
};

export default ReferralDashboard;
