import * as params from "./params.ts";
import * as response from "./response.ts";
import * as storage from "../common/storage.ts";
import * as helper from "../common/helper.ts";
import * as scraper from "../common/scraper.ts"

export async function add(url: URL): Promise<Response> {
    console.log("Received request to add 1 or more addon entries to storage.");
    const addonSlugs = params.getAddonSlugs(url);
    if (addonSlugs.length < 1) {
        return response.errorMissingAddons();
    }
    let counter = 0;
    for (const addonSlug of addonSlugs) {
        const exists = await storage.entryExists(addonSlug);
        if (!exists) {
            await storage.addEntry(addonSlug);
            console.log(`Added '${addonSlug}' addon entry to storage.`);
            counter++;
        }
        else {
            console.log(`Not added '${addonSlug}' addon entry to storage (already existed).`);
        }
    }
    const entryTerm = helper.autoPluralize("entry", counter);
    console.log(`Added ${counter} new addon ${entryTerm} to storage.`);
    const addonTerm = helper.autoPluralize("addon", counter);
    const entries = await storage.getEntries();
    return response.success(`Added ${counter} new ('not yet existing') ${addonTerm} to the pool.`, entries);
}

export async function get(): Promise<Response> {
    console.log("Received request to read all addon entries from storage.");
    const entries = await storage.getEntries();
    const count = entries.length;
    const term = helper.autoPluralize("addon", count);
    return response.success(`${count} ${term} found in pool.`, entries);
}

export async function scrape(isGitHubActionsRequest: boolean): Promise<Response> {
    if (isGitHubActionsRequest) {
        console.log("Received 'periodic' request (CRON trigger from GitHub Actions) to scrape all addon entries.");
    }
    else {
        console.log("Received 'manual' request to scrape all addon entries immediately.");
    }
    const count = await scrapeAllEntries();
    const entries = await storage.getEntries();
    const term = helper.autoPluralize("addon", count);
    return response.success(`${count} ${term} scraped and updated in pool.`, entries);
}

export async function clear(): Promise<Response> {
    console.log("Received request to clear storage.");
    await storage.deleteEntries();
    return response.success("Cleared pool.", []);
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
        await storage.updateEntry(entry);
        counter++;
    };
    const term = helper.autoPluralize("addon", counter);
    console.log(`Scraped ${counter} ${term}.`);
    return counter;
}