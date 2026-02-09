import * as server from "./server.ts";

if (import.meta.main) {
  server.start();
  console.log("Started Deno server.");
}