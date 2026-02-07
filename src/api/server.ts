import * as response from "./response.ts";
import * as routes from "./routes.ts";
import { isNonEmptyString } from "../common/guards.ts";

export function start() {
    Deno.serve(async (request: Request) => {
        // Everything is handled via HTTP GET requests to keep some easy in-browser testing (in contrast to some real/correct REST API design)
        const method = request.method;
        if (method !== "GET") {
            return response.errorMethodNotAllowed();
        }
        const url = new URL(request.url);
        const path = url.pathname.trim();
        if (path === "/") {
            // Deno not sends any content type by default (in contrast to Node)
            return response.hello();
        }
        const tokenErrorResponse = getTokenErrorResponse(url);
        if (tokenErrorResponse) {
            return tokenErrorResponse;
        }
        try {
            switch (path) {
                case "/":
                    return routes.root();
                case "/resolve":
                    return await routes.resolve(url);
                case "/clear":
                    return await routes.clear();
                default:
                    return response.notFound();
            }
        }
        catch (err: unknown) {
            console.log(err);
            const msg = err instanceof Error ? err.message : "An internal server error occurred (check logs for details).";
            return response.error(msg, 500);
        }
    });
}

function getTokenErrorResponse(url: URL): Response | null {
    // This should (of course) not replace any real security (it shall just act as some small script-kiddies barrier)
    // Query param (to keep easy in-browser testing) seems OK (since there is no correct REST API design here anyway)
    // Using such insecure solution seems better than nothing (since there is no sensible data to secure here anyway)
    const tokenParam = url.searchParams.get("token");
    if (!isNonEmptyString(tokenParam)) {
        return response.errorMissingToken();
    }
    const token = tokenParam.trim().toLowerCase();
    const validToken = Deno.env.get("WOWCAM_TOKEN");
    if (!validToken) {
        console.error("Could not found WOWCAM_TOKEN in env settings.");
        return response.error("Internal server error occurred (please check logs).", 500);
    }
    if (token !== validToken) {
        return response.errorInvalidToken();
    }
    return null;
}