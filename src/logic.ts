import { getAllScrapes } from "./data.ts";
import { pluralizeWhenNecessary } from "./helper.ts";
import { log } from "./helper.ts";
import { TScrapeResult } from "./types.ts";

export async function update(): Promise<void> {
    let counter = 0;
    for (const entry of getAllScrapes()) {
        entry.scrapeResult = await callScraperApi(entry.addonSlug);
        console.log(entry.scrapeResult.downloadUrl);
        counter++;
    };
    const word = pluralizeWhenNecessary('addon', counter);
    log(`Scraped ${counter} ${word}.`, true);
}

async function callScraperApi(addonSlug: string): Promise<TScrapeResult> {
    const url = `https://wowcam.mbodm.com/scrape?addon=${addonSlug}`;
    const response = await fetch(url);
    const obj = await response.json();
    return { addonSlug, downloadUrl: obj.result.downloadUrl, successFromScraperApi: obj.success, errorFromScraperApi: obj.error };
}