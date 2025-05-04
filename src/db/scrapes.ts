import { ScrapeEntry, ScrapeResult, OperationType } from "../core/types.ts";

export async function exists(addonSlug: string): Promise<boolean> {
    idEmptyCheck(addonSlug);
    const kv = await Deno.openKv();
    const entry: Deno.KvEntryMaybe<ScrapeEntry> = await kv.get(kvKey(addonSlug));
    const existing = entry.value !== null;
    kv.close();
    return existing;
}

export async function createOrUpdate(addonSlug: string, scrapeResult: ScrapeResult): Promise<OperationType> {
    idEmptyCheck(addonSlug);
    // Is create or update?
    const kv = await Deno.openKv();
    const entry: Deno.KvEntryMaybe<ScrapeEntry> = await kv.get(kvKey(addonSlug));
    const existing = entry.value !== null;
    // Perform create/update
    const value: ScrapeEntry = { addonSlug, scrapeResult };
    const result = await kv.set(kvKey(addonSlug), value);
    if (!result.ok) {
        throw new Error("Could not create or update Deno KV entry.");
    }
    kv.close();
    return existing ? OperationType.Update : OperationType.Create;
}

export async function getOne(addonSlug: string): Promise<ScrapeEntry> {
    idEmptyCheck(addonSlug);
    const kv = await Deno.openKv();
    const entry: Deno.KvEntryMaybe<ScrapeEntry> = await kv.get(kvKey(addonSlug));
    if (entry.value === null) {
        throw new Error("Deno KV not contains any entry with given key.");
    }
    const value = entry.value;
    kv.close();
    return value;
}

export async function getAll(): Promise<ScrapeEntry[]> {
    const kv = await Deno.openKv();
    const entries: Deno.KvListIterator<ScrapeEntry> = kv.list({ prefix: ["scrape"] });
    const result: ScrapeEntry[] = [];
    for await (const entry of entries) {
        result.push(entry.value);
    }
    kv.close();
    return result;
}

export async function deleteAll(): Promise<void> {
    const kv = await Deno.openKv();
    const entries: Deno.KvListIterator<ScrapeEntry> = kv.list({ prefix: ["scrape"] });
    for await (const entry of entries) {
        await kv.delete(entry.key);
    }
    kv.close();
}

function idEmptyCheck(addonSlug: string): void {
    if (addonSlug === "") {
        throw new Error(`The given 'addonSlug' argument (used as Deno KV key/ID) was an empty string.`);
    }
    if (addonSlug.trim() === "") {
        throw new Error(`The given 'addonSlug' argument (used as Deno KV key/ID) is a string which contains whitespaces only.`);
    }
}

function kvKey(addonSlug: string): string[] {
    return ["scrape", addonSlug];
}