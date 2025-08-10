import { AddonEntry, ServerResult } from "../core/types.ts";
import * as helper from "../core/helper.ts";
import * as params from "./params.ts";
import * as errors from "./errors.ts";
import * as storage from "../core/storage.ts";
import * as scraper from "../core/scraper.ts";

export async function add(url: URL): Promise<Response> {
    helper.log("Received request to add 1 or more addon entries.");
    const addonSlugs = params.getAddonsFromUrl(url);
    if (!addonSlugs) {
        return errors.missingAddonsError();
    }
    let counter = 0;
    for (const addonSlug of addonSlugs) {
        const exists = await storage.exists(addonSlug);
        if (!exists) {
            await storage.create(addonSlug);
            helper.log(`Added '${addonSlug}' addon entry.`);
            counter++;
        }
        else {
            helper.log(`Not added '${addonSlug}' addon entry (already existed).`);
        }
    }
    const term = helper.pluralizeWhenNecessary(counter, 'addon');
    const msg = `Added ${counter} new ${term}.`;
    helper.log(msg);
    const entries = await storage.getAll();
    return createResponse(msg, entries);
}

export async function get(): Promise<Response> {
    helper.log("Received request to read all addon entries.");
    const entries = await storage.getAll();
    const count = entries.length;
    const term = helper.pluralizeWhenNecessary(count, "addon");
    return createResponse(`${count} ${term} found.`, entries);
}

export async function scrape(): Promise<Response> {
    helper.log("Received request to immediately scrape all addon entries.");
    const count = await scraper.all();
    const entries = await storage.getAll();
    const term = helper.pluralizeWhenNecessary(count, "addon");
    return createResponse(`${count} ${term} scraped.`, entries);
}

export async function clear(): Promise<Response> {
    helper.log("Received request to clear all storages.");
    await storage.deleteAll();
    return createResponse("Cleared all storages.", []);
}

function createResponse(msg: string, entries: AddonEntry[]): Response {
    const serverResult: ServerResult = {
        success: true,
        error: "",
        status: helper.createPrettyHttpStatus(200),
        msg,
        entries
    };
    const json = JSON.stringify(serverResult, null, 4);
    return new Response(json, { headers: { "content-type": "application/json; charset=UTF-8" } });
}