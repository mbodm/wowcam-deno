import { isNonEmptyString } from "../common/guards.ts";
import * as response from "./response.ts";
import * as scraper from "../common/scraper.ts";
import * as storage from "../common/storage.ts";

export function root() {
    return response.hello();
}

export async function resolve(url: URL): Promise<Response> {
    const addonParam = url.searchParams.get("addon");
    if (!isNonEmptyString(addonParam)) {
        return response.errorMissingAddon();
    }
    const addonSlug = addonParam.trim().toLowerCase();
    // If in cache -> Use from cache
    const existingAddonEntry = await storage.getOne(addonSlug);
    if (existingAddonEntry) {
        return response.success("Used addon from cache.", existingAddonEntry);
    }
    // If not in cache -> Scrape and add to cache
    const newAddonEntry = await scraper.callScraperApi(addonSlug);
    await storage.addOrUpdate(newAddonEntry.addonSlug, newAddonEntry.downloadUrl, newAddonEntry.scrapedAt);
    return response.success("Added addon to cache.", newAddonEntry);
}

export async function clear(): Promise<Response> {
    console.log("Received request to clear storage.");
    await storage.clear();
    console.log("Cleared storage.");
    return response.success("Cleared cache storage");
}