# Influencer Brief Strategist ✨

A specialized AI tool built for female health and wellness influencers. This application transforms chaotic brand partnership briefs into FTC/FDA compliant, high-performing content with a supportive "big sister" tone.

## Features
- **Compliance Check:** Automatically flags non-compliant health claims (FDA) and ensures proper disclosure (FTC).
- **Caption Generation:** Provides three distinct caption versions (Casual, Educational, Story-Driven).
- **Reel & Story Scripts:** Comprehensive scripts including on-screen text, visual cues, and verbal disclosures.
- **Brand Vibe Analysis:** Extracts tone and visual styles from the brief.
- **History Tracking:** Saves recent strategies to local storage.

## Tech Stack
- **Frontend:** React + Tailwind CSS
- **AI:** Google Gemini API (`gemini-3-flash-preview`)
- **Deployment:** Optimized for static hosting (ES modules)

## Getting Started
1. Ensure you have your `API_KEY` set in the environment.
2. Open `index.html` in a modern browser or serve via a static server.

## Compliance Logic
The app strictly enforces:
- **FDA:** No disease curing/treating claims. Uses "supports/promotes" alternatives.
- **FTC:** Mandatory #ad or "Partnering with..." disclosure in the first 3 lines/10 seconds.
