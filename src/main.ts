import { resolve } from "./logic.ts";
import * as server from "./server.ts";

if (import.meta.main) {
  await addDefaultAddon();
  server.start();
  console.log("Started Deno API server.");
}

async function addDefaultAddon() {
  const addon = "raiderio";
  await resolve(addon);
  console.log(`Scraped and added default addon ("${addon}") to storage.`);
}