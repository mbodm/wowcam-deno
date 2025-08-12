import * as errors from "./errors.ts";
import * as params from "./params.ts";
import * as routes from "./routes.ts";
import * as helper from "../core/helper.ts";

export function start() {
    Deno.serve(async (request: Request) => {
        // Everything is handled via HTTP GET requests to keep some easy in-browser testing (in contrast to a real/correct API design)
        const method = request.method;
        if (method !== "GET") {
            return errors.methodNotAllowedError();
        }
        const url = new URL(request.url);
        const path = url.pathname;
        if (path === "/") {
            return new Response("hello", { headers: { "content-type": "text/html; charset=UTF-8" } });
        }
        // Some token is better than nothing and is expected via URL query param to keep some easy in-browser testing (in contrast to a real/correct API design)
        const token = params.getTokenFromUrl(url);
        if (token === null) {
            return errors.missingTokenError();
        }
        if (token !== "d19f023f-bfe0-437a-9daf-7ef28386ebe2") {
            return errors.invalidTokenError();
        }
        try {
            if (path.startsWith("/add")) {
                return await routes.add(url);
            }
            if (path.startsWith("/get")) {
                return await routes.get();
            }
            if (path.startsWith("/scrape")) {
                return await routes.scrape();
            }
            if (path.startsWith("/clear")) {
                return await routes.clear();
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