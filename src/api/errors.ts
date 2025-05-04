import { ServerResult } from "../core/types.ts";
import * as helper from "../core/helper.ts";

export function missingIdError(): Response {
    return createError("Missing 'id' query param.", 400);
}

export function missingAddonsError(): Response {
    return createError("Missing 'addons' query param.", 400);
}

export function missingTokenError(): Response {
    return createError("Not authorized.", 401);
}

export function invalidTokenError(): Response {
    return createError("Access denied.", 403);
}

export function configNotExistsError(): Response {
    return createError("Config with given ID not exists.", 404);
}

export function createError(error: string, status: number): Response {
    const serverResult: ServerResult = { success: false, error, status: helper.createPrettyHttpStatus(status) };
    const json = JSON.stringify(serverResult, null, 4);
    return new Response(json, { headers: { "content-type": "application/json; charset=UTF-8" }, status });
}