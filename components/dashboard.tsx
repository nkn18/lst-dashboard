"use client"

import React, { useState, useEffect } from "react"
import {
  ArrowDown,
  ArrowUp,
  Search,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  BarChart3,
  PieChart,
  LineChart,
  Layers,
  Wallet,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fetchLSTData, type Protocol, type PoolWithHistory } from "@/lib/api"
import TvlLineChart from "@/components/tvl-line-chart"
import MarketSharePieChart from "@/components/market-share-pie-chart"
import YieldComparisonChart from "@/components/yield-comparison-chart"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Dashboard() {
  const [data, setData] = useState<{ protocols: Protocol[]; pools: PoolWithHistory[] }>({
    protocols: [],
    pools: [],
  })
  const [filteredProtocols, setFilteredProtocols] = useState<Protocol[]>([])
  const [filteredPools, setFilteredPools] = useState<PoolWithHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [protocolSortConfig, setProtocolSortConfig] = useState({ key: "tvl", direction: "desc" })
  const [poolSortConfig, setPoolSortConfig] = useState({ key: "tvl", direction: "desc" })
  const [searchQuery, setSearchQuery] = useState("")
  const [totalTVL, setTotalTVL] = useState(0)
  const [avgYield, setAvgYield] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [expandedProtocols, setExpandedProtocols] = useState<Record<string, boolean>>({})
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const result = await fetchLSTData()

        // Ensure we have valid data before setting state
        if (result.protocols.length > 0 || result.pools.length > 0) {
          setData(result)
          setFilteredProtocols(result.protocols)
          setFilteredPools(result.pools)

          // Calculate total TVL
          const total = result.protocols.reduce((sum, protocol) => sum + protocol.tvl, 0)
          setTotalTVL(total)

          // Calculate weighted average APY
          const totalWeight = result.protocols.reduce((sum, protocol) => sum + protocol.tvl, 0)
          const weightedSum = result.protocols.reduce((sum, protocol) => sum + protocol.apy * protocol.tvl, 0)
          const avgApy = totalWeight > 0 ? weightedSum / totalWeight : 0
          setAvgYield(avgApy)
        } else {
          console.error("Invalid data format received or empty data array")
          setError("Failed to load data from API. Please try again later.")
        }
      } catch (error) {
        console.error("Failed to fetch LST data:", error)
        setError("Failed to load data from API. Please try again later.")
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    }

    loadData()
  }, [isRefreshing])

  useEffect(() => {
    // Filter protocols based on search query
    const filtered = data.protocols.filter((protocol) => {
      return protocol.name.toLowerCase().includes(searchQuery.toLowerCase())
    })

    // Sort protocols based on sort config
    const sorted = [...filtered].sort((a, b) => {
      if (a[protocolSortConfig.key] < b[protocolSortConfig.key]) {
        return protocolSortConfig.direction === "asc" ? -1 : 1
      }
      if (a[protocolSortConfig.key] > b[protocolSortConfig.key]) {
        return protocolSortConfig.direction === "asc" ? 1 : -1
      }
      return 0
    })

    setFilteredProtocols(sorted)

    // Filter pools based on search query
    const filteredPoolsData = data.pools.filter((pool) => {
      const searchFields = [pool.name, pool.chain, pool.symbol].filter(Boolean).map((field) => field.toLowerCase())

      return searchFields.some((field) => field.includes(searchQuery.toLowerCase()))
    })

    // Sort pools based on sort config
    const sortedPools = [...filteredPoolsData].sort((a, b) => {
      if (a[poolSortConfig.key] < b[poolSortConfig.key]) {
        return poolSortConfig.direction === "asc" ? -1 : 1
      }
      if (a[poolSortConfig.key] > b[poolSortConfig.key]) {
        return poolSortConfig.direction === "asc" ? 1 : -1
      }
      return 0
    })

    setFilteredPools(sortedPools)
  }, [data, searchQuery, protocolSortConfig, poolSortConfig])

  const handleProtocolSort = (key: string) => {
    setProtocolSortConfig((prevConfig) => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === "desc" ? "asc" : "desc",
    }))
  }

  const handlePoolSort = (key: string) => {
    setPoolSortConfig((prevConfig) => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === "desc" ? "asc" : "desc",
    }))
  }

  const toggleProtocolExpanded = (protocolName: string) => {
    setExpandedProtocols((prev) => ({
      ...prev,
      [protocolName]: !prev[protocolName],
    }))
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
  }

  const formatTVL = (value: number) => {
    if (value >= 1e9) {
      return `$${(value / 1e9).toFixed(2)}B`
    } else if (value >= 1e6) {
      return `$${(value / 1e6).toFixed(2)}M`
    } else {
      return `$${value.toFixed(2)}`
    }
  }

  const formatPercentage = (value: number) => {
    return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`
  }

  const getPercentageColor = (value: number) => {
    return value > 0 ? "text-emerald-500" : value < 0 ? "text-rose-500" : "text-gray-500"
  }

  const getPercentageIcon = (value: number) => {
    return value > 0 ? <ArrowUp className="h-4 w-4" /> : value < 0 ? <ArrowDown className="h-4 w-4" /> : null
  }

  // Format protocol name for display
  const formatProtocolName = (name: string) => {
    // Capitalize first letter of each word and replace hyphens with spaces
    return name
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-md px-4 sm:px-6">
        <div className="flex flex-1 items-center gap-2">
          <Wallet className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-semibold">DeFi Liquid Staking Dashboard</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="rounded-full"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="sr-only">Refresh</span>
          </Button>
          <ThemeToggle />
        </div>
      </header>
      <main className="flex-1 grid items-start gap-6 p-4 sm:px-6 sm:py-6 md:gap-8 animate-fade-in">
        {error && (
          <div className="bg-destructive/15 text-destructive p-4 rounded-lg border border-destructive/20 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium">Error:</span> {error}
            </div>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="stat-card card-hover shadow-md">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-muted-foreground" />
                Total Value Locked
              </CardDescription>
              <CardTitle className="text-3xl font-bold">
                {isLoading ? <Skeleton className="h-9 w-28" /> : formatTVL(totalTVL)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">Across all LST protocols</div>
            </CardContent>
          </Card>
          <Card className="stat-card card-hover shadow-md">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-muted-foreground" />
                Protocols
              </CardDescription>
              <CardTitle className="text-3xl font-bold">
                {isLoading ? <Skeleton className="h-9 w-28" /> : data.protocols.length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">Active LST providers</div>
            </CardContent>
          </Card>
          <Card className="stat-card card-hover shadow-md">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                Pools
              </CardDescription>
              <CardTitle className="text-3xl font-bold">
                {isLoading ? <Skeleton className="h-9 w-28" /> : data.pools.length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">Total LST pools</div>
            </CardContent>
          </Card>
          <Card className="stat-card card-hover shadow-md">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <LineChart className="h-4 w-4 text-muted-foreground" />
                Average Yield
              </CardDescription>
              <CardTitle className="text-3xl font-bold">
                {isLoading ? <Skeleton className="h-9 w-28" /> : `${avgYield.toFixed(2)}%`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">Weighted average APY</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          <Card className="lg:col-span-4 shadow-md card-hover">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="h-5 w-5 text-primary" />
                    TVL Trends
                  </CardTitle>
                  <CardDescription>Historical TVL for top 5 LST protocols</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[350px] flex items-center justify-center">
                  <Skeleton className="h-[300px] w-full rounded-lg" />
                </div>
              ) : filteredProtocols.length > 0 ? (
                <TvlLineChart data={filteredProtocols.slice(0, 5)} />
              ) : (
                <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="lg:col-span-3 shadow-md card-hover">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-primary" />
                    Market Share
                  </CardTitle>
                  <CardDescription>Distribution among LST providers</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[350px] flex items-center justify-center">
                  <Skeleton className="h-[300px] w-[300px] rounded-full mx-auto" />
                </div>
              ) : filteredProtocols.length > 0 ? (
                <MarketSharePieChart data={filteredProtocols.slice(0, 8)} />
              ) : (
                <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="protocols" className="w-full">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <TabsList className="h-11">
              <TabsTrigger value="protocols" className="text-sm px-4">
                <Layers className="h-4 w-4 mr-2" />
                Protocols
              </TabsTrigger>
              <TabsTrigger value="pools" className="text-sm px-4">
                <BarChart3 className="h-4 w-4 mr-2" />
                Pools
              </TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="pl-9 w-full sm:w-[260px] rounded-full h-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          <TabsContent value="protocols" className="mt-0 space-y-4">
            <Card className="shadow-md">
              <CardHeader className="pb-0">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Layers className="h-5 w-5 text-primary" />
                      LST Protocols
                    </CardTitle>
                    <CardDescription>Overview of all liquid staking token protocols</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select defaultValue="tvl">
                      <SelectTrigger className="w-[160px] rounded-full">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tvl" onClick={() => handleProtocolSort("tvl")}>
                          Sort by TVL
                        </SelectItem>
                        <SelectItem value="change_24h" onClick={() => handleProtocolSort("change_24h")}>
                          Sort by 24h Change
                        </SelectItem>
                        <SelectItem value="change_7d" onClick={() => handleProtocolSort("change_7d")}>
                          Sort by 7d Change
                        </SelectItem>
                        <SelectItem value="apy" onClick={() => handleProtocolSort("apy")}>
                          Sort by APY
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="rounded-b-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[180px]">Protocol</TableHead>
                        <TableHead className="text-right" onClick={() => handleProtocolSort("tvl")}>
                          <div className="flex items-center justify-end cursor-pointer">
                            TVL
                            {protocolSortConfig.key === "tvl" && (
                              <span className="ml-1">{protocolSortConfig.direction === "asc" ? "↑" : "↓"}</span>
                            )}
                          </div>
                        </TableHead>
                        <TableHead className="text-right" onClick={() => handleProtocolSort("change_24h")}>
                          <div className="flex items-center justify-end cursor-pointer">
                            24h Change
                            {protocolSortConfig.key === "change_24h" && (
                              <span className="ml-1">{protocolSortConfig.direction === "asc" ? "↑" : "↓"}</span>
                            )}
                          </div>
                        </TableHead>
                        <TableHead className="text-right" onClick={() => handleProtocolSort("change_7d")}>
                          <div className="flex items-center justify-end cursor-pointer">
                            7d Change
                            {protocolSortConfig.key === "change_7d" && (
                              <span className="ml-1">{protocolSortConfig.direction === "asc" ? "↑" : "↓"}</span>
                            )}
                          </div>
                        </TableHead>
                        <TableHead className="text-right" onClick={() => handleProtocolSort("apy")}>
                          <div className="flex items-center justify-end cursor-pointer">
                            APY
                            {protocolSortConfig.key === "apy" && (
                              <span className="ml-1">{protocolSortConfig.direction === "asc" ? "↑" : "↓"}</span>
                            )}
                          </div>
                        </TableHead>
                        <TableHead className="w-[50px]">Pools</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        Array.from({ length: 5 }).map((_, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Skeleton className="h-6 w-24" />
                            </TableCell>
                            <TableCell className="text-right">
                              <Skeleton className="h-6 w-20 ml-auto" />
                            </TableCell>
                            <TableCell className="text-right">
                              <Skeleton className="h-6 w-20 ml-auto" />
                            </TableCell>
                            <TableCell className="text-right">
                              <Skeleton className="h-6 w-20 ml-auto" />
                            </TableCell>
                            <TableCell className="text-right">
                              <Skeleton className="h-6 w-16 ml-auto" />
                            </TableCell>
                            <TableCell className="text-center">
                              <Skeleton className="h-6 w-8 mx-auto" />
                            </TableCell>
                          </TableRow>
                        ))
                      ) : filteredProtocols.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-6">
                            <div className="flex flex-col items-center justify-center text-muted-foreground">
                              <Layers className="h-10 w-10 mb-2 opacity-20" />
                              <p>No protocols found</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredProtocols.map((protocol, index) => (
                          <React.Fragment key={index}>
                            <TableRow
                              className="cursor-pointer table-row-hover"
                              onClick={() => toggleProtocolExpanded(protocol.name)}
                            >
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                                    {protocol.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    {formatProtocolName(protocol.name)}
                                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                                      <Layers className="h-3 w-3" />
                                      {protocol.pools.length} pools
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-right font-medium">{formatTVL(protocol.tvl)}</TableCell>
                              <TableCell className="text-right">
                                <div
                                  className={`flex items-center justify-end gap-1 ${getPercentageColor(protocol.change_24h)}`}
                                >
                                  {getPercentageIcon(protocol.change_24h)}
                                  {formatPercentage(protocol.change_24h)}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <div
                                  className={`flex items-center justify-end gap-1 ${getPercentageColor(protocol.change_7d)}`}
                                >
                                  {getPercentageIcon(protocol.change_7d)}
                                  {formatPercentage(protocol.change_7d)}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <Badge variant={protocol.apy > 5 ? "default" : "secondary"} className="font-medium">
                                  {protocol.apy.toFixed(2)}%
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                  {expandedProtocols[protocol.name] ? (
                                    <ChevronUp className="h-4 w-4" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4" />
                                  )}
                                </Button>
                              </TableCell>
                            </TableRow>
                            {expandedProtocols[protocol.name] && (
                              <TableRow className="bg-muted/30">
                                <TableCell colSpan={6} className="p-0">
                                  <div className="p-4 animate-fade-in">
                                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                                      <Layers className="h-4 w-4 text-primary" />
                                      Pools in {formatProtocolName(protocol.name)}
                                    </h4>
                                    <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead>Pool</TableHead>
                                            <TableHead>Chain</TableHead>
                                            <TableHead className="text-right">TVL</TableHead>
                                            <TableHead className="text-right">APY</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {protocol.pools.map((pool, poolIndex) => (
                                            <TableRow key={poolIndex} className="table-row-hover">
                                              <TableCell>
                                                <div className="flex items-center gap-2">
                                                  <div className="font-medium">{pool.symbol}</div>
                                                  {pool.poolMeta && (
                                                    <div className="text-xs text-muted-foreground">{pool.poolMeta}</div>
                                                  )}
                                                </div>
                                              </TableCell>
                                              <TableCell>
                                                <Badge variant="outline" className="font-normal">
                                                  {pool.chain}
                                                </Badge>
                                              </TableCell>
                                              <TableCell className="text-right">{formatTVL(pool.tvl)}</TableCell>
                                              <TableCell className="text-right">
                                                <Badge
                                                  variant={pool.apy > 5 ? "default" : "secondary"}
                                                  className="font-medium"
                                                >
                                                  {pool.apy.toFixed(2)}%
                                                </Badge>
                                              </TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </div>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </React.Fragment>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pools" className="mt-0 space-y-4">
            <Card className="shadow-md">
              <CardHeader className="pb-0">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      LST Pools
                    </CardTitle>
                    <CardDescription>All liquid staking token pools across protocols</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select defaultValue="tvl">
                      <SelectTrigger className="w-[160px] rounded-full">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tvl" onClick={() => handlePoolSort("tvl")}>
                          Sort by TVL
                        </SelectItem>
                        <SelectItem value="change_24h" onClick={() => handlePoolSort("change_24h")}>
                          Sort by 24h Change
                        </SelectItem>
                        <SelectItem value="change_7d" onClick={() => handlePoolSort("change_7d")}>
                          Sort by 7d Change
                        </SelectItem>
                        <SelectItem value="apy" onClick={() => handlePoolSort("apy")}>
                          Sort by APY
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="rounded-b-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[180px]">Pool</TableHead>
                        <TableHead>Protocol</TableHead>
                        <TableHead>Chain</TableHead>
                        <TableHead className="text-right" onClick={() => handlePoolSort("tvl")}>
                          <div className="flex items-center justify-end cursor-pointer">
                            TVL
                            {poolSortConfig.key === "tvl" && (
                              <span className="ml-1">{poolSortConfig.direction === "asc" ? "↑" : "↓"}</span>
                            )}
                          </div>
                        </TableHead>
                        <TableHead className="text-right" onClick={() => handlePoolSort("change_24h")}>
                          <div className="flex items-center justify-end cursor-pointer">
                            24h Change
                            {poolSortConfig.key === "change_24h" && (
                              <span className="ml-1">{poolSortConfig.direction === "asc" ? "↑" : "↓"}</span>
                            )}
                          </div>
                        </TableHead>
                        <TableHead className="text-right" onClick={() => handlePoolSort("apy")}>
                          <div className="flex items-center justify-end cursor-pointer">
                            APY
                            {poolSortConfig.key === "apy" && (
                              <span className="ml-1">{poolSortConfig.direction === "asc" ? "↑" : "↓"}</span>
                            )}
                          </div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        Array.from({ length: 5 }).map((_, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Skeleton className="h-6 w-24" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-6 w-24" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-6 w-20" />
                            </TableCell>
                            <TableCell className="text-right">
                              <Skeleton className="h-6 w-20 ml-auto" />
                            </TableCell>
                            <TableCell className="text-right">
                              <Skeleton className="h-6 w-20 ml-auto" />
                            </TableCell>
                            <TableCell className="text-right">
                              <Skeleton className="h-6 w-16 ml-auto" />
                            </TableCell>
                          </TableRow>
                        ))
                      ) : filteredPools.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-6">
                            <div className="flex flex-col items-center justify-center text-muted-foreground">
                              <BarChart3 className="h-10 w-10 mb-2 opacity-20" />
                              <p>No pools found</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredPools.map((pool, index) => (
                          <TableRow key={index} className="table-row-hover">
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                                  {pool.symbol ? pool.symbol.charAt(0) : pool.name.charAt(0)}
                                </div>
                                <div>
                                  {pool.symbol}
                                  {pool.poolMeta && (
                                    <div className="text-xs text-muted-foreground">{pool.poolMeta}</div>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{formatProtocolName(pool.name)}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="font-normal">
                                {pool.chain}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-medium">{formatTVL(pool.tvl)}</TableCell>
                            <TableCell className="text-right">
                              <div
                                className={`flex items-center justify-end gap-1 ${getPercentageColor(pool.change_24h)}`}
                              >
                                {getPercentageIcon(pool.change_24h)}
                                {formatPercentage(pool.change_24h)}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge variant={pool.apy > 5 ? "default" : "secondary"} className="font-medium">
                                {pool.apy.toFixed(2)}%
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="shadow-md card-hover">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Staking Yields Comparison
                </CardTitle>
                <CardDescription>Compare yields across different LST providers</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[350px] flex items-center justify-center">
                <Skeleton className="h-[300px] w-full rounded-lg" />
              </div>
            ) : filteredProtocols.length > 0 ? (
              <YieldComparisonChart data={filteredProtocols.slice(0, 10)} />
            ) : (
              <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                <div className="flex flex-col items-center">
                  <BarChart3 className="h-10 w-10 mb-2 opacity-20" />
                  <p>No data available</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <footer className="border-t py-4 px-6 text-center text-sm text-muted-foreground">
        <p>DeFi Liquid Staking Dashboard • Data provided by DeFi Llama API</p>
      </footer>
    </div>
  )
}

