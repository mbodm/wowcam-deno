import * as helper from "../core/helper.ts";
import * as params from "./params.ts";
import * as response from "./response.ts";
import * as storage from "../core/storage.ts";
import * as scraper from "../core/scraper.ts"

export async function add(url: URL): Promise<Response> {
    helper.log("Received request to add 1 or more addon entries.");
    const addonSlugs = params.getAddonsFromUrl(url);
    if (addonSlugs === null || addonSlugs.length < 1) {
        return response.errorMissingAddons();
    }
    let addedCounter = 0;
    let existCounter = 0;
    for (const addonSlug of addonSlugs) {
        const exists = await storage.entryExists(addonSlug);
        if (!exists) {
            await storage.addEntry(addonSlug);
            helper.log(`Added '${addonSlug}' addon entry.`);
            addedCounter++;
        }
        else {
            helper.log(`Not added '${addonSlug}' addon entry (already existed).`);
            existCounter++;
        }
    }
    const addedTerm = helper.pluralizeWhenNecessary('addon', addedCounter);
    const existTerm = helper.pluralizeWhenNecessary('addon', existCounter);
    const msg = `Added ${addedCounter} new ${addedTerm} (${existCounter} ${existTerm} already existed).`;
    helper.log(msg);
    const entries = await storage.getEntries();
    return response.success(msg, entries);
}

export async function get(): Promise<Response> {
    helper.log("Received request to read all addon entries.");
    const entries = await storage.getEntries();
    const count = entries.length;
    const term = helper.pluralizeWhenNecessary("addon", count);
    return response.success(`${count} ${term} found.`, entries);
}

export async function scrape(): Promise<Response> {
    helper.log("Received request to scrape all addon entries.");
    const count = await scrapeAllEntries();
    const entries = await storage.getEntries();
    const term = helper.pluralizeWhenNecessary("addon", count);
    return response.success(`${count} ${term} scraped.`, entries);
}

export async function clear(): Promise<Response> {
    helper.log("Received request to clear storage.");
    await storage.deleteEntries();
    return response.success("Cleared storage.", []);
}

async function scrapeAllEntries(): Promise<number> {
    let counter = 0;
    const entries = await storage.getEntries();
    for (const entry of entries) {
        const scrapeResult = await scraper.callScraperApi(entry.addonSlug);
        entry.hadScrape = true;
        entry.downloadUrl = scrapeResult.downloadUrl;
        entry.downloadUrlFinal = scrapeResult.downloadUrlFinal;
        entry.scraperApiSuccess = scrapeResult.scraperApiSuccess;
        entry.scraperApiError = scrapeResult.scraperApiError;
        entry.timestamp = scrapeResult.timestamp;
        storage.updateEntry(entry);
        counter++;
    };
    const term = helper.pluralizeWhenNecessary('addon', counter);
    helper.log(`Scraped ${counter} ${term}.`);
    return counter;
}