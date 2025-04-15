export type TLogicResult = {
    success: boolean,
    lastRefresh: string,
    scrapeResults: TScrapeResult[],
    error: string
}

export type TScrapeResult = {
    success: boolean,
    addonSlug: string,
    downloadUrl: string,
    error: string
}

export type TDatabaseEntry = {
    id: string,
    scrapeResults: TScrapeResult[],
    addOrUpdateTimestamp: string
}