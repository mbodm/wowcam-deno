# wowcam-cache

WOWCAM backend service to provide addon data

### What?

- It's a simple web service (written in TS)
- It's the web backend front face for WOWCAM desktop client
- It calls the wowcam-scraper API every 1h and cache the results
- It's a small Deno project
  - offering a few HTTP GET endpoints
  - using promises (via `async/await` statements)
  - using Deno KV for data storage
  - not using any external packages or dependencies
  - doing all logging via `console.log()` and `console.error()`
  - See `CLAUDE.md` file, `src` folder and `deno.json` for details
- Deno Deploy is used for production hosting:
  - Every push to `main` branch automatically deploys to staging
  - I manually deploy staging to live via Deno Deploy web UI
  - I inspect all above mentioned logging in Deno Deploy web UI
- Project runs locally via `deno task dev` script (see `deno.json`)

### Why?

To have some backend API, that handles, scrapes, and caches addon download URLs,  
which are used by my WOWCAM application (now only acting as simple desktop client).

### How?

- By developing everything directly on my Linux VPS server (remote)
- By using VS Code with active _Remote SSH_ extension on my Mac
- By doing CI/CD with GitHub and Deno Deploy
- By hosting and deploying with Deno Deploy (see above)

### Vibe coding?

- Initially i built this project manually as a 25+ years experienced senior developer
- Today it's developed and maintained with AI assistance (primarily Claude)
- Claude Code can use the [CLAUDE.md](CLAUDE.md) file for repository-specific guidance
- No changes are released before i personally review them in detail

#### Have fun.

