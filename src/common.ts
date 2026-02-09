export function normalizeAddonSlug(addonSlug: string): string {
    if (isNonEmptyString(addonSlug)) {
        return addonSlug.toLowerCase().trim();
    }
    return addonSlug;
}

export function autoPluralize(singular: string, count: number): string {
    if (count < 0) {
        return singular;
    }
    const plural = singular === "entry" ? "entries" : singular + "s";
    return count === 1 ? singular : plural;
}

// Type Guards

export const isString = (value: unknown): value is string =>
    typeof value === "string";

export const isNonEmptyString = (value: unknown): value is string =>
    typeof value === "string" && value.trim() !== "";
