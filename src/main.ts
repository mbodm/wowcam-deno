import * as server from "./server.ts";
import * as storage from "./storage.ts";

if (import.meta.main) {
  await addDefaultAddon();
  server.start();
  console.log("Started Deno API server.");
}

async function addDefaultAddon() {
  const addonSlug = "raiderio";
  await storage.addOrUpdate(addonSlug, "", "");
  console.log(`Added default addon ('${addonSlug}') to storage.`);
}