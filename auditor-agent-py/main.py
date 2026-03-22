import os
import json
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Body
from pydantic import BaseModel, Field
import google.generativeai as genai
import httpx
from bs4 import BeautifulSoup
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(
    title="CERTTN Messaging Auditor",
    description="A professional B2B copy strategist tool using Gemini 1.5 Pro.",
    version="1.0.0"
)

# Configure Gemini API
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    # We will raise an error internally if not set, but for now we initialize
    pass

genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-1.5-pro')

class AuditRequest(BaseModel):
    url: str = Field(..., example="https://deductive.ai")

class PillarAudit(BaseModel):
    score: int
    critique: str
    fix: str

class AuditResponse(BaseModel):
    overall_grade: str
    executive_summary: str
    audit: dict # We'll use a dict for flexibility with the CERTTN pillars
    conversion_killers: List[str]

@app.get("/")
async def root():
    return {"message": "CERTTN Messaging Auditor API is running. Use POST /audit to start."}

@app.post("/audit")
async def perform_audit(request: AuditRequest):
    if not api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY is not configured in .env")

    # 1. Scrape the content
    content = await scrape_url(request.url)
    
    # 2. Generate the audit using Gemini
    audit_report = await generate_certtn_audit(content)
    
    return audit_report

async def scrape_url(url: str) -> str:
    async with httpx.AsyncClient(follow_redirects=True, timeout=30.0) as client:
        try:
            response = await client.get(url)
            response.raise_for_status()
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=e.response.status_code, detail=f"Failed to reach URL: {str(e)}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Scraping error: {str(e)}")
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Remove script and style elements
        for script_or_style in soup(["script", "style"]):
            script_or_style.decompose()

        # Extracting key areas and text
        # Focus on visible text, capping to stay within reasonable context window
        page_text = soup.get_text(separator=' ', strip=True)
        return page_text[:15000] # Increased limit slightly for better context

async def generate_certtn_audit(page_text: str):
    prompt = f"""
    You are a World-Class B2B Copy Strategist and Brand Marketer. 
    Audit the following website content using the **CERTTN Framework** (Clarity, Explain, Resonate, Tie, Trust, Next Step).

    **Website Content:**
    {page_text}

    **Your Task:**
    Provide a detailed, critical report. Do not be "nice." If the copy is vague or 
    uses too much jargon without meaning, point it out. 
    Evaluate the **strategic gap** between what is said and what the customer actually cares about.

    **Framework Definitions:**
    - **Clarity:** Is the value prop immediate? Can a busy exec understand it in 5 seconds?
    - **Explain:** How does it work? Is the "New Way vs Old Way" clear?
    - **Resonate:** Does it use the customer's language (e.g., SRE terminology)?
    - **Tie:** Does it tie features back to business outcomes (ROI, time saved)?
    - **Trust:** Are there proof points, logos, or pedigree?
    - **Next Step:** Is the CTA low-friction and logical for the buyer stage?

    **Output Format:**
    Return ONLY a valid JSON object with the following structure:
    {{
      "overall_grade": "A-F",
      "executive_summary": "3-4 sentences on brand positioning and strategic impact.",
      "audit": {{
        "clarity": {{ "score": 0-10, "critique": "...", "fix": "..." }},
        "explain": {{ "score": 0-10, "critique": "...", "fix": "..." }},
        "resonate": {{ "score": 0-10, "critique": "...", "fix": "..." }},
        "tie": {{ "score": 0-10, "critique": "...", "fix": "..." }},
        "trust": {{ "score": 0-10, "critique": "...", "fix": "..." }},
        "next_step": {{ "score": 0-10, "critique": "...", "fix": "..." }}
      }},
      "conversion_killers": ["killer 1", "killer 2", "killer 3"]
    }}
    """

    try:
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                response_mime_type="application/json",
            )
        )
        
        # Parse the JSON response
        audit_json = json.loads(response.text)
        return audit_json
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Analysis failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
