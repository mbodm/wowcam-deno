import { TLogicResult, TScrapeResult, TDatabaseEntry } from "./types.ts";
import { isDenoDeploy } from "./platform.ts";
import * as db from "./database.ts";

export async function run(id: string, addons: string[]): Promise<TLogicResult> {
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

function timestampIsOlderThan30Minutes(timestamp: string): boolean {
    const now = new Date();
    const old = new Date(timestamp);
    const ms = now.getTime() - old.getTime();
    return ms > 5000; // 1000 * 60 * 30;
}

function createSuccess(entry: TDatabaseEntry): TLogicResult {
    return { success: true, lastRefresh: entry.addOrUpdateTimestamp, scrapeResults: entry.scrapeResults, error: "" };
}

function createError(error: string): TLogicResult {
    return { success: false, lastRefresh: "", scrapeResults: [], error };
}