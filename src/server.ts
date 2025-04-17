import * as logic from "./logic.ts";
import * as repo from "./repo.ts";

export function serve() {
    Deno.serve(async (request: Request) => {
        const method = request.method;
        const url = new URL(request.url);
        const pathname = url.pathname;
        if (method == "GET" && pathname === "/") {
            return new Response("hello", { headers: { "content-type": "text/html; charset=UTF-8" } });
        }
        try {
            if (method === "GET" && pathname.startsWith("/configs/add")) {
                const id = getIdFromQuery(url)
                if (!id) {
                    return createError("Missing 'id' query param.", 400);
                }
                const addons = getAddonsFromQuery(url);
                if (!addons) {
                    return createError("Missing 'addons' query param.", 400);
                }
                repo.addConfig(id, addons);
            }
            if (method === "GET" && pathname === "/scrapes") {
                const addons = getAddonsFromQuery(url);
                if (!addons) {
                    return createError("Missing 'addons' query param.", 400);
                }
                const result = getDetailsFromQuery(url) ? repo.getScrapes() : repo.getScrapesWithoutDetails();
                return createSuccess(result);
            }
            if (method === "GET" && pathname === "/manual") {
                const addons = getAddonsFromQuery(url);
                if (!addons) {
                    return createError("Missing 'addons' query param.", 400);
                }
                const withDetails = getDetailsFromQuery(url);
                const result =  ? repo.getScrapesByAddonSlugs(addons, withDetails);
                return createSuccess(result);
            }
        }
        catch (e: unknown) {
            if (e instanceof Error) {
                console.log(e.message);
                return createError("Internal server exception occurred (please check logs).", 500);
            }
            return createError("Internal server exception occurred.", 500);
        }
        return new Response(null, { status: 404 });
    });
}

function getIdFromQuery(url: URL): string | null {
    const id = url.searchParams.get("id");
    if (!id) {
        return null;
    }
    return id;
}

function getAddonsFromQuery(url: URL): string[] | null {
    const addons = url.searchParams.get("addons");
    if (!addons) {
        return null;
    }
    return addons.split(",").map(addon => addon.trim()).filter(addon => addon);
}

function getDetailsFromQuery(url: URL): boolean {
    const id = url.searchParams.get("details");
    return id === "true";
}

function createError(error: string, status: number): Response {
    const json = JSON.stringify({ success: false, result: null, error, status: createPrettyStatus(status) }, null, 4);
    return new Response(json, { headers: { "content-type": "application/json; charset=UTF-8" }, status });
}

function createSuccess(result: unknown): Response {
    const json = JSON.stringify({ success: true, result, error: "", status: createPrettyStatus(200) }, null, 4);
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