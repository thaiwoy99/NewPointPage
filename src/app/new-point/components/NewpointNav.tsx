'use client'
import Image from 'next/image';

import { useState } from 'react';
import { Moon, Send, Menu, X } from 'lucide-react';

// Mock Logo component - replace with your actual Logo component
const Logo = () => (
  <div className="flex items-center space-x-2">
   <Image
                   src="/images/Logomark.png"
                   alt="Plane"
                   width={25}
                   height={10}
                   className=""
                   priority
                 />
              
    <span className="text-white font-normal text-lg">Deserialize</span>
  </div>
);

const NewpointNav = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Products', href: '#', active: true },
    { name: 'Developers', href: '#', active: false },
    { name: 'About', href: '#', active: false },
    { name: 'Community', href: '#', active: false },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className=" w-full  bg-gradient-to-r from-[#162B24] to-[#3FFF3D]/[0.00] backdrop-blur-[62.6px] border-b border-[#162B24]/20 fixed top-0 z-100 py-2 ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Logo />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-2 text-[22px] font-light transition-colors duration-200 ${
                    item.active
                      ? 'text-[#3FFF3D] border-b-2 border-[#3FFF3D]'
                      : 'text-gray-300 hover:text-[#3FFF3D]'
                  }`}
                >
                  {item.name}
                </a>
              ))}
            </div>
          </div>

          {/* Desktop Right Section */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle */}
            <button className="p-2 rounded-full bg-[#6D7D70] hover:bg-gray-600/50 transition-colors duration-200">
              <Moon className="w-5 h-5 text-black" />
            </button>
            
            {/* Launch App Button */}
            <button className="flex items-center space-x-2 bg-[#387533] t px-4 py-2 rounded-lg font-medium hover:bg-[#3FFF3D]/90 transition-colors duration-200">
              <Image
                   src="/images/Logoplane.png"
                   alt="Plane"
                   width={25}
                   height={10}
                   className=""
                   priority
                 />
   
              <span className='text-white font-medium text-base'>Launch App</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-[#3FFF3D]"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-gradient-to-r from-[#162B24] to-[#3FFF3D]/[0.00] backdrop-blur-sm border-t border-[#162B24]/20">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={`block px-3 py-2 text-base font-medium transition-colors duration-200 rounded-md ${
                  item.active
                    ? 'text-[#3FFF3D] bg-[#3FFF3D]/10'
                    : 'text-gray-300 hover:text-[#3FFF3D] hover:bg-gray-700/50'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </a>
            ))}
          </div>
          
          {/* Mobile Right Section */}
          <div className="px-4 py-3 border-t border-[#162B24]/20">
            <div className="flex items-center justify-between">
              <button className="p-2 rounded-full bg-[#6D7D70] hover:bg-gray-600/50 transition-colors duration-200">
                <Moon className="w-5 h-5 text-black" />
              </button>
              
              <button className="flex items-center space-x-2 bg-[#387533] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#3FFF3D]/90 transition-colors duration-200">
                 <Image
                   src="/images/Logoplane.png"
                   alt="Plane"
                   width={25}
                   height={10}
                   className=""
                   priority
                 />
   
                <span>Launch App</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default NewpointNav;