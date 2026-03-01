import { ScraperService, ScrapedContent } from "./scraper";
import { AIService, AuditScores, ImprovementFix } from "./ai";
import { DatabaseService } from "./db";

export interface FullAuditResult {
    id: string;
    url: string;
    messagingScore: number;
    sectionScores: AuditScores;
    evidence: ScrapedContent;
    prioritizedFixes: ImprovementFix[];
}

export class AuditService {
    private scraper = new ScraperService();

    async performAudit(url: string, env: any): Promise<FullAuditResult> {
        const ai = new AIService(env.AI);
        const db = new DatabaseService(env.DB);
        const id = crypto.randomUUID();

        // 1. Scrape content
        const content = await this.scraper.scrape(url);

        // 2. Audit with AI 1 (LLaMA-3)
        const auditResult = await ai.auditContent(content);

        // 3. Scoring Logic (0-100)
        const messagingScore = this.calculateMessagingScore(auditResult.data);

        // 4. Improvements with AI 2 (Mistral)
        const improvementsResult = await ai.suggestImprovements(content, auditResult.data);

        const result: FullAuditResult = {
            id,
            url,
            messagingScore,
            sectionScores: auditResult.data,
            evidence: content,
            prioritizedFixes: improvementsResult.data,
        };

        // 5. Save to Database
        await db.saveAuditReport({
            id,
            url,
            messaging_score: messagingScore,
            section_scores: JSON.stringify(auditResult.data),
            evidence: JSON.stringify(content),
            ai1_prompt: auditResult.prompt,
            ai1_response: auditResult.response,
            ai2_prompt: improvementsResult.prompt,
            ai2_response: improvementsResult.response,
            prioritized_fixes: JSON.stringify(improvementsResult.data),
        });

        return result;
    }

    private calculateMessagingScore(scores: AuditScores): number | null {
        if (scores.isError) return null;

        // User's suggested rigid logic expanded for all 6 metrics
        // We'll normalize 1-5 scores to 0-100 based on weights
        const weights = {
            positioning: 20,
            value: 20,
            icp: 20,
            clarity: 15,
            proof: 15,
            cta: 10,
        };

        const maxRating = 5;

        const weightedSum =
            (scores.positioning.score / maxRating) * weights.positioning +
            (scores.value.score / maxRating) * weights.value +
            (scores.icp.score / maxRating) * weights.icp +
            (scores.clarity.score / maxRating) * weights.clarity +
            (scores.proof.score / maxRating) * weights.proof +
            (scores.cta.score / maxRating) * weights.cta;

        return Math.round(weightedSum);
    }
}
