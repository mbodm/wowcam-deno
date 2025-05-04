import * as dbconfigs from "./db/configs.ts";
import * as logic from "./core/logic.ts";
import * as server from "./api/server.ts";
import * as helper from "./core/helper.ts";

if (import.meta.main) {
  const defaultConfigName = "default-9ccb0654-508d-4882-9983-4a7dd35e2243";
  dbconfigs.createOrUpdate(defaultConfigName, ["tomtom"]); // To have something in DB
  helper.log(`Created '${defaultConfigName}' config.`);
  Deno.cron("CronJob1", "*/1 * * * *", async () => {
    if (Deno.env.get("STOP") === "1") {
      return;
    }
    await logic.refreshScrapes();
  });
  server.serve();
  helper.log("Started Deno API server.");
}