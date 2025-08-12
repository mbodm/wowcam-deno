import { AddonEntry, ServerResult } from "../core/types.ts";
import * as helper from "../core/helper.ts";
import * as params from "./params.ts";
import * as errors from "./errors.ts";
import * as storage from "../core/storage.ts";
import * as logic from "../core/logic.ts";

export async function add(url: URL): Promise<Response> {
    helper.log("Received request to add 1 or more addon entries.");
    const addonSlugs = params.getAddonsFromUrl(url);
    if (addonSlugs === null || addonSlugs.length < 1) {
        return errors.missingAddonsError();
    }
    let addedCounter = 0;
    let existCounter = 0;
    for (const addonSlug of addonSlugs) {
        const exists = await storage.entryExists(addonSlug);
        if (!exists) {
            await storage.addEntry(addonSlug);
            helper.log(`Added '${addonSlug}' addon entry.`);
            addedCounter++;
        }
        else {
            helper.log(`Not added '${addonSlug}' addon entry (already existed).`);
            existCounter++;
        }
    }
    const addedTerm = helper.pluralizeWhenNecessary('addon', addedCounter);
    const existTerm = helper.pluralizeWhenNecessary('addon', existCounter);
    const msg = `Added ${addedCounter} new ${addedTerm} (${existCounter} ${existTerm} already existed).`;
    helper.log(msg);
    const entries = await storage.getAllEntries();
    return createResponse(msg, entries);
}

export async function get(): Promise<Response> {
    helper.log("Received request to read all addon entries.");
    const entries = await storage.getAllEntries();
    const count = entries.length;
    const term = helper.pluralizeWhenNecessary("addon", count);
    return createResponse(`${count} ${term} found.`, entries);
}

export async function scrape(): Promise<Response> {
    helper.log("Received request to immediately scrape all addon entries.");
    const count = await logic.executeScrapeForAllEntries();
    const entries = await storage.getAllEntries();
    const term = helper.pluralizeWhenNecessary("addon", count);
    return createResponse(`${count} ${term} scraped.`, entries);
}

export async function clear(): Promise<Response> {
    helper.log("Received request to clear all storages.");
    await storage.deleteAllEntries();
    return createResponse("Cleared all storages.", []);
}

function createResponse(msg: string, entries: AddonEntry[]): Response {
    const serverResult: ServerResult = {
        success: true,
        error: "",
        status: helper.createPrettyHttpStatus(200),
        msg,
        addons: entries
    };
    const json = JSON.stringify(serverResult, null, 4);
    return new Response(json, { headers: { "content-type": "application/json; charset=UTF-8" } });
}