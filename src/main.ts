import { start } from "./server.ts";

if (import.meta.main) {
  start();
  console.log("Deno server started");
}