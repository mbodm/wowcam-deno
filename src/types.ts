export type ConfigEntry = {
    configName: string, // <-- ID
    addonSlugs: string[]
}

export enum ConfigOperationType {
    Create,
    Update
}

export type ScrapeEntry = {
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
    configs?: ConfigEntry[],
    results?: TScrapeResult[],
    scrapes?: ScrapeEntry[],
    slugs?: string[],
    allSlugs?: string[]
}

export type TServerResult = {
    success: boolean,
    error: string,
    status: string,
} & TServerSuccessInput;