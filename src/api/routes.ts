import { AddonData, ServerResult } from "../core/types.ts";
import * as params from "./params.ts";
import * as errors from "./errors.ts";
import * as db from "../db/addons.ts";
import * as logic from "../core/scrape.ts";
import * as helper from "../core/helper.ts";

export async function add(url: URL): Promise<Response> {
    helper.log("Client wants to add 1 or more addons.");
    const addons = params.getAddonsFromUrl(url);
    if (!addons) {
        return errors.missingAddonsError();
    }
    let counter = 0;
    for (const addon of addons) {
        const exists = await db.exists(addon);
        if (!exists) {
            await db.create(addon);
            helper.log(`Added '${addon}' addon.`);
            counter++;
        }
    }
    const term = helper.pluralizeWhenNecessary(counter, 'addon');
    const msg = `Added ${counter} new ${term}.`;
    helper.log(msg);

    
    return createResponse(msg, addons);
}

export async function get(): Promise<Response> {
    helper.log("Client requested reading of all addons.");
    const addons = await db.getAll();
    const count = addons.length;
    const term = helper.pluralizeWhenNecessary(count, "addon");
    return createResponse(`${count} ${term} found.`, addons);
}

export async function scrape(): Promise<Response> {
    helper.log("Client requested scraping of all addons.");
    await logic.scrapeAll();
    const addons = await db.getAll();
    const count = addons.length;
    const term = helper.pluralizeWhenNecessary(count, "addon");
    return createResponse(`${count} ${term} scraped.`, addons);
}

export async function clear(): Promise<Response> {
    helper.log("Client requested clearing of all Deno KV storages.");
    await db.deleteAll();
    return createResponse("Cleared all Deno KV storages.", []);
}

function createResponse(msg: string, addons: AddonData[]): Response {
    const serverResult: ServerResult = {
        success: true,
        error: "",
        status: helper.createPrettyHttpStatus(200),
        msg,
        addons
    };
    const json = JSON.stringify(serverResult, null, 4);
    return new Response(json, { headers: { "content-type": "application/json; charset=UTF-8" } });
}