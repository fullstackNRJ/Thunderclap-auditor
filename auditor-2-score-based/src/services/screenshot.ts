import puppeteer from "@cloudflare/puppeteer";

export class ScreenshotService {
    async capture(url: string, browserBinding: any): Promise<string> {
        let browser;
        try {
            browser = await puppeteer.launch(browserBinding);
            const page = await browser.newPage();

            // Set viewport to a standard desktop size
            await page.setViewport({ width: 1280, height: 800 });

            // Navigate to URL
            await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

            // Wait a bit for animations to settle
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Capture screenshot as base64
            const screenshot = await page.screenshot({
                type: "jpeg",
                quality: 80,
                encoding: "base64"
            });

            return screenshot as string;
        } catch (error) {
            console.error("Screenshot Error:", error);
            throw new Error(`Failed to capture screenshot: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            if (browser) {
                await browser.close();
            }
        }
    }
}
