import { AddonEntry, ServerResult } from "../common/types.ts";

export function errorMethodNotAllowed(): Response {
    return error("HTTP method not allowed.", 405);
}

export function errorMissingAddons(): Response {
    return error("Missing 'addons' query param.", 400);
}

export function errorMissingToken(): Response {
    return error("Unauthorized.", 401);
}

export function errorInvalidToken(): Response {
    return error("Access denied.", 403);
}

export function error(error: string, status: number): Response {
    const serverResult: ServerResult = {
        success: false,
        error,
        status: createPrettyHttpStatus(status)
    };
    return create(serverResult);
}

export function success(msg: string, entries: AddonEntry[]): Response {
    const serverResult: ServerResult = {
        success: true,
        error: "",
        status: createPrettyHttpStatus(200),
        msg,
        addons: entries
    };
    return create(serverResult);
}

function createPrettyHttpStatus(status: number): string {
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

function create(serverResult: ServerResult): Response {
    const json = JSON.stringify(serverResult, null, 4);
    return new Response(json, { headers: { "content-type": "application/json; charset=UTF-8" } });
}