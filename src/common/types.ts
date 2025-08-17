export type AddonEntry = {
    addonSlug: string; // <-- Deno KV key/ID
    hadScrape: boolean;
} & Partial<Omit<ScrapeResult, "addonSlug">>;

export type ScrapeResult = {
    addonSlug: string,
    downloadUrl: string,
    downloadUrlFinal: string,
    scraperApiSuccess: boolean,
    scraperApiError: string,
    timestamp: string
}

export type ServerResult = {
    success: boolean,
    error: string,
    status: string,
    msg?: string,
    addons?: AddonEntry[],
}