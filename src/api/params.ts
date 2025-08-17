export function getAddonSlugs(url: URL): string[] {
    const addons = url.searchParams.get("addons");
    return addons ? addons.split(",").map(addon => addon.trim()).filter(addon => addon) : [];
}

export function getToken(url: URL): string {
    return url.searchParams.get("token") ?? "";
}