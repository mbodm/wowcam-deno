import * as data from "./data.ts";
import { TScrapeResult } from "./types.ts";

export async function update() {
    for (const entry of data.getAllScrapes()) {
        entry.scrapeResult = await callScraperApi(entry.addonSlug);
    }
}

async function callScraperApi(addonSlug: string): Promise<TScrapeResult> {
    const url = `https://wowcam.mbodm.com/scrape?addon=${addonSlug}`;
    const response = await fetch(url);
    const obj = await response.json();
    console.log("fetched slug: + addonSlug + " downloadUrl: " + );
    return { addonSlug, downloadUrl: obj.downloadUrl, successFromScraperApi: obj.success, errorFromScraperApi: obj.error };
}

/*
function timestampIsOlderThan30Minutes(timestamp: string): boolean {
    const now = new Date();
    const old = new Date(timestamp);
    const ms = now.getTime() - old.getTime();
    return ms > 5000; // 1000 * 60 * 30;
}
*/
