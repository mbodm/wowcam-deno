import * as logger from "./logger.ts";

if (import.meta.main) {
  Deno.serve(async (request: Request) => {
    const pathname = new URL(request.url).pathname;
    const method = request.method;
    if (method == "GET" && pathname === "/") {
      return new Response('hello', { headers: { "content-type": "text/html; charset=UTF-8" } });
    }
    if (method == "GET" && pathname.startsWith("/run")) {
      logger.log("/run reached");
      const url = new URL(request.url);
      const addon = url.searchParams.get('addon') ?? '';
      if (addon) {
        logger.log(`has target addon -> ${addon}`);
      }
      else {
        logger.log(`has no target addon -> scraping all addons`);
      }
      const result = await run(addon ?? '');
      const json = JSON.stringify({ downloadUrl: result });
      return new Response(json, { headers: { "content-type": "application/json; charset=UTF-8" } });
    }
    return new Response(null, { status: 404 });
  });
}

async function run(addon: string): Promise<string | undefined> {
  if (!addon) {
    return 'unknown';
  }
  try {
    const url = `https://wowcam.mbodm.com/scrape?addon=${addon}`
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const obj = await response.json();
    return obj.result.downloadUrl;
  } catch (e: unknown) {
    if (e instanceof Error) {
      console.error(e.message);
    }
  }
}