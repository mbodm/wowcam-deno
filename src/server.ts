import * as data from "./data.ts";

export function serve() {
    Deno.serve((request: Request) => {
        const method = request.method;
        const url = new URL(request.url);
        const pathname = url.pathname;
        if (method == "GET" && pathname === "/") {
            return new Response("hello", { headers: { "content-type": "text/html; charset=UTF-8" } });
        }
        try {
            if (method === "GET" && pathname.startsWith("/configs/add")) {
                const id = getId(url)
                if (!id) {
                    return createMissingIdError();
                }
                const addons = getAddons(url);
                if (!addons) {
                    return createMissingAddonsError();
                }
                const created = data.addOrUpdateConfig(id, addons);
                return createSuccess(`Config successfully ${created ? "created" : "updated"}.`);
            }
            if (method === "GET" && pathname.startsWith("/configs")) {
                if (!hasAdminToken(url)) {
                    return createMissingTokenError();
                }
                return createSuccess(data.getAllConfigs());
            }
            if (method === "GET" && pathname.startsWith("/scrapes/get")) {
                const id = getId(url)
                if (!id) {
                    return createMissingIdError();
                }
                const results = data.getScrapesByConfigName(id);
                if (!results) {
                    return createConfigNotExistsError();
                }
                return createSuccess(results);
            }
            if (method === "GET" && pathname.startsWith("/scrapes")) {
                if (!hasAdminToken(url)) {
                    return createMissingTokenError();
                }
                return createSuccess(data.getAllScrapes());
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

function getId(url: URL): string | null {
    return url.searchParams.get("id");
}

function getAddons(url: URL): string[] | null {
    const addons = url.searchParams.get("addons");
    return addons ? addons.split(",").map(addon => addon.trim()).filter(addon => addon) : null;
}

function hasAdminToken(url: URL): boolean {
    // This should (of course) not replace real security (it shall just act as some small barrier)
    // It's fine (wether we have any data to secure nor we use real REST API concepts here anyway)
    return url.searchParams.get("token") === "d19f023f-bfe0-437a-9daf-7ef28386ebe2";
}

function createMissingIdError() {
    return createError("Missing 'id' query param.", 400);
}

function createMissingAddonsError() {
    return createError("Missing 'addons' query param.", 400);
}

function createMissingTokenError() {
    return createError("Access denied.", 403);
}

function createConfigNotExistsError() {
    return createError("Config with given ID not exists.", 404);
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