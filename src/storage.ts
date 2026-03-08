const kv = await Deno.openKv();

type MyKvKey = readonly ["addon", string];

type MyKvValue = {
    downloadUrl: string,
    scrapedAt: string
};

export type StorageEntry = {
    addonSlug: string,
    downloadUrl: string,
    scrapedAt: string,
};

export async function addOrUpdate(addonSlug: string, downloadUrl: string, scrapedAt: string): Promise<void> {
    const key = buildKvKey(addonSlug);
    const value: MyKvValue = {
        downloadUrl: downloadUrl.trim(),
        scrapedAt: scrapedAt.trim(),
    };
    const result = await kv.set(key, value);
    if (!result.ok) {
        throw new Error("Could not write Deno KV entry");
    }
}

export async function getAll(): Promise<StorageEntry[]> {
    // The encapsulated kv.list() function returns an AsyncIterableIterator<> type (that's why we do "for await" here)
    const storageEntries: StorageEntry[] = [];
    for await (const entry of getKvEntries()) {
        storageEntries.push({
            addonSlug: entry.key[1],
            downloadUrl: entry.value.downloadUrl,
            scrapedAt: entry.value.scrapedAt,
        });
    }
    return storageEntries;
}

export async function clearAll(): Promise<void> {
    // The encapsulated kv.list() function returns an AsyncIterableIterator<> type (that's why we do "for await" here)
    for await (const entry of getKvEntries()) {
        await kv.delete(entry.key);
    }
}

function buildKvKey(addonSlug: string): MyKvKey {
    // A Deno KV key is a unique array of key parts (Note: A Curse addon slug is already a unique identifier)    
    const normalizedAddonSlug = addonSlug.toLowerCase().trim();
    if (normalizedAddonSlug === "") {
        throw new Error("Given 'addonSlug' is an empty string (or contains only whitespace)");
    }
    return ["addon", normalizedAddonSlug] as const;
}

// Sadly Deno.KvListIterator<> does not support a generic type T for the key (so we do a bit more complex typing here and use an explicit cast)
// Otherwise we would need a type guard for every entry in every loop iteration (even though the key shape is already safe at runtime via prefix)
const getKvEntries = (): AsyncIterableIterator<Deno.KvEntry<MyKvValue> & { key: MyKvKey }> =>
    kv.list<MyKvValue>({ prefix: ["addon"] }) as AsyncIterableIterator<Deno.KvEntry<MyKvValue> & { key: MyKvKey }>;
