import * as browser from "./browser.ts";
import * as logic from "./logic.ts";
import * as bql from "./bql.ts";
import * as logger from "./logger.ts";

if (import.meta.main) {
  Deno.serve(async (request: Request) => {
    const pathname = new URL(request.url).pathname;
    const method = request.method;
    if (method == "GET" && pathname === "/") {
      return new Response(`
      <body align="center" style="font-family: Avenir, Helvetica, Arial, sans-serif; font-size: 1.5rem;">
      <h1>Available endpoints:</h1>
      <p><a href="/html">/html</a> -> Say hello</p>
      <p><a href="/deinit">/deinit</a> -> De-Initialize logic</p>
      <p><a href="/run">/run</a> -> Run logic</p>
      <p><a href="/bql">/bql</a> -> Run BQL</p>
      </body>`,
        {
          headers: {
            "content-type": "text/html; charset=UTF-8",
          },
        },
      );
    }
    if (method == "GET" && pathname.startsWith("/html")) {
      const html = `<html><p>Hello from Deno!</p></html>`;
      return new Response(html, {
        headers: { "content-type": "text/html; charset=UTF-8" },
      });
    }
    if (method == "GET" && pathname.startsWith("/deinit")) {
      const success = await browser.deinit();
      const json = JSON.stringify({ success });
      return new Response(json, {
        headers: {
          "content-type": "application/json; charset=UTF-8",
        },
      });
    }
    if (method == "GET" && pathname.startsWith("/run")) {
      logger.log("main -> received request - starting logic now");
      const url = new URL(request.url);
      const target = url.searchParams.get('target') ?? undefined;
      if (target) {
        logger.log(`has target addon -> ${target}`, true);
      }
      else {
        logger.log(`has no target addon -> scraping all addons`, true);
      }
      const result = await logic.run(target);
      logger.log("main -> logic ended - returning response now");
      const json = JSON.stringify(result);
      return new Response(json, {
        headers: {
          "content-type": "application/json; charset=UTF-8",
        },
      });
    }
    if (method == "GET" && pathname.startsWith("/bql")) {
      logger.log("main -> received request - starting BQL logic now");
      const finals = await bql.run();
      const json = JSON.stringify(finals);
      logger.log("main -> BQL logic ended - returning response now");
      return new Response(json, {
        headers: {
          "content-type": "application/json; charset=UTF-8",
        },
      });
    }
    return new Response(null, { status: 404 });
  });
}