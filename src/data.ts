import { ConfigEntry, ScrapeEntry, TScrapeResult } from "./types.ts";
import { log } from "./helper.ts";

const configs: ConfigEntry[] = [];
const scrapes: ScrapeEntry[] = [];

// Configs


/*
export function configExists(configName: string): boolean {
    idEmptyCheck(configName, "configName");
    return configs.some(e => e.configName === configName);
}
    */

export function addOrUpdateConfig(configName: string, addonSlugs: string[]): boolean {
    idEmptyCheck(configName, "configName");
    const index = configs.findIndex(e => e.configName === configName);
    if (index === -1) {
        // Cap array size (for security reasons)
        if (configs.length > 50) {
            throw new Error("Reached maximum of allowed config entries.");
        }
        const entry = { configName, addonSlugs };
        configs.push(entry);
        addToScrapesIfNotExists(addonSlugs);
        log(`A new config was added ('${configName}').`, true);
        return true;
    }
    else {
        configs[index].addonSlugs = addonSlugs;
        addToScrapesIfNotExists(addonSlugs);
        return false;
    }
}

export function getConfig(configName: string): ConfigEntry | null {
    idEmptyCheck(configName, "configName");
    const index = configs.findIndex(e => e.configName === configName);
    return index === -1 ? null : configs[index];
}

export function getAllConfigs(): ConfigEntry[] {
    return configs;
}

// Scrapes

export function scrapeExists(addonSlug: string): boolean {
    idEmptyCheck(addonSlug, "addonSlug");
    return scrapes.some(e => e.addonSlug === addonSlug);
}

export function addOrUpdateScrape(addonSlug: string, scrapeResult: TScrapeResult): ScrapeEntry {
    idEmptyCheck(addonSlug, "addonSlug");
    const index = scrapes.findIndex(e => e.addonSlug === addonSlug);
    if (index === -1) {
        // Cap array size (for security reasons)
        if (scrapes.length > 50) {
            throw new Error("Reached maximum of allowed config entries.");
        }
        const entry = { addonSlug, scrapeResult };
        scrapes.push(entry);
        return entry;
    }
    else {
        scrapes[index].scrapeResult = scrapeResult;
        return scrapes[index];
    }
}

export function getScrape(addonSlug: string): ScrapeEntry | null {
    idEmptyCheck(addonSlug, "addonSlug");
    const index = scrapes.findIndex(e => e.addonSlug === addonSlug);
    return index === -1 ? null : scrapes[index];
}

export function getAllScrapes(): ScrapeEntry[] {
    console.log("getAllScrapes() called in data module. here are the scrapes:");
    console.log(scrapes);
    return scrapes;
}

// Relational

export function getScrapeResultsByConfigName(configName: string): TScrapeResult[] | null {
    idEmptyCheck(configName, "configName");
    const config = getConfig(configName);
    if (!config) {
        return null;
    }
    return getAllScrapes().
        filter(e => config.addonSlugs.includes(e.addonSlug)).
        map(e => createSimpleScrapeResult(e.scrapeResult.addonSlug, e.scrapeResult.downloadUrl));
}

// Internal

function idEmptyCheck(idValue: string, idName: string): void {
    if (idValue === "") {
        throw new Error(`The given '${idName}' argument (used as ID/PrimaryKey) was an empty string.`);
    }
    if (idValue.trim() === "") {
        throw new Error(`The given '${idName}' argument (used as ID/PrimaryKey) is a string which contains whitespaces only.`);
    }
}

function addToScrapesIfNotExists(addonSlugs: string[]): void {
    for (const addonSlug of addonSlugs) {
        if (!scrapeExists(addonSlug)) {
            addOrUpdateScrape(addonSlug, { addonSlug, downloadUrl: "", successFromScraperApi: false, errorFromScraperApi: "" });
        }
    }
}

function createSimpleScrapeResult(addonSlug: string, downloadUrl: string): TScrapeResult {
    return { addonSlug, downloadUrl };
}