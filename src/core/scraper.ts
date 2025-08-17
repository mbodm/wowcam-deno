import { ScrapeResult } from "../types.ts";

export async function callScraperApi(addonSlug: string): Promise<ScrapeResult> {
    const url = `https://wowcam.mbodm.com/scrape?addon=${addonSlug}`;
    const response = await fetch(url);
    const obj = await response.json();
    if (!obj) {
        throw new Error("Response from scraper API was an undefined object.");
    }
    if (!obj.result) {
        throw new Error("Response from scraper API contained an undefinded object as 'result' property.");
    }
    const timestamp = new Date().toISOString();
    return {
        addonSlug,
        downloadUrl: obj.result.downloadUrl ?? "",
        downloadUrlFinal: obj.result.downloadUrlFinal ?? "",
        scraperApiSuccess: obj.success ?? false,
        scraperApiError: obj.error ?? "",
        timestamp
    };
}