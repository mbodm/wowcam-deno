import * as server from "./api/server.ts";
import * as helper from "./common/helper.ts";
import * as storage from "./common/storage.ts";

if (import.meta.main) {
  await addDefaultAddon();
  Deno.cron("CronJob1", "*/30 * * * *", async () => {
    if (Deno.env.get("STOP") === "1") {
      return;
    }
    const base = import.meta.url ?? "127.0.0.1";
    const url = new URL("/scrape", base);
    url.searchParams.append("token", "d19f023f-bfe0-437a-9daf-7ef28386ebe2");
    const response = await fetch(url);
    if (!response.ok) {
      helper.log(`Requesting '/scrape' in Deno CRON job failed (response status code was HTTP ${response.status}).`);
    }
  });
  server.start();
  helper.log("Started Deno API server.");
}

async function addDefaultAddon() {
  const addonSlug = "raiderio";
  const entryExists = await storage.entryExists(addonSlug);
  if (!entryExists) {
    await storage.addEntry(addonSlug);
    helper.log(`Added default addon ('${addonSlug}') to storage.`);
  }
}