import { NextResponse } from "next/server"
import { fetchLSTData } from "@/lib/data-service"
import { knowledgeStore } from "@/lib/knowledge-store"

export async function GET() {
  try {
    // Fetch the latest data
    const data = await fetchLSTData()

    // Get Bifrost specific data
    const bifrostData = data.filter(
      (p) =>
        p.project.toLowerCase().includes("bifrost") ||
        (p.projectName && p.projectName.toLowerCase().includes("bifrost")),
    )

    // Get sample context for a Bifrost query
    await knowledgeStore.update(data)
    const sampleContext = await knowledgeStore.getContextForQuery("What are the best yield opportunities on Bifrost?")

    return NextResponse.json({
      totalProtocols: data.length,
      protocols: data.map((p) => ({
        project: p.project,
        symbol: p.symbol,
        chain: p.chain,
        apy: p.apy,
        tvlUsd: p.tvlUsd,
      })),
      bifrostProtocols: bifrostData,
      sampleContext: sampleContext,
    })
  } catch (error) {
    console.error("Error in debug data route:", error)

    return NextResponse.json(
      {
        error: "Failed to fetch debug data",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

