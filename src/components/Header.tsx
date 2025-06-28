// @ts-nocheck

'use client';

import Link from 'next/link';
import { useTheme } from '@/providers/ThemeProvider';
import { Button } from '@/components/ui/button';
import Image from "next/image";
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronDown, Sun, Moon } from 'lucide-react';

const navItems = [
  { name: 'SWAP', href: 'https://www.deserialize.xyz/' },
  { name: 'BRIDGE', href: 'https://bridge.deserialize.xyz/' },
  // { name: 'LIQUIDITY', href: '#' },
  // { name: 'PORTFOLIO', dropdown: true, items: ['Overview', 'History'] },
  { name: 'POINTS', href: '/' },
  // { name: 'TASKS', href: '/tasks' },
  // { name: 'INCENTIVE HUB', href: '/incentive' },
  // { name: 'MORE', dropdown: true, items: ['Docs', 'Support'] },
];

const walletLogoMap = {
  'Phantom': 'https://187760183-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2F-MVOiF6Zqit57q_hxJYp%2Ficon%2FU7kNZ4ygz4QW1rUwOuTT%2FWhite%20Ghost_docs_nu.svg?alt=media&token=447b91f6-db6d-4791-902d-35d75c19c3d1',
  'Backpack': 'https://i.ibb.co/gZPKHW0c/Standalone-Icon-Red.png',
};



// Function to truncate the wallet address
const truncateAddress = (address: String | null) => {
  if (!address) return '';
  const start = address.slice(0, 4);
  const end = address.slice(-4);
  return `${start}...${end}`;
};

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { setVisible } = useWalletModal(); // Hook to control the modal
  const { connecting, connected, wallet, publicKey } = useWallet(); // Hook to get wallet state

  const walletName = wallet?.adapter?.name;
  const walletLogoUrl = walletLogoMap[walletName] || '';
  const walletLogo = connected && walletLogoUrl ? (
    <img
      src={walletLogoUrl}
      alt={walletName + " Logo"}
      style={{ width: '20px', height: '20px', marginRight: '8px' }}
    />
  ) : null;

  const handleClick = () => {
    if (!connected) {
      setVisible(true); // Open the modal if not connected
    } else {
      console.log("Wallet already connected!");
      // Optionally, add disconnect logic here
    }
  };

  return (
    <header className="sticky top-0 left-0 w-full px-6 py-4 flex items-center justify-between border-b transition-all duration-300
      bg-white dark:bg-zinc-900 shadow-md border-gray-200 dark:border-zinc-700 z-50">

      {/* Left: Logo & Name */}
      <div className="flex items-center space-x-2">
      {/* <Circle className="h-8 w-8 text-primary" /> */}
      <Image
        src="https://www.deserialize.xyz/_next/image?url=%2Fimages%2Flogo.png&w=48&q=75"
        alt="Deserialize Logo"
        width={40}
        height={40}
        className="rounded-full"
      />
      <span className="text-xl font-bold text-gray-900 dark:text-white">Deserialize</span>
      </div>

      {/* Center: Navigation */}
      <nav className="hidden md:flex space-x-6">
      {navItems.map((item, index) =>
        item.dropdown ? (
        <Dropdown key={index} title={item.name} items={item.items} />
        ) : (
        <Link key={index} href={item.href} className="hover:text-primary text-gray-900 dark:text-gray-300">
          {item.name}
        </Link>
        )
      )}
      </nav>

      {/* Right: Theme Toggle & Connect Button */}
      <div className="flex items-center space-x-4">
      <Button variant="ghost" size="icon" onClick={toggleTheme}>
        {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </Button>
      <Button onClick={handleClick} variant="outline" className="border-primary dark:text-white hover:bg-primary hover:text-white">
        {connecting ? (
        "Connecting..."
        ) : connected ? (
        <span className="flex items-center">
          {walletLogo}
          {truncateAddress(publicKey?.toBase58())}
        </span>
        ) : (
        "Connect"
        )}
      </Button>
      </div>
    </header>
  );
}

// Dropdown Component
type DropdownProps = {
  title: string;
  items: string[];
};

function Dropdown({ title, items }: DropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center space-x-1 hover:text-primary text-gray-900 dark:text-gray-300">
        <span>{title}</span>
        <ChevronDown className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white">
        {items.map((item, idx) => (
          <DropdownMenuItem key={idx}>
            <Link href="#" className="block px-4 py-2 hover:bg-gray-200 dark:hover:bg-zinc-700">
              {item}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
