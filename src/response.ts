export type ServerSuccessResult = {
    infoMessage: string,
    statusInfo: string
};

export type ServerErrorResult = {
    errorMessage: string,
    statusInfo: string
};

export function error(error: string, status: number): Response {
    return createJsonResponse(status, {
        errorMessage: error,
        statusInfo: createPrettyStatus(status)
    });
}

export function success<T extends object>(info: string, payload?: T): Response {
    const statusInfo = createPrettyStatus(200);
    if (payload) {
        return createJsonResponse(200, {
            ...payload,
            infoMessage: info,
            statusInfo
        });
    }
    return createJsonResponse(200, {
        infoMessage: info,
        statusInfo
    });
}

function createPrettyStatus(status: number): string {
    switch (status) {
        case 200:
            return "HTTP 200 OK";
        case 400:
            return "HTTP 400 Bad Request";
        case 401:
            return "HTTP 401 Unauthorized";
        case 403:
            return "HTTP 403 Forbidden";
        case 404:
            return "HTTP 404 Not Found";
        case 500:
            return "HTTP 500 Internal Server Error";
        case 502:
            return "HTTP 502 Bad Gateway";
        case 507:
            return "HTTP 507 Insufficient Storage";
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