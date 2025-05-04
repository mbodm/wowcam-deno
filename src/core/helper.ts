export function isDenoDeploy(): boolean {
    return Deno.env.get("DENO_DEPLOYMENT_ID") !== undefined;
}

export function log(msg: string): void {
    if (isDenoDeploy()) {
        console.log(msg);
    }
    else {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] ${msg}`);
    }
}

export function pluralizeWhenNecessary(count: number, singular: string): string {
    return count === 1 ? singular : `${singular}s`;
}

export function createPrettyHttpStatus(status: number): string {
    switch (status) {
        case 200:
            return "HTTP 200 (OK)";
        case 400:
            return "HTTP 400 (Bad Request)";
        case 401:
            return "HTTP 401 (Unauthorized)";
        case 403:
            return "HTTP 403 (Forbidden)";
        case 404:
            return "HTTP 404 (Not Found)";
        case 500:
            return "HTTP 500 (Internal Server Error)";
        default:
            return "UNKNOWN";
    }
}