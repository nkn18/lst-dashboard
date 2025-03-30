"use client"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import type { Protocol } from "@/lib/api"

interface YieldComparisonChartProps {
  data: Protocol[]
}

export default function YieldComparisonChart({ data }: YieldComparisonChartProps) {
  // Sort data by APY for better visualization
  const sortedData = [...data].sort((a, b) => b.apy - a.apy)

  // Format data for bar chart
  const chartData = sortedData.map((protocol) => ({
    name: protocol.name,
    apy: protocol.apy,
    tvl: protocol.tvl,
    poolCount: protocol.pools.length,
  }))

  // Function to format protocol names for display
  const formatProtocolName = (name: string) => {
    // Capitalize first letter of each word and replace hyphens with spaces
    return name
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  return (
    <div className="w-full h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={60}
            tick={{ fontSize: 12 }}
            tickFormatter={formatProtocolName}
          />
          <YAxis tickFormatter={(value) => `${value.toFixed(1)}%`} />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.[0]) return null

              const data = payload[0].payload

              return (
                <div className="rounded-md border bg-background p-4 shadow-md">
                  <div className="text-sm font-medium">{formatProtocolName(data.name)}</div>
                  <div className="text-xs text-muted-foreground">TVL: ${(data.tvl / 1e9).toFixed(2)}B</div>
                  <div className="text-xs text-muted-foreground">Pools: {data.poolCount}</div>
                  <div className="font-medium">APY: {data.apy.toFixed(2)}%</div>
                </div>
              )
            }}
          />
          <Bar dataKey="apy" fill="var(--primary)" radius={[4, 4, 0, 0]} className="fill-primary" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

