import { Context } from "hono";
import { Layout } from "./layout";
import { AuditService } from "../services/audit";
import { DatabaseService } from "../services/db";

export const UserUI = {
    decodeHTMLEntities: (str: string) => {
        if (!str) return "";
        return str
            .replace(/&quot;/g, '"')
            .replace(/&#x27;/g, "'")
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/&#39;/g, "'")
            .replace(/&rsquo;/g, "'")
            .replace(/&lsquo;/g, "'");
    },

    landing: (c: Context) => {
        return c.html(
            <Layout title="Thunderclap Auditor">
                <div class="max-w-4xl mx-auto px-4 py-20 flex flex-col items-center justify-center">
                    <div class="text-center mb-12">
                        <h1 class="text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">Audit Your Messaging</h1>
                        <p class="text-xl text-gray-600 max-w-2xl">Get a repeatable, explainable Messaging Score and prioritized fixes for your landing page.</p>
                    </div>

                    <form action="/audit" method="post" class="w-full max-w-lg bg-white p-8 rounded-2xl shadow-xl border border-gray-100 h-64 flex flex-col justify-between">
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
        const citations = scores.citations || [];

        // Remove citations and verdict from scores for the grid display
        const displayScores = { ...scores };
        delete displayScores.citations;
        delete displayScores.verdict;

        return c.html(
            <Layout title={`Audit Report: ${report.url}`}>
                <div class="max-w-5xl mx-auto px-6 py-16 container-query">
                    {/* Header Section */}
                    <div class="mb-16 pb-12 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div class="flex-1">
                            <div class="flex items-center gap-3 mb-4">
                                <span class="px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-blue-100">Audit Complete</span>
                                <span class="text-gray-300">/</span>
                                <span class="text-xs font-bold text-gray-500 uppercase tracking-widest">{new URL(report.url).hostname}</span>
                            </div>
                            <h1 class="text-7xl font-black text-gray-900 mb-4 tracking-tighter leading-none ">
                                Messaging <span class="text-blue-600 italic"> Score :</span>  <span class="text-blue-600">{report.messaging_score}</span>
                            </h1>

                            <p class="text-lg text-gray-500 font-medium">Historical audit comparison: <span class="text-gray-900 font-bold">-{100 - report.messaging_score}% from perfection</span></p>
                        </div>
                        <div class="max-w-1/2 bg-gray-900 text-white p-8 rounded-[2.5rem] shadow-2xl shadow-gray-200 min-w-[300px] transform hover:scale-105 transition-transform">
                            <p class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">The Verdict</p>
                            <h2 class="text-3xl font-black mb-2">{report.messaging_score > 70 ? "Ready to Scale" : "Optimization Required"}</h2>
                            <p class="text-sm text-gray-400 font-medium leading-relaxed">
                                {scores.verdict || (report.messaging_score > 70
                                    ? "Your core messaging is strong enough to support paid traffic at scale. Focus on minor edge cases."
                                    : "Major psychological friction detected. Scaling now would waste 40-60% of your ad spend.")}
                            </p>
                        </div>
                    </div>

                    {/* Psychological Breakdown (Citations) */}
                    {citations.length > 0 && (
                        <div class="mb-20">
                            <div class="flex items-center gap-4 mb-10">
                                <h2 class="text-3xl font-black text-gray-900 tracking-tight">Psychological <span class="text-blue-600 underline decoration-8 underline-offset-4 decoration-blue-100">Deep-Dive</span></h2>
                                <div class="h-px flex-1 bg-gray-100 ml-4"></div>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {citations.map((cite: any) => (
                                    <div class={`p-8 rounded-[2rem] border-2 transition-all hover:shadow-lg ${cite.type === 'good' ? 'bg-green-50/50 border-green-100' :
                                        cite.type === 'bad' ? 'bg-red-50/50 border-red-100' : 'bg-orange-50/50 border-orange-100'
                                        }`}>
                                        <div class="flex items-center gap-3 mb-4">
                                            <span class={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${cite.type === 'good' ? 'bg-green-600 text-white' :
                                                cite.type === 'bad' ? 'bg-red-600 text-white' : 'bg-orange-600 text-white'
                                                }`}>
                                                {cite.type}
                                            </span>
                                            <div class="h-px flex-1 bg-black/5"></div>
                                        </div>
                                        <p class="text-xl font-bold italic text-gray-900 mb-4 leading-tight">"{UserUI.decodeHTMLEntities(cite.sentence)}"</p>
                                        <div class="flex gap-4">
                                            <div class={`w-1 h-auto rounded-full ${cite.type === 'good' ? 'bg-green-200' : cite.type === 'bad' ? 'bg-red-200' : 'bg-orange-200'}`}></div>
                                            <p class="text-sm text-gray-600 font-medium leading-relaxed">{UserUI.decodeHTMLEntities(cite.explanation)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Scoring Metrics */}
                    <div class="mb-20">
                        <h2 class="text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-10 text-center">Rigid Audit Metrics</h2>
                        <div class="grid grid-cols-2 lg:grid-cols-6 gap-6">
                            {Object.entries(displayScores).map(([key, value]) => (
                                <div class="bg-white p-8 rounded-3xl border border-gray-100 text-center shadow-sm hover:border-blue-600 transition-colors group">
                                    <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 group-hover:text-blue-600 transition-colors font-bold">{key}</p>
                                    <p class="text-4xl font-black text-gray-900 group-hover:scale-110 transition-transform">{Number(value)}<span class="text-xs text-gray-300 font-bold">/5</span></p>
                                    <div class="w-full bg-gray-50 h-1.5 rounded-full mt-6 overflow-hidden">
                                        <div class={`h-full ${Number(value) > 3 ? 'bg-green-500' : 'bg-orange-500'}`} style={`width: ${Number(value) * 20}%`}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Execution Roadmap */}
                    <div class="mb-20">
                        <div class="bg-blue-600 rounded-[3rem] p-16 text-white overflow-hidden relative shadow-3xl shadow-blue-100">
                            <div class="relative z-10">
                                <h2 class="text-4xl font-black mb-12 tracking-tight">Execution Roadmap</h2>
                                <div class="space-y-6">
                                    {fixes.map((fix: any, idx: number) => (
                                        <div class="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/10 flex items-start gap-6 group hover:bg-white/20 transition-all">
                                            <div class="bg-white text-blue-600 w-12 h-12 rounded-2xl flex items-center justify-center font-black flex-shrink-0 text-xl overflow-hidden shadow-lg group-hover:rotate-6 transition-transform">
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <div class="flex items-center gap-3 mb-2">
                                                    <h4 class="font-extrabold text-xl leading-tight">{fix.fix}</h4>
                                                    <span class={`text-[10px] font-black uppercase px-2 py-0.5 rounded border border-white/40 whitespace-nowrap`}>
                                                        {fix.impact} Impact
                                                    </span>
                                                </div>
                                                <p class="text-blue-100 text-sm font-medium leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">Prioritized correction required to lift Messaging Score by estimated +12 points.</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div class="absolute -bottom-20 -right-20 w-96 h-96 bg-white/10 blur-[100px] rounded-full"></div>
                            <div class="absolute -top-20 -left-20 w-96 h-96 bg-blue-400/20 blur-[100px] rounded-full"></div>
                        </div>
                    </div>

                    {/* Evidence Vault */}
                    <div class="mt-32">
                        <div class="flex flex-col items-center mb-12">
                            <div class="w-12 h-1 bg-blue-600 mb-6 rounded-full"></div>
                            <h2 class="text-3xl font-black text-gray-900 tracking-tight">Evidence <span class="italic text-gray-400">Vault</span></h2>
                            <p class="text-gray-400 font-medium mt-2">The raw data used for this analysis</p>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div class="space-y-12">
                                <div>
                                    <h3 class="text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-4">
                                        Hero Section Content
                                        <div class="h-px flex-1 bg-gray-100"></div>
                                    </h3>
                                    <div class="bg-gray-50 p-8 rounded-3xl border border-gray-100 font-serif text-2xl text-gray-800 leading-snug">
                                        {UserUI.decodeHTMLEntities(evidence.hero) || "No hero content detected."}
                                    </div>
                                </div>
                                <div>
                                    <h3 class="text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-4 text-center">
                                        Core Headings
                                        <div class="h-px flex-1 bg-gray-100"></div>
                                    </h3>
                                    <div class="space-y-3">
                                        {evidence.headings.map((h: string) => (
                                            <div class="bg-white px-6 py-4 rounded-2xl border border-gray-100 text-gray-700 font-bold shadow-sm">{UserUI.decodeHTMLEntities(h)}</div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div class="space-y-12">
                                <div>
                                    <h3 class="text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-4">
                                        Calls to Action (CTAs)
                                        <div class="h-px flex-1 bg-gray-100"></div>
                                    </h3>
                                    <div class="flex flex-wrap gap-3">
                                        {evidence.ctas.map((cta: string) => (
                                            <span class="bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-sm uppercase tracking-wider">{UserUI.decodeHTMLEntities(cta)}</span>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h3 class="text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-4">
                                        Social Proof Elements
                                        <div class="h-px flex-1 bg-gray-100"></div>
                                    </h3>
                                    <div class="space-y-4">
                                        {evidence.testimonials.map((t: string) => (
                                            <div class="p-6 rounded-3xl border-2 border-dashed border-gray-200 text-gray-500 text-sm leading-relaxed italic">
                                                "{UserUI.decodeHTMLEntities(t)}"
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Disclaimer */}
                <div class="bg-gray-50 border-t border-gray-200 py-12 mt-20">
                    <div class="max-w-5xl mx-auto px-6 text-center">
                        <p class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 italic leading-relaxed">
                            This report was generated using Thunderclap Strategy Engine v2.0.<br />
                            Scores are based on a rigid marketing psychology framework and zero bias.
                        </p>
                        <div class="flex justify-center gap-8 mt-8 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
                            <div class="w-8 h-8 bg-black rounded-lg"></div>
                            <span class="font-black text-xl tracking-tighter self-center">THUNDERCLAP</span>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }
};
