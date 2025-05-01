import { addOrUpdateConfig, getAllScrapes } from "./data.ts";
import { update } from "./logic.ts";
//import { update } from "./logic.ts";
import { serve } from "./server.ts";

if (import.meta.main) {
  addOrUpdateConfig("9ccb0654-508d-4882-9983-4a7dd35e2243", ["tomtom"]); // To have something in DB
  Deno.cron("CronJob1", "*/1 * * * *", async () => {
    if (Deno.env.get("STOP") === "1") {
      return;
    }
  });
  serve();
}