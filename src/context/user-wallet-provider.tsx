"use client";

import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { useConnection, useWallet, Wallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import base58 from "bs58"
import { SwapSDK, Token } from "@deserialize/swap-sdk";
import { useToast } from "@/hooks/use-toast";
import { getUnWrapEthTx } from "@/lib/utils";
// import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

type ContentType = {
  wallet: Wallet | null;
  solBalance: number | undefined;
  handleConnect: () => Promise<void>;
  handleSendTransaction: (tx: VersionedTransaction) => Promise<
    | {
      signature: string;
    }
    | undefined
  >;
  handleSendSerializedTransaction: (serializedTx: string) => Promise<{
    status: boolean;
    signature: string | undefined;
    blockhash: string;
    lastValidBlockHeight: number;
  }>;
  handleGetWalletTokenBalance: (
    tokenAddress: string,
    programId: string
  ) => Promise<number>;
  publicKey: PublicKey | null;
  connected: boolean;
  connection: Connection;
  tokenBalances: TokenBalanceType[] | undefined;

  handleGetIfUserHasWrapEth: (userWalletAddress: string) => Promise<boolean>;
  handleSendUnWrapEthTransaction: (userWalletAddress: string) => Promise<{
    status: boolean;
    signature: string | undefined;
  }>;
  handleConfirmTransaction: (
    signature: string,
    blockhash: string,
    lastValidBlockHeight: number
  ) => Promise<{
    status: boolean;
    signature: string;
  }>;

  handleSignSerializedTransaction: (serializedTx: string) => Promise<{
    status: boolean;
    serializedTransaction: string | undefined;
  }>
  setUserTokenBalance: () => void;
};

const UserWallet = createContext<ContentType | null>(null);

const deserialize = new SwapSDK();

type TokenBalanceType = {
  mint: string;
  balanceUiAmount: number;
};

const UserWalletProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const {
    wallet,
    select,
    connect,
    disconnect,
    connected,
    publicKey,
    sendTransaction,
    signTransaction
  } = useWallet();
  const { setVisible } = useWalletModal();
  const [balance, setBalance] = useState<number | undefined>(undefined);
  const { connection } = useConnection();

  // state for token balance list of type AccountInfo<ParsedAccountData>
  const [tokenBalances, setTokenBalances] = useState<
    TokenBalanceType[] | undefined
  >(undefined);

  const [tokenList, setTokenList] = useState<Token[] | undefined>(undefined);

  // const [tokenBalances, setTokenBalances] = useState<
  //   { mint: any; balance: any; uiAmount: any }[]
  // >([]);

  useEffect(() => {
    if (!connection || !publicKey) return;

    connection.getAccountInfo(publicKey).then((info) => {
      setBalance(info?.lamports);
    });
  }, [publicKey, connection]);

  useEffect(() => {
    deserialize.tokenList().then((data) => {
      setTokenList(data);
    });
  }, []);

  useEffect(() => {
    if (!publicKey) return;

    if (!tokenList) return;
    deserialize
      .getTokenMintBalance({
        userAddress: publicKey.toBase58(),
        tokenMints: tokenList.map((token) => token.address),
      })
      .then((tokenBalances) => {
        if (tokenBalances) {
          setTokenBalances(tokenBalances);
        }
      });
  }, [publicKey, tokenList]);

  const setUserTokenBalance = () => {
    if (!publicKey) return;
    if (!tokenList) return;
    deserialize
      .getTokenMintBalance({
        userAddress: publicKey.toBase58(),
        tokenMints: tokenList.map((token) => token.address),
      })
      .then((tokenBalances) => {
        if (tokenBalances) {
          setTokenBalances(tokenBalances);
        }
      });
  };

  //   HDR: Solana balance
  const solBalance = useMemo(() => {
    if (publicKey && balance) {
      return balance / LAMPORTS_PER_SOL;
    }
  }, [balance, publicKey]);

  //   HDR: Handling connections
  const handleConnect = useCallback(async () => {
    if (!wallet) {
      setVisible(true);
      return;
    }

    try {
      if (!connected) {
        await connect();
      } else {
        await disconnect();
        select(null);
      }
    } catch (error) {
      console.error("Wallet connection failed:", error);
    }
  }, [wallet, connect, disconnect, connected, select, setVisible]);

  // HDR: Handle get Token Balance
  const handleGetWalletTokenBalance = useCallback(
    async (tokenAddress: string, programId: string) => {
      console.log("programId: ", programId);
      console.log("tokenAddress: ", tokenAddress);
      if (!publicKey) throw new WalletNotConnectedError();

      return 0;
    },
    [publicKey]
  );

  // HDR: Handle transaction
  const handleSendTransaction = useCallback(
    async (tx: VersionedTransaction) => {
      if (!publicKey) throw new WalletNotConnectedError();

      const {
        context: { slot: minContextSlot },
      } = await connection.getLatestBlockhashAndContext();
      let signature;

      toast({
        title: "Confirm The Transaction in your Wallet",
        description: "Accept the transaction",
        className: "border-2 border-red-500",
      });

      try {
        signature = await sendTransaction(tx, connection, {
          minContextSlot,
        });
      } catch (error) {
        toast({
          title: "Transaction Failed",
          description: "Error Sending Transaction",
          className: "border-2 border-red-500",
        });
        return;
      }

      return { signature };
    },
    [publicKey, sendTransaction, connection, toast]
  );

  // HDR: Handle Serialized transaction
  const handleSendSerializedTransaction = useCallback(
    async (serializedTx: string) => {
      if (!publicKey) throw new WalletNotConnectedError();

      const {
        context: { slot: minContextSlot },
        value: { blockhash, lastValidBlockHeight },
      } = await connection.getLatestBlockhashAndContext();

      // Convert the base64-encoded transaction into a VersionedTransaction.
      const txBuffer = Buffer.from(serializedTx, "base64");
      const transaction = VersionedTransaction.deserialize(txBuffer);

      let signature;
      let status = false;
      try {
        const sign = await sendTransaction(transaction, connection, {
          minContextSlot,
        });
        signature = sign;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        if (error.message.includes("Plugin Closed")) {
          toast({
            title: "User Closed Wallet For signing",
            description: "Please try again",
            className: "border-2 border-red-500",
          });
          return { status, signature, blockhash, lastValidBlockHeight };
        }
        if (error.message.includes("Approval Denied")) {
          toast({
            title: "User Denied Transaction Signing",
            description: "Please approve the transaction",
            className: "border-2 border-red-500",
          });
          return { status, signature, blockhash, lastValidBlockHeight };
        }
      }

      status = true;
      return { signature, status, blockhash, lastValidBlockHeight };
    },
    [publicKey, sendTransaction, connection]
  );

  // HDR: Handle Serialized transaction
  const handleSignSerializedTransaction = useCallback(
    async (serializedTx: string) => {
      if (!publicKey) throw new WalletNotConnectedError();
      if (!signTransaction) throw new Error("SIGN_TRANSACTION_NOT_SUPPORT")


      // Convert the base64-encoded transaction into a VersionedTransaction.
      const based58Encoded = base58.decode(serializedTx)
      const transaction = Transaction.from(based58Encoded)

      let serializedTransaction: string | undefined = "";
      let status = false;
      try {
        const signedTransaction = await signTransaction(transaction);
        console.log("base64 trx", Buffer.from(signedTransaction.serialize({ requireAllSignatures: false })).toString("base64"))
        serializedTransaction = base58.encode(signedTransaction.serialize({ requireAllSignatures: false }))

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {

        if (error.message.includes("Plugin Closed")) {
          toast({
            title: "User Closed Wallet For signing",
            description: "Please try again",
            className: "border-2 border-red-500",
          });
          return { status, serializedTransaction };
        }
        if (error.message.includes("Approval Denied")) {
          toast({
            title: "User Denied Transaction Signing",
            description: "Please approve the transaction",
            className: "border-2 border-red-500",
          });
          return { status, serializedTransaction };
        }
      }

      status = true;

      return { serializedTransaction, status, };
    },
    [publicKey, sendTransaction, connection]
  );

  const handleConfirmTransaction = useCallback(
    async (
      signature: string,
      blockhash: string,
      lastValidBlockHeight: number
    ) => {
      let status = false;
      if (signature) {
        try {
          await connection.confirmTransaction({
            blockhash,
            lastValidBlockHeight,
            signature,
          });
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
          toast({
            title: "Could not Confirm Transaction",
            description: error.message,
            className: "border-2 border-red-500",
          });
          return { status, signature };
        }
      } else {
        toast({
          title: "Transaction Not Signed",
          description: "Error Signing Transaction",
          className: "border-2 border-red-500",
        });
        return { status, signature };
      }
      status = true;
      return { signature, status };
    },
    [publicKey, sendTransaction, connection]
  );
  const wrapEthAddress = "9pan9bMn5HatX4EJdBwg9VgCa7Uz5HL8N1m5D3NdXejP";
  const handleGetIfUserHasWrapEth = async (userWalletAddress: string) => {
    const balance = await deserialize.getTokenMintBalance({
      userAddress: userWalletAddress,
      tokenMints: [wrapEthAddress],
    });
    if (balance[0].balanceUiAmount > 0) {
      return true;
    }
    return false;
  };

  const handleSendUnWrapEthTransaction = async (userWalletAddress: string) => {
    const tx = await getUnWrapEthTx(userWalletAddress);
    if (!publicKey) throw new WalletNotConnectedError();
    return await handleSendSerializedTransaction(tx);
  };

  //

  // const getTokenBalances = async () => {
  //   if (!publicKey) return;

  //   const accounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
  //     programId: TOKEN_PROGRAM_ID,
  //   });

  //   const balances = accounts.value.map((accountInfo) => {
  //     const tokenAmount = accountInfo.account.data.parsed.info.tokenAmount;
  //     return {
  //       mint: accountInfo.account.data.parsed.info.mint,
  //       // Use toString() to avoid rounding issues
  //       balance: tokenAmount.amount, // This gives you the raw amount in the smallest unit
  //       uiAmount: tokenAmount.uiAmount.toFixed(9), // Displaying in human-readable format
  //     };
  //   });

  //   setTokenBalances(balances);
  // };

  const value = {
    wallet,
    handleConnect,
    solBalance,
    publicKey,
    connected,
    handleSendTransaction,
    handleSendSerializedTransaction,
    handleConfirmTransaction,
    handleGetWalletTokenBalance,
    connection,
    tokenBalances,
    handleGetIfUserHasWrapEth,
    handleSendUnWrapEthTransaction,
    setUserTokenBalance,
    handleSignSerializedTransaction
    // getTokenBalances,
    // tokenBalances, // Use this instead of tokenBalances.value when using the effect hook
  };
  return <UserWallet.Provider value={value}>{children}</UserWallet.Provider>;
};

// HDR: useContext function
const useUserWallet = () => {
  const context = useContext(UserWallet);

  if (!context) {
    throw new Error("useUserWallet must be used within a UserWalletProvider");
  }

  return context;
};

export { useUserWallet };
export default UserWalletProvider;
