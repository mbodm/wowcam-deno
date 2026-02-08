import { AddonEntry } from "./types.ts";
import { handleStringArgument } from "./helper.ts";

const kv = await Deno.openKv();

type KvKey = readonly ["addon", string];

type KvValue = {
    downloadUrl: string,
    scrapedAt: string
};

export async function addOrUpdate(addonSlug: string, downloadUrl: string, scrapedAt: string): Promise<void> {
    const name = handleStringArgument(addonSlug, "addonSlug").toLowerCase();
    const key = buildKvKey(name);
    const value: KvValue = {
        downloadUrl: downloadUrl.trim(),
        scrapedAt: scrapedAt.trim(),
    };
    const result = await kv.set(key, value);
    if (!result.ok) {
        throw new Error("Could not write Deno KV entry.");
    }
}

export async function getOne(addonSlug: string): Promise<AddonEntry | null> {
    const key = buildKvKey(handleStringArgument(addonSlug, "addonSlug").toLowerCase());
    const entry = await kv.get<KvValue>(key);
    return kvEntryExists(entry) ? createAddonEntry(key, entry.value) : null;
}

export async function getAll(): Promise<AddonEntry[]> {
    const addonEntries: AddonEntry[] = [];
    // The encapsulated kv.list() function returns an AsyncIterableIterator<> type (that's why we do "for await" here)
    for await (const e of getKvEntries()) {
        if (isKvKey(e.key)) {
            addonEntries.push(createAddonEntry(e.key, e.value));
        }
    }
    return addonEntries;
}

export async function clear(): Promise<void> {
    // The encapsulated kv.list() function returns an AsyncIterableIterator<> type (that's why we do "for await" here)
    for await (const e of getKvEntries()) {
        if (isKvKey(e.key)) {
            await kv.delete(e.key);
        }
    }
}

// In Deno KV a key is a unique array of key parts (Note: A Curse addon slug is already a unique identifier)
const buildKvKey = (addonSlug: string): KvKey =>
    ["addon", addonSlug] as const;

// A "kvEntry.value === null" in Deno KV
// - means: "There is no entry at all, for given key."
// - means NOT: "This is an existing entry, for given key, just with an empty value."
const kvEntryExists = (kvEntry: Deno.KvEntryMaybe<KvValue>): kvEntry is Deno.KvEntry<KvValue> =>
    kvEntry.value !== null;

const createAddonEntry = (key: KvKey, value: KvValue): AddonEntry => ({
    addonSlug: key[1],
    downloadUrl: value.downloadUrl,
    scrapedAt: value.scrapedAt
});

const getKvEntries = (): Deno.KvListIterator<KvValue> =>
    kv.list<KvValue>({ prefix: ["addon"] });

const isKvKey = (key: Deno.KvKey): key is KvKey =>
    key.length === 2 && key[0] === "addon" && typeof key[1] === "string";
