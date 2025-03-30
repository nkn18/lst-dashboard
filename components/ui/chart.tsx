"use client"

import * as React from "react"
import {
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie as RePie,
  LineChart as ReLineChart,
  Line as ReLine,
  XAxis as ReXAxis,
  YAxis as ReYAxis,
  Tooltip as ReTooltip,
  BarChart as ReBarChart,
  Bar as ReBar,
} from "recharts"

export const Chart = ({ children, data }: { children: React.ReactNode; data: any[] }) => {
  // Determine which chart type to render based on children
  const chartType = React.Children.toArray(children).find(
    (child) =>
      React.isValidElement(child) && (child.type === LineChart || child.type === BarChart || child.type === PieChart),
  )

  if (React.isValidElement(chartType) && chartType.type === LineChart) {
    return <ReLineChart data={data}>{children}</ReLineChart>
  } else if (React.isValidElement(chartType) && chartType.type === BarChart) {
    return <ReBarChart data={data}>{children}</ReBarChart>
  } else if (React.isValidElement(chartType) && chartType.type === PieChart) {
    return <RePieChart data={data}>{children}</RePieChart>
  }

  // Default fallback
  return <ReLineChart data={data}>{children}</ReLineChart>
}

export const Pie = RePie
export const PieChart = RePieChart
export const Line = ReLine
export const LineChart = ReLineChart
export const XAxis = ReXAxis
export const YAxis = ReYAxis
export const Bar = ReBar
export const BarChart = ReBarChart

export const ChartContainer = ({
  children,
  config = {},
  className,
}: { children: React.ReactNode; config?: any; className?: string }) => {
  return (
    <ResponsiveContainer width="100%" height="100%" className={className}>
      {children}
    </ResponsiveContainer>
  )
}

export const ChartTooltipContent = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:zoom-out-95 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-90 data-[state=open]:fade-in-0 dark:border-muted">
      {children}
    </div>
  )
}

export const ChartTooltip = ({ children }: { children: React.ReactNode }) => {
  return <ReTooltip content={children} />
}

