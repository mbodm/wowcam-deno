import { ServerErrorResult, ServerSuccessResult } from "./types.ts";

export function hello(): Response {
    return new Response("hello", { status: 200, headers: { "content-type": "text/plain; charset=utf-8" } });
}

export function notFound(): Response {
    return new Response(null, { status: 404 });
}

export function errorMethodNotAllowed(): Response {
    return error("HTTP method not allowed.", 405);
}

export function errorMissingAddon(): Response {
    return error("Missing 'addon' query param.", 400);
}

export function errorMissingToken(): Response {
    return error("Unauthorized (missing 'token' query param).", 401);
}

export function errorInvalidToken(): Response {
    return error("Access denied (invalid 'token' query param).", 403);
}

export function error(error: string, status: number): Response {
    const serverResult: ServerErrorResult = {
        errorMessage: error,
        statusInfo: createPrettyStatus(status),
    };
    return createJsonResponse(status, serverResult);
}

export function success<T extends object>(infoMessage: string, payload?: T): Response {
    const serverResult: ServerSuccessResult | (T & ServerSuccessResult) = payload
        ? {
            ...payload,
            infoMessage,
            statusInfo: createPrettyStatus(200),
        }
        : {
            infoMessage,
            statusInfo: createPrettyStatus(200),
        };
    return createJsonResponse(200, serverResult);
}

function createPrettyStatus(status: number): string {
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
            return `HTTP ${status}`;
    }
}

function createJsonResponse(status: number, serverResult: ServerErrorResult | ServerSuccessResult): Response {
    const json = JSON.stringify(serverResult, null, 4);
    return new Response(json, {
        status,
        headers: {
            "content-type": "application/json; charset=utf-8",
            "cache-control": "no-store"
        }
    });
}