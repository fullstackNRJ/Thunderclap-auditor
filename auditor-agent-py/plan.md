# b2b marketing site auditor
To execute this like a professional B2B copy strategist, the tool shouldn't just summarize text; it needs to evaluate the **strategic gap** between what is said and what the customer actually cares about.

Below is the implementation plan, the FastAPI code structure, and the prompt engineering required to make Gemini act like a high-tier Brand Marketer.

---

## 1. The Strategy: How a Pro Audits

A professional doesn't just check for the presence of a CTA. They check for **Friction** and **Value Exchange**.

* 
**Correctness:** Does the technical terminology (e.g., "telemetry," "root-causing") actually match how an SRE speaks?.


* 
**Reliability:** Is the "Traditional Way vs. New Way" comparison logical or just marketing fluff?.


* 
**Execution:** Is the CTA low-friction (e.g., "Request Early Access") or high-commitment (e.g., "Talk to Sales")?.



---

## 2. FastAPI + Gemini Implementation

This script uses FastAPI to create an endpoint that accepts a URL, scrapes the content, and passes it to Gemini 1.5 Pro with a highly specialized "Strategist" system instruction.

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import google.generativeai as genai
import httpx
from bs4 import BeautifulSoup

app = FastAPI(title="CERTTN Messaging Auditor")

# Configure Gemini API
genai.configure(api_key="YOUR_GEMINI_API_KEY")
model = genai.GenerativeModel('gemini-1.5-pro')

class AuditRequest(BaseModel):
    url: str

@app.post("/audit")
async def perform_audit(request: AuditRequest):
    # 1. Simple Scraper (In production, use Playwright for JS-heavy sites)
    async with httpx.AsyncClient() as client:
        response = await client.get(request.url)
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Could not reach URL")
        
        soup = BeautifulSoup(response.text, 'html.parser')
        # Extracting key B2B areas: Hero, Features, Social Proof
        page_text = soup.get_text(separator=' ', strip=True)[:10000] # Cap for context window

    # 2. The Professional Strategist Prompt
    prompt = f"""
    You are a World-Class B2B Copy Strategist and Brand Marketer. 
    Audit the following website content using the **CERTTN Framework** (Clarity, Explain, Resonate, Tie, Trust, Next Step).

    **Website Content:**
    {page_text}

    **Your Task:**
    Provide a detailed, critical report. Do not be "nice." If the copy is vague or 
    uses too much jargon without meaning, point it out.
    
    Return the response in the following JSON format:
    {{
      "overall_grade": "A-F",
      "executive_summary": "3 sentences on brand positioning.",
      "audit": {{
        "clarity": {{ "score": 0-10, "critique": "", "fix": "Rewrite the hero headline" }},
        "explain": {{ "score": 0-10, "critique": "", "fix": "" }},
        "resonate": {{ "score": 0-10, "critique": "", "fix": "" }},
        "tie": {{ "score": 0-10, "critique": "", "fix": "" }},
        "trust": {{ "score": 0-10, "critique": "", "fix": "" }},
        "next_step": {{ "score": 0-10, "critique": "", "fix": "" }}
      }},
      "conversion_killers": ["List 3 specific things scaring users away"]
    }}
    """

    response = model.generate_content(prompt)
    return response.text

```

---

## 3. The Professional Audit Report (Sample Output)

If you ran this against a site like **Deductive.ai** (from the framework), here is how the "Professional Copy Strategist" output would look:

### **Executive Summary**

Deductive.ai has a strong technical foundation but leans heavily on the "Expert Persona". The positioning successfully moves from "debugging" (a task) to "root-causing" (an outcome), which elevates the brand from a tool to a strategic asset.

### **CERTTN Deep Dive**

| Pillar | Strategist Critique | Recommended Execution |
| --- | --- | --- |
| **Clarity** | The headline "No More Root Causing in the Dark" hits a high-intensity pain point for SREs.

 | **Maintain.** It uses "Dark" as a powerful metaphor for lack of visibility. |
| **Explain** | The "Traditional vs. Deductive" table is excellent for cognitive ease. It visualizes the time-saving gap (Hours vs. Minutes).

 | **Enhance:** Add a "Cost of Downtime" metric to make the problem financial, not just technical. |
| **Tie** | Features like "Knowledge Graph" are mentioned, but the "WIIFM" (What's In It For Me) is slightly buried in technical prose.

 | <br>**Fix:** Explicitly state: "Identify the exact line of code causing the break, so you don't have to." 

 |
| **Trust** | Lacks customer logos, which is a "Conversion Killer" for enterprise.

 | <br>**Fix:** Lean harder into the "Ex-Databricks/Meta" pedigree as a 'Proxy for Trust' until logos are secured.

 |

---

## 4. Next Steps for Execution

To move this from a script to a product, would you like me to:

1. **Build the Frontend:** Create a simple Streamlit or React dashboard to visualize these JSON scores?
2. 
**Add Visual Auditing:** Update the code to use **Gemini 1.5 Pro Vision** to analyze the actual *layout* and *design* (e.g., is the CTA button high-contrast enough?).