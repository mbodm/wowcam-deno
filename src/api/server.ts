import * as errors from "./errors.ts";
import * as params from "./params.ts";
import * as routes from "./routes.ts";
import * as helper from "../core/helper.ts";

export function start() {
    Deno.serve(async (request: Request) => {
        const method = request.method;
        if (method !== "GET") {
            return errors.methodNotAllowed();
        }
        const url = new URL(request.url);
        const path = url.pathname;
        if (path === "/") {
            return new Response("hello", { headers: { "content-type": "text/html; charset=UTF-8" } });
        }
        if (!params.hasToken(url)) {
            return errors.missingTokenError();
        }
        if (!params.hasAdminToken(url)) {
            return errors.invalidTokenError();
        }
        try {
            if (path.startsWith("/add")) {
                await routes.add(url);
            }
            if (path.startsWith("/get")) {
                await routes.get();
            }
            if (path.startsWith("/scrape")) {
                await routes.scrape();
            }
            if (path.startsWith("/clear")) {
                await routes.clear();
            }
        }
        catch (e: unknown) {
            if (e instanceof Error) {
                helper.log(e.message);
                return errors.createResponse("Internal server exception occurred (please check logs).", 500);
            }
            return errors.createResponse("Internal server exception occurred.", 500);
        }
        return new Response(null, { status: 404 });
    });
}