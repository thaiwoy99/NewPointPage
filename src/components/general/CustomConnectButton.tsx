"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "../ui/button";
import { Check, Copy, LogOut, Wallet, WalletMinimal } from "lucide-react";
import { splitStringInMiddle } from "@/lib/utils";
import { SwapSDK, Token } from "@deserialize/swap-sdk";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import TokenBalance from "@/sections/TokenBalance";
import { useUserWallet } from "@/context/user-wallet-provider";
import { NATIVE_ETH_TOKEN, SOLANA_CONTRACT_ADDRESS } from "@/lib/constant";
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';

const CustomConnectButton = ({ isMobileOpen }: { isMobileOpen: boolean }) => {
  const {
    handleConnect,
    solBalance,
    // wallet,
    // publicKey,
    // connected,
    connection,
    tokenBalances,
  } = useUserWallet();
  const { connecting, connected, wallet, publicKey } = useWallet();
  const { setVisible } = useWalletModal();
  const [showSidebar, setShowSidebar] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tokenList, setTokenList] = useState<Token[] | undefined>(undefined);

  // HDR: TIMER TO CLOSE TOOLTIP
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(false);
    }, 5000);

    () => clearTimeout(timer);
  }, [showTooltip]);

  useEffect(() => {
    const deserialize = new SwapSDK();
    deserialize.tokenList().then((data) => {
      setTokenList(data);
    });
  }, [publicKey]);

  // HDR: COPY TEXT
  const copyLink = (text: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
      setShowTooltip(true);
    }
  };

  // HDR: Wallet connection
  const connectHandler = useCallback(() => {
    if (connected) {
      showSidebarHandler();
    }
    handleConnect();
  }, [connected, handleConnect]);

  const showSidebarHandler = () => {
    setShowSidebar((prev) => !prev);
  };

  const handleClick = () => {
    if (!connected) {
     // setVisible(true); // Open the modal if not connected
    } else {
      console.log("Wallet already connected!");
      showSidebarHandler()
      // Optionally, add disconnect logic here
    }
  };

  const handleDisConnect = () => {
    if (connected) {
      wallet?.adapter.disconnect().then(() => {
        console.log("Wallet disconnected successfully.");
      }).catch((error) => {
        console.error("Error disconnecting wallet:", error);
      });
    }
  }

  return (
    <>
      {connected ? (
        <Button
          className="py-1.5 h-fit px-2 md:pr-5"
          variant="outline"
          onClick={handleClick}
         // onClick={showSidebarHandler}
        >
          <span className="size-7 rounded-full bg-secondary-foreground/40 flex items-center justify-center">
            <Wallet color="black" />
          </span>
          <div className="flex flex-col items-start text-xs">
            <span className={`opacity-65`}>{wallet?.adapter.name}</span>
            <span className="font-semibold">
              {splitStringInMiddle(publicKey?.toBase58() ?? "", 5)}
            </span>
          </div>
        </Button>
      ) : (
        <Button className="" onClick={connectHandler}>
          <WalletMinimal />
          <span className="hidden md:inline">Connect</span>
        </Button>
      )}

      {/* HDR: Sidebar  */}
      <Sheet open={showSidebar} onOpenChange={showSidebarHandler}>
        <SheetContent>
          <SheetHeader className="hidden">
            <SheetTitle>wallet</SheetTitle>
            <SheetDescription>wallet data</SheetDescription>
          </SheetHeader>
          <div className="mt-10">
            {/* SUB: Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="size-12 rounded-full bg-secondary/50 flex items-center justify-center">
                  <Wallet />
                </span>
                <div className="flex flex-col items-start text-sm">
                  <span className="opacity-65">{wallet?.adapter.name}</span>
                  <span className="font-semibold">
                    {splitStringInMiddle(publicKey?.toBase58() ?? "", 5)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 mr-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger
                      className="size-12 rounded-full bg-secondary/50 flex items-center justify-center hover:bg-secondary transition duration-300 ease"
                      onClick={() => copyLink(publicKey?.toBase58() ?? "")}
                    >
                      {showTooltip ? (
                        <Check className="size-5 text-green-500" />
                      ) : (
                        <Copy className="size-5" />
                      )}
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Copy Wallet Address</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger
                      className="size-12 rounded-full bg-secondary/50 flex items-center justify-center"
                      onClick={connectHandler}
                    >
                      <LogOut onClick={handleDisConnect} className="size-5" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Disconnect Wallet</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            {/* SUB: Content */}
            <div className="mt-6">
              <h4 className="pb-2 border-b ">Balances</h4>

              {solBalance ? (
                <>
                  <TokenBalance
                    key="native"
                    balance={solBalance}
                    onModal
                    onClick={() => {}}
                    token={NATIVE_ETH_TOKEN}
                  />
                  {tokenBalances && tokenList
                    ? tokenBalances.map((balance) => {
                        if (balance.mint !== SOLANA_CONTRACT_ADDRESS) {
                          const matchingToken = tokenList.find(
                            (t) => t.address === balance.mint
                          );
                          return (
                            matchingToken && (
                              <TokenBalance
                                key={matchingToken.address}
                                balance={balance.balanceUiAmount}
                                onModal
                                onClick={() => {}}
                                token={matchingToken}
                              />
                            )
                          );
                        }
                      })
                    : null}
                </>
              ) : null}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default CustomConnectButton;
