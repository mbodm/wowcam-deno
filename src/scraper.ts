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

export async function callScraperApi(addonSlug: string): Promise<ScrapeResult> {
    if (!isNonEmptyString(addonSlug)) {
        throw new Error("Given 'addonSlug' is an empty string (or contains whitespaces only)");
    }
    const normalizedAddonSlug = addonSlug.toLowerCase().trim();
    const scraperUrl = `https://wowcam.mbodm.com/scrape?addon=${encodeURIComponent(normalizedAddonSlug)}`;
    const response = await fetch(scraperUrl, { signal: AbortSignal.timeout(30_000) });
    const content: unknown = await response.json();
    if (!response.ok) {
        const baseMessage = `Received response error from scraper API -> HTTP ${response.status} (${response.statusText})`;
        const message = isScraperApiErrorResponse(content) ? `${baseMessage}: ${content.errorMessage.trim()}` : baseMessage;
        throw new Error(message);
    }
    if (!isScraperApiSuccessResponse(content) || content.addonSlug.toLowerCase().trim() !== normalizedAddonSlug) {
        throw new Error("Response JSON from scraper API did not contain the expected addon slug and download URL (even when status code was HTTP 200");
    }
    const result: ScrapeResult = {
        addonSlug: normalizedAddonSlug,
        downloadUrl: content.downloadUrl.trim(),
        scrapedAt: new Date().toISOString().slice(0, 16) + "Z"
    };
    return result;
}

// Type Guards

const isNonEmptyString = (u: unknown): u is string =>
    typeof u === "string" && u.trim().length > 0;

const isScraperApiErrorResponse = (content: unknown): content is ScraperApiErrorResponse =>
    isObject(content) && isNonEmptyString(content.errorMessage);

const isScraperApiSuccessResponse = (content: unknown): content is ScraperApiSuccessResponse =>
    isObject(content) && isNonEmptyString(content.addonSlug) && isNonEmptyString(content.downloadUrl);

const isObject = (o: unknown): o is Record<string, unknown> =>
    typeof o === "object" && o !== null && !Array.isArray(o);
