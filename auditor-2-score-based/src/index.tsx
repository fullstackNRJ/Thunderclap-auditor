import { fromHono } from "chanfana";
import { Hono } from "hono";
import { AuditEndpoint } from "./endpoints/auditPerform";
import { UserUI } from "./ui/UserRoutes";
import { AdminUI } from "./ui/AdminRoutes";
import { AuthService } from "./services/auth";
import { AuditService } from "./services/audit";

type Bindings = {
	DB: D1Database;
	AI: any;
	BROWSER: any;
	ADMIN_PASSWORD?: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// Auth Middleware
app.use("/admin*", AuthService.middleware);

// User UI Routes
app.get("/", (c) => UserUI.landing(c));
app.get("/report/:id", (c) => UserUI.report(c));

// Form handler for audits from the UI
app.post("/audit", async (c) => {
	const body = await c.req.parseBody();
	const url = body.url as string;
	const auditService = new AuditService();
	try {
		const result = await auditService.performAudit(url, c.env);

		if (c.req.header("Accept")?.includes("application/json")) {
			return c.json({ redirect: `/report/${result.id}` });
		}

		return c.redirect(`/report/${result.id}`);
	} catch (e: any) {
		console.error("Audit failed:", e);
		if (c.req.header("Accept")?.includes("application/json")) {
			return c.json({ error: e.message }, 500);
		}
		return c.text("Audit failed: " + e.message, 500);
	}
});

// Admin UI Routes
app.get("/admin/login", (c) => AdminUI.login(c));
app.post("/admin/login", async (c) => {
	const body = await c.req.parseBody();
	const success = await AuthService.login(c, body.password as string);
	if (success) return c.redirect("/admin");
	return AdminUI.login(c, "Invalid password");
});
app.get("/admin", (c) => AdminUI.dashboard(c));
app.get("/admin/audit/:id", (c) => AdminUI.reportDetail(c));
app.get("/admin/logout", (c) => {
	AuthService.logout(c);
	return c.redirect("/admin/login");
});

// API Routes (OpenAPI) - Moved to avoid root conflict
const openapi = fromHono(app, {
	docs_url: "/api-docs",
});

openapi.post("/api/audit", AuditEndpoint);

export default app;

