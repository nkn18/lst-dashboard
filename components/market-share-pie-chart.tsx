"use client"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"
import type { Protocol } from "@/lib/api"

interface MarketSharePieChartProps {
  data: Protocol[]
}

export default function MarketSharePieChart({ data }: MarketSharePieChartProps) {
  // Calculate total TVL
  const totalTVL = data.reduce((sum, protocol) => sum + protocol.tvl, 0)

  // Format data for pie chart
  const chartData = data.map((protocol) => ({
    name: protocol.name,
    value: protocol.tvl,
    percentage: (protocol.tvl / totalTVL) * 100,
  }))

  // Generate colors for each protocol
  const getProtocolColor = (index: number) => {
    const colors = [
      "#2563eb", // blue-600
      "#8b5cf6", // violet-500
      "#ec4899", // pink-500
      "#f97316", // orange-500
      "#10b981", // emerald-500
      "#06b6d4", // cyan-500
      "#eab308", // yellow-500
      "#ef4444", // red-500
    ]

    return colors[index % colors.length]
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
    <div className="w-full h-[350px]">
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={120}
              paddingAngle={2}
              cornerRadius={4}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getProtocolColor(index)} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null

                const data = payload[0].payload

                return (
                  <div className="rounded-md border bg-background p-4 shadow-md">
                    <div className="text-sm font-medium">{formatProtocolName(data.name)}</div>
                    <div className="text-xs text-muted-foreground">${(data.value / 1e9).toFixed(2)}B</div>
                    <div className="font-medium">{data.percentage.toFixed(2)}%</div>
                  </div>
                )
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        {chartData.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: getProtocolColor(index) }} />
            <div className="truncate">{formatProtocolName(item.name)}</div>
            <div className="ml-auto font-medium">{item.percentage.toFixed(1)}%</div>
          </div>
        ))}
      </div>
    </div>
  )
}

