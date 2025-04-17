import { TLogicResult } from "./types.ts";
import { run } from "./logic.ts";

export function serve() {
    Deno.serve(async (request: Request) => {
        const pathname = new URL(request.url).pathname;
        const method = request.method;
        if (method == "GET" && pathname === "/") {
            return new Response("hello", { headers: { "content-type": "text/html; charset=UTF-8" } });
        }
        if (method == "GET" && pathname.startsWith("/add")) {
            const url = new URL(request.url);
            const id = url.searchParams.get("id");
            if (!id) {
                return createError("Missing 'id' query param.", 400);
            }
            const addons = url.searchParams.get("addons");
            if (!addons) {
                return createError("Missing 'addons' query param.", 400);
            }
            const addonsArray = addons.split(",").map(e => e.trim()).filter(e => e);
            const logicResult = await run(id, addonsArray);
            if (!logicResult.success) {
                return createError(`An internal error occurred: ${logicResult.error}`, 500);
            }
            return createSuccess(logicResult);
        }
        return new Response(null, { status: 404 });
    });
}

function stringifyObject(obj: unknown): string {
    return JSON.stringify(obj, null, 4);
}

function createError(error: string, status: number): Response {
    const json = stringifyObject({ success: false, lastRefresh: "", urls: [], error, status: createPrettyStatus(status) });
    return new Response(json, { headers: { "content-type": "application/json; charset=UTF-8" }, status });
}

function createSuccess(result: TLogicResult): Response {
    const json = stringifyObject({ success: true, lastRefresh: result.lastRefresh, scrapeResults: result.scrapeResults, error: "", status: createPrettyStatus(200) });
    return new Response(json, { headers: { "content-type": "application/json; charset=UTF-8" } });
}

function createPrettyStatus(status: number): string {
    switch (status) {
        case 200:
            return "HTTP 200 (OK)";
        case 400:
            return "HTTP 400 (Bad Request)";
        case 500:
            return "HTTP 500 (Internal Server Error)";
        default:
            return "UNKNOWN";
    }
}