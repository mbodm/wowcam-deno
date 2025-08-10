import * as scraper from "./core/scraper.ts";
import * as server from "./api/server.ts";
import * as helper from "./core/helper.ts";
import * as storage from "./core/storage.ts";

if (import.meta.main) {
  await addDefaultAddon();
  Deno.cron("CronJob1", "*/30 * * * *", async () => {
    if (Deno.env.get("STOP") === "1") {
      return;
    }
    await scraper.all();
  });
  server.start();
  helper.log("Started Deno API server.");
}

async function addDefaultAddon() {
  const addonSlug = "raiderio";
  await storage.create(addonSlug);
  helper.log(`Added default addon ('${addonSlug}').`);
}