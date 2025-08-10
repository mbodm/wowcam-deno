import { AddonData, ScrapeResult } from "../core/types.ts";



export async function exists(addonSlug: string): Promise<boolean> {
    idEmptyCheck(addonSlug);
    const kv = await Deno.openKv();
    try {
        const key = kvBuildKey(addonSlug);
        const entry: Deno.KvEntryMaybe<AddonData> = await kv.get(key);
        return kvEntryExists(entry);
    }
    finally {
        kv.close();
    }
}

export async function create(addonSlug: string): Promise<void> {
    idEmptyCheck(addonSlug);
    const kv = await Deno.openKv();
    try {
        const key = kvBuildKey(addonSlug);
        const entry: Deno.KvEntryMaybe<AddonData> = await kv.get(key);
        if (kvEntryExists(entry)) {
            throw new Error("An entry for the given 'addonSlug' argument (used as Deno KV key/ID) already exists.");
        }
        const value: AddonData = {
            addonSlug,
            scrapeDone: false,
            scrapeResult: null
        };
        const result = await kv.set(key, value);
        if (!result.ok) {
            throw new Error("Could not create Deno KV entry.");
        }
    }
    finally {
        kv.close();
    }
}

export async function update(addonSlug: string, scrapeResult: ScrapeResult): Promise<void> {
    idEmptyCheck(addonSlug);
    const kv = await Deno.openKv();
    try {
        const key = kvBuildKey(addonSlug);
        const entry: Deno.KvEntryMaybe<AddonData> = await kv.get(key);
        if (!kvEntryExists(entry)) {
            throw new Error("An entry for the given 'addonSlug' argument (used as Deno KV key/ID) not exists.");
        }
        const value: AddonData = {
            addonSlug,
            scrapeDone: true,
            scrapeResult
        };
        const result = await kv.set(key, value);
        if (!result.ok) {
            throw new Error("Could not update Deno KV entry.");
        }
    }
    finally {
        kv.close();
    }
}

export async function getOne(addonSlug: string): Promise<AddonData> {
    idEmptyCheck(addonSlug);
    const kv = await Deno.openKv();
    try {
        const key = kvBuildKey(addonSlug);
        const entry: Deno.KvEntryMaybe<AddonData> = await kv.get(key);
        if (!kvEntryExists(entry)) {
            throw new Error("An entry for the given 'addonSlug' argument (used as Deno KV key/ID) not exists.");
        }
        return entry.value!;
    }
    finally {
        kv.close();
    }
}

export async function getAll(): Promise<AddonData[]> {
    const kv = await Deno.openKv();
    try {
        const entries: Deno.KvListIterator<AddonData> = kv.list({ prefix: ["addon"] });
        const result: AddonData[] = [];
        // The kv.list() function returns an AsyncIterableIterator<> type (that's why we do "for await" here)
        for await (const entry of entries) {
            result.push(entry.value);
        }
        return result;
    }
    finally {
        kv.close();
    }
}

export async function deleteOne(addonSlug: string): Promise<void> {
    idEmptyCheck(addonSlug);
    const kv = await Deno.openKv();
    try {
        const key = kvBuildKey(addonSlug);
        const entry: Deno.KvEntryMaybe<AddonData> = await kv.get(key);
        if (!kvEntryExists(entry)) {
            throw new Error("An entry for the given 'addonSlug' argument (used as Deno KV key/ID) not exists.");
        }
        await kv.delete(entry.key);
    }
    finally {
        kv.close();
    }
}

export async function deleteAll(): Promise<void> {
    const kv = await Deno.openKv();
    try {
        const entries: Deno.KvListIterator<AddonData> = kv.list({ prefix: ["addon"] });
        // The kv.list() function returns an AsyncIterableIterator<> type (that's why we do "for await" here)
        for await (const entry of entries) {
            await kv.delete(entry.key);
        }
    }
    finally {
        kv.close();
    }
}

function idEmptyCheck(addonSlug: string): void {
    if (addonSlug === "") {
        throw new Error("The given 'addonSlug' argument (used as Deno KV key/ID) is an empty string.");
    }
    if (addonSlug.trim() === "") {
        throw new Error("The given 'addonSlug' argument (used as Deno KV key/ID) is a string which contains whitespaces only.");
    }
}

function kvBuildKey(addonSlug: string): string[] {
    // In Deno KV a key/ID is a unique array of strings (a Curse addon slug is already a unique string)
    return ["addon", addonSlug];
}

function kvEntryExists(kvEntry: Deno.KvEntryMaybe<AddonData>): boolean {
    // In Deno KV a "kvEntry.value === null" means "there is no entry for that key/ID at all" and NOT "this is an existing key/ID entry with just an empty value"
    return kvEntry.value !== null;
}