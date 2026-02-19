import { Context } from "hono";
import { Layout } from "./layout";
import { AuditService } from "../services/audit";
import { DatabaseService } from "../services/db";

export const UserUI = {
    landing: (c: Context) => {
        return c.html(
            <Layout title="Thunderclap Auditor">
                <div class="max-w-4xl mx-auto px-4 py-20 flex flex-col items-center justify-center">
                    <div class="text-center mb-12">
                        <h1 class="text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">Audit Your Messaging</h1>
                        <p class="text-xl text-gray-600 max-w-2xl">Get a repeatable, explainable Messaging Score and prioritized fixes for your landing page.</p>
                    </div>

                    <form action="/audit" method="POST" class="w-full max-w-lg bg-white p-8 rounded-2xl shadow-xl border border-gray-100 h-64 flex flex-col justify-between">
                        <div>
                            <label for="url" class="block text-sm font-semibold text-gray-700 mb-2">Website URL</label>
                            <input type="url" id="url" name="url" placeholder="https://yourwebsite.com" required
                                class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" />
                        </div>
                        <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-colors shadow-lg shadow-blue-200">
                            Run Audit
                        </button>
                    </form>

                    <div id="loading" class="hidden mt-8 w-full max-w-lg text-center">
                        <div class="shimmer h-8 w-48 mx-auto rounded-lg mb-4"></div>
                        <p class="text-gray-500 animate-pulse">Analyzing landing page psychology...</p>
                    </div>
                </div>
            </Layout>
        );
    },

    report: async (c: Context) => {
        const id = c.req.param("id");
        const db = new DatabaseService((c.env as any).DB);
        const report: any = await db.getReportById(id);

        if (!report) return c.notFound();

        const scores = JSON.parse(report.section_scores);
        const fixes = JSON.parse(report.prioritized_fixes);
        const evidence = JSON.parse(report.evidence);

        return c.html(
            <Layout title={`Audit Report: ${report.url}`}>
                <div class="max-w-4xl mx-auto px-4 py-12 container-query">
                    {/* Header Section */}
                    <div class="mb-12 border-b border-gray-200 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <p class="text-xs font-bold text-blue-600 tracking-widest uppercase mb-2">Executive Summary</p>
                            <h1 class="text-6xl font-black text-gray-900 mb-2 tracking-tight">Messaging Score: <span class="text-blue-600">{report.messaging_score}</span><span class="text-gray-400 text-2xl font-bold italic ml-1">/100</span></h1>
                            <p class="text-gray-500 font-medium">Audited on: {new Date(report.created_at).toLocaleDateString()}</p>
                        </div>
                        <div class="bg-gray-900 text-white px-6 py-4 rounded-2xl">
                            <p class="text-sm font-bold tracking-wide">Verdict: {report.messaging_score > 70 ? "Ready to Scale" : "Optimization Required"}</p>
                        </div>
                    </div>

                    {/* Scoring Grid */}
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                        {Object.entries(scores).map(([key, value]) => (
                            <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <div class="flex justify-between items-start mb-4">
                                    <h3 class="font-bold text-gray-900 capitalize text-sm tracking-wide">{key.replace(/_/g, ' ')}</h3>
                                    <span class={`text-xs font-bold px-2 py-1 rounded-md ${Number(value) > 3 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                        {(Number(value) * 20)}%
                                    </span>
                                </div>
                                <div class="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                    <div class={`h-full ${Number(value) > 3 ? 'bg-green-500' : 'bg-orange-500'}`} style={`width: ${Number(value) * 20}%`}></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Key Insight Highlight */}
                    <div class="bg-blue-600 rounded-3xl p-12 mb-16 relative overflow-hidden text-center">
                        <div class="absolute top-4 left-8 text-blue-400 opacity-30 text-9xl font-serif">“</div>
                        <p class="text-white text-3xl font-extrabold italic leading-tight mb-4 relative z-10">
                            "Your customers are searching for a partner to solve a strategic shift, but your messaging is still talking to them like you're just a faster tool."
                        </p>
                        <p class="text-blue-100 font-medium relative z-10">— AI Strategy Engine v1.0</p>
                    </div>

                    {/* Roadmap / Fixes */}
                    <div>
                        <h2 class="text-2xl font-black text-gray-900 mb-8 uppercase tracking-wider border-l-4 border-blue-600 pl-4">Execution Roadmap</h2>
                        <div class="space-y-4">
                            {fixes.map((fix: any, idx: number) => (
                                <div class="bg-white p-8 rounded-2xl border border-gray-100 flex items-start gap-6 shadow-sm">
                                    <div class="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-black flex-shrink-0">{idx + 1}</div>
                                    <div>
                                        <div class="flex items-center gap-3 mb-1">
                                            <h4 class="font-extrabold text-gray-900 text-lg">{fix.fix}</h4>
                                            <span class={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${fix.impact === 'High' ? 'border-red-600 text-red-600' : 'border-blue-600 text-blue-600'}`}>
                                                {fix.impact} Impact
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }
};
