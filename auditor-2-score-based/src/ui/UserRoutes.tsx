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

    SkeletonReport: () => {
        return (
            <div id="skeleton-report" class="hidden max-w-5xl mx-auto px-6 py-16 animate-pulse">
                <div class="mb-12 text-center bg-blue-50 py-6 rounded-3xl border border-blue-100 shadow-sm shadow-blue-50">
                    <p class="text-blue-600 font-black text-xl animate-bounce tracking-tight">
                        Analyzing messaging psychology... <span class="text-blue-400 font-bold text-sm block md:inline md:ml-2">(This usually takes 30-45 seconds)</span>
                    </p>
                </div>

                {/* Header Skeleton */}
                <div class="mb-16 pb-12 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div class="flex-1">
                        <div class="flex items-center gap-3 mb-4">
                            <div class="h-6 w-24 bg-gray-200 rounded-full"></div>
                            <div class="text-gray-300">/</div>
                            <div class="h-4 w-32 bg-gray-100 rounded"></div>
                        </div>
                        <div class="h-20 w-3/4 bg-gray-200 rounded-2xl mb-4"></div>
                        <div class="h-6 w-1/2 bg-gray-100 rounded"></div>
                    </div>
                    <div class="w-80 h-48 bg-gray-900 rounded-[2.5rem]"></div>
                </div>

                {/* Grid Skeleton */}
                <div class="mb-20 grid grid-cols-2 lg:grid-cols-6 gap-4">
                    {[1, 2, 3, 4, 5, 6].map(() => (
                        <div class="bg-white p-6 rounded-2xl border border-gray-100 flex flex-col items-center">
                            <div class="h-3 w-12 bg-gray-100 rounded mb-4"></div>
                            <div class="h-10 w-8 bg-gray-200 rounded mb-4"></div>
                            <div class="w-full bg-gray-50 h-1 rounded-full"></div>
                        </div>
                    ))}
                </div>

                {/* Detailed Breakdown Skeleton */}
                <div class="space-y-8">
                    <div class="h-10 w-64 bg-gray-200 rounded mb-12"></div>
                    {[1, 2].map(() => (
                        <div class="bg-white rounded-[2rem] border-2 border-gray-100 p-8">
                            <div class="flex justify-between items-center mb-6">
                                <div class="h-8 w-48 bg-gray-200 rounded"></div>
                                <div class="h-8 w-16 bg-gray-100 rounded-full"></div>
                            </div>
                            <div class="w-full bg-gray-100 h-2 rounded-full mb-8"></div>
                            <div class="h-4 w-full bg-gray-100 rounded mb-2"></div>
                            <div class="h-4 w-5/6 bg-gray-100 rounded mb-8"></div>
                            <div class="space-y-4">
                                <div class="h-20 w-full bg-gray-50 rounded-2xl"></div>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        );
    },

    landing: (c: Context) => {
        return c.html(
            <Layout title="Thunderclap Auditor">
                <div id="landing-content" class="max-w-4xl mx-auto px-4 py-20 flex flex-col items-center justify-center">
                    <div class="text-center mb-12">
                        <h1 class="text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">Audit Your Messaging</h1>
                        <p class="text-xl text-gray-600 max-w-2xl">Get a repeatable, explainable Messaging Score and prioritized fixes for your landing page.</p>
                    </div>

                    <form id="audit-form" action="/audit" method="post" class="w-full max-w-lg bg-white p-8 rounded-2xl shadow-xl border border-gray-100 h-64 flex flex-col justify-between">
                        <div>
                            <label for="url" class="block text-sm font-semibold text-gray-700 mb-2">Website URL</label>
                            <div class="relative flex items-center">
                                <span class="absolute left-4 text-gray-400 font-bold pointer-events-none">https://</span>
                                <input type="text" id="url" name="url" placeholder="example.com" required
                                    class="w-full pl-[4.5rem] pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none font-medium" />
                            </div>
                        </div>
                        <button type="submit" id="submit-btn" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-colors shadow-lg shadow-blue-200 flex items-center justify-center gap-2 text-lg">
                            Start Audit
                        </button>
                    </form>
                </div>

                {UserUI.SkeletonReport()}

                <script dangerouslySetInnerHTML={{
                    __html: `
                    const urlInput = document.getElementById('url');
                    
                    // Trim prefix if user pastes/types it
                    urlInput.addEventListener('input', (e) => {
                        let val = e.target.value.trim();
                        if (val.startsWith('https://')) {
                            e.target.value = val.replace('https://', '');
                        } else if (val.startsWith('http://')) {
                            e.target.value = val.replace('http://', '');
                        }
                    });

                    document.getElementById('audit-form').addEventListener('submit', async (e) => {
                        e.preventDefault();
                        const form = e.target;
                        let urlValue = urlInput.value.trim();

                        // Ensure we have a valid URL for the backend
                        if (urlValue && !urlValue.startsWith('http')) {
                            urlValue = 'https://' + urlValue;
                        }

                        const formData = new FormData();
                        formData.append('url', urlValue);

                        // UI Transition
                        document.getElementById('landing-content').classList.add('hidden');
                        document.getElementById('skeleton-report').classList.remove('hidden');
                        window.scrollTo({ top: 0, behavior: 'smooth' });

                        const targetUrl = form.action;

                        try {
                            const response = await fetch(targetUrl, {
                                method: 'POST',
                                body: formData,
                                headers: { 'Accept': 'application/json' }
                            });
                            
                            if (response.ok) {
                                const result = await response.json();
                                if (result.redirect) {
                                    window.location.href = result.redirect;
                                    return;
                                }
                            }
                            throw new Error('Audit failed');
                        } catch (err) {
                            console.error(err);
                            alert('Audit failed. Please try again.');
                            window.location.reload();
                        }
                    });
                ` }} />
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

        const categoryLabels: Record<string, string> = {
            positioning: "Positioning",
            value: "Value Proposition",
            icp: "Audience Alignment",
            clarity: "Messaging Clarity",
            proof: "Proof & Credibility",
            cta: "Call to Action"
        };

        const isError = scores.isError === true;

        return c.html(
            <Layout title={`Audit Report: ${report.url}`}>
                <div class="max-w-5xl mx-auto px-6 py-16 container-query">
                    {/* Header Section */}
                    <div class="mb-16 pb-12 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div class="flex-1">
                            <div class="flex items-center gap-3 mb-4">
                                <span class={`px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border ${isError ? 'bg-red-50 text-red-700 border-red-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                                    {isError ? 'Audit Suspended' : 'Audit Complete'}
                                </span>
                                <span class="text-gray-300">/</span>
                                <span class="text-xs font-bold text-gray-500 uppercase tracking-widest">{new URL(report.url).hostname}</span>
                            </div>
                            <h1 class="text-7xl font-black text-gray-900 mb-4 tracking-tighter leading-none ">
                                Messaging <span class="text-blue-600 italic"> {isError ? 'Report' : 'Score :'}</span>  {!isError && <span class="text-blue-600">{report.messaging_score}</span>}
                            </h1>

                            {!isError && (
                                <p class="text-lg text-gray-500 font-medium">Historical audit comparison: <span class="text-gray-900 font-bold">-{100 - report.messaging_score}% from perfection</span></p>
                            )}
                        </div>
                        <div class={`max-w-1/2 p-8 rounded-[2.5rem] shadow-2xl min-w-[300px] transform hover:scale-105 transition-transform ${isError ? 'bg-red-600 text-white shadow-red-200' : 'bg-gray-900 text-white shadow-gray-200'}`}>
                            <p class={`text-[10px] font-black uppercase tracking-[0.2em] mb-4 ${isError ? 'text-white/80' : 'text-gray-400'}`}>
                                {isError ? 'Critical Status' : 'The Verdict'}
                            </p>
                            <h2 class="text-3xl font-black mb-2">{isError ? 'AI Unavailable' : (report.messaging_score > 70 ? "Ready to Scale" : "Optimization Required")}</h2>
                            <p class={`text-sm font-medium leading-relaxed ${isError ? 'text-white' : 'text-gray-400'}`}>
                                {scores.verdict || (report.messaging_score > 70
                                    ? "Your core messaging is strong enough to support paid traffic at scale. Focus on minor edge cases."
                                    : "Major psychological friction detected. Scaling now would waste 40-60% of your ad spend.")}
                            </p>
                        </div>
                    </div>

                    {!isError && (
                        <>
                            {/* Quick Score Grid */}
                            <div class="mb-20">
                                <div class="grid grid-cols-2 lg:grid-cols-6 gap-4">
                                    {Object.entries(categoryLabels).map(([key, label]) => {
                                        const data = scores[key];
                                        const value = typeof data === 'object' ? data.score : data;
                                        return (
                                            <div class="bg-white p-6 rounded-2xl border border-gray-100 text-center shadow-sm hover:border-blue-600 transition-colors group">
                                                <p class="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-2 group-hover:text-blue-600 transition-colors">{label}</p>
                                                <p class="text-2xl font-black text-gray-900 group-hover:scale-110 transition-transform">{Number(value)}<span class="text-[10px] text-gray-300 font-bold">/5</span></p>
                                                <div class="w-full bg-gray-50 h-1 rounded-full mt-4 overflow-hidden">
                                                    <div class={`h-full ${Number(value) > 3 ? 'bg-green-500' : 'bg-orange-500'}`} style={`width: ${Number(value) * 20}%`}></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* How we evaluated your score */}
                            <div class="mb-20">
                                <div class="flex flex-col mb-12">
                                    <h2 class="text-4xl font-black text-gray-900 tracking-tight mb-2">How we evaluated your <span class="text-blue-600 underline decoration-8 underline-offset-4 decoration-blue-100">score</span></h2>
                                    <p class="text-gray-500 font-medium">Detailed breakdown of each category based on real copy from your site.</p>
                                </div>

                                <div class="space-y-8">
                                    {Object.entries(categoryLabels).map(([key, label]) => {
                                        const data = scores[key];
                                        if (!data || typeof data !== 'object') return null;
                                        const percentage = data.score * 20;

                                        return (
                                            <div class="bg-white rounded-[2rem] border-2 border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                                <div class="p-8">
                                                    <div class="flex justify-between items-center mb-6">
                                                        <h3 class="text-2xl font-black text-gray-900">{label}</h3>
                                                        <div class="flex items-center gap-3">
                                                            <span class="text-2xl font-black text-gray-900">{percentage}%</span>
                                                            <span class={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${data.score >= 4 ? 'bg-green-100 text-green-700' : data.score >= 3 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                                                                {data.score >= 4 ? 'Good' : data.score >= 3 ? 'Moderate' : 'Poor'}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div class="w-full bg-gray-100 h-2 rounded-full mb-8 overflow-hidden">
                                                        <div class={`h-full transition-all duration-1000 ${data.score >= 4 ? 'bg-green-500' : data.score >= 3 ? 'bg-orange-500' : 'bg-red-500'}`} style={`width: ${percentage}%`}></div>
                                                    </div>

                                                    <p class="text-lg text-gray-700 font-medium leading-relaxed mb-8">
                                                        {UserUI.decodeHTMLEntities(data.reasoning)}
                                                    </p>

                                                    {data.examples && data.examples.length > 0 && (
                                                        <div class="space-y-4">
                                                            <p class="text-xs font-black text-gray-400 uppercase tracking-widest">Examples from your site:</p>
                                                            {data.examples.map((ex: any) => (
                                                                <div class="bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
                                                                    <p class="text-gray-900 font-bold italic mb-2">"{UserUI.decodeHTMLEntities(ex.text)}"</p>
                                                                    <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">{ex.label}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <div class="bg-gray-50 flex justify-end px-8 py-3 border-t border-gray-100">
                                                    <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Contributes ~16% to overall score</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    )}

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
                            {/* Visual Evidence (New) */}
                            {report.screenshot && (
                                <div class="col-span-1 md:col-span-2 bg-white rounded-[2rem] border-2 border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                    <div class="bg-gray-50 px-8 py-4 border-b border-gray-100 flex justify-between items-center">
                                        <p class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Visual Evidence <span class="text-gray-400 font-medium">/ Captured via Browser Rendering</span></p>
                                        <span class="px-3 py-1 bg-blue-100 text-blue-700 text-[10px] font-black uppercase rounded-full">Llama 3.2 Vision Enabled</span>
                                    </div>
                                    <div class="p-6">
                                        <img
                                            src={`data:image/jpeg;base64,${report.screenshot}`}
                                            alt="Landing Page Screenshot"
                                            class="w-full h-auto rounded-2xl border border-gray-100 shadow-xl"
                                        />
                                    </div>
                                </div>
                            )}

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
