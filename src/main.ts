import * as dbconfigs from "./db/configs.ts";
import * as logic from "./core/logic.ts";
import * as server from "./api/server.ts";
import * as helper from "./core/helper.ts";

if (import.meta.main) {
  await addDefaultConfig();
  Deno.cron("CronJob1", "*/30 * * * *", async () => {
    if (Deno.env.get("STOP") === "1") {
      return;
    }
    await logic.refreshScrapes();
  });
  server.serve();
  helper.log("Started Deno API server.");
}

async function addDefaultConfig() {
  const defaultConfigName = "default-9ccb0654-508d-4882-9983-4a7dd35e2243";
  const addons = ["tomtom"];
  dbconfigs.createOrUpdate(defaultConfigName, addons); // To have something in DB
  await logic.addToScrapesIfNotExisting(addons);
  helper.log(`Added '${defaultConfigName}' config.`);
}