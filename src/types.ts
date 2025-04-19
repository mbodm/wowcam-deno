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
    successFromScraperApi?: boolean,
    errorFromScraperApi?: string
}

export type TServerSuccessInput = {
    message?: string,
    configs?: TDatabaseConfigEntry[],
    results?: TScrapeResult[],
    scrapes?: TDatabaseScrapeEntry[]
}

export type TServerResult = {
    success: boolean,
    error: string,
    status: string,
} & TServerSuccessInput;