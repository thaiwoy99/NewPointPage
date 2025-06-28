// lib/fetchers.ts

type ProtocolStats = {
  name: string;
  logo: string;
  points?: number;
  rank?: number;
  description?: string;
  extra?: Record<string, { value: string | number; url: string }>;
  comingSoon?: boolean;
  isNew?: boolean;
  requiresTwitter?: boolean;
};

export async function fetchUmbraStats(
  address: string | null
): Promise<ProtocolStats> {
  if (!address) {
    return {
      name: "Umbra",
      logo: "https://umbra.finance/favicon.png",
      points: 0,
      rank: 0,
      description: "Private transfers on Umbra",
      extra: {
        epoch0Points: {
          value: 0,
          url: "https://info.umbra.finance/umbra-points/point-distribution-system",
        },
        currentEpochSharePrimary: {
          value: 0,
          url: "https://info.umbra.finance/umbra-points/point-distribution-system",
        },
        ascCurrentEpochShare: {
          value: 0,
          url: "https://scopenft.xyz/explore/ECLIPSE:6ffVbxEZVWtksbXtQbt8xzudyain8MdsVdkkXxvaxznC",
        },
        bitzShare: {
          value: 0,
          url: "https://info.umbra.finance/umbra-points/point-distribution-system",
        },
        bitztradingVolume: {
          value: 0,
          url: "https://info.umbra.finance/umbra-points/point-distribution-system",
        },
      },
    };
  }
  const res = await fetch(
    `https://api2.umbra.finance/campaign/vetoken/1/info/${address}`
  );
  const data = await res.json();

  if (!data) {
    return {
      name: "Umbra",
      logo: "https://umbra.finance/favicon.png",
      points: 0,
      rank: 999,
      description: "Private transfers on Umbra",
      extra: {
        epoch0Points: {
          value: 0,
          url: "https://info.umbra.finance/umbra-points/point-distribution-system",
        },
        //epoch1Points: { value: 0, url: "https://info.umbra.finance/umbra-points/point-distribution-system" },
        currentEpochSharePrimary: {
          value: 0,
          url: "https://info.umbra.finance/umbra-points/point-distribution-system",
        },
        ascCurrentEpochShare: {
          value: 0,
          url: "https://scopenft.xyz/explore/ECLIPSE:6ffVbxEZVWtksbXtQbt8xzudyain8MdsVdkkXxvaxznC",
        },
        bitzShare: {
          value: 0,
          url: "https://info.umbra.finance/umbra-points/point-distribution-system",
        },
        bitztradingVolume: {
          value: 0,
          url: "https://info.umbra.finance/umbra-points/point-distribution-system",
        },
      },
    };
  }
  //
  //
  return {
    name: "Umbra",
    logo: "https://umbra.finance/favicon.png",
    points: data.points ?? 0,
    rank: data.rank ?? 999,
    description: "Private transfers on Umbra",
    extra: {
      epoch0Points: {
        value: data.epoch0Points ?? 0,
        url: "https://info.umbra.finance/umbra-points/point-distribution-system",
      },
      //epoch1Points: { value: data.points ?? 0, url: "https://info.umbra.finance/umbra-points/point-distribution-system" },
      currentEpochSharePrimary: {
        value: data.currentEpochShare.primary.share ?? 0,
        url: "https://info.umbra.finance/umbra-points/point-distribution-system",
      },
      ascCurrentEpochShare: {
        value: data.currentEpochShare.ascHolders.share ?? 0,
        url: "https://scopenft.xyz/explore/ECLIPSE:6ffVbxEZVWtksbXtQbt8xzudyain8MdsVdkkXxvaxznC",
      },
      bitzShare: {
        value: data.currentEpochShare.bitz.share ?? 0,
        url: "https://info.umbra.finance/umbra-points/point-distribution-system",
      },
      bitztradingVolume: {
        value: data.currentEpochShare.bitz.tradingVolume ?? 0,
        url: "https://info.umbra.finance/umbra-points/point-distribution-system",
      },
    },
  };
}

export async function fetchInvariantStats(
  address: string | null
): Promise<ProtocolStats> {
  if (!address) {
    return {
      name: "Invariant",
      logo: "https://eclipse.invariant.app/favicon-32x32.png",
      points: 0,
      rank: 0,
      description: "AMM on Solana with concentrated liquidity",
      extra: {
        LiquidityPoints: {
          value: 0,
          url: "https://eclipse.invariant.app/liquidity",
        },
        SwapPoints: { value: 0, url: "https://eclipse.invariant.app/" },
        last24HourPoints: { value: 0, url: "https://eclipse.invariant.app/" },
      },
    };
  }
  const res = await fetch(
    `https://api.invariant.app/api/eclipse-mainnet/total/${address}?offset=0&size=1`
  );
  const json = await res.json();

  // const lpRes = await fetch(
  //   `https://api.invariant.app/api/eclipse-mainnet/lp/${address}?offset=0&size=1`
  // );
  // const lpJson = await lpRes.json();
  //const lpUser = lpJson.user;

  // const swapsRes = await fetch(
  //   `https://api.invariant.app/api/eclipse-mainnet/swaps/${address}?offset=0&size=1`
  // );
  //const swapsJson = await swapsRes.json();
  //const swapsUser = swapsJson.user;

  const user = json.user;

  const totalItems = json.totalItems ?? 0;
  console.log(
    "user",
    user,
    "totalItems",
    totalItems,
    "swapPointsHex",
    parseInt(user.swapPoints, 16) / 100000000
  );

  if (!user) {
    return {
      name: "Invariant",
      logo: "https://eclipse.invariant.app/favicon-32x32.png",
      points: 0,
      rank: 0,
      description: "AMM on Solana with concentrated liquidity",
      extra: {
        LiquidityPoints: {
          value: 0,
          url: "https://eclipse.invariant.app/liquidity",
        },
        SwapPoints: { value: 0, url: "https://eclipse.invariant.app/" },
        last24HourPoints: { value: 0, url: "https://eclipse.invariant.app/" },
      },
    };
  }
  console.log('Invariant data', user)

  // const points = parseInt(user.points, 1);

  return {
    name: "Invariant",
    logo: "https://eclipse.invariant.app/favicon-32x32.png",
    points: parseInt(user.swapPoints, 16) / 100000000,
    rank: user.rank ?? totalItems + 1,
    description: "AMM on Solana with concentrated liquidity",
    extra: {
      LiquidityPoints: {
        value: user.lpPoints ?? 0,
        url: "https://eclipse.invariant.app/liquidity",
      },
      SwapPoints: {
        value: parseInt(user.swapPoints, 16) / 100000000,
        url: "https://eclipse.invariant.app/",
      },
      last24HourPoints: {
        value: user.last24hPoints,
        url: "https://eclipse.invariant.app/",
      },
    },
  };
}

export async function fetchSolarDexStats(
  address: string | null
): Promise<ProtocolStats> {
  if (!address) {
    // If User Not found, we assign default bottom values to them
    return {
      name: "Solar Dex",
      logo: "https://eclipse.solarstudios.co/images/solar.jpeg",
      points: 0,
      rank: 0,
      description: "DEX on SVM",
      extra: {
        total_liquidity_added: {
          value: 0,
          url: "https://api.solarstudios.co/",
        },
      },
    };
  }
  const res = await fetch("https://api.solarstudios.co/leaderboard");
  const { data } = await res.json();

  if (!Array.isArray(data)) {
    throw new Error("Invalid response from Solar Dex");
  }

  const userIndex = data.findIndex((user) => user.user_id === address);

  if (!userIndex || userIndex === -1) {
    // If User Not found, we assign default bottom values to them
    return {
      name: "Solar Dex",
      logo: "https://eclipse.solarstudios.co/images/solar.jpeg",
      points: 0,
      rank: 0,
      description: "DEX on SVM",
      extra: {
        totalLiquidityAdded: {
          value: 0,
          url: "https://api.solarstudios.co/",
        },
      },
    };
  }

  const userData = data[userIndex];

  return {
    name: "Solar Dex",
    logo: "https://avatars.githubusercontent.com/u/184900682?s=200&amp;v=4",
    points: userData.total_swap_volume ?? 0,
    rank: userData.rank ?? userIndex + 1,
    description: "DEX on SVM",
    extra: {
      total_liquidity_added: {
        value: userData.total_liquidity_added ?? 0,
        url: "https://api.solarstudios.co/",
      },
    },
  };
}

export async function fetchAllDomainsStats(
  address: string | null
): Promise<ProtocolStats> {
  if (!address) {
    return {
      name: "All Domains",
      logo: "https://pbs.twimg.com/profile_images/1859723004705398785/LoFnPgJa_400x400.jpg",
      points: 0,
      rank: 0,
      description: "Web3 domain aggregator",
      extra: {
        boost: { value: 0, url: "https://api.alldomains.id" },
        extraPoints: { value: 0, url: "https://api.alldomains.id" },
        bridgePoints: { value: 0, url: "https://api.alldomains.id" },
        invariantRewards: { value: 0, url: "https://api.alldomains.id" },
      },
    };
  }
  const res = await fetch(`https://api.alldomains.id/user-profile/${address}`, {
    headers: {
      accept: "application/json, text/plain, */*",
      "accept-language": "en-GB,en-NG;q=0.9,en-US;q=0.8,en;q=0.7",
      priority: "u=1, i",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-site",
      "x-onsol-chain": "ECLIPSE",
      Referer: "https://eclipse.alldomains.id/",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    },
    body: null,
    method: "GET",
  });
  const data = await res.json();
  console.log("data: ", data);

  if (!data) {
    return {
      name: "All Domains",
      logo: "https://pbs.twimg.com/profile_images/1859723004705398785/LoFnPgJa_400x400.jpg",
      points: 0,
      rank: 0,
      description: "Web3 domain aggregator",
      extra: {
        boost: { value: 0, url: "https://api.alldomains.id" },
        extraPoints: { value: 0, url: "https://api.alldomains.id" },
        bridgePoints: { value: 0, url: "https://api.alldomains.id" },
        invariantRewards: { value: 0, url: "https://api.alldomains.id" },
      },
    };
  }

  return {
    name: "All Domains",
    logo: "https://pbs.twimg.com/profile_images/1859723004705398785/LoFnPgJa_400x400.jpg",
    points: data.points ?? 0,
    rank: data.ranking ?? 999,
    description: "Web3 domain aggregator",
    extra: {
      boost: { value: data.boost ?? 0, url: "https://api.alldomains.id" },
      extraPoints: {
        value: data.extraPoints ?? 0,
        url: "https://api.alldomains.id",
      },
      bridgePoints: {
        value: data.bridgePoints ?? 0,
        url: "https://api.alldomains.id",
      },
      invariantRewards: {
        value: data.invariantRewards ?? 0,
        url: "https://api.alldomains.id",
      },
    },
  };

  //let us add other extras for all domain

  // {
  //   "progress": 1,
  //   "ranking": 28384,
  //   "boost": 0,
  //   "points": 420,
  //   "twitterHandle": null,
  //   "discordUserId": null,
  //   "referralCode": "7Ky70y",
  //   "mainDomain": null,
  //   "referrals": 0,
  //   "extraPoints": 0,
  //   "bridgePoints": 0,
  //   "serverBoost": 0,
  //   "hasClaimedFreeSolana": false,
  //   "hasClaimedFreeDomain": false,
  //   "domains": {
  //       "own": 1,
  //       "renew": 0
  //   },
  //   "steps": {
  //       "domainOwn": true,
  //       "domainRenew": false,
  //       "twitterFollow": false,
  //       "twitterLinkAccount": false,
  //       "discord": false,
  //       "mainDomain": false,
  //       "bridge": false,
  //       "nftValidators": false,
  //       "laikaToken": false,
  //       "asc": false,
  //       "moonlaunch": false,
  //       "cryptara": false,
  //       "turbotapOg": false,
  //       "invariant": false
  //   },
  //   "invariantRewards": 0
}

export async function fetchFightHorse(
  address: string | null
): Promise<ProtocolStats> {
  if (!address) {
    return {
      name: "Fight.Horse",
      logo: "https://eclipse.fight.horse/_next/image?url=%2Fimages%2Fhorsefun%2Flitehorsehead.png&w=750&q=75",
      points: 0,
      rank: 0,
      description: "AMM on Solana with concentrated liquidity",
    };
  }
  const res = await fetch(
    `https://apieclipse.fight.horse/api/userswallet/leaderboard-position/${address}`
  );
  //console.log('res', res)
  const user = await res.json();
  console.log("datw", user);

  if (!user || !user.position) {
    return {
      name: "Fight.Horse",
      logo: "https://eclipse.fight.horse/_next/image?url=%2Fimages%2Fhorsefun%2Flitehorsehead.png&w=750&q=75",
      points: 0,
      rank: 0,
      description: "AMM on Solana with concentrated liquidity",
    };
  }

  const res2 = await fetch(
    `https://apieclipse.fight.horse/api/userswallet/questprogress/${address}`
  );

  const user2 = await res2.json();

  return {
    name: "Fight Horse",
    logo: "https://eclipse.fight.horse/_next/image?url=%2Fimages%2Fhorsefun%2Flitehorsehead.png&w=750&q=75",
    points: user.totalPoints ?? 0,
    rank: user.position ?? 0,
    description: "MemeCoin Launcher",
    extra: {
      CurrentPoints: {
        value: user2.CurrentPoints ?? 0,
        url: "https://apieclipse.fight.horse",
      },
      PercentageElligible: {
        value: user2.PercentageElligible ?? 0,
        url: "https://apieclipse.fight.horse",
      },
    },

    comingSoon: false,
  };
}

export async function fetchWerm(
  address: string | null
): Promise<ProtocolStats> {
  // const res = await fetch(
  //   `https://apieclipse.fight.horse/api/userswallet/leaderboard-position/${address}`
  // );
  // //console.log('res', res)
  // const user = await res.json();
  // console.log("datw", user);

  // if (!user) {
  //   return {
  //     name: "Fight.Horse",
  //     logo: "https://eclipse.fight.horse/_next/image?url=%2Fimages%2Fhorsefun%2Flitehorsehead.png&w=750&q=75",
  //     points: 0,
  //     rank: 0,
  //     description: "AMM on Solana with concentrated liquidity",
  //   };
  // }

  return {
    name: "Werm",
    logo: "https://pbs.twimg.com/profile_images/1899790614478376960/puBpA1SY_400x400.jpg",
    description: "PvP bet-to-play snake game",
    points: 0,
    rank: 0,
    comingSoon: true,
  };
}

export async function fetchAstrol(
  address: string | null
): Promise<ProtocolStats> {
  if (!address) {
    return {
      name: "Astrol",
      logo: "https://pbs.twimg.com/profile_images/1864015389144838144/ZvK6Wlx0_400x400.jpg",
      points: 0,
      rank: 0,
      description: "Asset Productivity Layer of Eclipse",
    };
  }
  const res = await fetch(
    `https://corsproxy.io/?https://app.astrol.io/api/points?userWallet=${address}`,
    {
      method: "GET",
    }
  );

  // const res = await fetch(
  //   `https://app.astrol.io/api/points?userWallet=${address}`
  // );
  //console.log('res', res)
  const user = await res.json();
  console.log("datw astrol", user);

  if (!user || !user.data) {
    return {
      name: "Astrol",
      logo: "https://pbs.twimg.com/profile_images/1864015389144838144/ZvK6Wlx0_400x400.jpg",
      points: 0,
      rank: 0,
      description: "Asset Productivity Layer of Eclipse",
      extra: {
        referralPoints: {
          value: 0,
          url: "https://app.astrol.io/",
        },
        totalBorrowingPoints: {
          value: 0,
          url: "https://app.astrol.io/",
        },
        totalLendingPoints: {
          value: 0,
          url: "https://app.astrol.io/",
        },
        boost: {
          value: 0,
          url: "https://app.astrol.io/",
        },
      },
    };
  }

  return {
    name: "Astrol",
    logo: "https://pbs.twimg.com/profile_images/1864015389144838144/ZvK6Wlx0_400x400.jpg",
    description: "Asset Productivity Layer of Eclipse",
    points: user.data.total_points ?? 0,
    rank: user.data.rank ?? 0,
    extra: {
      referralPoints: {
        value: user.data.referral_points ?? 0,
        url: "https://app.astrol.io/",
      },
      totalBorrowingPoints: {
        value: user.data.total_borrowing_points ?? 0,
        url: "https://app.astrol.io/",
      },
      totalLendingPoints: {
        value: user.data.total_lending_points ?? 0,
        url: "https://app.astrol.io/",
      },
      boost: {
        value: user.data.boost ?? 0,
        url: "https://app.astrol.io/",
      },
    },
    comingSoon: false,
  };
}

export async function fetchScope(address: string): Promise<ProtocolStats> {
  return {
    name: "Scope",
    logo: "https://pbs.twimg.com/profile_images/1781046529958014976/MApYDPxJ_400x400.jpg",
    description: "Native NFT Launchpad for Eclipse",
    comingSoon: true,
  };
}

export async function fetchSoe(address: string | null, twitterUsername: string | null): Promise<ProtocolStats> {
  console.log("SOE", twitterUsername);
  if (!twitterUsername) {
    // If User Not found, we assign default bottom values to them
    return {
      name: "SOE",
      logo: "https://pbs.twimg.com/profile_images/1874763677900886016/D7dgORxl_400x400.jpg",
      points: 0,
      rank: 0,
      description: "The first NFT collection on Eclipse",
      extra: {
        hyperactivePercent: {
          value: 0,
          url: "https://soetheagent.com/",
        },
        teacherPercent: {
          value: 0,
          url: "https://soetheagent.com/",
        },
        yapperPercent: {
          value: 0,
          url: "https://soetheagent.com/",
        },
      },
      requiresTwitter: true,
      comingSoon: true,
    };
  }

  const res = await fetch("https://api.soetheagent.com/api/leaderboard");
  const { data } = await res.json();

  if (!Array.isArray(data)) {
    throw new Error("Invalid response from Solar Dex");
  }

  console.log('SOE DATA', data)

  // 0xalimo

  const userIndex = data.findIndex((user) => user.username === twitterUsername);

  console.log('SOE', twitterUsername)

  if (!userIndex || userIndex === -1) {
    // If User Not found, we assign default bottom values to them
    return {
      name: "SOE",
      logo: "https://pbs.twimg.com/profile_images/1874763677900886016/D7dgORxl_400x400.jpg",
      points: 0,
      rank: 0,
      description: "The first NFT collection on Eclipse",
      extra: {
        hyperactivePercent: {
          value: 0,
          url: "https://soetheagent.com/",
        },
        teacherPercent: {
          value: 0,
          url: "https://soetheagent.com/",
        },
        yapperPercent: {
          value: 0,
          url: "https://soetheagent.com/",
        },
      },
      requiresTwitter: true,
      comingSoon: true,
    };
  }

  console.log('userIndex', data[userIndex])


  return {
    name: "SOE",
    logo: "https://pbs.twimg.com/profile_images/1874763677900886016/D7dgORxl_400x400.jpg",
    description: "AI Agent for all things @ Eclipse",
    rank: data[userIndex].rank ?? 0,
    points: data[userIndex].points ?? 0,
    extra: {
      hyperactivePercent: {
        value: data[userIndex].hyperactive_percent ?? 0,
        url: "https://soetheagent.com/",
      },
      teacherPercent: {
        value: 0,
        url: data[userIndex].teacher_percent ?? 0,
      },
      yapperPercent: {
        value: 0,
        url: data[userIndex].yapper_percent ?? 0,
      },
    },
    requiresTwitter: true,
    comingSoon: true,
  };
}

export async function fetchValidators(address: string): Promise<ProtocolStats> {
  return {
    name: "Validators",
    logo: "https://pbs.twimg.com/profile_images/1773792950327369728/oL6iyBTK_400x400.jpg",
    description: "The first NFT collection on Eclipse",
    comingSoon: true,
  };
}

// /ensofi/fetch-ranking.js

export async function fetchEnsoFi(address: string | null): Promise<ProtocolStats> {
  if (!address) {
    return {
      name: "EnsoFi",
      logo: "https://pbs.twimg.com/profile_images/1743944537612177408/Ym9-uidp_400x400.jpg",
      points: 0,
      rank: 0,
      description: "Cross-chain DeFi Hub",
      extra: {
        rank: {
          value: 0,
          url: "https://app.ensofi.xyz/",
        },
        totalPoints: {
          value: 0,
          url: "https://app.ensofi.xyz/",
        }
      },
    };
  }
  const baseUrl = "https://service.ensofi.xyz/api/collab/ranking";
  const apiKey = "ohX5cjihmud6br0sPa90Dexp0rGhmQct";

  const url = new URL(baseUrl);
  url.searchParams.append("network", "ECLIPSE");
  url.searchParams.append("walletAddress", address);

  // try {
  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      accept: "/*",
      "x-api-key": apiKey,
    },
  });

  const data = await response.json();
  console.log("User Ranking:", data, data.data.totalPoints);

  if (!data) {
    return {
      name: "EnsoFi",
      logo: "https://pbs.twimg.com/profile_images/1743944537612177408/Ym9-uidp_400x400.jpg",
      points: 0,
      rank: 0,
      description: "Cross-chain DeFi Hub",
      extra: {
        rank: {
          value: 0,
          url: "https://app.ensofi.xyz/",
        },
        totalPoints: {
          value: 0,
          url: "https://app.ensofi.xyz/",
        },
      },
    };
  }

  return {
    name: "EnsoFi",
    logo: "https://pbs.twimg.com/profile_images/1743944537612177408/Ym9-uidp_400x400.jpg",
    description: "Cross-chain DeFi Hub",
    points: data.data.totalPoints,
    rank: data.data.rank,
    extra: {
      rank: {
        value: data.data.rank,
        url: "https://app.ensofi.xyz/",
      },
      totalPoints: {
        value: data.data.totalPoints,
        url: "https://app.ensofi.xyz/",
      },
    },
    comingSoon: false,
  };
};

export async function fetchEDAS(address: string | null): Promise<ProtocolStats> {
  if (!address) {
    return {
      name: "EDAS",
      logo: "https://pbs.twimg.com/profile_images/1890085601376096256/zpvAIh5__400x400.jpg",
      points: 0,
      rank: 0,
      description: "Cross-chain DeFi Hub",
      extra: {
        rank: {
          value: 0,
          url: "https://www.edas.ensofi.xyz/",
        },
        totalPoints: {
          value: 0,
          url: "https://www.edas.ensofi.xyz/",
        }
      },
    };
  }
  const baseUrl = "https://service.ensofi.xyz/api/collab/ranking";
  const apiKey = "ohX5cjihmud6br0sPa90Dexp0rGhmQct";

  const url = new URL(baseUrl);
  url.searchParams.append("network", "ECLIPSE");
  url.searchParams.append("walletAddress", address);

  // try {
  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      accept: "/*",
      "x-api-key": apiKey,
    },
  });

  const data = await response.json();
  console.log("User Ranking:", data, data.data.totalPoints);

  if (!data) {
    return {
      name: "EDAS",
      logo: "https://pbs.twimg.com/profile_images/1890085601376096256/zpvAIh5__400x400.jpg",
      points: 0,
      rank: 0,
      description: "Cross-chain DeFi Hub",
      extra: {
        rank: {
          value: 0,
          url: "https://www.edas.ensofi.xyz/",
        },
        totalPoints: {
          value: 0,
          url: "https://www.edas.ensofi.xyz/",
        },
      },
    };
  }

  return {
    name: "EDAS",
    logo: "https://pbs.twimg.com/profile_images/1890085601376096256/zpvAIh5__400x400.jpg",
    description: "Cross-chain DeFi Hub",
    points: data.data.totalPoints,
    rank: data.data.rank,
    extra: {
      rank: {
        value: data.data.rank,
        url: "https://www.edas.ensofi.xyz/",
      },
      totalPoints: {
        value: data.data.totalPoints,
        url: "https://www.edas.ensofi.xyz/",
      },
    },
    comingSoon: false,
  };
};


// Example usage:
//fetchUserRanking('SOLANA', '5bqxGZtbwrG91dF11kZyo2ZaytkTp86HvSgtqoXZ3Qh4');


export async function fetchEnsoFi2(
  address: string | null
): Promise<ProtocolStats> {
  if (!address) {
    return {
      name: "EnsoFi",
      logo: "https://pbs.twimg.com/profile_images/1743944537612177408/Ym9-uidp_400x400.jpg",
      points: 0,
      rank: 0,
      description: "Cross-chain DeFi Hub",
    };
  }
  const res = await fetch(
    "https://app.ensofi.xyz/dapp-service/point-system/earned-reward",
    {
      headers: {
        accept: "application/json",
        "accept-language": "en-US,en;q=0.9",
        authorization:
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4ODg4MCIsImlhdCI6MTc0NTc5MTU5N30.QN_-JipBGYUIepSXEJyp7gZQ1ciy8vgWlIk3FgdjvlA",
        "if-none-match": 'W/"20e-jZm/tcFE9T5da324gs7GFrqyXvk"',
        "ngrok-skip-browser-warning": "69420",
        priority: "u=1, i",
        "sec-ch-ua":
          '"Google Chrome";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        cookie:
          "_ga=GA1.1.1726858927.1744302475; eclipse-token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4ODg4MCIsImlhdCI6MTc0NTc5MTU5N30.QN_-JipBGYUIepSXEJyp7gZQ1ciy8vgWlIk3FgdjvlA; _ga_GNVVWBL3J9=GS2.1.s1746367743$o3$g1$t1746368055$j0$l0$h0; _ga_623SWQHK6Z=GS1.1.1746367731.6.1.1746368055.60.0.0; _ga_J83SN75STK=GS1.1.1746367731.6.1.1746368055.60.0.0; AWSALBTG=MqZKDRHuA3vIRAyi+ll2Fo4nypgdW8qWJGHRjOIha4SYEBlb6X/xMqK5Z/79v58GPc1Wf6UxJn8xcGrECcvAPksXOuyB2Dbbw0mrovZGhX0AOH0v0t14HV2CbjpN7RNdB0l++MUyAarn98u1Hqfvb8Wzp9+5zs1XuictV9AVuvoF+tSMtSlbu8i5J3fvicvemg723OUwPaQPOAIHjiBe/ccnfUuvjIrogeYgBXaZedVSyZNehEK2pYODl40hx21L; AWSALBTGCORS=MqZKDRHuA3vIRAyi+ll2Fo4nypgdW8qWJGHRjOIha4SYEBlb6X/xMqK5Z/79v58GPc1Wf6UxJn8xcGrECcvAPksXOuyB2Dbbw0mrovZGhX0AOH0v0t14HV2CbjpN7RNdB0l++MUyAarn98u1Hqfvb8Wzp9+5zs1XuictV9AVuvoF+tSMtSlbu8i5J3fvicvemg723OUwPaQPOAIHjiBe/ccnfUuvjIrogeYgBXaZedVSyZNehEK2pYODl40hx21L; AWSALB=R60eSvIUkoAT18y7kqYfIMbzoEUIxrCJ0m/U4LZoepDQDMm3Liq+bWO7GYrYJsvXF0f1VVjF6YhbXn27I3by0iDenwZTMi2gkUJwC0RZwRustQQeX/p0WDrjmbsP16p5ClTnE4eZm2s10d0rEy3PtTlJ8EV4LEm1/H/GtUx0zjDIFPDA1Tzq1Nc4NWDFdw==; AWSALBCORS=R60eSvIUkoAT18y7kqYfIMbzoEUIxrCJ0m/U4LZoepDQDMm3Liq+bWO7GYrYJsvXF0f1VVjF6YhbXn27I3by0iDenwZTMi2gkUJwC0RZwRustQQeX/p0WDrjmbsP16p5ClTnE4eZm2s10d0rEy3PtTlJ8EV4LEm1/H/GtUx0zjDIFPDA1Tzq1Nc4NWDFdw==",
        Referer: "https://app.ensofi.xyz/point",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
      body: null,
      method: "GET",
    }
  );
  // EiontuvqHmZm4FSAs6LtaaYk1kmyHYY6bPRfyZf5k6KP
  // const res = await fetch(
  //   `https://app.ensofi.xyz/dapp-service/loans/count?network=ECLIPSE&borrowerAddress=${address}&statusFilter=PROCESSING`,
  //   {
  //     method: "GET",
  //   }
  // );
  const user = await res.json();
  console.log("datw ensofi", user);

  if (!user || user.data === 0) {
    return {
      name: "EnsoFi",
      logo: "https://pbs.twimg.com/profile_images/1743944537612177408/Ym9-uidp_400x400.jpg",
      points: 0,
      rank: 0,
      description: "Cross-chain DeFi Hub",
    };
  }

  return {
    name: "EnsoFi",
    logo: "https://pbs.twimg.com/profile_images/1743944537612177408/Ym9-uidp_400x400.jpg",
    description: "Cross-chain DeFi Hub",
    points: 0,
    rank: 0,
    comingSoon: false,
  };
}

export async function fetchAfterSchoolClub(
  address: string
): Promise<ProtocolStats> {
  return {
    name: "After School Club",
    logo: "https://pbs.twimg.com/profile_images/1774801658897424384/CYDsqT0K_400x400.jpg",
    description: "The Official Genesis NFT Collection of Eclipse",
    comingSoon: true,
  };
}

export async function fetchLifinity(address: string): Promise<ProtocolStats> {
  return {
    name: "Lifinity",
    logo: "https://pbs.twimg.com/profile_images/1609927143601098752/Iyjh31Pd_400x400.jpg",
    description: "Oracle-based DEX on Eclipse and Solana",
    comingSoon: true,
  };
}

export async function fetchPixelWar(address: string): Promise<ProtocolStats> {
  return {
    name: "Pixel War",
    logo: "https://pbs.twimg.com/profile_images/1906119814537441280/fv5IE0D2_400x400.jpg",
    description: "Pixel War game on Eclipse",
    comingSoon: true,
  };
}

export async function fetchNeuroGuardians(
  address: string | null
): Promise<ProtocolStats> {
  return {
    name: "NeuroGuardians",
    logo: "https://neuroguardians.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo.e3e0e0c8.png&w=96&q=75",
    description: "Building the next-gen Web3 gaming on Eclipse",
    comingSoon: true,
  };
}

export async function fetchStackEM(address: string): Promise<ProtocolStats> {
  return {
    name: "StackEM",
    logo: "https://pbs.twimg.com/profile_images/1880040107971158016/kEu-dOSP_400x400.jpg",
    description: "Stacking game on Eclipse",
    comingSoon: true,
  };
}

export async function fetchCelestialMammoth(
  address: string
): Promise<ProtocolStats> {
  return {
    name: "CelestialMammoth",
    logo: "https://pbs.twimg.com/profile_images/1894527107574669312/wR-gBdOQ_400x400.jpg",
    description: "pfp collection on Eclipse",
    comingSoon: true,
  };
}

export async function fetchOrca(address: string): Promise<ProtocolStats> {
  return {
    name: "Orca",
    logo: "https://pbs.twimg.com/profile_images/1898099113859678208/1NOETPA8_400x400.png",
    description: "Provide liquidity on Eclipse and Solana",
    comingSoon: true,
  };
}

export async function fetchMintyMarket(
  address: string
): Promise<ProtocolStats> {
  return {
    name: "Minty Market",
    logo: "https://pbs.twimg.com/profile_images/1902429628423086080/FSDQMdI7_400x400.png",
    description: "NFT marketplace powered by Eclipse",
    comingSoon: true,
  };
}

export async function fetchCryptaraConquest(
  address: string
): Promise<ProtocolStats> {
  return {
    name: "Cryptara Conquest",
    logo: "https://pbs.twimg.com/profile_images/1855841648015527936/H0CwWiQM_400x400.jpg",
    description: "Multichain top-down 2D",
    comingSoon: true,
  };
}

export async function fetchCastleDash(address: string): Promise<ProtocolStats> {
  return {
    name: "Castle Dash",
    logo: "https://pbs.twimg.com/profile_images/1900624201335373824/v9RJErGr_400x400.jpg",
    description: "Thrilling, round-based capture the flag game",
    comingSoon: true,
  };
}

export async function fetchSave(address: string): Promise<ProtocolStats> {
  return {
    name: "Save",
    logo: "https://save-assets.s3.us-east-1.amazonaws.com/assets/tokens/save.eclipse.svg",
    description: "Lending Protocol on Eclipse and Solana",
    comingSoon: true,
  };
}

export async function fetchRollItUp(address: string): Promise<ProtocolStats> {
  return {
    name: "Roll It Up",
    logo: "https://pbs.twimg.com/profile_images/1894266979177189376/06UrVnky_400x400.jpg",
    description: "Memecoin Launchpad on Eclipse",
    comingSoon: true,
  };
}

export async function fetchMoonlaunch(
  address: string | null
): Promise<ProtocolStats> {
  //       if (!address) {
  //         return {
  //           name: "Moonlaunch",
  //           logo: "https://pbs.twimg.com/profile_images/1873935722950123521/-zO3SgqT_400x400.jpg",
  //           points: 0,
  //           rank: 0,
  //           description: "AMM on Solana with concentrated liquidity",
  //         };
  //       }

  // const res = await fetch(
  //   `https://corsproxy.io/?https://api.moonlaunch.fun/api/users/user-rankings?address=vQSDW6FTh7wB7EWnB66SD67ZixmPjPjV7EpzZhzwKvC`,
  //   {
  //     method: "GET",
  //   }
  // );


  //   const user = await res.json();
  //   console.log("datw moon launch", user);

  return {
    name: "Moonlaunch",
    logo: "https://pbs.twimg.com/profile_images/1873935722950123521/-zO3SgqT_400x400.jpg",
    description: "Memecoin Launchpad on Eclipse",
    comingSoon: true,
  };
}

export async function fetchParlaysfun(address: string): Promise<ProtocolStats> {
  return {
    name: "Parlays.fun",
    logo: "https://pbs.twimg.com/profile_images/1895212888106901504/d0tQ8qEv_400x400.jpg",
    description: "Onchain Parlay Markets for Crypto Speculation on Eclipse.",
    comingSoon: true,
  };
}

export async function fetchMoo(address: string): Promise<ProtocolStats> {
  return {
    name: "Moo",
    logo: "https://pbs.twimg.com/profile_images/1892508888819187712/s7m_1Fo7_400x400.png",
    description: "Defi Execution Layer of Eclipse",
    comingSoon: true,
  };
}

export async function fetchNovaProtocol(
  address: string
): Promise<ProtocolStats> {
  return {
    name: "NovaProtocol",
    logo: "https://ui-avatars.com/api/?name=Nova%20Protocol%20",
    description: "Native decentralized stablecoin of Eclipse",
    comingSoon: true,
  };
}
