import { ServerResult } from "../core/types.ts";
import * as helper from "../core/helper.ts";

export function methodNotAllowed(): Response {
    return createResponse("HTTP method not allowed.", 405);
}

export function missingIdError(): Response {
    return createResponse("Missing 'id' query param.", 400);
}

export function missingAddonsError(): Response {
    return createResponse("Missing 'addons' query param.", 400);
}

export function missingTokenError(): Response {
    return createResponse("Unauthorized.", 401);
}

export function invalidTokenError(): Response {
    return createResponse("Access denied.", 403);
}

export function createResponse(error: string, status: number): Response {
    const serverResult: ServerResult = {
        success: false,
        error,
        status: helper.createPrettyHttpStatus(status)
    };
    const json = JSON.stringify(serverResult, null, 4);
    return new Response(json, { headers: { "content-type": "application/json; charset=UTF-8" }, status });
}