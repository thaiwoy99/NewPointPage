// lib/getProtocols.ts

type ProtocolStats = {
  name: string;
  logo: string;
  points?: number;
  rank?: number;
  description?: string;
  comingSoon?: boolean;
  isNew?: boolean;
  requiresTwitter?: boolean;
  twitterUsername?: string;
};

  
import {
    fetchUmbraStats,
    fetchInvariantStats,
    fetchSolarDexStats,
    fetchAllDomainsStats,
    fetchFightHorse,
    fetchAstrol,
    fetchScope,
    fetchAfterSchoolClub,
    fetchEnsoFi,
    fetchEDAS,
    fetchPixelWar,
    fetchLifinity,
    fetchWerm,
    fetchValidators,
    fetchCelestialMammoth,
    fetchNeuroGuardians,
    fetchStackEM,
    fetchCastleDash,
    fetchMintyMarket,
    fetchOrca,
    fetchParlaysfun,
    fetchMoonlaunch,
    fetchMoo,
    fetchRollItUp,
    fetchSave,
    fetchNovaProtocol,
    fetchSoe,
  } from "./fetchers";
  
  export async function getAllProtocolStats(address: string | null, twitterUsername: string | null): Promise<ProtocolStats[]> {
    const results = await Promise.allSettled([
      fetchUmbraStats(address),
      fetchInvariantStats(address),
      fetchAllDomainsStats(address),
      fetchAstrol(address),
      fetchFightHorse(address),
      fetchSolarDexStats(address),
      fetchEnsoFi(address),
      fetchEDAS(address),
      fetchSoe(address, twitterUsername),
      fetchWerm(address),
      fetchNeuroGuardians(address),
      fetchMoonlaunch(address),
    ]);
  
    return results
      .filter((r): r is PromiseFulfilledResult<ProtocolStats> => r.status === "fulfilled")
      .map((r) => r.value);
  }
  