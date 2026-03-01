export interface CategoryDetail {
    score: number;
    reasoning: string;
    examples: { text: string; label: string }[];
}

export interface AuditScores {
    positioning: CategoryDetail;
    value: CategoryDetail;
    icp: CategoryDetail;
    clarity: CategoryDetail;
    proof: CategoryDetail;
    cta: CategoryDetail;
    verdict: string;
    isError?: boolean;
}

export interface ImprovementFix {
    fix: string;
    impact: string;
}

export interface AIResult<T> {
    data: T;
    prompt: string;
    response: string;
}

export class AIService {
    private ai: any;

    constructor(ai: any) {
        this.ai = ai;
    }

    async auditContent(content: any): Promise<AIResult<AuditScores>> {
        const prompt = `
      You are an expert marketing auditor. Audit the following landing page content.
      
      CONTENT:
      Hero: ${content.hero.substring(0, 500)}
      Headings: ${content.headings.join(" | ").substring(0, 1000)}
      CTAs: ${content.ctas.join(" | ").substring(0, 500)}
      Testimonials: ${content.testimonials.join(" | ").substring(0, 2000)}

      SCORING CRITERIA (1-5, where 1=Poor, 5=Excellent):
      1. Positioning: Is the product's unique space clear?
      2. Value: Does it clearly communicate benefits?
      3. ICP: Is it obvious who this is for?
      4. Clarity: Is the message easy to understand?
      5. Proof: Is there sufficient social proof or data?
      6. CTA: Are call-to-actions compelling and clear?

      For EACH category, provide:
      - A score (1-5)
      - A concise reasoning (1-2 sentences) explaining the score based on the content.
      - 1-2 specific "examples" (quotes) from the site that support this reasoning, with a short label (e.g., "Hero headline", "Main CTA").

      VERDICT:
      Provide a one-sentence "verdict" summarizing the psychological impact.

      Provide ONLY a raw JSON response in this format:
      {
        "positioning": { "score": number, "reasoning": "string", "examples": [{"text": "string", "label": "string"}] },
        "value": { "score": number, "reasoning": "string", "examples": [{"text": "string", "label": "string"}] },
        "icp": { "score": number, "reasoning": "string", "examples": [{"text": "string", "label": "string"}] },
        "clarity": { "score": number, "reasoning": "string", "examples": [{"text": "string", "label": "string"}] },
        "proof": { "score": number, "reasoning": "string", "examples": [{"text": "string", "label": "string"}] },
        "cta": { "score": number, "reasoning": "string", "examples": [{"text": "string", "label": "string"}] },
        "verdict": "string"
      }
    `;

        try {
            console.log("AI Audit Prompt:", prompt);
            const response = await this.ai.run("@cf/meta/llama-3-8b-instruct", {
                messages: [{ role: "user", content: prompt }],
                max_tokens: 2048,
            });

            const rawResponse = response.response || response.text || "";
            console.log("AI Audit Raw Response:", rawResponse);
            const jsonStr = this.extractJSON(rawResponse);
            return {
                data: JSON.parse(jsonStr),
                prompt,
                response: rawResponse,
            };
        } catch (error) {
            console.error("AI Audit Error:", error);
            // Graceful fallback for upstream errors (e.g. Cloudflare error 1031)
            const fallback: AuditScores = {
                positioning: { score: 0, reasoning: "Incomplete: AI unavailable.", examples: [] },
                value: { score: 0, reasoning: "Incomplete: AI unavailable.", examples: [] },
                icp: { score: 0, reasoning: "Incomplete: AI unavailable.", examples: [] },
                clarity: { score: 0, reasoning: "Incomplete: AI unavailable.", examples: [] },
                proof: { score: 0, reasoning: "Incomplete: AI unavailable.", examples: [] },
                cta: { score: 0, reasoning: "Incomplete: AI unavailable.", examples: [] },
                verdict: "THUNDERCLAP ENGINE OFFLINE (Error 1031): The AI model is currently overloaded. We cannot provide an accurate Messaging Score at this moment. Please try again in 5-10 minutes.",
                isError: true
            };
            return {
                data: fallback,
                prompt,
                response: "Fallback used due to AI error: " + (error as any).message,
            };
        }
    }

    async suggestImprovements(content: any, scores: AuditScores): Promise<AIResult<ImprovementFix[]>> {
        const prompt = `
      Based on the following audit scores (1-5): ${JSON.stringify(scores)}
      And the current landing page content: ${JSON.stringify(content)}
      
      Suggest 3 prioritized improvements to increase the messaging score.
      Each fix should be specific and actionable.
      
      Provide ONLY a raw JSON response in this format. Ensure all quotes inside strings are escaped with backslashes.
      [
        {"fix": "string", "impact": "High/Medium/Low"},
        {"fix": "string", "impact": "High/Medium/Low"},
        {"fix": "string", "impact": "High/Medium/Low"}
      ]
    `;

        try {
            console.log("AI Improvements Prompt:", prompt);
            const response = await this.ai.run("@cf/mistral/mistral-7b-instruct-v0.1", {
                messages: [{ role: "user", content: prompt }],
                max_tokens: 1024,
            });

            const rawResponse = response.response || response.text || "";
            console.log("AI Improvements Raw Response:", rawResponse);
            const jsonStr = this.extractJSON(rawResponse);
            return {
                data: JSON.parse(jsonStr),
                prompt,
                response: rawResponse,
            };
        } catch (error) {
            console.error("AI Improvements Error:", error);
            const fallback = [
                { fix: "Clarify the hero headline to speak directly to the target audience.", impact: "High" },
                { fix: "Add more specific social proof or case studies.", impact: "Medium" }
            ];
            return {
                data: fallback,
                prompt,
                response: "Fallback used due to AI error: " + (error as any).message,
            };
        }
    }

    private extractJSON(text: string): string {
        // 1. Remove markdown code blocks
        let cleaned = text.replace(/```json\n?|```/g, "").trim();

        // 2. Find the first '{' or '[' and the last corresponding '}' or ']'
        const startBrace = cleaned.indexOf("{");
        const startBracket = cleaned.indexOf("[");
        let startIndex = -1;

        if (startBrace !== -1 && (startBracket === -1 || startBrace < startBracket)) {
            startIndex = startBrace;
        } else if (startBracket !== -1) {
            startIndex = startBracket;
        }

        if (startIndex === -1) return cleaned;

        const endBrace = cleaned.lastIndexOf("}");
        const endBracket = cleaned.lastIndexOf("]");
        let endIndex = -1;

        if (endBrace !== -1 && (endBracket === -1 || endBrace > endBracket)) {
            endIndex = endBrace;
        } else if (endBracket !== -1) {
            endIndex = endBracket;
        }

        if (endIndex === -1) return cleaned;

        cleaned = cleaned.substring(startIndex, endIndex + 1);

        // 3. Sanitize the extracted JSON
        return this.sanitizeJSON(cleaned);
    }

    private sanitizeJSON(json: string): string {
        return json
            // Remove trailing commas in objects and arrays
            .replace(/,\s*([}\]])/g, "$1")
            // Fix unescaped newlines in strings
            .replace(/"([^"]*)"/g, (match, p1) => {
                return '"' + p1.replace(/\n/g, "\\n").replace(/\r/g, "\\r") + '"';
            });
        // Note: Unescaped quotes inside strings are handled via prompt instructions
        // as automated regex-based fixing is prone to false positives.
    }
}

