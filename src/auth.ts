import { isNonEmptyString } from "./common.ts";
import * as response from "./response.ts";

export type RouteFunc = (url: URL) => Response | Promise<Response>;

export function authCheck(routeFunc: RouteFunc): RouteFunc {
    return (url: URL) => getAuthErrorResponse(url) ?? routeFunc(url);
}

function getAuthErrorResponse(url: URL): Response | undefined {
    // This should (of course) not replace any real security (it shall just act as some small script-kiddies barrier)
    // Query param (to keep easy in-browser testing) seems OK (since there is no correct REST API design here anyway)
    // Using such insecure solution seems better than nothing (since there is no sensible data to secure here anyway)
    const tokenParam = url.searchParams.get("token");
    if (!isNonEmptyString(tokenParam)) {
        return response.errorMissingToken();
    }
    const storedSecret = Deno.env.get("WOWCAM_TOKEN");
    if (!isNonEmptyString(storedSecret)) {
        throw new Error("Could not found WOWCAM_TOKEN in environment settings.");
    }
    const token = tokenParam.trim();
    const secret = storedSecret.trim();
    if (token !== secret) {
        return response.errorInvalidToken();
    }
    return undefined;
}