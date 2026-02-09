import { isNonEmptyString } from "./common.ts";

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
    const addonSlugNormalized = addonSlug.toLowerCase().trim();
    if (addonSlugNormalized === "") {
        const err = new Error("The given 'addonSlug' argument is an empty string (or contains whitespaces only).");
        err.name = "ScraperModuleInputValidationError";
        throw err;
    }
    const scraperUrl = `https://wowcam.mbodm.com/scrape?addon=${encodeURIComponent(addonSlugNormalized)}`;
    const response = await fetch(scraperUrl, { signal: AbortSignal.timeout(30_000) });
    const content: unknown = await response.json();
    if (!response.ok) {
        const baseMessage = `Received response error from scraper API -> HTTP ${response.status} (${response.statusText})`;
        const message = isScraperApiErrorResponse(content) ? `${baseMessage}: ${content.errorMessage.trim()}` : baseMessage;
        throw new Error(message);
    }
    if (!isScraperApiSuccessResponse(content) || content.addonSlug.toLowerCase().trim() !== addonSlugNormalized) {
        throw new Error("Received successful HTTP 2xx response from scraper API, but the response JSON did not contain the expected addon slug and download URL.");
    }
    const result: ScrapeResult = {
        addonSlug: addonSlugNormalized,
        downloadUrl: content.downloadUrl.trim(),
        scrapedAt: new Date().toISOString().slice(0, 16) + "Z"
    };
    return result;
}

// Type Guards

const isScraperApiErrorResponse = (content: unknown): content is ScraperApiErrorResponse =>
    isObject(content) && isNonEmptyString(content.errorMessage);

const isScraperApiSuccessResponse = (content: unknown): content is ScraperApiSuccessResponse =>
    isObject(content) && isNonEmptyString(content.addonSlug) && isNonEmptyString(content.downloadUrl);

const isObject = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null && !Array.isArray(value);
