import { z } from "zod";
import { Str } from "chanfana";

export const AuditRequest = z.object({
    url: Str({ example: "https://example.com" }),
});

export const AuditResponse = z.object({
    url: z.string(),
    messagingScore: z.number().int().min(0).max(100),
    sectionScores: z.object({
        positioning: z.number().int(),
        value: z.number().int(),
        icp: z.number().int(),
        clarity: z.number().int(),
        proof: z.number().int(),
        cta: z.number().int(),
    }),
    evidence: z.object({
        hero: z.string(),
        headings: z.array(z.string()),
        testimonials: z.array(z.string()),
        ctas: z.array(z.string()),
    }),
    prioritizedFixes: z.array(z.object({
        fix: z.string(),
        impact: z.string(),
    })),
});
