export function isDenoDeployPlatform(): boolean {
    return Deno.env.get("DENO_DEPLOYMENT_ID") !== undefined;
}

export function log(msg: string): void {
    if (isDenoDeployPlatform()) {
        console.log(msg);
    }
    else {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] ${msg}`);
    }
}

export function pluralizeWhenNecessary(singular: string, count: number): string {
    if (count < 0) {
        return singular;
    }
    const plural = singular === "entry" ? "entries" : singular + "s";
    return count === 1 ? singular : plural;
}