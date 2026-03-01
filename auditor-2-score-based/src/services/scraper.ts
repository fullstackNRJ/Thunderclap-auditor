export interface ScrapedContent {
    hero: string;
    headings: string[];
    testimonials: string[];
    ctas: string[];
}

export class ScraperService {
    async scrape(url: string): Promise<ScrapedContent> {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch URL: ${url} (${response.status})`);
        }

        const result: ScrapedContent = {
            hero: "",
            headings: [],
            testimonials: [],
            ctas: [],
        };


        const rewriter = new HTMLRewriter()
            // Headings
            .on("h1, h2, h3", {
                text(text) {
                    if (!this.headingText) this.headingText = "";
                    this.headingText += text.text;
                    if (text.lastInTextNode) {
                        const content = this.headingText.trim();
                        if (content) result.headings.push(content);
                        this.headingText = "";
                    }
                },
            } as any)
            // CTAs - buttons, links with cta class, or signup/demo keywords
            .on('button, a[class*="cta"], a[class*="button"], a[href*="signup"], a[href*="demo"]', {
                text(text) {
                    if (!this.ctaText) this.ctaText = "";
                    this.ctaText += text.text;
                    if (text.lastInTextNode) {
                        const content = this.ctaText.trim();
                        if (content) result.ctas.push(content);
                        this.ctaText = "";
                    }
                },
            } as any)
            // Hero sections - heuristic based on classes
            .on('section[class*="hero"], div[class*="hero"], header', {
                text(text) {
                    if (!this.heroText) this.heroText = "";
                    this.heroText += text.text;
                    if (text.lastInTextNode) {
                        const content = this.heroText.trim();
                        if (!result.hero && content.length > 20) {
                            result.hero = content;
                        }
                        this.heroText = "";
                    }
                },
            } as any)
            // Testimonials - heuristic based on classes
            .on('[class*="testimonial"], blockquote, [class*="social-proof"]', {
                text(text) {
                    if (!this.testimonialText) this.testimonialText = "";
                    this.testimonialText += text.text;
                    if (text.lastInTextNode) {
                        const content = this.testimonialText.trim();
                        if (content) result.testimonials.push(content);
                        this.testimonialText = "";
                    }
                },
            } as any);

        // Transform doesn't return the result directly; it processes the stream. 
        // We need to consume the response body for the handlers to run.
        await rewriter.transform(response).arrayBuffer();

        // Deduplicate and clean up
        result.headings = [...new Set(result.headings)].filter(h => h.length > 2);
        result.ctas = [...new Set(result.ctas)].filter(c => c.length > 1);
        result.testimonials = [...new Set(result.testimonials)].filter(t => t.length > 10);

        return result;
    }
}
