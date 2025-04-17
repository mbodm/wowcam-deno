import * as db from "./db.ts";
import { TScrapeResult, TScrapeResultWithoutDetails } from "./types.ts";

export function configExists(name: string): boolean {
    return !db.getConfig(name) ? false : true;
}

export function addConfig(id: string, addons: string[]) {
    db.addOrUpdateConfig(id, addons);
}

export function getScrapes(): TScrapeResult[] {
    return db.getAllScrapes().map(scrape => scrape.scrapeResult);
}

export function getScrapesWithoutDetails(): TScrapeResultWithoutDetails[] {
    return db.getAllScrapes().map(scrape => (createScrapeResultWithoutDetails(scrape.addonSlug, scrape.scrapeResult.downloadUrl)));
}

export function getAddonSlugsByConfigName(configName: string): string[] | null {
    const config = db.getConfig(configName)
    if (!config) {
        return null;
    }
    return config.addons;
}

export function getScrapesByConfigName(configName: string): TScrapeResult[] | null {
    const config = db.getConfig(configName)
    if (!config) {
        return null;
    }
    return db.getAllScrapes().filter(scrape => config.addons.includes(scrape.addonSlug)).map(scrape => scrape.scrapeResult);
}

export function getScrapesByAddonSlugs(addonSlugs: string[]): TScrapeResult[] {
    return db.getAllScrapes().
        filter(scrape => addonSlugs.includes(scrape.addonSlug)).
        map(scrape => scrape.scrapeResult);
}

export function getScrapesByAddonSlugsWithoutDetails(addonSlugs: string[]): TScrapeResultWithoutDetails[] {
    return db.getAllScrapes().
        filter(scrape => addonSlugs.includes(scrape.addonSlug)).
        map(scrape => createScrapeResultWithoutDetails(scrape.addonSlug, scrape.scrapeResult.downloadUrl));
}

function createScrapeResultWithoutDetails(addonSlug: string, downloadUrl: string): TScrapeResultWithoutDetails {
    return { addonSlug, downloadUrl };
}