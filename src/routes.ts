import { handleOne, refreshAll } from "./cache.ts";
import * as response from "./response.ts";
import { callScraperApi, UpstreamError } from "./scraper.ts";
import * as storage from "./storage.ts";

export class RouteError extends Error {
    constructor(public readonly status: number, message: string, cause?: unknown) {
        super(message, { cause });
        this.name = "RouteError";
    }
}

export async function get(url: URL): Promise<Response> {
    requireAuth(url);
    const addonSlug = getAddonSlug(url);
    const addonEntry = await handleOne(addonSlug);
    const infoMessage = addonEntry.fromCache
        ? "Used addon from cache (1h max age)"
        : "Scraped addon and added it to cache";
    return response.success(infoMessage, addonEntry);
}

export async function scrape(url: URL): Promise<Response> {
    requireAuth(url);
    const addonSlug = getAddonSlug(url);
    try {
        const scrapeResult = await callScraperApi(addonSlug);
        return response.success("Successfully scraped addon (without adding it to cache)", scrapeResult);
    }
    catch (err: unknown) {
        if (err instanceof UpstreamError) {
            throw new RouteError(502, "An upstream error occurred (check logs for details)", err);
        }
        throw err;
    }
}

export function refresh(url: URL): Response {
    requireAuth(url);
    console.log("Received request to start background refreshing");
    refreshAll().catch((err) => console.error(err));
    return response.success("Background refreshing started");
}

export async function showCache(url: URL): Promise<Response> {
    requireAuth(url);
    const entries = await storage.getAll();
    const count = entries.length;
    const term = count === 1 ? "entry" : "entries";
    return response.success(`${count} ${term} in cache`, { entries });
}

export async function clearCache(url: URL): Promise<Response> {
    requireAuth(url);
    console.log("Received request to clear storage");
    await storage.clearAll();
    console.log("Cleared storage");
    return response.success("Cleared cache");
}

function requireAuth(url: URL): void {
    // This should (of course) not replace any real security (it shall just act as some small script-kiddies barrier)
    // Using a less secure solution seems better than nothing (since there is no sensible data to secure here anyway)
    // And token is not in header to allow easy in-browser testing (this API does not follow REST conventions anyway)
    const tokenParam = url.searchParams.get("token");
    if (tokenParam === null) {
        throw new RouteError(401, "Unauthorized (missing 'token' query param)");
    }
    const token = tokenParam.trim();
    const secret = Deno.env.get("WOWCAM_TOKEN")?.trim() ?? '';
    if (!secret) {
        throw new Error("Missing or empty WOWCAM_TOKEN environment variable");
    }
    if (token !== secret) {
        throw new RouteError(403, "Access denied (invalid 'token' query param)");
    }
}

const getAddonSlug = (url: URL): string => {
    const addonParam = url.searchParams.get("addon");
    if (addonParam === null) {
        throw new RouteError(400, "Missing 'addon' query param");
    }
    const addonSlug = addonParam.toLowerCase().trim();
    if (addonSlug === "") {
        throw new RouteError(400, "The 'addon' query param is empty (or contains only whitespace)");
    }
    return addonSlug;
};
