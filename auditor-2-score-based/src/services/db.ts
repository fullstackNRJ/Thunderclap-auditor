export class DatabaseService {
    private db: D1Database;

    constructor(db: D1Database) {
        this.db = db;
    }

    async saveAuditReport(report: {
        id: string;
        url: string;
        messaging_score: number;
        section_scores: string;
        evidence: string;
        ai1_prompt?: string;
        ai1_response?: string;
        ai2_prompt?: string;
        ai2_response?: string;
        prioritized_fixes: string;
    }) {
        return this.db.prepare(`
      INSERT INTO audit_reports (
        id, url, messaging_score, section_scores, evidence, 
        ai1_prompt, ai1_response, ai2_prompt, ai2_response, prioritized_fixes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
            report.id,
            report.url,
            report.messaging_score,
            report.section_scores,
            report.evidence,
            report.ai1_prompt,
            report.ai1_response,
            report.ai2_prompt,
            report.ai2_response,
            report.prioritized_fixes
        ).run();
    }

    async getAllReports() {
        const result = await this.db.prepare("SELECT * FROM audit_reports ORDER BY created_at DESC").all();
        return result.results;
    }

    async getReportById(id: string) {
        return this.db.prepare("SELECT * FROM audit_reports WHERE id = ?").bind(id).first();
    }

    async getConfig(key: string): Promise<string | null> {
        const result: any = await this.db.prepare("SELECT value FROM app_config WHERE key = ?").bind(key).first();
        return result ? result.value : null;
    }

    async setConfig(key: string, value: string) {
        return this.db.prepare("INSERT OR REPLACE INTO app_config (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)").bind(key, value).run();
    }
}
