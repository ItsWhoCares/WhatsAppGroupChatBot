# WhatsApp Q&A Bot

A WhatsApp group bot using Baileys and Google's Gemini 2.0 Flash model with Google Search tools.

## Setup

1. Copy `.env.example` to `.env` and fill in your `GEMINI_API_KEY`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the bot:
   ```bash
   npm start
   ```

## Project Structure

- `src/config.js` – loads env vars
- `src/whatsapp.js` – Baileys connection
- `src/handlers/messageHandler.js` – @mention parsing & dispatch
- `src/geminiClient.js` – Gemini v2.0 Flash + Google Search integration
- `src/utils/logger.js` – shared utilities
