export type ConfigEntry = {
    configName: string, // <-- Deno KV key/ID
    addonSlugs: string[]
}

export type ScrapeEntry = {
    addonSlug: string, // <-- Deno KV key/ID
    scrapeResult: ScrapeResult
}

export enum OperationType {
    Create,
    Update
}

export type ScrapeResult = {
    addonSlug: string,
    downloadUrl: string,
    downloadUrlAfterAllRedirects: string,
    successFromScraperApi?: boolean,
    errorFromScraperApi?: string
}

export type ServerResult = {
    // Always
    success: boolean,
    error: string,
    status: string,
    // Depends
    msg?: string,
    entry?: ConfigEntry | ScrapeEntry,
    entries?: ConfigEntry[] | ScrapeEntry[],
    scrapes?: ScrapeResult[]
}