# LST Dashboard

A modern dashboard to compare yield and liquidity provision (LP) opportunities on Bifrost and other LST protocols, powered by real-time data from the DeFiLlama API.

## Features

- 📊 **Real-Time Data:** Instantly compare current yield, TVL, and protocol stats across all major LST protocols.
- 📉 **Historical Analysis:** Visualize TVL and yield trends over time with interactive charts.
- 💰 **LP Opportunities:** Explore and compare liquidity provision rewards and APYs.
- 🏆 **Active DeFi Campaigns:** Discover ongoing DeFi campaigns, helping users discover more earning opportunities.
- 🤖 **LST Insight Agent:** Ask questions about LSTs, protocols, and yields using the built-in AI agent (powered by Vercel AI SDK and DeepSeek).

## Data & Updates

- All data is sourced from the [DeFiLlama API](https://defillama.com/).
- Protocol and pool data is updated every 15 minutes.
- Active DeFi campaigns are loaded from a JSON file (`public/data/campaigns.json`) and displayed with campaign name, description, reward, and a direct link.

## Getting Started

### Clone the Repository
```sh
git clone https://github.com/nkn18/lst-dashboard.git
cd lst-dashboard
```

### Install Dependencies
```sh
npm install
```

### Build the Project
```sh
npm run build
```

### Start the Application
```sh
npm run start
```

## Directory Structure

- `components/` – UI components (Cards, Tables, Charts, Campaigns, Chatbot, etc.)
- `public/data/campaigns.json` – List of active DeFi campaigns (editable).
- `lib/` – Data fetching, formatting, and API logic.
- `app/` – Next.js App Router structure and layout.

## Customization

- **Campaigns:** To add or update DeFi campaigns, edit `public/data/campaigns.json`:
  ```json
  [
    {
      "campaign_name": "DeFi Singularity",
      "description": "Earn vDOT Rewards by providing liquidity to eligible pools.",
      "campaign_time": "ongoing",
      "campaign_reward": "765,000 DOT",
      "campaign_link": "https://defisingularity.com/explore"
    }
  ]
  ```
- **Theme:** The dashboard supports light/dark mode via the theme toggle in the header.

## Credits

- Data: [DeFiLlama API](https://defillama.com/)
- UI: [Shadcn UI](https://ui.shadcn.com/)
- AI: [Vercel AI SDK](https://sdk.vercel.ai/), [DeepSeek](https://deepseek.com/) 
