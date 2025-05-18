// LST projects to filter - ensure Bifrost is included with correct casing
export const LST_PROJECTS = [
  "zlot",
  "ankr",
  "lido",
  "stakehound",
  "stakewise-v2",
  "stafi",
  "sharedstake",
  "steakbank-finance",
  "marinade-liquid-staking",
  "karura-liquid-staking",
  "meta-pool-near",
  "rocket-pool",
  "geth",
  "asol",
  "stader",
  "ifpool",
  "jpool",
  "neoburger",
  "pstake-lsd",
  "benqi-staked-avax",
  "klaystation",
  "galgo-liquid-governance",
  "sicx",
  "steak",
  "thunderpokt",
  "stakeeasy",
  "linear-protocol",
  "bifrost-liquid-staking",
  "tenderize-v1",
  "argo-finance",
  "acala-liquid-staking",
  "eris-protocol",
  "acala-lcdot",
  "filet-finance",
  "algem",
  "skcs",
  "parallel-polkadot-crowdloan",
  "parallel-polkadot-liquid-staking",
  "exinpool",
  "stcelo",
  "eversol",
  "interlay-staking",
  "frax-ether",
  "stake-ly",
  "geode",
  "amulet-liquidity-staking",
  "ditto",
  "tortuga",
  "increment-liquid-staking",
  "stlos-liquid-staking",
  "yield-yak-staked-avax",
  "stride",
  "tranchess-ether",
  "kava-liquid",
  "strx-finance",
  "jito",
  "bifrost-liquid-crowdloan",
  "pepetam-swaves",
  "veno-finance",
  "stake-link-liquid",
  "nf3-ape",
  "okc-liquid-staking",
  "nucleon",
  "lockless-protocol",
  "hord",
  "trufin-legacy-vaults",
  "wynd-lsd",
  "glif",
  "starfish-liquid-staking",
  "stfil",
  "swell-liquid-staking",
  "stakehouse",
  "quicksilver-protocol",
  "sft-protocol",
  "binance-staked-eth",
  "blazestake",
  "origin-ether",
  "creth2",
  "scanto",
  "nodedao",
  "avely-staking",
  "mfil-protocol",
  "hashmix-fil",
  "liquid-collective",
  "stkd-scrt",
  "minefi",
  "swapscanner-lsd",
  "stakedicp",
  "neopin-liquid",
  "gogopool",
  "xalgo-liquid-staking",
  "collectif-dao",
  "hashking",
  "bemo",
  "meter-liquid-staking",
  "hatom-liquid-staking",
  "trustake",
  "jewelswap-liquid-staking"
]

// Types for the data
export interface LSTPool {
  chain: string
  project: string
  symbol: string
  tvlUsd: number
  apyBase: number
  apyReward: number | null
  apy: number
  apyPct1D: number | null
  apyPct7D: number | null
  apyPct30D: number | null
  apyMean30d: number | null
  ilRisk: string
  exposure: string
  poolMeta: string | null
  mu: number | null
  sigma: number | null
  count: number | null
  outlier: boolean
  underlyingTokens: string[] | null
  projectName: string
  stablecoin: boolean
  audits: string | null
  url: string
  rewardTokens: string[] | null
}

// Cache expiration in milliseconds (15 minutes)
const CACHE_EXPIRATION = 15 * 60 * 1000

// In-memory cache
let dataCache: {
  timestamp: number
  data: LSTPool[]
} | null = null

/**
 * Fetches LST data from DeFiLlama with caching
 */
export async function fetchLSTData(forceRefresh = false): Promise<LSTPool[]> {
  // Return cached data if available and not expired
  if (!forceRefresh && dataCache && Date.now() - dataCache.timestamp < CACHE_EXPIRATION) {
    console.log("Using cached LST data")
    return dataCache.data
  }

  console.log("Fetching fresh LST data from DeFiLlama")

  try {
    const response = await fetch("https://yields.llama.fi/pools", {
      next: { revalidate: 900 }, // Revalidate every 15 minutes
    })

    if (!response.ok) {
      throw new Error(`DeFiLlama API returned ${response.status}`)
    }

    const responseData = await response.json()

    // Filter for LST projects with EXACT matching from our list
    const filteredData = responseData.data.filter((pool: LSTPool) => {
      // Check if the project name exactly matches any in our list (case-insensitive)
      return LST_PROJECTS.some(
        (lstProject) =>
          pool.project.toLowerCase() === lstProject.toLowerCase() ||
          (pool.projectName && pool.projectName.toLowerCase() === lstProject.toLowerCase()),
      )
    })

    console.log(`Filtered ${filteredData.length} LST protocols from ${responseData.data.length} total pools`)

    // Update cache
    dataCache = {
      timestamp: Date.now(),
      data: filteredData,
    }

    return filteredData
  } catch (error) {
    console.error("Error fetching LST data:", error)

    // Return cached data if available, even if expired
    if (dataCache) {
      console.log("Returning expired cache due to fetch error")
      return dataCache.data
    }

    return []
  }
}
