import * as storage from "./storage.ts";
import { callScraperApi } from "./scraper.ts";

export type AddonEntry = {
    addonSlug: string,
    downloadUrl: string,
    scrapedAt: string,
    fromCache: boolean
};

export async function fetcheOne(addonSlug: string): Promise<AddonEntry> {
    // If in cache -> Use from cache
    const existingStorageEnty = await storage.getOne(addonSlug);
    if (existingStorageEnty) {
        return {
            ...existingStorageEnty,
            fromCache: true
        };
    }
    // If not in cache -> Scrape and add to cache
    const scrapeResult = await callScraperApi(addonSlug);
    const { downloadUrl, scrapedAt } = scrapeResult;
    await storage.addOrUpdate(addonSlug, downloadUrl, scrapedAt);
    return {
        ...scrapeResult,
        fromCache: false
    }
}

export async function refreshAll(): Promise<number> {
    const storageEntries = await storage.getAll();
    let failedEntries = 0;
    for (const storageEnty of storageEntries) {
        try {
            const scrapeResult = await callScraperApi(storageEnty.addonSlug);
            const { downloadUrl, scrapedAt } = scrapeResult;
            await storage.addOrUpdate(storageEnty.addonSlug, downloadUrl, scrapedAt);
        }
        catch (err) {
            const msg = err instanceof Error
                ? err.message
                : "Error occured while background refreshing (continue with next entry)";
            console.error(msg);
            failedEntries++;
        }
    }
    return failedEntries;
}