import { getAllScrapes, addOrUpdateScrape } from "./data.ts";
import { pluralizeWhenNecessary } from "./helper.ts";
import { log } from "./helper.ts";
import { TScrapeResult } from "./types.ts";

export async function update(): Promise<void> {
    let counter = 0;
    for (const entry of getAllScrapes()) {
        const scrapeResult = await callScraperApi(entry.addonSlug);
        addOrUpdateScrape(entry.addonSlug, scrapeResult);
        counter++;
    };
    const word = pluralizeWhenNecessary('addon', counter);
    log(`Scraped ${counter} ${word}.`);
}

async function callScraperApi(addonSlug: string): Promise<TScrapeResult> {
    const url = `https://wowcam.mbodm.com/scrape?addon=${addonSlug}`;
    const response = await fetch(url);
    const obj = await response.json();
    if (!obj) {
        throw new Error("Response from scraper API was an undefined object.");
    }
    if (!obj.result) {
        throw new Error("Response from scraper API contained an undefinded object as 'result' property.");
    }
    const downloadUrl = obj.result.downloadUrl ?? "";
    const error = obj.error ?? "";
    return { addonSlug, downloadUrl, successFromScraperApi: obj.success, errorFromScraperApi: error };
}