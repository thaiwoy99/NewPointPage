"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Connection,
  Transaction,
  PublicKey,
  SendTransactionError,
  VersionedTransaction,
} from "@solana/web3.js";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";

interface CreateATAResponse {
  message: string;
  serializedTransaction?: string; // Base64-encoded unsigned transaction
  associatedTokenAddress?: string;
  error?: string;
}

interface AtaInfo {
  address: string;
  exists: boolean;
  status: string;
}

const tokens = [
  {
    name: "USD Coin",
    symbol: "USDC",
    mintAddress: "AKEWE7Bgh87GPp171b4cJPSSZfmZwQ3KaqYqXoKLNAEE", // Verify for Eclipse
    image: "https://assets.coingecko.com/coins/images/6319/standard/usdc.png",
  },
  {
    name: "Orca",
    symbol: "ORCA",
    mintAddress: "2tGbYEm4nuPFyS6zjDTELzEhvVKizgKewi6xT7AaSKzn", // Verify for Eclipse
    image:
      "https://assets.coingecko.com/coins/images/17547/standard/Orca_Logo.png?1696517083",
  },
  {
    name: "Solana",
    symbol: "SOL",
    mintAddress: "So11111111111111111111111111111111111111112", // Verify for Eclipse
    image: "https://assets.coingecko.com/coins/images/4128/standard/solana.png",
  },
  {
    name: "Tether USD",
    symbol: "USDT",
    mintAddress: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", // Verify for Eclipse
    image:
      "https://assets.coingecko.com/coins/images/325/standard/Tether.png?1696501661",
  },
  {
    name: "dogwifhat",
    symbol: "WIF",
    mintAddress: "841P4tebEgNux2jaWSjCoi9LhrVr9eHGjLc758Va3RPH", // Verify for Eclipse
    image:
      "https://assets.coingecko.com/coins/images/33566/standard/dogwifhat.jpg?1702499428",
  },
];

export default function AtaForm() {
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [ataInfo, setAtaInfo] = useState<AtaInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { publicKey, connected, signTransaction } = useWallet();
  const { connection } = useConnection();

  // Private connection for transaction operations
  const privateConnection = new Connection(
    process.env.NEXT_PUBLIC_PRIVATE_RPC_URL ||
      "https://api.mainnet-beta.solana.com",
    "confirmed"
  );

  // Reset ATA info when token or wallet changes
  useEffect(() => {
    if (!tokenSymbol || !connected || !publicKey) {
      setAtaInfo(null);
    }
  }, [tokenSymbol, connected, publicKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!connected || !publicKey) {
      toast.error("Wallet Not Connected", {
        description: "Please connect your Solana wallet to proceed.",
        style: {
          background: "hsl(var(--destructive))",
          color: "hsl(var(--destructive-foreground))",
          border: "1px solid hsl(var(--border))",
        },
      });
      setIsLoading(false);
      return;
    }

    if (!tokenSymbol) {
      toast.error("Token Required", {
        description: "Please select a token to create ATA for.",
        style: {
          background: "hsl(var(--destructive))",
          color: "hsl(var(--destructive-foreground))",
          border: "1px solid hsl(var(--border))",
        },
      });
      setIsLoading(false);
      return;
    }

    const selectedToken = tokens.find((token) => token.symbol === tokenSymbol);
    if (!selectedToken) {
      toast.error("Invalid Token", {
        description: "Selected token is not supported.",
        style: {
          background: "hsl(var(--destructive))",
          color: "hsl(var(--destructive-foreground))",
          border: "1px solid hsl(var(--border))",
        },
      });
      setIsLoading(false);
      return;
    }

    try {
      // Call the backend API to create ATA
      const response = await fetch("https://api.deserialize.xyz/createAta", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userAddress: publicKey.toBase58(),
          // If the API expects tokenMint, add it here:
          // tokenMint: selectedToken.mintAddress,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create ATA");
      }

      const data = await response.json();
      console.log(data);
      if (!data.serializedTx) {
        // Update ATA info (no address from API, so leave blank)
        setAtaInfo({
          address: "",
          exists: true,
          status: "All ATAs already exists",
        });

        // Mark as verified in your DB/state
        await fetch("/api/user/set-ata-verified", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ walletAddress: publicKey.toBase58() }),
        });

        toast.success("All ATAs already exists", {
          description: `All ATAs already exist`,
          style: {
            background: "hsl(var(--card))",
            color: "hsl(var(--foreground))",
            border: "1px solid hsl(var(--border))",
          },
        });
        setIsLoading(false);
        return;
      }

      if (!signTransaction) {
        throw new Error("Wallet does not support transaction signing");
      }

      // Decode base64 to Uint8Array
      const txBytes = Uint8Array.from(atob(data.serializedTx), (c) =>
        c.charCodeAt(0)
      );
      // Deserialize using VersionedTransaction.deserialize
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

      // Update ATA info (no address from API, so leave blank)
      setAtaInfo({
        address: "",
        exists: true,
        status: "ATA created successfully",
      });

      toast.success("ATA Created Successfully", {
        description: `Associated Token Account created for ${tokenSymbol}. Transaction: ${signature.slice(
          0,
          8
        )}...`,
        style: {
          background: "hsl(var(--card))",
          color: "hsl(var(--foreground))",
          border: "1px solid hsl(var(--border))",
        },
      });
    } catch (err) {
      let errorMessage = "Could not process the transaction.";
      if (err instanceof SendTransactionError) {
        const logs = await err.getLogs(privateConnection);
        console.error("Transaction logs:", logs);
        errorMessage = err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      toast.error("Transaction Failed", {
        description: errorMessage,
        style: {
          background: "hsl(var(--destructive))",
          color: "hsl(var(--destructive-foreground))",
          border: "1px solid hsl(var(--border))",
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border border-border/50 shadow-lg shadow-black/20 bg-card/90 backdrop-blur-sm mt-50">
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-2">
            <Label
              htmlFor="tokenInput"
              className="text-sm font-medium text-foreground"
            >
              Token
            </Label>
            <Select value={tokenSymbol} onValueChange={setTokenSymbol} required>
              <SelectTrigger
                id="tokenInput"
                className="bg-secondary/80 border-border/50 focus:ring-ring hover:bg-secondary/90 transition-colors"
              >
                <SelectValue placeholder="Select a token" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border/50">
                {tokens.map((token) => (
                  <SelectItem
                    key={token.symbol}
                    value={token.symbol}
                    className="flex items-center gap-2 hover:bg-accent/90 focus:bg-accent/90"
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={token.image}
                        alt={`${token.name} logo`}
                        className="w-6 h-6 rounded-full"
                        onError={(e) =>
                          (e.currentTarget.src =
                            "https://via.placeholder.com/24?text=Token")
                        }
                      />
                      <span>
                        {token.name} ({token.symbol})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">
              Wallet Address
            </Label>
            <p className="text-sm text-muted-foreground">
              {connected && publicKey
                ? publicKey.toBase58()
                : "Please connect your Solana wallet"}
            </p>
          </div>

          {ataInfo && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">
                ATA Status
              </Label>
              <div className="text-sm space-y-1">
                <p
                  className={`font-medium ${
                    ataInfo.exists ? "text-green-600" : "text-yellow-600"
                  }`}
                >
                  {ataInfo.status}
                </p>
                <p className="text-muted-foreground break-all">
                  Address: {ataInfo.address}
                </p>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col items-start gap-4 mt-4">
          <Button
            type="submit"
            disabled={isLoading || !connected || !tokenSymbol}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-transform"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {ataInfo?.exists ? "Verifying..." : "Creating ATA..."}
              </>
            ) : ataInfo?.exists ? (
              "ATA Already Exists"
            ) : (
              "Create ATA"
            )}
          </Button>

          {ataInfo && (
            <div className="text-sm text-muted-foreground space-y-2 p-4 bg-secondary/20 rounded-md w-full">
              <p>
                <strong>Token:</strong> {tokenSymbol}
              </p>
              <p>
                <strong>ATA Address:</strong>{" "}
                <span className="break-all ml-1">{ataInfo.address}</span>
              </p>
              <p>
                <strong>Owner:</strong>{" "}
                <span className="break-all ml-1">{publicKey?.toBase58()}</span>
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={`ml-1 ${
                    ataInfo.exists ? "text-green-600" : "text-yellow-600"
                  }`}
                >
                  {ataInfo.status}
                </span>
              </p>
            </div>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}

// "use client";

// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Card, CardContent, CardFooter } from "@/components/ui/card";
// import { Loader2 } from "lucide-react";
// import { toast } from "sonner";
// import {
//   Connection,
//   Transaction,
//   TransactionInstruction,
//   PublicKey,
//   SendTransactionError,
// } from "@solana/web3.js";
// import { useWallet, useConnection } from "@solana/wallet-adapter-react";

// interface AtaResponse {
//   token: string;
//   tokenMint: string;
//   ownerPublicKey: string;
//   associatedToken: string;
//   status: string;
//   instruction: {
//     programId: string;
//     keys: { pubkey: string; isSigner: boolean; isWritable: boolean }[];
//     data: string;
//   } | null;
// }

// interface ErrorResponse {
//   status: boolean | string;
//   token: string;
//   error: string;
// }

// const tokens = [
//   {
//     name: "USD Coin",
//     symbol: "USDC",
//     image: "https://assets.coingecko.com/coins/images/6319/standard/usdc.png",
//   },
//   {
//     name: "dogwifhat",
//     symbol: "WIF",
//     image:
//       "https://assets.coingecko.com/coins/images/33566/standard/dogwifhat.jpg?1702499428",
//   },
//   {
//     name: "Solana",
//     symbol: "SOL",
//     image: "https://assets.coingecko.com/coins/images/4128/standard/solana.png",
//   },
//   {
//     name: "Ethereum",
//     symbol: "ETH",
//     image:
//       "https://assets.coingecko.com/coins/images/279/standard/ethereum.png?1696501628",
//   },
//   {
//     name: "Turbo ETH",
//     symbol: "tETH",
//     image:
//       "https://assets.coingecko.com/coins/images/52492/standard/tETH.png?1733441914",
//   },
//   {
//     name: "Orca",
//     symbol: "ORCA",
//     image:
//       "https://assets.coingecko.com/coins/images/17547/standard/Orca_Logo.png?1696517083",
//   },
//   {
//     name: "Tether USD",
//     symbol: "USDT",
//     image:
//       "https://assets.coingecko.com/coins/images/325/standard/Tether.png?1696501661",
//   },
//   {
//     name: "BITZ",
//     symbol: "BITZ",
//     image:
//       "https://assets.coingecko.com/coins/images/55907/standard/download.png?1747672115",
//   },
// ];

// export default function AtaForm() {
//   const [tokenInput, setTokenInput] = useState("");
//   const [result, setResult] = useState<AtaResponse | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const { publicKey, connected, signTransaction } = useWallet();
//   const { connection } = useConnection();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setResult(null);

//     if (!connected || !publicKey) {
//       toast.error("Wallet Not Connected", {
//         description: "Please connect your Solana wallet to proceed.",
//         style: {
//           background: "hsl(var(--destructive))",
//           color: "hsl(var(--destructive-foreground))",
//           border: "1px solid hsl(var(--border))",
//         },
//       });
//       setIsLoading(false);
//       return;
//     }

//     const ownerPublicKey = publicKey.toBase58();

//     try {
//       const response = await fetch(
//         `${
//           process.env.NEXT_PUBLIC_BACKEND_URL
//         }createAta?tokenInput=${encodeURIComponent(
//           tokenInput
//         )}&ownerPublicKey=${encodeURIComponent(
//           ownerPublicKey
//         )}&apiKey=${encodeURIComponent(process.env.NEXT_PUBLIC_API_KEY || "")}`
//       );

//       const data: AtaResponse | ErrorResponse = await response.json();

//       if (!response.ok || "error" in data) {
//         toast.error("Error", {
//           description: (data as ErrorResponse).error || "Failed to process ATA",
//           style: {
//             background: "hsl(var(--destructive))",
//             color: "hsl(var(--destructive-foreground))",
//             border: "1px solid hsl(var(--border))",
//           },
//         });
//         setIsLoading(false);
//         return;
//       }

//       const ataResponse = data as AtaResponse;
//       setResult(ataResponse);

//       if (
//         ataResponse.status === "Instruction Created" &&
//         ataResponse.instruction
//       ) {
//         if (!signTransaction) {
//           toast.error("Wallet Error", {
//             description: "Wallet does not support transaction signing.",
//             style: {
//               background: "hsl(var(--destructive))",
//               color: "hsl(var(--destructive-foreground))",
//               border: "1px solid hsl(var(--border))",
//             },
//           });
//           setIsLoading(false);
//           return;
//         }

//         // Construct the transaction
//         const transaction = new Transaction();
//         const instruction = new TransactionInstruction({
//           programId: new PublicKey(ataResponse.instruction.programId),
//           keys: ataResponse.instruction.keys.map((key) => ({
//             pubkey: new PublicKey(key.pubkey),
//             isSigner: key.isSigner,
//             isWritable: key.isWritable,
//           })),
//           data: Buffer.from(ataResponse.instruction.data, "base64"),
//         });
//         transaction.add(instruction);

//         // Set fee payer and recent blockhash
//         transaction.feePayer = publicKey;
//         const { blockhash } = await connection.getLatestBlockhash("confirmed");
//         transaction.recentBlockhash = blockhash;

//         // Sign and send the transaction
//         const signedTransaction = await signTransaction(transaction);
//         const signature = await connection.sendRawTransaction(
//           signedTransaction.serialize()
//         );
//         await connection.confirmTransaction(signature, "confirmed");

//         toast.success("Success", {
//           description: `ATA created for ${ataResponse.token}. Transaction: ${signature}`,
//           style: {
//             background: "hsl(var(--card))",
//             color: "hsl(var(--foreground))",
//             border: "1px solid hsl(var(--border))",
//           },
//         });
//       } else {
//         toast.success("Success", {
//           description: `ATA verified for ${ataResponse.token}.`,
//           style: {
//             background: "hsl(var(--card))",
//             color: "hsl(var(--foreground))",
//             border: "1px solid hsl(var(--border))",
//           },
//         });
//       }
//     } catch (err) {
//       let errorMessage = "Could not process the transaction.";
//       if (err instanceof SendTransactionError) {
//         console.error("Transaction logs:", await err.getLogs(connection));
//         errorMessage = err.message.includes("Invalid Mint")
//           ? "Invalid token mint address. The selected token may not be supported on this network."
//           : err.message;
//       } else if (err instanceof Error) {
//         errorMessage = err.message;
//       }
//       console.error(err);
//       toast.error("Error", {
//         description: errorMessage,
//         style: {
//           background: "hsl(var(--destructive))",
//           color: "hsl(var(--destructive-foreground))",
//           border: "1px solid hsl(var(--border))",
//         },
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <Card className="border border-border/50 shadow-lg shadow-black/20 bg-card/90 backdrop-blur-sm mt-50">
//       <form onSubmit={handleSubmit}>
//         <CardContent className="space-y-6 pt-6">
//           <div className="space-y-2">
//             <Label
//               htmlFor="tokenInput"
//               className="text-sm font-medium text-foreground"
//             >
//               Token
//             </Label>
//             <Select value={tokenInput} onValueChange={setTokenInput} required>
//               <SelectTrigger
//                 id="tokenInput"
//                 className="bg-secondary/80 border-border/50 focus:ring-ring hover:bg-secondary/90 transition-colors"
//               >
//                 <SelectValue placeholder="Select a token" />
//               </SelectTrigger>
//               <SelectContent className="bg-card border-border/50">
//                 {tokens.map((token) => (
//                   <SelectItem
//                     key={token.symbol}
//                     value={token.symbol}
//                     className="flex items-center gap-2 hover:bg-accent/90 focus:bg-accent/90"
//                   >
//                     <div className="flex items-center gap-2">
//                       <img
//                         src={token.image}
//                         alt={`${token.name} logo`}
//                         className="w-6 h-6 rounded-full"
//                         onError={(e) =>
//                           (e.currentTarget.src =
//                             "https://via.placeholder.com/24?text=Token")
//                         }
//                       />
//                       <span>
//                         {token.name} ({token.symbol})
//                       </span>
//                     </div>
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>
//           <div className="space-y-2">
//             <Label className="text-sm font-medium text-foreground">
//               Wallet Address
//             </Label>
//             <p className="text-sm text-muted-foreground">
//               {connected && publicKey
//                 ? publicKey.toBase58()
//                 : "Please connect your Solana wallet"}
//             </p>
//           </div>
//         </CardContent>
//         <CardFooter className="flex flex-col items-start gap-4 mt-4">
//           <Button
//             type="submit"
//             disabled={isLoading || !connected}
//             className="w-full bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-transform"
//           >
//             {isLoading ? (
//               <>
//                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                 Processing...
//               </>
//             ) : (
//               "Create/Verify ATA"
//             )}
//           </Button>
//           {result && (
//             <div className="text-sm text-muted-foreground space-y-2 py-4 rounded-md w-full">
//               <p>
//                 <strong>Token:</strong> {result.token}
//               </p>
//               <p>
//                 <strong>Token Mint:</strong> {result.tokenMint}
//               </p>
//               <p>
//                 <strong>Owner Public Key:</strong> {result.ownerPublicKey}
//               </p>
//               <p>
//                 <strong>Associated Token Address:</strong>{" "}
//                 {result.associatedToken}
//               </p>
//               <p>
//                 <strong>Status:</strong> {result.status}
//               </p>
//             </div>
//           )}
//         </CardFooter>
//       </form>
//     </Card>
//   );
// }
