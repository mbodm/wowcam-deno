import * as params from "./params.ts";
import * as errors from "./errors.ts";
import * as routes from "./routes.ts";
import * as helper from "../core/helper.ts";

export function serve() {
    Deno.serve(async (request: Request) => {
        const method = request.method;
        const url = new URL(request.url);
        const path = url.pathname;
        if (method == "GET" && path === "/") {
            return new Response("HELLO", { headers: { "content-type": "text/html; charset=UTF-8" } });
        }
        if (!params.hasToken(url)) {
            return errors.missingTokenError();
        }
        if (!params.hasAdminToken(url)) {
            return errors.invalidTokenError();
        }
        try {
            if (method === "GET" && path.startsWith("/configs/add")) {
                return await routes.configsAdd(url);
            }
            if (method === "GET" && path.startsWith("/configs/one")) {
                return await routes.configsOne(url);
            }
            if (method === "GET" && path.startsWith("/configs/all")) {
                return await routes.configsAll();
            }
            if (method === "GET" && path.startsWith("/scrapes/all")) {
                return await routes.scrapesAll();
            }
            if (method === "GET" && path.startsWith("/scrapes/refresh")) {
                return await routes.scrapesRefresh();
            }
            if (method === "GET" && path.startsWith("/storages/clear")) {
                return await routes.storagesClear();
            }
        }
        catch (e: unknown) {
            if (e instanceof Error) {
                helper.log(e.message);
                return errors.createError("Internal server exception occurred (please check logs).", 500);
            }
            return errors.createError("Internal server exception occurred.", 500);
        }
        return new Response(null, { status: 404 });
    });
}