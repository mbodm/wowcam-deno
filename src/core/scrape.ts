import * as db from "../db/addons.ts";
import * as helper from "./helper.ts";

export async function scrapeAll(): Promise<number> {
    let counter = 0;
    const addons = await db.getAll();
    for (const addon of addons) {
        const scrapeResult = await callScraperApi(addon.addonSlug);
        db.update(addon.addonSlug, scrapeResult);
        counter++;
    };
    const addonOrAddons = helper.pluralizeWhenNecessary(counter, 'addon');
    helper.log(`Scraped ${counter} ${addonOrAddons}.`);
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
    const downloadUrl = obj.result.downloadUrl ?? "";
    const downloadUrlFinal = obj.result.downloadUrlFinal ?? "";
    const success = obj.success ?? false;
    const error = obj.error ?? "";
    return { addonSlug, downloadUrl, downloadUrlFinal, successFromScraperApi: success, errorFromScraperApi: error };
}
