import * as logic from "./core/scrape.ts";
import * as server from "./api/server.ts";
import * as helper from "./core/helper.ts";
import * as db from "./db/addons.ts";

if (import.meta.main) {
  await addDefaultAddon();
  Deno.cron("CronJob1", "*/30 * * * *", async () => {
    if (Deno.env.get("STOP") === "1") {
      return;
    }
    await logic.scrapeAll();
  });
  server.start();
  helper.log("Started Deno API server.");
}

async function addDefaultAddon() {
  const addonSlug = "raiderio";
  await db.create(addonSlug);
  helper.log(`Added default addon ('${addonSlug}').`);
}