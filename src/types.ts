export type TDatabaseConfigEntry = {
    configName: string, // <-- ID
    addonSlugs: string[]
}

export type TDatabaseScrapeEntry = {
    addonSlug: string, // <-- ID
    scrapeResult: TScrapeResult
}

export type TScrapeResult = {
    addonSlug: string,
    downloadUrl: string,
    successFromScraperApi: boolean,
    errorFromScraperApi: string
}