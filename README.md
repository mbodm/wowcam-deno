# wowcam-cache

WOWCAM backend service to scrape addon data

### What?

- It's a simple web service (written in TS)
- It's the web backend front face for WOWCAM
- It calls the wowcam-scraper API every 1h and cache the results
- It's a small Deno project:
  - Offering a few HTTP GET endpoints
  - Using promises (via `async/await` statements)
  - Using Deno KV for data storage
  - Not using any external packages or dependencies
  - All logging is done via `console.log()` and `console.error()`
  - See `src` folder and `deno.json` for details
- Deno Deploy is used for production hosting:
  - Every push to `main` branch automatically deploys to staging
  - I manually deploy staging to live via Deno Deploy web UI
  - I inspect all above mentioned logging in Deno Deploy web UI
- Project runs locally via `deno task dev` script (see `deno.json`)

### Why?

To have some backend API, which handles, scrapes, and caches addon download URLs,
which are used by my WOWCAM application (now only acting as simple desktop client).

### How?

- By using on-premise hosting on my [netcup](https://www.netcup.com) server
- By developing everything directly on that machine (remote)
- By using _VS Code_ with active _Remote SSH_ extension
- By using a DNS A-Record for the subdomain
- By deploying everything to Deno Deploy (see above)

### Vibe coding?

- Initially i built this project manually as a 25+ years experienced senior developer
- Today it's developed and maintained with AI assistance (primarily Claude)
- AI agents can use the [AGENTS.md](AGENTS.md) file for repository-specific guidance
- No changes are released before I personally review them in detail

### Production caveats?

- This service depends on FlareSolverr and the target site's page behavior
- Any upstream changes will require corresponding adjustments in this service (by design)
- The scraper is intentionally lightweight and may need quick updates when target markup changes
- Error responses may include brief internal diagnostics for devs (but never tokens or stack traces)
- Service availability depends on all three containers (`node` / `flaresolverr` / `caddy`) being healthy
- But all of this is "by design" and intentional

#### Have fun.

