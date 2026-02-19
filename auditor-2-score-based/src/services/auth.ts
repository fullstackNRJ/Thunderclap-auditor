import { Context, Next } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";

export class AuthService {
    private static SESSION_KEY = "admin_session";

    static async middleware(c: Context, next: Next) {
        const session = getCookie(c, AuthService.SESSION_KEY);
        const isAdmin = session === "authenticated";

        if (!isAdmin && c.req.path.startsWith("/admin") && c.req.path !== "/admin/login") {
            return c.redirect("/admin/login");
        }

        await next();
    }

    static async login(c: Context, password: string): Promise<boolean> {
        const adminPassword = (c.env as any).ADMIN_PASSWORD || "admin"; // Default for dev if not set
        if (password === adminPassword) {
            setCookie(c, AuthService.SESSION_KEY, "authenticated", {
                httpOnly: true,
                secure: true,
                sameSite: "Strict",
                maxAge: 60 * 60 * 24, // 24 hours
            });
            return true;
        }
        return false;
    }

    static logout(c: Context) {
        deleteCookie(c, AuthService.SESSION_KEY);
    }
}
