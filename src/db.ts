import { TDatabaseConfigEntry, TDatabaseScrapeEntry, TScrapeResult } from "./types.ts";

const configs: TDatabaseConfigEntry[] = [];
const scrapes: TDatabaseScrapeEntry[] = [];

// Configs

export function configExists(name: string): boolean {
    idEmptyCheck(name, "name");
    return configs.some(o => o.name === name);
}

export function addOrUpdateConfig(name: string, addons: string[]): TDatabaseConfigEntry {
    idEmptyCheck(name, "name");
    const index = configs.findIndex(o => o.name === name);
    if (index === -1) {
        // Cap array size (for security reasons)
        if (configs.length > 50) {
            throw new Error("Reached maximum of allowed config entries.");
        }
        const entry = { name, addons };
        configs.push(entry);
        return entry;
    }
    else {
        configs[index].addons = addons;
        return configs[index];
    }
}

export function getConfig(name: string): TDatabaseConfigEntry | null {
    idEmptyCheck(name, "name");
    const index = configs.findIndex(o => o.name === name);
    if (index === -1) {
        return null;
    }
    return configs[index];
}

export function getAllConfigs(): TDatabaseConfigEntry[] {
    return configs;
}

// Scrapes

export function scrapeExists(addonSlug: string): boolean {
    idEmptyCheck(addonSlug, "addonSlug");
    return scrapes.some(o => o.addonSlug === addonSlug);
}

export function addOrUpdateScrape(addonSlug: string, scrapeResult: TScrapeResult): TDatabaseScrapeEntry {
    idEmptyCheck(addonSlug, "addonSlug");
    const index = scrapes.findIndex(o => o.addonSlug === addonSlug);
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

export function getScrape(addonSlug: string): TDatabaseScrapeEntry | null {
    idEmptyCheck(addonSlug, "addonSlug");
    const index = scrapes.findIndex(o => o.addonSlug === addonSlug);
    if (index === -1) {
        return null;
    }
    return scrapes[index];
}

export function getAllScrapes(): TDatabaseScrapeEntry[] {
    return scrapes;
}

function idEmptyCheck(idValue: string, idName: string) {
    if (idValue === "") {
        throw new Error(`The given '${idName}' argument (used as ID/PrimaryKey) was an empty string.`);
    }
    if (idValue.trim() === "") {
        throw new Error(`The given '${idName}' argument (used as ID/PrimaryKey) is a string which contains whitespaces only.`);
    }
}