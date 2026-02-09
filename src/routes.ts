import { RouteFunc, authCheck } from "./auth.ts";
import * as response from "./response.ts";
import { fetcheOne, refreshAll } from "./logic.ts";
import { callScraperApi } from "./scraper.ts";
import * as storage from "./storage.ts";
import { isNonEmptyString } from "./common.ts";

export const root: RouteFunc = rootHandler;
export const fetch: RouteFunc = authCheck(fetchHandler);
export const scrape: RouteFunc = authCheck(scrapeHandler);
export const refresh: RouteFunc = authCheck(refreshHandler);
export const show: RouteFunc = authCheck(showHandler);
export const clear: RouteFunc = authCheck(clearHandler);

function rootHandler(_: URL): Response {
    return response.hello();
}

async function fetchHandler(url: URL): Promise<Response> {
    const addonSlug = getAddonSlugFromUrl(url);
    if (!addonSlug) {
        return response.errorMissingAddon();
    }
    const addonEntry = await fetcheOne(addonSlug);
    const infoMessage = addonEntry.fromCache
        ? "Used addon from cache storage (1h max age)"
        : "Scraped and added addon to cache storage";
    return response.success(infoMessage, addonEntry);
}

async function scrapeHandler(url: URL): Promise<Response> {
    const addonSlug = getAddonSlugFromUrl(url);
    if (!addonSlug) {
        return response.errorMissingAddon();
    }
    const scrapeResult = await callScraperApi(addonSlug);
    return response.success("Successfully scraped (addon was not added to cache storage)", { ...scrapeResult });
}

function refreshHandler(_: URL): Response {
    console.log("Received /refresh request and start background refreshing now");
    refreshAll()
        .then((num) => console.log(`Finished background refreshing (${num} entries failed)`))
        .catch((err) => console.error("Error occurred while background refreshing (stopped)", err));
    return response.success(`Background refreshing started`);
}

async function showHandler(_: URL): Promise<Response> {
    const entries = await storage.getAll();
    const word = entryOrEntries(entries.length);
    return response.success(`${entries.length} ${word} in cache storage`, { entries });
}

async function clearHandler(_: URL): Promise<Response> {
    console.log("Received request to clear storage.");
    await storage.clear();
    console.log("Cleared storage.");
    return response.success("Cleared cache storage");
}

function getAddonSlugFromUrl(url: URL): string | null {
    const addonParam = url.searchParams.get("addon");
    return isNonEmptyString(addonParam) ? addonParam.trim().toLowerCase() : null;
}

const entryOrEntries = (count: number): string =>
    count === 1 ? "entry" : "entries";
