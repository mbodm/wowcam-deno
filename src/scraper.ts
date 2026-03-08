type ScraperApiSuccessResponse = {
    addonSlug: string,
    downloadUrl: string
};

type ScraperApiErrorResponse = {
    errorMessage: string
};

export type ScrapeResult = {
    addonSlug: string,
    downloadUrl: string,
    scrapedAt: string
};

export class UpstreamError extends Error {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = "UpstreamError";
    }
}

export async function callScraperApi(addonSlug: string): Promise<ScrapeResult> {
    const normalizedAddonSlug = addonSlug.toLowerCase().trim();
    if (normalizedAddonSlug === "") {
        throw new Error("Given 'addonSlug' is an empty string (or contains only whitespace)");
    }
    const scraperUrl = `https://wowcam.mbodm.com/scrape?addon=${encodeURIComponent(normalizedAddonSlug)}`;
    let response: Response;
    let content: ScraperApiSuccessResponse | ScraperApiErrorResponse;
    try {
        response = await fetch(scraperUrl, { signal: AbortSignal.timeout(30_000) });
        content = await response.json();
    }
    catch (err: unknown) {
        throw new UpstreamError("Error occurred while calling scraper API", err);
    }
    if (!response.ok) {
        const messageIntro = `Received response error from scraper API (HTTP ${response.status})`;
        const message = isScraperApiErrorResponse(content) ? `${messageIntro}: ${content.errorMessage.trim()}` : messageIntro;
        throw new UpstreamError(message);
    }
    if (!isScraperApiSuccessResponse(content) || content.addonSlug.toLowerCase().trim() !== normalizedAddonSlug) {
        throw new UpstreamError("Response JSON from scraper API did not contain the expected addon slug and download URL (even when status code was HTTP 200)");
    }
    return {
        addonSlug: normalizedAddonSlug,
        downloadUrl: content.downloadUrl.trim(),
        scrapedAt: new Date().toISOString().slice(0, 16) + "Z"
    };
}

// Type Guards

const isScraperApiErrorResponse = (content: unknown): content is ScraperApiErrorResponse =>
    isObject(content) && isNonEmptyString(content.errorMessage);

const isScraperApiSuccessResponse = (content: unknown): content is ScraperApiSuccessResponse =>
    isObject(content) && isNonEmptyString(content.addonSlug) && isNonEmptyString(content.downloadUrl);

const isObject = (o: unknown): o is Record<string, unknown> =>
    typeof o === "object" && o !== null && !Array.isArray(o);

const isNonEmptyString = (u: unknown): u is string =>
    typeof u === "string" && u.trim().length > 0;
