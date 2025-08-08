import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import AppWalletProvider from "@/context/AppWalletProvider";
import WalletProvider from "@/context/WalletProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import UserWalletProvider from "@/context/user-wallet-provider";
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/sonner";
import { Montserrat } from "next/font/google";
import Header from "@/components/Header";
import { Inter } from "next/font/google";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";

//const inter = Inter({ subsets: ['latin'] });

//const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'] });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Deserialize DEX",
  description: "A Web3 DEX Aggregator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // <html lang="en" className={spaceGrotesk.className} suppressHydrationWarning>
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${montserrat.className} antialiased bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-300`}
      >
        <ThemeProvider>
          <UserWalletProvider>
            <WalletProvider>
              <AppWalletProvider>
                <Toaster />
                {/*<Navbar />*/}
                {/* <Header /> */}

                {children}
              </AppWalletProvider>
            </WalletProvider>
          </UserWalletProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
