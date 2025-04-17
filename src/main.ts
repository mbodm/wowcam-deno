import { serve } from "./server.ts";
import { update } from "./logic.ts";

if (import.meta.main) {
  Deno.cron("Scrape Curse", "*/30 * * * *", async () => {
    console.log("Starting update job");
    await update();
  });
  serve();
}