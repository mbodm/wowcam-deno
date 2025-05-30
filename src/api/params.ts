export function getIdFromUrl(url: URL): string | null {
    return url.searchParams.get("id");
}

export function getAddonsFromUrl(url: URL): string[] | null {
    const addons = url.searchParams.get("addons");
    return addons ? addons.split(",").map(addon => addon.trim()).filter(addon => addon) : null;
}

export function getDetailsFromUrl(url: URL): boolean | null {
    const details = url.searchParams.get("details");
    return details ? details.toLowerCase() === "true" || details === "1" : null;
}

// This should (of course) not replace real security (it shall just act as some small barrier)
// It's fine (wether we have any data to secure nor we use real REST API concepts here anyway)

export function hasToken(url: URL): boolean {
    return url.searchParams.get("token") !== null;
}

export function hasAdminToken(url: URL): boolean {
    return url.searchParams.get("token") === "d19f023f-bfe0-437a-9daf-7ef28386ebe2";
}