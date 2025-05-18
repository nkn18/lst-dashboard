import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { TooltipProvider } from "@/components/ui/tooltip"
import { VectorStoreInitializer } from "@/components/vector-store-initializer"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeScript } from "@/components/theme-script"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Liquid Staking Insight Agent",
  description: "Explore liquid staking protocols with AI-powered data analysis"
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className={inter.className}>
        <ThemeProvider defaultTheme="system">
          <TooltipProvider>
            <VectorStoreInitializer />
            {children}
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}