export type AddonEntry = {
    addonSlug: string,
    downloadUrl: string,
    scrapedAt: string
};

export type ServerSuccessResult = {
    infoMessage: string,
    statusInfo: string
};

export type ServerErrorResult = {
    errorMessage: string,
    statusInfo: string
};