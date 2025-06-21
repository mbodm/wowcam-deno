import { ScrapeEntry, ScrapeResult } from "../core/types.ts";
import * as dbconfigs from "../db/configs.ts";
import * as dbscrapes from "../db/scrapes.ts";
import * as helper from "../core/helper.ts";

export async function refreshScrapes(): Promise<number> {
    let counter = 0;
    const scrapes = await dbscrapes.getAll();
    for (const scrape of scrapes) {
        const scrapeResult = await callScraperApi(scrape.addonSlug);
        await dbscrapes.createOrUpdate(scrape.addonSlug, scrapeResult);
        counter++;
    };
    const addonOrAddons = helper.pluralizeWhenNecessary(counter, 'addon');
    helper.log(`Scraped ${counter} ${addonOrAddons}.`);
    return counter;
}

export async function getScrapeResultsByConfigName(configName: string): Promise<ScrapeResult[]> {
    const config = await dbconfigs.getOne(configName);
    const scrapes = await dbscrapes.getAll();
    const scrapesOfConfig: ScrapeEntry[] = scrapes.filter(scrape => config.addonSlugs.includes(scrape.addonSlug));
    const scrapeResults: ScrapeResult[] = scrapesOfConfig.map(scrape => createSimpleScrapeResult(scrape.addonSlug, scrape.scrapeResult.downloadUrl));
    return scrapeResults;
}

export async function addToScrapesIfNotExisting(addonSlugs: string[]) {
    const allScrapes = await dbscrapes.getAll();
    const knownAddons = allScrapes.map(scrape => scrape.addonSlug);
    addonSlugs.forEach(addonSlug => {
        if (!knownAddons.includes(addonSlug)) {
            dbscrapes.createOrUpdate(addonSlug, { addonSlug, downloadUrl: "" });
            helper.log(`Added '${addonSlug}' to scrapes.`);
        }
    });
}

async function callScraperApi(addonSlug: string): Promise<ScrapeResult> {
    const url = `https://wowcam-puppeteer.mbodm.com/scrape?addon=${addonSlug}`;
    const response = await fetch(url);
    const obj = await response.json();
    if (!obj) {
        throw new Error("Response from scraper API was an undefined object.");
    }
    if (!obj.result) {
        throw new Error("Response from scraper API contained an undefinded object as 'result' property.");
    }
    const downloadUrl = obj.result.downloadUrl ?? "";
    const success = obj.success ?? false;
    const error = obj.error ?? "";
    return { addonSlug, downloadUrl, successFromScraperApi: success, errorFromScraperApi: error };
}

function createSimpleScrapeResult(addonSlug: string, downloadUrl: string): ScrapeResult {
    return { addonSlug, downloadUrl };
}