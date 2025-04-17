import { TLogicResult, TScrapeResult, TScrapeResultWithoutDetails } from "./types.ts";
import { isDenoDeploy } from "./platform.ts";
import * as db from "./db.ts";
import * as repo from "./repo.ts";


/*
export async function manual(id: string, addons: string[]): Promise<TLogicResult> {
    if (!id || !addons || addons.length < 1) {
        throw new Error("Internal input validation failed.");
    }
    const existingEntry = db.get(id);
    if (existingEntry && !timestampIsOlderThan30Minutes(existingEntry.addOrUpdateTimestamp)) {
        return createSuccess(existingEntry);
    }
    const addonResults: TScrapeResult[] = [];
    for (const addon of addons) {
        try {
            const url = `https://wowcam.mbodm.com/scrape?addon=${addon}`
            const response = await fetch(url);
            const obj = await response.json();
            if (!response.ok) {
                addonResults.push({ success: false, addonSlug: addon, downloadUrl: "", error: `The wowcam-scraper API returned: ${obj.error}` });
            }
            else {
                addonResults.push({ success: true, addonSlug: addon, downloadUrl: obj.result.downloadUrl, error: "" });
            }
        } catch (e: unknown) {
            if (e instanceof Error) {
                if (!isDenoDeploy()) {
                    console.error(e.message);
                }
                return createError(e.message);
            }
        }
    }
    const newOrUpdatedEntry = db.addOrUpdate(id, addonResults);
    return createSuccess(newOrUpdatedEntry);
}
*/

export async function update(): Promise<undefined> {

    repo.getAddonSlugsByConfigName()




    for (const entry of db.getAllScrapes()) {
        const result = await scrapeOne(entry.addonSlug);
    }
}

export async function scrape(addonSlugs: string[]): Promise<TScrapeResult[]> {
    const scrapeResults: TScrapeResult[] = [];
    for (const addonSlug in addonSlugs) {
        const scrapeResult = await scrapeOne(addonSlug);
        scrapeResults.push(scrapeResult)
    }
    return scrapeResults;
}

async function scrapeOne(addonSlug: string): Promise<TScrapeResult> {
    const url = `https://wowcam.mbodm.com/scrape?addon=${addonSlug}`
    const response = await fetch(url);
    const obj = await response.json();
    if (!response.ok) {
        throw new Error(`The wowcam-scraper API returned: ${obj.error}`);
    }
    return { addonSlug, downloadUrl: obj.downloadUrl, scraperApiSuccess: obj.success, scraperApiError: obj.error };
}

function timestampIsOlderThan30Minutes(timestamp: string): boolean {
    const now = new Date();
    const old = new Date(timestamp);
    const ms = now.getTime() - old.getTime();
    return ms > 5000; // 1000 * 60 * 30;
}