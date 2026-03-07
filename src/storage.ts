const kv = await Deno.openKv();

type AddonKvKey = readonly ["addon", string];

type AddonKvValue = {
    downloadUrl: string,
    scrapedAt: string
};

export type AddonStorageEntry = {
    addonSlug: string,
    downloadUrl: string,
    scrapedAt: string,
};

export async function addOrUpdate(addonSlug: string, downloadUrl: string, scrapedAt: string): Promise<void> {
    const key = buildAddonKvKey(addonSlug);
    const value: AddonKvValue = {
        downloadUrl: downloadUrl.trim(),
        scrapedAt: scrapedAt.trim(),
    };
    const result = await kv.set(key, value);
    if (!result.ok) {
        throw new Error("Could not write Deno KV entry");
    }
}

export async function getOne(addonSlug: string): Promise<AddonStorageEntry | null> {
    const key = buildAddonKvKey(addonSlug);
    const entry = await kv.get<AddonKvValue>(key);
    return kvEntryExists(entry) ? createStorageEntry(key, entry.value) : null;
}

export async function getAll(): Promise<AddonStorageEntry[]> {
    const storageEntries: AddonStorageEntry[] = [];
    // The encapsulated kv.list() function per se returns an AsyncIterableIterator<> type (that's why we do "for await" here)
    for await (const e of getAddonKvEntries()) {
        storageEntries.push(createStorageEntry(e.key, e.value));
    }
    return storageEntries;
}

export async function clear(): Promise<void> {
    // The encapsulated kv.list() function per se returns an AsyncIterableIterator<> type (that's why we do "for await" here)
    for await (const e of getAddonKvEntries()) {
        await kv.delete(e.key);
    }
}

// In Deno KV a key is a unique array of key parts (Note: A Curse addon slug is already a unique identifier)
const buildAddonKvKey = (addonSlug: string): AddonKvKey => {
    if (!isNonEmptyString(addonSlug)) {
        throw new Error("Given 'addonSlug' is an empty string (or contains whitespaces only)");
    }
    const normalizedAddonSlug = addonSlug.toLowerCase().trim();
    return ["addon", normalizedAddonSlug] as const;
}

// Type Guard
const isNonEmptyString = (u: unknown): u is string =>
    typeof u === "string" && u.trim().length > 0;

// A "kvEntry.value === null" in Deno KV
// - means: "There is no entry at all, for given key."
// - means NOT: "This is an existing entry, for given key, just with an empty value."
const kvEntryExists = (kvEntry: Deno.KvEntryMaybe<AddonKvValue>): kvEntry is Deno.KvEntry<AddonKvValue> =>
    kvEntry.value !== null;

const createStorageEntry = (key: AddonKvKey, value: AddonKvValue): AddonStorageEntry => ({
    addonSlug: key[1],
    downloadUrl: value.downloadUrl,
    scrapedAt: value.scrapedAt,
});

// Sadly Deno.KvListIterator<> does not support a generic type T for the key (so we do a bit more complex typing here and use an explicit cast)
// Otherwise we would need a type guard for every entry in every loop iteration (even though the key shape is already safe at runtime via prefix)
const getAddonKvEntries = (): AsyncIterableIterator<Deno.KvEntry<AddonKvValue> & { key: AddonKvKey }> =>
    kv.list<AddonKvValue>({ prefix: ["addon"] }) as AsyncIterableIterator<Deno.KvEntry<AddonKvValue> & { key: AddonKvKey }>;
