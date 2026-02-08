import { AddonEntry } from "./types.ts";
import { handleStringArgument } from "./helper.ts";
import { getOne, addOrUpdate } from "./storage.ts";
import { callScraperApi } from "./scraper.ts";

export async function resolve(addon: string): Promise<AddonEntry> {
    const addonSlug = handleStringArgument(addon, "addon");
    // If in cache -> Use from cache
    const existingAddonEntry = await getOne(addonSlug);
    if (existingAddonEntry) {
        return existingAddonEntry;
    }
    // If not in cache -> Scrape and add to cache
    const newAddonEntry = await callScraperApi(addonSlug);
    await addOrUpdate(newAddonEntry.addonSlug, newAddonEntry.downloadUrl, newAddonEntry.scrapedAt);
    return newAddonEntry;
}