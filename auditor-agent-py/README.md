# CERTTN Messaging Auditor

A professional B2B copy strategist tool that audits websites using the CERTTN framework, powered by FastAPI and Gemini 1.5 Pro.

## Features

- **CERTTN Audit:** Evaluates Clarity, Explain, Resonate, Tie, Trust, and Next Step.
- **Strategist Persona:** Provides critical, high-tier brand marketing feedback.
- **FastAPI Backend:** Fast and easy-to-use API endpoint.
- **Gemini 1.5 Pro:** Leverages state-of-the-art AI for deep strategic analysis.

## Setup

1. **Clone the repository.**
2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
3. **Configure environment:**
   Create a `.env` file in the root directory and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_actual_api_key_here
   ```
4. **Run the server:**
   ```bash
   uvicorn main:app --reload
   ```

## Usage

Send a POST request to `/audit` with the URL you want to audit:

```bash
curl -X POST "http://localhost:8000/audit" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://deductive.ai"}'
```

## CERTTN Framework

- **Clarity:** Immediate understanding of the value proposition.
- **Explain:** Clear explanation of how the product works.
- **Resonate:** Alignment with customer language and pain points.
- **Tie:** Connections between features and business outcomes.
- **Trust:** Proof of authority and reliability.
- **Next Step:** Frictionless and logical Call to Action.
