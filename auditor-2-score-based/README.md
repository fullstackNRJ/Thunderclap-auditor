# Thunderclap: AI-Powered Landing Page Auditor

Thunderclap is an intelligent tool designed to bridge the gap between "good design" and "effective messaging." It scans landing pages to evaluate how well they communicate value to their target audience.

---

## 🎯 For My Marketing Friends (The "Why")

Ever wonder if your landing page is actually *saying* what you think it is? Thunderclap is your 24/7 automated marketing auditor. 

### What it does:
1.  **Scans Your Page**: It reads your headlines, hero sections, CTAs, and testimonials.
2.  **Grades Your Messaging**: It uses **Artificial Intelligence (LLMs)** to grade your page on 6 critical pillars: *Positioning, Value, ICP (Ideal Customer Profile) Clarity, Message Clarity, Social Proof, and Call-to-Action strength.*
3.  **Provides Real Evidence**: It points to specific sentences on your page and tags them as "Good," "Bad," or "Passive."
4.  **Gives You a To-Do List**: The AI doesn't just critique; it acts as a consultant, suggesting 3 prioritized fixes to improve your conversion rate immediately.

**The Magic:** We leverage the same technology behind ChatGPT (Large Language Models) but train it specifically to think like a conversion copywriter and marketing strategist.

---

## 🛠️ Technical Overview (The "How")

Thunderclap is a high-performance, edge-computing application built on the Cloudflare stack.

### The Tech Stack:
-   **Framework**: [Hono](https://hono.dev/) & [chanfana](https://github.com/cloudflare/chanfana) (OpenAPI 3.1 compliance).
-   **Runtime**: [Cloudflare Workers](https://workers.cloudflare.com/) (Serverless at the edge).
-   **Scraping**: High-speed stream processing using Cloudflare's native `HTMLRewriter`.
-   **AI Engine (Workers AI)**:
    -   **Llama 3 (8B Instruct)**: Orchestrates the primary audit, identifying citations and calculating categorical scores.
    -   **Mistral (7B Instruct)**: Processes the audit scores and source content to generate actionable improvement suggestions.
-   **Persistence**: [Cloudflare D1](https://developers.cloudflare.com/d1/) (Edge SQL database) for storing report history and AI audit logs.

### Key Engineering Features:
-   **Robust JSON Sanitization**: Custom logic to handle AI "hallucinations" or formatting issues (trailing commas, unescaped characters).
-   **Observability**: Integrated logging of LLM prompts and raw responses for continuous prompt engineering and debugging.
-   **Edge Performance**: Zero-cold-start execution with sub-second analysis (scooter-speed scraping + parallel AI inference).

---

## 🚀 Getting Started

1.  **Clone & Install**: `pnpm install`
2.  **Login**: `wrangler login`
3.  **Local Dev**: `pnpm run start`
4.  **Deploy**: `wrangler deploy`

Open `http://localhost:8787/` to access the audit interface or API documentation.
