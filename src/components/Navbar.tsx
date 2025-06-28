"use client";
import React, { useEffect, useState } from "react";
import Logo from "@/components/general/Logo";
import mixpanel from "@/lib/mixpanel";
import { cn } from "@/lib/utils";
import { Menu, X, Sun, Moon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import MaxWidth from "@/components/general/MaxWidth";
import { NavLinks } from "@/data/navlinks";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import CustomConnectButton from "@/components/general/CustomConnectButton";
import AnnouncementBanner from "@/components/general/AnnonceMentBanner";
import Footer from "@/components/Footer";
// import PointsBadge from "../general/PointsBadge";

const Navbar = () => {
  const { setTheme, theme } = useTheme();
  const { setVisible } = useWalletModal();
   const { connecting, connected, wallet, publicKey } = useWallet();
  // const { setVisible } = useWalletModal(); // Hook to control the modal
  const pathName = usePathname();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // HDR: PREVENT SCROLL WHEN OPEN OR VISIBLE
  useEffect(() => {
    if (showMobileMenu) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }
  }, [showMobileMenu]);

  // HDR:CLOSE DROPDOWN AND MENU
  const closeMenu = () => {
    setShowMobileMenu(false);
  };
  const announcements = [
    {
      announcement: "Deserialize secret points? 👀",
      href: "https://points.deserialize.xyz",
    },
    {
      announcement: "🎉 Deserialize Eclipse Boost Is Live!",
      href: "https://tap.eclipse.xyz/",
    },
  ];

  const handleClick = () => {
    if (!connected) {
      setVisible(true); // Open the modal if not connected
    } else {
      console.log("Wallet already connected!");
      // Optionally, add disconnect logic here
    }
  };


  return (
    <>
      <header className=" dark:bg-zinc-900 bg-zinc-50 pb-3 fixed z-[20] w-full top-0">
        <AnnouncementBanner announcements={announcements} />

        <MaxWidth>
          <nav className="flex items-center lg:gap-x-8 md:gap-x-6 gap-x-4">
            <div className="md:hidden flex md:invisible visible">
              <button onClick={() => setShowMobileMenu(true)}>
                <Menu size={30} />
              </button>
            </div>

            <div
              className={cn(
                "flex items-center justify-between gap-x-5 gap-y-10  py-2 flex-1 md:justify-start"
              )}
            >
              {/* SUB: LOGO */}
              <div
                onClick={() => {
                  setShowMobileMenu(false);
                }}
              >
                <Logo />
              </div>
              {/* SUB: NAVLINKS */}
              <div
                className={cn(
                  "my-5 flex flex-col gap-x-2 gap-y-6 z-[300] md:my-0 md:flex-row md:items-center  md:gap-x-4 fixed md:static dark:bg-zinc-900 bg-zinc-50 inset-0 -top-5 -left-[120%] transition-all duration-500 ease-in-out md:w-auto w-full h-screen md:h-fit pb-12 pt-14 md:pt-0 md:pb-0 md:py-0 md:px-0 px-6 ",
                  showMobileMenu && "left-0"
                )}
              >
                <div className="md:hidden flex absolute right-4 top-6 md:invisible visible">
                  <button onClick={() => setShowMobileMenu(false)}>
                    <X size={25} />
                  </button>
                </div>
                {NavLinks.map(({ name, link, tag }) => {
                  return (
                    <Link
                      href={link ?? "#"}
                      key={name}
                      onClick={() => {
                        closeMenu();

                        mixpanel.track("Navigation Link Clicked", {
                          name,
                          link: link ?? "#",
                          pathname: window.location.pathname,
                        });

                        console.log({
                          name,
                          link: link ?? "#",
                          tag: tag ?? null,
                          pathname: window.location.pathname,
                        });
                      }}
                      className={cn(
                        "flex items-center gap-1 text-sm font-medium transition-all duration-300 ease-in-out hover:opacity-75",
                        pathName === link && "text-teal-500"
                      )}
                    >
                      {name}
                      {tag && (
                        <span
                          className={cn(
                            "text-[8px] px-[0.25rem] py-1 rounded-sm font-semibold uppercase tracking-wider text-white backdrop-blur-sm",
                            "border border-white/10 shadow-md animate-pulse flex items-center",
                            tag === "New" &&
                              "bg-[#10B981] drop-shadow-[0_0_3px_#10B981]",
                            tag === "Hot" &&
                              "bg-[#F97316] drop-shadow-[0_0_3px_#F97316]"
                          )}
                        >
                          {tag}
                        </span>
                      )}
                    </Link>
                  );
                })}
                <Button
                  className="p-1.5 md:hidden roundd-full w-fit"
                  variant="secondary"
                  onClick={() => {
                    setTheme((prev) => {
                      if (prev === "dark") {
                        return "light";
                      } else {
                        return "dark";
                      }
                    });
                  }}
                  aria-label="Switch theme"
                >
                  {theme === "dark" ? (
                    <Sun className="!size-5" />
                  ) : (
                    <Moon className="!size-5" />
                  )}
                </Button>
                <div className="w-full sm:hidden flex">
                  <Footer />
                </div>
              </div>

              {/* SUB: Search */}
              {/* <div className="md:ml-auto -order-1 md:order-none">Search</div> */}

              {/* SUB: SUB BUTTON */}
              <div className="flex items-center gap-2 md:ml-auto">
                <Button
                  className="p-1.5 h-fit md:inline-block hidden"
                  variant="secondary"
                  onClick={() => {
                    setTheme((prev) => {
                      if (prev === "dark") {
                        return "light";
                      } else {
                        return "dark";
                      }
                    });
                  }}
                  aria-label="Switch theme"
                >
                  {theme === "dark" ? (
                    <Sun className="!size-5" />
                  ) : (
                    <Moon className="!size-5" />
                  )}
                </Button>
                {/* <PointsBadge /> */}
                {/* <Button onClick={handleClick}>conn</Button> */}

                <div onClick={handleClick} style={{ display: "contents" }}>
                  <CustomConnectButton isMobileOpen={false} />
                </div>
              
              
              </div>
            </div>
          </nav>
        </MaxWidth>
      </header>
    </>
  );
};

export default React.memo(Navbar);


// "use client";
// import React, { useEffect, useState } from "react";
// import Logo from "@/components/general/Logo";

// import { cn } from "@/lib/utils";
// import { Menu, Moon, Sun, X } from "lucide-react";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import MaxWidth from "@/components/general/MaxWidth";
// import { NavLinks } from "@/data/navlinks";
// import { Button } from "@/components/ui/button";
// import { useTheme } from "next-themes";
// import CustomConnectButton from "@/components/general/CustomConnectButton";
// import AnnouncementBanner from "@/components/general/AnnonceMentBanner";
// import Footer from "@/components/Footer";
// import PointsBadge from "@/components/general/PointsBadge";
// import { BsFillLightningChargeFill } from "react-icons/bs";
// import { BsStars } from "react-icons/bs";

// const Navbar = () => {
//   const { setTheme, theme } = useTheme();
//   const pathName = usePathname();
//   const [showMobileMenu, setShowMobileMenu] = useState(false);

//   // HDR: PREVENT SCROLL WHEN OPEN OR VISIBLE
//   useEffect(() => {
//     if (showMobileMenu) {
//       document.body.classList.add("no-scroll");
//     } else {
//       document.body.classList.remove("no-scroll");
//     }
//   }, [showMobileMenu]);

//   // HDR:CLOSE DROPDOWN AND MENU
//   const closeMenu = () => {
//     setShowMobileMenu(false);
//   };
//   const announcements = [
//     {
//       announcement: "Deserialize secret points? 👀",
//       href: "https://points.deserialize.xyz",
//     },
//     {
//       announcement: "🎉 Deserialize Eclipse Boost Is Live!",
//       href: "https://tap.eclipse.xyz/",
//     },
//   ];

//   return (
//     <>
//       <header className=" dark:bg-zinc-900 bg-zinc-50 fixed md:py-3 py-2 z-[20] w-full top-0">
//         <AnnouncementBanner announcements={announcements} />

//         <MaxWidth>
//           <nav className="flex items-center lg:gap-x-8 md:gap-x-6 gap-x-4">
//             <div className="md:hidden flex md:invisible visible">
//               <button onClick={() => setShowMobileMenu(true)}>
//                 <Menu size={30} />
//               </button>
//             </div>

//             <div
//               className={cn(
//                 "flex items-center justify-between gap-x-5 gap-y-10  py-2 flex-1 md:justify-start"
//               )}
//             >
//               {/* SUB: LOGO */}
//               <div
//                 onClick={() => {
//                   setShowMobileMenu(false);
//                 }}
//               >
//                 <Logo />
//               </div>
//               {/* SUB: NAVLINKS */}
//               <div
//                 className={cn(
//                   "my-5 flex flex-col gap-x-2 gap-y-6 z-[300] md:my-0 md:flex-row md:items-center  md:gap-x-4 fixed md:static dark:bg-zinc-900 bg-zinc-50 inset-0 -top-5 -left-[120%] transition-all duration-500 ease-in-out md:w-auto w-full h-screen md:h-fit pb-12 pt-14 md:pt-0 md:pb-0 md:py-0 md:px-0 px-6 ",
//                   showMobileMenu && "left-0"
//                 )}
//               >
//                 <div className="md:hidden flex absolute right-4 top-6 md:invisible visible">
//                   <button onClick={() => setShowMobileMenu(false)}>
//                     <X size={25} />
//                   </button>
//                 </div>
//                 {NavLinks.map(({ name, link, tag }) => {
//                   return (
//                     <Link
//                       href={link ?? "#"}
//                       key={name}
//                       onClick={closeMenu}
//                       className={cn(
//                         "flex items-center gap-1 text-sm font-medium transition-all duration-300 ease-in-out hover:opacity-75",
//                         pathName === link && "text-teal-500"
//                       )}
//                     >
//                       {name}
//                       {tag && (
//                         <span
//                           className={cn(
//                             "text-[8px] px-1 py-0.1 rounded-md font-semibold uppercase tracking-wider text-white backdrop-blur-sm",
//                             "border border-white/10 shadow-md animate-pulse flex items-center",
//                             tag === "New" &&
//                               "bg-[#10B981] drop-shadow-[0_0_3px_#10B981]",
//                             tag === "Hot" &&
//                               "bg-[#F97316] drop-shadow-[0_0_3px_#F97316]"
//                           )}
//                         >
//                           {tag}
//                         </span>
//                       )}
//                     </Link>
//                   );
//                 })}
//                 {/* <Button
//                   className="p-1.5 md:hidden roundd-full w-fit"
//                   variant="secondary"
//                   onClick={() => {
//                     setTheme((prev) => {
//                       if (prev === "dark") {
//                         return "light";
//                       } else {
//                         return "dark";
//                       }
//                     });
//                   }}
//                   aria-label="Switch theme"
//                 >
//                   {theme === "dark" ? (
//                     <Sun className="!size-5" />
//                   ) : (
//                     <Moon className="!size-5" />
//                   )}
//                 </Button> */}
//                 <div className="w-full sm:hidden flex">
//                   <Footer />
//                 </div>
//               </div>

//               {/* SUB: Search */}
//               {/* <div className="md:ml-auto -order-1 md:order-none">Search</div> */}

//               {/* SUB: SUB BUTTON */}
//               <div className="flex items-center gap-2 md:ml-auto">
//                 {/* <Button
//                   className="p-1.5 h-fit md:inline-block hidden"
//                   variant="secondary"
//                   onClick={() => {
//                     setTheme((prev) => {
//                       if (prev === "dark") {
//                         return "light";
//                       } else {
//                         return "dark";
//                       }
//                     });
//                   }}
//                   aria-label="Switch theme"
//                 >
//                   {theme === "dark" ? (
//                     <Sun className="!size-5" />
//                   ) : (
//                     <Moon className="!size-5" />
//                   )}
//                 </Button> */}
//                 <PointsBadge />
//                 <CustomConnectButton isMobileOpen={showMobileMenu} />
//               </div>
//             </div>
//           </nav>
//         </MaxWidth>
//       </header>
//     </>
//   );
// };

// export default React.memo(Navbar);



// "use client";

// import { Button } from "@/components/ui/button";

// export const Navbar = () => {
//   return (
//     <nav className="w-full bg-gray-950 py-4 px-6 flex justify-between items-center fixed top-0 z-50 shadow-md">
//       <h1 className="text-xl font-bold text-white">Web3 Tasks</h1>
//       <div>
//         <Button variant="outline">Connect Wallet</Button>
//       </div>
//     </nav>
//   );
// };
