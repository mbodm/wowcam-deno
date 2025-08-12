import * as logic from "./core/logic.ts";
import * as server from "./api/server.ts";
import * as helper from "./core/helper.ts";
import * as storage from "./core/storage.ts";

if (import.meta.main) {
  await addDefaultAddon();
  Deno.cron("CronJob1", "*/30 * * * *", async () => {
    if (Deno.env.get("STOP") === "1") {
      return;
    }
    await logic.executeScrapeForAllEntries();
  });
  server.start();
  helper.log("Started Deno API server.");
}

async function addDefaultAddon() {
  const addonSlug = "raiderio";
  const entryExists = await storage.entryExists(addonSlug);
  if (!entryExists) {
    await storage.addEntry(addonSlug);
    helper.log(`Added default addon ('${addonSlug}').`);
  }
}