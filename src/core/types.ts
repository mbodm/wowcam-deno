export type AddonData = {
    addonSlug: string; // <-- Deno KV key/ID
    scrapeDone: boolean;
    scrapeResult: ScrapeResult | null;
}

export type ScrapeResult = {
    addonSlug: string,
    downloadUrl: string,
    downloadUrlFinal: string,
    successFromScraperApi: boolean,
    errorFromScraperApi: string
}

export type ServerResult = {
    success: boolean,
    error: string,
    status: string,
    msg?: string,
    addons?: AddonData[],
}