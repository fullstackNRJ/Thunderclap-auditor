export interface AuditScores {
    positioning: number;
    value: number;
    icp: number;
    clarity: number;
    proof: number;
    cta: number;
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
      Hero: ${content.hero}
      Headings: ${content.headings.join(" | ")}
      CTAs: ${content.ctas.join(" | ")}
      Testimonials: ${content.testimonials.join(" | ")}

      SCORING CRITERIA (1-5, where 1=Poor, 5=Excellent):
      1. Positioning: Is the product's unique space clear?
      2. Value: Does it clearly communicate benefits?
      3. ICP: Is it obvious who this is for?
      4. Clarity: Is the message easy to understand?
      5. Proof: Is there sufficient social proof or data?
      6. CTA: Are call-to-actions compelling and clear?

      Provide ONLY a raw JSON response in this format:
      {
        "positioning": number,
        "value": number,
        "icp": number,
        "clarity": number,
        "proof": number,
        "cta": number
      }
    `;

        try {
            const response = await this.ai.run("@cf/meta/llama-3-8b-instruct", {
                messages: [{ role: "user", content: prompt }],
            });

            const rawResponse = response.response || response.text || "";
            const jsonStr = this.extractJSON(rawResponse);
            return {
                data: JSON.parse(jsonStr),
                prompt,
                response: rawResponse,
            };
        } catch (error) {
            console.error("AI Audit Error:", error);
            throw new Error("Failed to audit content with AI");
        }
    }

    async suggestImprovements(content: any, scores: AuditScores): Promise<AIResult<ImprovementFix[]>> {
        const prompt = `
      Based on the following audit scores (1-5): ${JSON.stringify(scores)}
      And the current landing page content: ${JSON.stringify(content)}
      
      Suggest 3 prioritized improvements to increase the messaging score.
      Each fix should be specific and actionable.
      
      Provide ONLY a raw JSON response in this format:
      [
        {"fix": "string", "impact": "High/Medium/Low"},
        {"fix": "string", "impact": "High/Medium/Low"},
        {"fix": "string", "impact": "High/Medium/Low"}
      ]
    `;

        try {
            const response = await this.ai.run("@cf/mistral/mistral-7b-instruct-v0.1", {
                messages: [{ role: "user", content: prompt }],
            });

            const rawResponse = response.response || response.text || "";
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
        const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
        return match ? match[0] : text;
    }
}

