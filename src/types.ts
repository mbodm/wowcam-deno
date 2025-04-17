export type TDatabaseConfigEntry = {
    name: string, // <-- ID
    addons: string[]
}

export type TDatabaseScrapeEntry = {
    addonSlug: string, // <-- ID
    scrapeResult: TScrapeResult
}

export type TScrapeResult = {
    addonSlug: string,
    downloadUrl: string,
    scraperApiSuccess: boolean,
    scraperApiError: string
}

export type TScrapeResultWithoutDetails = {
    addonSlug: string,
    downloadUrl: string,
}