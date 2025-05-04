import { ConfigEntry, OperationType } from "../core/types.ts";

export async function exists(configName: string): Promise<boolean> {
    idEmptyCheck(configName);
    const kv = await Deno.openKv();
    const entry: Deno.KvEntryMaybe<ConfigEntry> = await kv.get(kvKey(configName));
    const existing = entry.value !== null;
    kv.close();
    return existing;
}

export async function createOrUpdate(configName: string, addonSlugs: string[]): Promise<OperationType> {
    idEmptyCheck(configName);
    // Is create or update?
    const kv = await Deno.openKv();
    const entry: Deno.KvEntryMaybe<ConfigEntry> = await kv.get(kvKey(configName));
    const existing = entry.value !== null;
    // Perform create/update
    const value: ConfigEntry = { configName, addonSlugs };
    const result = await kv.set(kvKey(configName), value);
    if (!result.ok) {
        throw new Error("Could not create or update Deno KV entry.");
    }
    kv.close();
    return existing ? OperationType.Update : OperationType.Create;
}

export async function getOne(configName: string): Promise<ConfigEntry> {
    idEmptyCheck(configName);
    const kv = await Deno.openKv();
    const entry: Deno.KvEntryMaybe<ConfigEntry> = await kv.get(kvKey(configName));
    if (entry.value === null) {
        throw new Error("Deno KV not contains any entry with given key.");
    }
    const value = entry.value;
    kv.close();
    return value;
}

export async function getAll(): Promise<ConfigEntry[]> {
    const kv = await Deno.openKv();
    const entries: Deno.KvListIterator<ConfigEntry> = kv.list({ prefix: ["config"] });
    const result: ConfigEntry[] = [];
    for await (const entry of entries) {
        result.push(entry.value);
    }
    kv.close();
    return result;
}

export async function deleteAll(): Promise<void> {
    const kv = await Deno.openKv();
    const entries: Deno.KvListIterator<ConfigEntry> = kv.list({ prefix: ["config"] });
    for await (const entry of entries) {
        await kv.delete(entry.key);
    }
    kv.close();
}

function idEmptyCheck(configName: string): void {
    if (configName === "") {
        throw new Error(`The given 'configName' argument (used as Deno KV key/ID) was an empty string.`);
    }
    if (configName.trim() === "") {
        throw new Error(`The given 'configName' argument (used as Deno KV key/ID) is a string which contains whitespaces only.`);
    }
}

function kvKey(configName: string): string[] {
    return ["config", configName];
}