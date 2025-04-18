import { serve } from "./server.ts";
import { update } from "./logic.ts";

if (import.meta.main) {
  Deno.cron("Scrape Curse", "*/1 * * * *", async () => {
    await update();
    console.log("Finished scraper cron job.");
  });
  serve();
}