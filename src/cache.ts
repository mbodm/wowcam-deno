import * as storage from "./storage.ts";
import { callScraperApi } from "./scraper.ts";

export type AddonEntry = {
    addonSlug: string,
    downloadUrl: string,
    scrapedAt: string,
    fromCache: boolean
};

export class CacheLimitError extends Error {
    constructor() {
        super("Reached cache limit of 255 entries");
        this.name = "CacheLimitError";
    }
}

export async function handleOne(addonSlug: string): Promise<AddonEntry> {
    const existingEntries = await storage.getAll();
    const existingEntry = existingEntries.find((entry) => entry.addonSlug === addonSlug);
    // If in cache -> Use from cache
    if (existingEntry) {
        return {
            ...existingEntry,
            fromCache: true
        };
    }
    // If not in cache -> Scrape and add to cache
    if (existingEntries.length >= 255) {
        throw new CacheLimitError();
    }
    const scrapeResult = await callScraperApi(addonSlug);
    const { downloadUrl, scrapedAt } = scrapeResult;
    await storage.addOrUpdate(addonSlug, downloadUrl, scrapedAt);
    return {
        ...scrapeResult,
        fromCache: false
    }
}

export async function refreshAll(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 3000));
    const entries = await storage.getAll();
    const total = entries.length;
    if (total <= 0) {
        console.log("Nothing to refresh (storage is empty)");
        return;
    }
    let failed = 0;
    for (const entry of entries) {
        try {
            const scrapeResult = await callScraperApi(entry.addonSlug);
            const { downloadUrl, scrapedAt } = scrapeResult;
            await storage.addOrUpdate(entry.addonSlug, downloadUrl, scrapedAt);
        }
        catch (err: unknown) {
            console.error("Error while background refreshing (will skip and continue with next one):", err);
            failed++;
        }
    }
    if (failed > 0) {
        console.error(`Finished background refreshing (${failed}/${total} failed)`);
    }
    else {
        console.log(`Finished background refreshing (${total}/${total} successful)`);
    }
}
