export function pluralizeWhenNecessary(singular: string, count: number): string {
    return count < 0 || count === 1 ? singular : `${singular}s`;
}

export function isDenoDeploy(): boolean {
    return Deno.env.get("DENO_DEPLOYMENT_ID") !== undefined
}

export function log(msg: string, always?: boolean): void {
    if (!isDenoDeploy()) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] ${msg}`);
    }
    else {
        if (always) {
            console.log(msg);
        }
    }
}