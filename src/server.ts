import * as response from "./response.ts";
import * as routes from "./routes.ts";

export function start() {
    Deno.serve(async (request: Request) => {
        // Everything is handled via HTTP GET requests to keep some easy in-browser testing (in contrast to some real/correct REST API design)
        const method = request.method;
        if (method !== "GET") {
            return response.errorMethodNotAllowed();
        }
        const url = new URL(request.url);
        const path = url.pathname;
        try {
            switch (path) {
                case "/":
                    return routes.root(url);
                case "/fetch":
                    return await routes.fetch(url);
                case "/scrape":
                    return await routes.scrape(url);
                case "/refresh":
                    return routes.refresh(url);
                case "/show":
                    return await routes.show(url);
                case "/clear":
                    return await routes.clear(url);
                default:
                    return response.notFound();
            }
        }
        catch (err: unknown) {
            const msg = "An internal server error occurred (check logs for details).";
            if (err instanceof Error) {
                if (!err.name.endsWith("ModuleInputValidationError")) {
                    return response.error(err.message, 500);
                }
                console.error(err.message);
            }
            return response.error(msg, 500);
        }
    });
}