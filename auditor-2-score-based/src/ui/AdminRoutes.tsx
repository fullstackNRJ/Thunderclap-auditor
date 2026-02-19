import { Context } from "hono";
import { Layout } from "./layout";
import { DatabaseService } from "../services/db";
import { AuthService } from "../services/auth";

export const AdminUI = {
    login: (c: Context, error?: string) => {
        return c.html(
            <Layout title="Admin Login | Thunderclap">
                <div class="max-w-md mx-auto mt-32 px-4">
                    <div class="bg-white p-10 rounded-3xl shadow-2xl border border-gray-100">
                        <h1 class="text-3xl font-black text-center mb-8 tracking-tight">Admin Login</h1>
                        {error && <p class="text-red-600 mb-6 text-sm font-bold bg-red-50 p-4 rounded-xl border border-red-100 text-center">{error}</p>}
                        <form action="/admin/login" method="POST" class="space-y-6">
                            <div>
                                <label class="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Access Password</label>
                                <input type="password" name="password" required
                                    class="w-full px-6 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all outline-none" />
                            </div>
                            <button type="submit" class="w-full bg-gray-900 text-white font-bold py-5 rounded-xl transition-all hover:scale-[1.02] active:scale-95 shadow-xl">
                                Enter Dashboard
                            </button>
                        </form>
                    </div>
                </div>
            </Layout>
        );
    },

    dashboard: async (c: Context) => {
        const db = new DatabaseService((c.env as any).DB);
        const reports: any[] = await db.getAllReports();

        return c.html(
            <Layout title="Admin Dashboard | Thunderclap">
                <nav class="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center bg-white/70 backdrop-blur-md sticky top-0 z-50">
                    <div class="flex items-center gap-2">
                        <div class="w-8 h-8 bg-black rounded-lg"></div>
                        <span class="font-black text-xl tracking-tighter">THUNDERCLAP</span>
                    </div>
                    <div class="flex items-center gap-6">
                        <a href="/admin" class="text-sm font-bold text-black border-b-2 border-black pb-1">Reports</a>
                        <a href="/admin/config" class="text-sm font-bold text-gray-400 hover:text-black transition-colors">Config</a>
                        <a href="/admin/logout" class="text-sm font-bold text-gray-400 hover:text-red-600 transition-colors">Logout</a>
                    </div>
                </nav>

                <div class="max-w-6xl mx-auto px-8 py-12">
                    <div class="flex justify-between items-end mb-12">
                        <div>
                            <h1 class="text-4xl font-black text-gray-900 mb-2">Audit Logs</h1>
                            <p class="text-gray-500 font-medium">History of all analyzed landing pages</p>
                        </div>
                        <div class="text-right">
                            <p class="text-3xl font-black text-gray-900">{reports.length}</p>
                            <p class="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Reports</p>
                        </div>
                    </div>

                    <div class="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                        <table class="w-full text-left">
                            <thead class="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th class="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">URL</th>
                                    <th class="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Score</th>
                                    <th class="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Date</th>
                                    <th class="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-50">
                                {reports.map(r => (
                                    <tr class="hover:bg-gray-50/50 transition-colors">
                                        <td class="px-8 py-6 font-bold text-gray-900 text-sm truncate max-w-xs">{r.url}</td>
                                        <td class="px-8 py-6">
                                            <span class={`text-sm font-black italic ${r.messaging_score > 70 ? 'text-green-600' : 'text-orange-600'}`}>{r.messaging_score}</span>
                                        </td>
                                        <td class="px-8 py-6 text-sm text-gray-500 font-medium">{new Date(r.created_at).toLocaleString()}</td>
                                        <td class="px-8 py-6 text-right">
                                            <a href={`/report/${r.id}`} target="_blank" class="text-xs font-black bg-gray-100 text-gray-600 px-4 py-2 rounded-lg hover:bg-black hover:text-white transition-all">Report</a>
                                            <a href={`/admin/audit/${r.id}`} class="ml-2 text-xs font-black bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-600 hover:text-white transition-all">Details</a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </Layout>
        );
    },

    reportDetail: async (c: Context) => {
        const id = c.req.param("id");
        const db = new DatabaseService((c.env as any).DB);
        const r: any = await db.getReportById(id);

        if (!r) return c.notFound();

        return c.html(
            <Layout title={`Audit Detail | ${r.url}`}>
                <div class="max-w-6xl mx-auto px-8 py-12">
                    <a href="/admin" class="text-xs font-black text-blue-600 uppercase tracking-widest mb-8 inline-block hover:translate-x-[-4px] transition-transform">← Back to Logs</a>
                    <h1 class="text-4xl font-black text-gray-900 mb-12">Deep Dive: <span class="text-blue-600 italic uppercase underline decoration-4 underline-offset-8">{new URL(r.url).hostname}</span></h1>

                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                        <div class="bg-gray-900 p-8 rounded-3xl text-gray-300">
                            <h2 class="text-xs font-black text-blue-400 uppercase tracking-widest mb-6">AI 1: Analysis Prompt</h2>
                            <pre class="whitespace-pre-wrap text-[11px] font-mono leading-relaxed opacity-80">{r.ai1_prompt}</pre>
                        </div>
                        <div class="bg-white p-8 rounded-3xl border border-gray-100">
                            <h2 class="text-xs font-black text-blue-600 uppercase tracking-widest mb-6">AI 1: Raw Output</h2>
                            <pre class="whitespace-pre-wrap text-[11px] font-mono leading-relaxed text-gray-600">{r.ai1_response}</pre>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div class="bg-gray-900 p-8 rounded-3xl text-gray-300">
                            <h2 class="text-xs font-black text-green-400 uppercase tracking-widest mb-6">AI 2: Improvements Prompt</h2>
                            <pre class="whitespace-pre-wrap text-[11px] font-mono leading-relaxed opacity-80">{r.ai2_prompt}</pre>
                        </div>
                        <div class="bg-white p-8 rounded-3xl border border-gray-100">
                            <h2 class="text-xs font-black text-green-600 uppercase tracking-widest mb-6">AI 2: Raw Output</h2>
                            <pre class="whitespace-pre-wrap text-[11px] font-mono leading-relaxed text-gray-600">{r.ai2_response}</pre>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }
};
