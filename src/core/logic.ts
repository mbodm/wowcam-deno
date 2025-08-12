import * as storage from "./storage.ts";
import * as scraper from "./scraper.ts"
import * as helper from "./helper.ts";

export async function executeScrapeForAllEntries(): Promise<number> {
    let counter = 0;
    const entries = await storage.getAllEntries();
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