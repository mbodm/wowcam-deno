import { AddonEntry, ServerResult } from "../types.ts";
import * as helper from "../core/helper.ts";

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
        status: helper.createPrettyHttpStatus(status)
    };
    return create(serverResult);
}

export function success(msg: string, entries: AddonEntry[]): Response {
    const serverResult: ServerResult = {
        success: true,
        error: "",
        status: helper.createPrettyHttpStatus(200),
        msg,
        addons: entries
    };
    return create(serverResult);
}

function create(serverResult: ServerResult): Response {
    const json = JSON.stringify(serverResult, null, 4);
    return new Response(json, { headers: { "content-type": "application/json; charset=UTF-8" } });
}