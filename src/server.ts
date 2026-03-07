import * as response from "./response.ts";
import * as routes from "./routes.ts";
import { RouteError } from "./routes.ts";

export function start() {
    Deno.serve(async (request: Request) => {
        // Everything is handled via HTTP GET requests to keep some easy in-browser testing (in contrast to some real/correct REST API design)
        if (request.method !== "GET") {
            return response.error("HTTP method not allowed", 405);
        }
        const url = new URL(request.url);
        try {
            switch (url.pathname) {
                case "/":
                    // Deno not sends any content type by default (in contrast to Node)
                    return new Response("hello", { status: 200, headers: { "content-type": "text/plain; charset=utf-8" } });
                case "/get":
                    return await routes.get(url);
                case "/scrape":
                    return await routes.scrape(url);
                case "/refresh":
                    return routes.refresh(url);
                case "/show":
                    return await routes.show(url);
                case "/clear":
                    return await routes.clear(url);
                default:
                    return new Response(null, { status: 404 });
            }
        }
        catch (err: unknown) {
            console.error(err);
            if (err instanceof RouteError) {
                if (err.cause) {
                    console.error(err.cause);
                }
                return response.error(err.message, err.status);
            }
            return response.error("An internal server error occurred (check logs for details)", 500);
        }
    });
}