import { AddonEntry } from "./types.ts";
import { handleStringArgument } from "./helper.ts";
import { isNonEmptyString } from "./guards.ts";

type ScraperApiSuccessResponse = {
    addonSlug: string,
    downloadUrl: string
};

type ScraperApiErrorResponse = {
    errorMessage: string
};

export async function callScraperApi(addonSlug: string): Promise<AddonEntry> {
    const result: AddonEntry = {
        addonSlug: handleStringArgument(addonSlug, "addonSlug").toLowerCase(),
        downloadUrl: "",
        scrapedAt: new Date().toISOString()
    }
    const scraperUrl = `https://wowcam.mbodm.com/scrape?addon=${encodeURIComponent(result.addonSlug)}`;
    const response = await fetch(scraperUrl, { signal: AbortSignal.timeout(30_000) });
    const content: unknown = await response.json();
    if (!response.ok) {
        const baseMessage = `Received response error from scraper API -> HTTP ${response.status} (${response.statusText})`;
        const message = isScraperApiErrorResponse(content) ? `${baseMessage}: ${content.errorMessage.trim()}` : baseMessage;
        throw new Error(message);
    }
    if (!isScraperApiSuccessResponse(content) || content.addonSlug.trim().toLowerCase() !== result.addonSlug) {
        throw new Error("Received successful HTTP 2xx response from scraper API, but the response JSON did not contain the expected addon slug and download URL.");
    }
    result.downloadUrl = content.downloadUrl.trim();
    return result;
}

// Type Guards

const isScraperApiErrorResponse = (content: unknown): content is ScraperApiErrorResponse =>
    isObject(content) && isNonEmptyString(content.errorMessage);

const isScraperApiSuccessResponse = (content: unknown): content is ScraperApiSuccessResponse =>
    isObject(content) && isNonEmptyString(content.addonSlug) && isNonEmptyString(content.downloadUrl);

const isObject = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null && !Array.isArray(value);
