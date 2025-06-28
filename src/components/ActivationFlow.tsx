"use client";

import type React from "react";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";
import {
  Shield,
  CheckCircle,
  XCircle,
  Key,
  Zap,
  Clock,
  ArrowRight,
} from "lucide-react";
import {
  VersionedTransaction,
  SendTransactionError,
  Connection,
} from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";

interface ActivationState {
  step: "input" | "verifying" | "success" | "error";
  ataVerified: boolean;
  error?: string;
}

interface ActivationFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  walletAddress: string | null;
  connected: boolean;
}

export const ActivationFlow: React.FC<ActivationFlowProps> = ({
  isOpen,
  onClose,
  onSuccess,
  walletAddress,
  connected,
}) => {
  const [activationState, setActivationState] = useState<ActivationState>({
    step: "input",
    ataVerified: false,
  });

  const privateConnection = new Connection(
    process.env.NEXT_PUBLIC_PRIVATE_RPC_URL ||
      "https://api.mainnet-beta.solana.com",
    "confirmed"
  );
  const { publicKey, signTransaction } = useWallet();

  const processActivation = async () => {
    setActivationState((prev) => ({ ...prev, step: "verifying" }));

    try {
      if (!publicKey) throw new Error("Wallet not connected");

      // Call the backend API to create ATA
      const response = await fetch("https://api.deserialize.xyz/createAta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userAddress: publicKey.toBase58() }),
      });

      if (!response.ok) throw new Error("Failed to create ATA");

      const data = await response.json();

      if (!data.serializedTx) {
        // All ATAs already exist, mark as verified
        await fetch("/api/user/set-ata-verified", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ walletAddress: publicKey.toBase58() }),
        });

        setActivationState((prev) => ({
          ...prev,
          step: "success",
          ataVerified: true,
        }));

        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        setTimeout(() => {
          onSuccess();
          resetModal();
        }, 3000);
        return;
      }

      if (!signTransaction)
        throw new Error("Wallet does not support transaction signing");

      // Decode base64 to Uint8Array
      const txBytes = Uint8Array.from(atob(data.serializedTx), (c) =>
        c.charCodeAt(0)
      );
      const transaction = VersionedTransaction.deserialize(txBytes);

      // Patch the blockhash
      const { blockhash } = await privateConnection.getLatestBlockhash(
        "confirmed"
      );
      transaction.message.recentBlockhash = blockhash;

      // Sign and send the transaction
      const signedTransaction = await signTransaction(transaction);
      const signature = await privateConnection.sendRawTransaction(
        signedTransaction.serialize(),
        {
          skipPreflight: false,
          preflightCommitment: "confirmed",
        }
      );

      // Confirm the transaction
      await privateConnection.confirmTransaction(signature, "confirmed");

      // Mark as verified in your DB/state
      await fetch("/api/user/set-ata-verified", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: publicKey.toBase58() }),
      });

      setActivationState((prev) => ({
        ...prev,
        step: "success",
        ataVerified: true,
      }));

      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      setTimeout(() => {
        onSuccess();
        resetModal();
      }, 3000);
    } catch (error: any) {
      setActivationState((prev) => ({
        ...prev,
        step: "error",
        error: error.message || "ATA verification failed. Please try again.",
      }));
    }
  };

  const resetModal = () => {
    onClose();
    setActivationState({
      step: "input",
      ataVerified: false,
    });
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) resetModal();
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-2xl border border-gray-700/50 rounded-3xl p-8 max-w-md w-full shadow-2xl"
      >
        {activationState.step === "input" && (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-white">
                Verify ATA Tokens
              </h3>
              <p className="text-gray-300">
                Verify your ATA token accounts to activate your referral system.
              </p>
            </div>

            <div className="bg-primary/10 rounded-xl p-4 border border-primary/20">
              <div className="flex items-start gap-3">
                <Key className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-primary mb-1">
                    What happens next?
                  </h4>
                  <ul className="text-xs text-gray-300 space-y-1">
                    <li>• Check all ATA token accounts</li>
                    <li>• Verify account ownership</li>
                    <li>• Activate your referral system</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={resetModal}
                variant="outline"
                className="flex-1 border-gray-600/50 bg-gray-800/40 text-gray-200 hover:bg-gray-700/40 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={processActivation}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-xl"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Verify ATAs
              </Button>
            </div>
          </div>
        )}

        {activationState.step === "verifying" && (
          <div className="space-y-6 text-center">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
              >
                <Zap className="w-8 h-8 text-primary" />
              </motion.div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Verifying ATAs...
              </h3>
              <p className="text-gray-300 mb-4">
                Checking your ATA token accounts
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-3 text-sm">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    }}
                  >
                    <Clock className="w-4 h-4 text-primary" />
                  </motion.div>
                  <span className="text-gray-300">Verifying ATA tokens...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activationState.step === "success" && (
          <div className="space-y-6 text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-green-400 mb-2">
                ATAs Verified!
              </h3>
              <p className="text-gray-300 mb-4">
                Your ATA tokens have been verified. You can now earn from
                referrals!
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-3 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300">ATA tokens verified</span>
                </div>
                <div className="flex items-center justify-center gap-3 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300">System activated</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activationState.step === "error" && (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                <XCircle className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-2xl font-bold text-red-400">
                Activation Failed
              </h3>
              <p className="text-gray-300">
                {activationState.error ||
                  "Something went wrong. Please try again."}
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={resetModal}
                variant="outline"
                className="flex-1 border-gray-600/50 bg-gray-800/40 text-gray-200 hover:bg-gray-700/40 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={() =>
                  setActivationState((prev) => ({
                    ...prev,
                    step: "input",
                    error: undefined,
                  }))
                }
                className="flex-1 bg-red-500 text-white hover:bg-red-600 font-semibold rounded-xl"
              >
                Try Again
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};
