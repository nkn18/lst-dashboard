import type { LSTPool } from "./data-service"
import { vectorStore, processLSTDataForVectorStore } from "./vector-store"
import { formatCurrency, formatPercentage } from "./format-data"

/**
 * Represents a RAG (Retrieval Augmented Generation) knowledge store
 * to organize and retrieve LST data for AI prompts
 */
export class LSTKnowledgeStore {
  private rawData: LSTPool[] = []
  private lastUpdated = 0

  /**
   * Updates the knowledge store with new data
   */
  async update(rawData: LSTPool[]) {
    try {
      this.rawData = rawData
      this.lastUpdated = Date.now()

      // Process data for vector store
      const documents = await processLSTDataForVectorStore(rawData)

      // Clear existing data and add new documents
      await vectorStore.clear()
      await vectorStore.addDocuments(documents)

      console.log(`Updated knowledge store with ${rawData.length} protocols`)
    } catch (error) {
      console.error("Error updating knowledge store:", error)
      // Continue even if there's an error - we'll fall back to basic filtering
    }
  }

  /**
   * Gets the relevant context for a query
   */
  async getContextForQuery(query: string): Promise<string> {
    try {
      // Perform similarity search
      const results = await vectorStore.similaritySearch(query, 5)

      let context = `## Retrieved Information\n\n`

      // Group results by type
      const protocolResults = results.filter((r) => r.metadata.type === "protocol")
      const categoryResults = results.filter((r) => r.metadata.type === "category")
      const chainResults = results.filter((r) => r.metadata.type === "chain")
      const projectResults = results.filter((r) => r.metadata.type === "project")

      // Add protocol details
      if (protocolResults.length > 0) {
        context += `### Protocol Details\n\n`
        for (const result of protocolResults) {
          context += result.content + "\n\n"
        }
      }

      // Add category information
      if (categoryResults.length > 0) {
        context += `### Market Overview\n\n`
        for (const result of categoryResults) {
          context += result.content + "\n\n"
        }
      }

      // Add chain information
      if (chainResults.length > 0) {
        context += `### Chain-Specific Information\n\n`
        for (const result of chainResults) {
          context += result.content + "\n\n"
        }
      }

      // Add project information
      if (projectResults.length > 0) {
        context += `### Project Information\n\n`
        for (const result of projectResults) {
          context += result.content + "\n\n"
        }
      }

      // Always append general overview for highest APY/top LST queries
      if (/highest apy|top apy|best yield|top lst/i.test(query)) {
        context += '\n' + this.getGeneralOverview()
      }

      // If no results found, provide a general overview
      if (results.length === 0) {
        context += this.getGeneralOverview()
      }

      return context
    } catch (error) {
      console.error("Error getting context for query:", error)
      // Fall back to a general overview if there's an error
      return this.getGeneralOverview()
    }
  }

  /**
   * Gets a general overview of the market
   */
  private getGeneralOverview(): string {
    let overview = `### Market Overview\n\n`

    // Top APY protocols
    const topApy = [...this.rawData].sort((a, b) => b.apy - a.apy).slice(0, 5)
    overview += `Top Performing Protocols by APY:\n`
    for (const protocol of topApy) {
      overview += `- ${protocol.project} (${protocol.symbol}): ${formatPercentage(protocol.apy)} APY, TVL: ${formatCurrency(protocol.tvlUsd)}\n`
    }

    overview += `\n`

    // Top TVL protocols
    const topTvl = [...this.rawData].sort((a, b) => b.tvlUsd - a.tvlUsd).slice(0, 5)
    overview += `Largest Protocols by TVL:\n`
    for (const protocol of topTvl) {
      overview += `- ${protocol.project} (${protocol.symbol}): ${formatCurrency(protocol.tvlUsd)} TVL, APY: ${formatPercentage(protocol.apy)}\n`
    }


    const bifrostProtocols = this.rawData.filter(
      (p) =>
        p.project.toLowerCase().includes("bifrost") ||
        (p.projectName && p.projectName.toLowerCase().includes("bifrost")),
    )

    if (bifrostProtocols.length > 0) {
      overview += `\n### Bifrost Protocols\n\n`
      for (const protocol of bifrostProtocols) {
        overview += `- ${protocol.project} (${protocol.symbol}) on ${protocol.chain}: ${formatPercentage(protocol.apy)} APY, TVL: ${formatCurrency(protocol.tvlUsd)}\n`
      }
    }

    return overview
  }

  /**
   * Gets data for a specific project
   */
  getProjectData(projectName: string) {
    const normalized = projectName.toLowerCase()
    return this.rawData.filter(
      (pool) => pool.project.toLowerCase().includes(normalized) || pool.projectName?.toLowerCase().includes(normalized),
    )
  }
}

// Create and export a singleton instance
export const knowledgeStore = new LSTKnowledgeStore()

