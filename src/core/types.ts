export type AddonEntry = {
    addonSlug: string; // <-- Deno KV key/ID
    scrapePassed: boolean;
    scrapeResult: ScrapeResult;
}

export type ScrapeResult = {
    addonSlug: string,
    downloadUrl: string,
    downloadUrlFinal: string,
    scraperApiSuccess: boolean,
    scraperApiError: string
}

export type ServerResult = {
    success: boolean,
    error: string,
    status: string,
    msg?: string,
    entries?: AddonEntry[],
}