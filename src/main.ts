import { addOrUpdateConfig } from "./data.ts";
//import { update } from "./logic.ts";
import { serve } from "./server.ts";

if (import.meta.main) {
  addOrUpdateConfig("9ccb0654-508d-4882-9983-4a7dd35e2243", ["tomtom"]); // To have something in DB
  //Deno.cron("CronJob1", "*/1 * * * *", () => update().then(() => console.log("CRON job finished and scrapes updated.")));
  const updateUrl = "https://mbodm-wowcam.deno.dev/scrapes/update?token=d19f023f-bfe0-437a-9daf-7ef28386ebe2";
  Deno.cron("CronJob1", "*/1 * * * *", () => fetch(updateUrl).then(() => console.log("CRON job finished and scrapes updated.")));
  serve();
}