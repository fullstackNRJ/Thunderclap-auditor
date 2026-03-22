import { ScraperService, ScrapedContent } from "./scraper";
import { AIService, AuditScores, ImprovementFix } from "./ai";
import { DatabaseService } from "./db";
import { ScreenshotService } from "./screenshot";

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
    private screenshot = new ScreenshotService();

    async performAudit(url: string, env: Env): Promise<FullAuditResult> {
        const ai = new AIService(env.AI);
        const db = new DatabaseService(env.DB);
        const id = crypto.randomUUID();

        // 1. Scrape content & Capture Screenshot in parallel
        const [content, screenshot] = await Promise.all([
            this.scraper.scrape(url),
            this.screenshot.capture(url, env.BROWSER).catch(err => {
                console.error("Screenshot capture failed:", err);
                return "";
            })
        ]);

        // 2. Audit with Text AI
        const auditResult = await ai.auditContent(content);

        // 3. Vision Analysis if screenshot available
        let visionResult = null;
        if (screenshot) {
            visionResult = await ai.auditVision(screenshot, content);
            // Merge vision critique into relevant categories if possible
            if (visionResult && visionResult.visual_critique) {
                auditResult.data.verdict += ` | Visual Insight: ${visionResult.visual_critique}`;
            }
        }

        // 4. Scoring Logic (0-100)
        let messagingScore = this.calculateMessagingScore(auditResult.data);
        if (messagingScore !== null && visionResult && visionResult.visual_score) {
            // Blend vision score (30% weight)
            messagingScore = Math.round((messagingScore * 0.7) + (visionResult.visual_score * 0.3));
        }

        // 5. Improvements with AI 2
        const improvementsResult = await ai.suggestImprovements(content, auditResult.data);

        const result: FullAuditResult = {
            id,
            url,
            messagingScore: messagingScore || 0,
            sectionScores: auditResult.data,
            evidence: content,
            prioritizedFixes: improvementsResult.data,
        };

        // 6. Save to Database
        await db.saveAuditReport({
            id,
            url,
            messaging_score: result.messagingScore,
            section_scores: JSON.stringify(auditResult.data),
            evidence: JSON.stringify(content),
            ai1_prompt: auditResult.prompt,
            ai1_response: auditResult.response,
            ai2_prompt: improvementsResult.prompt,
            ai2_response: improvementsResult.response,
            prioritized_fixes: JSON.stringify(improvementsResult.data),
            screenshot: screenshot
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
