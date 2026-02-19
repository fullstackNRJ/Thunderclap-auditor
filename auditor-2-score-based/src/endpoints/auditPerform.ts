import { OpenAPIRoute } from "chanfana";
import { AuditRequest, AuditResponse } from "../schemas/audit";
import { AuditService } from "../services/audit";
import { AppContext } from "../types";

export class AuditEndpoint extends OpenAPIRoute {
    schema = {
        tags: ["Audit"],
        summary: "Audit a landing page for messaging effectiveness",
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: AuditRequest,
                    },
                },
            },
        },
        responses: {
            "200": {
                description: "The audit result with messaging score and fixes",
                content: {
                    "application/json": {
                        schema: AuditResponse,
                    },
                },
            },
            "400": {
                description: "Invalid request or failed to fetch URL",
            },
            "500": {
                description: "Internal server error during audit",
            },
        },
    };

    async handle(c: AppContext) {
        const data = await this.getValidatedData<any>();
        const auditService = new AuditService();

        try {
            const result = await auditService.performAudit(data.body.url, c.env);
            return result;
        } catch (e: any) {
            console.error("Audit processing failed:", e);
            return c.json(
                { error: "Failed to process audit", details: e.message },
                500
            );
        }
    }
}
