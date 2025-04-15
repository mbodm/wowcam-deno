import { } from "./logic.ts";

export function serve() {
    Deno.serve(async (request: Request) => {
        const pathname = new URL(request.url).pathname;
        const method = request.method;
        if (method == "GET" && pathname === "/") {
            return new Response('hello', { headers: { "content-type": "text/html; charset=UTF-8" } });
        }
        if (method == "GET" && pathname.startsWith("/add")) {
            const url = new URL(request.url);
            const id = url.searchParams.get('id');
            if (!id) {
                return createError('Missing "id" query param.', 400);
            }
            const addons = url.searchParams.get('addons');
            if (!addons) {
                return createError('Missing "addons" query param.', 400);
            }
            const array = addons.split(',').map(e => e.trim()).filter(e => e);
            const results = await run(id, array);
            return new Response(stringifyObject(results), { headers: { "content-type": "application/json; charset=UTF-8" } });
        }
        return new Response(null, { status: 404 });
    });
}

function stringifyObject(obj: unknown): string {
    return JSON.stringify(obj, null, 4);
}

function createError(error: string, status: number): Response {
    const json = stringifyObject({ success: false, error, status: createPrettyStatus(status) });
    return new Response(json, { headers: { "content-type": "application/json; charset=UTF-8" }, status });
}

function createPrettyStatus(status: number): string {
    switch (status) {
        case 200:
            return 'HTTP 200 (OK)';
        case 400:
            return 'HTTP 400 (Bad Request)';
        case 500:
            return 'HTTP 500 (Internal Server Error)';
        default:
            return 'UNKNOWN';
    }
}