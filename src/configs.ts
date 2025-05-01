import { ConfigOperationType, ConfigEntry } from "./types.ts";

export async function exists(configName: string): Promise<boolean> {
    idEmptyCheck(configName);
    const kv = await Deno.openKv();
    const entry = await kv.get(["config", configName]);
    const existing = entry.value !== null;
    kv.close();
    return existing;
}

export async function createOrUpdate(configName: string, addonSlugs: string[]): Promise<ConfigOperationType> {
    idEmptyCheck(configName);
    // Is create or update?
    const kv = await Deno.openKv();
    const entry = await kv.get(["config", configName]);
    const existing = entry.value !== null;
    // Perform create/update
    const value: ConfigEntry = { configName, addonSlugs };
    const result = await kv.set(["config", configName], value);
    if (!result.ok) {
        throw new Error("Could not create or update the Deno KV entry.");
    }
    kv.close();
    return existing ? ConfigOperationType.Update : ConfigOperationType.Create;
}

export async function getAll(): Promise<ConfigEntry[]> {
    const kv = await Deno.openKv();
    const entries: Deno.KvListIterator<ConfigEntry> = kv.list({ prefix: ["config"] });
    const result: ConfigEntry[] = [];
    for await (const entry of entries) {
        result.push(entry.value);
    }
    return result;
}

export async function getOne(configName: string): Promise<ConfigEntry> {
    idEmptyCheck(configName);
    const kv = await Deno.openKv();
    const entry: Deno.KvEntryMaybe<ConfigEntry> = await kv.get(["config", configName]);
    if (entry.value === null) {
        throw new Error("Deno KV contains no config with given name.");
    }
    const value: ConfigEntry = entry.value;
    kv.close();
    return value;
}

function idEmptyCheck(configName: string): void {
    if (configName === "") {
        throw new Error(`The given 'configName' argument (used as the config's ID/Key) was an empty string.`);
    }
    if (configName.trim() === "") {
        throw new Error(`The given 'configName' argument (used as the config's ID/Key) is a string which contains whitespaces only.`);
    }
}