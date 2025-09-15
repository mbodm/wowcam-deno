export function autoPluralize(singular: string, count: number): string {
    if (count < 0) {
        return singular;
    }
    const plural = singular === "entry" ? "entries" : singular + "s";
    return count === 1 ? singular : plural;
}