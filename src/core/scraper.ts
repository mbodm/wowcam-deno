import { ScrapeResult } from "./types.ts";
import * as storage from "./storage.ts";
import * as helper from "./helper.ts";

export async function all(): Promise<number> {
    let counter = 0;
    const entries = await storage.getAll();
    for (const entry of entries) {
        const scrapeResult = await callScraperApi(entry.addonSlug);
        storage.update(entry.addonSlug, scrapeResult);
        counter++;
    };
    const term = helper.pluralizeWhenNecessary(counter, 'addon');
    helper.log(`Scraped ${counter} ${term}.`);
    return counter;
}

async function callScraperApi(addonSlug: string): Promise<ScrapeResult> {
    const url = `https://wowcam.mbodm.com/scrape?addon=${addonSlug}`;
    const response = await fetch(url);
    const obj = await response.json();
    if (!obj) {
        throw new Error("Response from scraper API was an undefined object.");
    }
    if (!obj.result) {
        throw new Error("Response from scraper API contained an undefinded object as 'result' property.");
    }
    return {
        addonSlug,
        downloadUrl: obj.result.downloadUrl ?? "",
        downloadUrlFinal: obj.result.downloadUrlFinal ?? "",
        scraperApiSuccess: obj.success ?? false,
        scraperApiError: obj.error ?? ""
    };
}