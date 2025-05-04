import { OperationType, ConfigEntry, ScrapeEntry, ScrapeResult, ServerResult } from "../core/types.ts";
import * as params from "./params.ts";
import * as errors from "./errors.ts";
import * as dbconfigs from "../db/configs.ts";
import * as dbscrapes from "../db/scrapes.ts";
import * as logic from "../core/logic.ts";
import * as helper from "../core/helper.ts";

export async function configsAdd(url: URL): Promise<Response> {
    const id = params.getIdFromUrl(url);
    if (!id) {
        return errors.missingIdError();
    }
    const addons = params.getAddonsFromUrl(url);
    if (!addons) {
        return errors.missingAddonsError();
    }
    const operation = await dbconfigs.createOrUpdate(id, addons);
    const kind = operation === OperationType.Create ? "created" : "updated";
    helper.log(`Config '${id}' was ${kind}.`);
    await logic.addToScrapesIfNotExisting(addons);
    return createSuccess({ msg: `Config successfully ${kind}}.` });
}

export async function configsOne(url: URL): Promise<Response> {
    const id = params.getIdFromUrl(url);
    if (!id) {
        return errors.missingIdError();
    }
    const entry = await dbconfigs.getOne(id);
    if (params.getDetailsFromUrl(url)) {
        const scrapes = await logic.getScrapeResultsByConfigName(id);
        return createSuccess({ entry, scrapes });
    }
    helper.log(`Single config '${id}' requested.`);
    return createSuccess({ entry });
}

export async function configsAll(): Promise<Response> {
    const entries = await dbconfigs.getAll();
    helper.log("All configs requested.");
    return createSuccess({ entries });
}

export async function scrapesAll(): Promise<Response> {
    const entries = await dbscrapes.getAll();
    helper.log("All scrapes requested.");
    return createSuccess({ entries });
}

export async function scrapesRefresh(): Promise<Response> {
    const count = await logic.refreshScrapes();
    const term = helper.pluralizeWhenNecessary(count, 'addon');
    const msg = `Refreshed ${count} ${term}.`;
    helper.log("Refresh of all scrapes manually triggered.");
    return createSuccess({ msg });
}

export async function storagesClear(): Promise<Response> {
    await dbconfigs.deleteAll();
    await dbscrapes.deleteAll();
    const msg = "Cleared all Deno KV storages.";
    helper.log(msg);
    return createSuccess({ msg })
}

type SuccessData = {
    msg?: string,
    entry?: ConfigEntry | ScrapeEntry,
    entries?: ConfigEntry[] | ScrapeEntry[]
    scrapes?: ScrapeResult[]
}

function createSuccess(data: SuccessData): Response {
    const { msg, entry, entries, scrapes } = data;
    const serverResult: ServerResult = { success: true, error: "", status: helper.createPrettyHttpStatus(200), msg, entry, entries, scrapes };
    const json = JSON.stringify(serverResult, null, 4);
    return new Response(json, { headers: { "content-type": "application/json; charset=UTF-8" } });
}