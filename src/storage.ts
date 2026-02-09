const kv = await Deno.openKv();

type KvKey = readonly ["addon", string];

type KvValue = {
    downloadUrl: string,
    scrapedAt: string
};

export type StorageEntry = {
    addonSlug: string,
    downloadUrl: string,
    scrapedAt: string,
};

export async function addOrUpdate(addonSlug: string, downloadUrl: string, scrapedAt: string): Promise<void> {
    const key = buildKvKey(handleAddonSlugArgument(addonSlug));
    const value: KvValue = {
        downloadUrl: downloadUrl.trim(),
        scrapedAt: scrapedAt.trim(),
    };
    const result = await kv.set(key, value);
    if (!result.ok) {
        throw new Error("Could not write Deno KV entry.");
    }
}

export async function getOne(addonSlug: string): Promise<StorageEntry | null> {
    const key = buildKvKey(handleAddonSlugArgument(addonSlug));
    const entry = await kv.get<KvValue>(key);
    return kvEntryExists(entry) ? createStorageEntry(key, entry.value) : null;
}

export async function getAll(): Promise<StorageEntry[]> {
    const storageEntries: StorageEntry[] = [];
    // The encapsulated kv.list() function returns an AsyncIterableIterator<> type (that's why we do "for await" here)
    for await (const e of getKvEntries()) {
        if (isKvKey(e.key)) {
            storageEntries.push(createStorageEntry(e.key, e.value));
        }
    }
    return storageEntries;
}

export async function clear(): Promise<void> {
    // The encapsulated kv.list() function returns an AsyncIterableIterator<> type (that's why we do "for await" here)
    for await (const e of getKvEntries()) {
        if (isKvKey(e.key)) {
            await kv.delete(e.key);
        }
    }
}

const buildKvKey = (addonSlug: string): KvKey =>
    // In Deno KV a key is a unique array of key parts (Note: A Curse addon slug is already a unique identifier)
    ["addon", addonSlug] as const;

const handleAddonSlugArgument = (addonSlug: string): string => {
    const addonSlugNormalized = addonSlug.toLowerCase().trim();
    if (addonSlugNormalized === "") {
        const err = new Error("The given 'addonSlug' argument is an empty string (or contains whitespaces only).");
        err.name = "StorageModuleInputValidationError";
        throw err;
    }
    return addonSlugNormalized;
}

const kvEntryExists = (kvEntry: Deno.KvEntryMaybe<KvValue>): kvEntry is Deno.KvEntry<KvValue> =>
    // A "kvEntry.value === null" in Deno KV
    // - means: "There is no entry at all, for given key."
    // - means NOT: "This is an existing entry, for given key, just with an empty value."
    kvEntry.value !== null;

const createStorageEntry = (key: KvKey, value: KvValue): StorageEntry => ({
    addonSlug: key[1],
    downloadUrl: value.downloadUrl,
    scrapedAt: value.scrapedAt,
});

const getKvEntries = (): Deno.KvListIterator<KvValue> =>
    kv.list<KvValue>({ prefix: ["addon"] });

const isKvKey = (key: Deno.KvKey): key is KvKey =>
    key.length === 2 && key[0] === "addon" && typeof key[1] === "string";
