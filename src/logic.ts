import { getAllScrapes } from "./data.ts";
import { pluralizeWhenNecessary } from "./helper.ts";
import { log } from "./helper.ts";
import { TScrapeResult } from "./types.ts";

export async function update(): Promise<void> {
    let counter = 0;
    for (const entry of getAllScrapes()) {
        const scrapeResult = await callScraperApi(entry.addonSlug);
        console.log("scraper result:");
        console.log(scrapeResult);
        console.log("array entry before assign:");
        console.log(entry);
        entry.scrapeResult = scrapeResult;
        console.log("array entry after assign:");
        console.log(entry);
        counter++;
    };
    const word = pluralizeWhenNecessary('addon', counter);
    log(`Scraped ${counter} ${word}.`);
}

async function callScraperApi(addonSlug: string): Promise<TScrapeResult> {
    const url = `https://wowcam.mbodm.com/scrape?addon=${addonSlug}`;
    const response = await fetch(url);
    const obj = await response.json();
    return { addonSlug, downloadUrl: obj.result.downloadUrl, successFromScraperApi: obj.success, errorFromScraperApi: obj.error };
}