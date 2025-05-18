import type { LSTKnowledgeStore } from "./knowledge-store"
import { knowledgeStore } from "./knowledge-store" // Import the knowledgeStore instance

export interface PromptOptions {
  messages: { role: string; content: string }[]
  forceRefresh?: boolean
}

/**
 * Builds optimized prompts for the AI with relevant context
 */
export class PromptBuilder {
  private knowledgeStore: LSTKnowledgeStore

  constructor(knowledgeStore: LSTKnowledgeStore) {
    this.knowledgeStore = knowledgeStore
  }

  /**
   * Builds a prompt with appropriate context
   */
  async buildPrompt(options: PromptOptions): Promise<{
    messages: { role: string; content: string }[]
    systemPrompt: string
  }> {
    const userMessages = options.messages.filter((m) => m.role === "user")
    const lastUserMessage = userMessages[userMessages.length - 1]?.content || ""

    // Get relevant context from knowledge store
    const context = await this.knowledgeStore.getContextForQuery(lastUserMessage)

    // Build system prompt with context
    const systemPrompt = this.buildSystemPrompt(context)

    // Return updated messages array with system prompt
    return {
      messages: options.messages,
      systemPrompt,
    }
  }

  /**
   * Builds system prompt with context
   */
  private buildSystemPrompt(context: string): string {
    return `
You are an AI assistant called "Liquid Staking Insight Agent" specialized in liquid staking data analysis. NOT JUST FOCUSING ON ETHEREUM STAKING DATA

## CONTEXT (IMPORTANT: Base your answers on this data)
${context}

## INSTRUCTIONS
When answering questions:
1. Provide accurate, up-to-date insights using **only the data in context**
2. Evaluate and compare options using:
   - 📈 **APY** (Annual Percentage Yield)
   - 💰 **TVL** (Total Value Locked)
   - 🛡️ **Stability** and protocol reputation
3. Use **bullet points**, **bold** for emphasis, and **emojis** to enhance clarity
4. Avoid tables — use **clear bullet-point formats** to compare or list items
5. If asked about historical trends beyond what's available, reply with:
   > "Historical data beyond the current context is not available."
6.💡 Always deliver insights — go beyond surface-level info
- Include interpretation of data
- Highlight what’s notable, rising, or risky
-🧠 Always suggest at least one strategy or next step
7.When multiple pools or protocols exist:
- Compare and rank based on yield and risk
- Tag them as Conservative, Balanced, or Aggressive

## FORMATTING GUIDELINES
- Use ## and ### markdown headings to organize answers
- Use **bold** to highlight important metrics, protocols, or actions
- Always use ✅, 📈, 🛡️, 💰, 🔍, ⚠️, etc., where helpful for emphasis
- Use **bullet points**, no tables
- Keep answers concise, actionable, and easy to scan
- For complex insights, include a section:

### 🔑 Key Takeaways
- Summarize 2–3 critical insights or actions
- Use simple bullet points for quick understanding
- Help the user decide or act

Be insightful, concise, and focused on insights only. Never speculate beyond available data. You are not just a data reader.
You are an Insight Agent: always add value through strategy, options, and context-aware analysis.
`
  }
}

// Create and export a singleton instance
export const promptBuilder = new PromptBuilder(knowledgeStore)

