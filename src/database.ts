import { TScrapeResult, TDatabaseEntry } from "./types.ts";

const db: TDatabaseEntry[] = [];

export function exists(id: string): boolean {
    if (id.trim() === "") {
        throw new Error("Internal input validation failed.");
    }
    return db.some(o => o.id === id);
}

export function get(id: string): TDatabaseEntry | null {
    if (id.trim() === "") {
        throw new Error("Internal input validation failed.");
    }
    const index = db.findIndex(o => o.id === id);
    if (index === -1) {
        return null;
    }
    return db[index];
}

export function addOrUpdate(id: string, scrapeResults: TScrapeResult[]): TDatabaseEntry {
    if (id.trim() === "") {
        throw new Error("Internal input validation failed.");
    }
    const timestamp = new Date().toISOString();
    const index = db.findIndex(o => o.id === id);
    if (index === -1) {
        const entry: TDatabaseEntry = { id, scrapeResults, addOrUpdateTimestamp: timestamp };
        db.push(entry);
        return entry;
    }
    else {
        db[index].scrapeResults = scrapeResults;
        db[index].addOrUpdateTimestamp = timestamp;
        return db[index];
    }
}