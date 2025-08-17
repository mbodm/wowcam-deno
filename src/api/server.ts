import * as response from "./response.ts";
import * as params from "./params.ts";
import * as routes from "./routes.ts";
import * as helper from "../common/helper.ts";

export function start() {
    Deno.serve(async (request: Request) => {
        // Everything is handled via HTTP GET requests to keep some easy in-browser testing (in contrast to some real/correct REST API design)
        const method = request.method;
        if (method !== "GET") {
            return response.errorMethodNotAllowed();
        }
        const url = new URL(request.url);
        const path = url.pathname;
        if (path === "/") {
            return new Response("hello", { headers: { "content-type": "text/html; charset=UTF-8" } });
        }
        // This should (of course) not replace any real security (it shall just act as some small script-kiddies barrier)
        // Query param (to keep easy in-browser testing) seems OK (since there is no correct REST API design here anyway)
        // Using such insecure solution seems better than nothing (since there is no sensible data to secure here anyway)
        const token = params.getToken(url);
        if (!token) {
            return response.errorMissingToken();
        }
        if (token.toLowerCase() !== "d19f023f-bfe0-437a-9daf-7ef28386ebe2") {
            return response.errorInvalidToken();
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
                return response.error("Internal server exception occurred (see log for details).", 500);
            }
            return response.error("Internal server exception occurred.", 500);
        }
        return new Response(null, { status: 404 });
    });
}