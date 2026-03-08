# wowcam-deno — Claude Context

## What this project is

A Deno/TypeScript HTTP API server deployed on **Deno Deploy** (serverless). It acts as a caching proxy for a WoW addon scraper API. Clients request addon download URLs; the server returns them from cache or scrapes them fresh.

No graceful shutdown handling needed — Deno Deploy lifecycle manages that.

## Module overview

```
src/main.ts      — entry point, calls server.start()
src/server.ts    — Deno.serve(), routing switch, error boundary
src/routes.ts    — one function per route, auth, param parsing
src/cache.ts     — cache logic (handleOne, refreshAll)
src/scraper.ts   — fetch call to upstream scraper API, type guards
src/storage.ts   — Deno KV wrapper (CRUD for addon entries)
src/response.ts  — JSON response helpers (success/error)
```

## Key architectural facts

- All routes require `?token=` query param auth (not header — allows browser testing)
- All responses are JSON except: `/` (plain text "hello"), 404/405 (null body)
- `cache-control: no-store` on all JSON responses
- Deno KV key structure: `["addon", addonSlug]` — max 255 entries (507 if exceeded)
- Timestamps: ISO 8601 UTC without seconds — `new Date().toISOString().slice(0, 16) + "Z"`
- `UpstreamError` propagates from scraper → caught in routes → re-thrown as `RouteError(502)`
- Background refresh is fire-and-forget: `refreshAll().catch((err) => console.error(err))`
- `refreshAll()` handles per-entry failures internally with try/catch — never throws to caller
- `/refresh` is called externally by a GitHub Action every 1 hour — this is the intended cache TTL mechanism; the info message "1h max age" in `routes.ts` is intentional and correct
- Deno automatically logs the full `.cause` chain via `console.error(err)` — no manual cause logging needed
- Type guards used for runtime JSON validation (Fetch API has no generic `.json<T>()`)

## No tests — by design

This project has no tests and that is intentional. It is a small, private project. Do not mention missing tests in reviews or suggest adding them.

## Coding philosophy

Code must follow **idiomatic, modern TypeScript as of 2026 or later**. When reviewing or suggesting changes, always consider what the current best practice is — not what was common in older TS/Node.js ecosystems.

## Coding rules (user preferences)

### Function declarations
- Arrow functions only for 1-liners. Multi-line functions must use `function` declarations.

### Error classes
- Always use ES2022 cause pattern: `super(message, { cause })` — never `this.cause = cause`.
- Always set `this.name = "ClassName"` in custom Error subclasses.

### Exports
- Only export what is actually used outside the module.
- Internal types and helpers stay unexported.

### Error handling
- No unnecessary try/catch. Trust internal code and framework guarantees.
- Only validate at system boundaries (user input, external APIs).
- Use `err instanceof SomeError` checks to re-throw with appropriate HTTP status codes in router module.

### Console logging
- Use `console.error` for errors and partial/full failures.
- Use `console.log` for informational messages.
- Never duplicate what Deno already logs automatically (full cause chain).

### TypeScript idioms
- `for await` over `Array.fromAsync` — consistent with side-effect iteration patterns.
- Intersection types to allow extra props: `ServerSuccessResult | ServerErrorResult` (not `object`).
- `payload?: Record<string, unknown>` preferred over generic `<T extends object>` when T is not used structurally.

## Review checklist (things to always verify)

1. **Modern, idiomatic TypeScript (2026 or later)** — flag anything that looks outdated or non-idiomatic
2. **Consistency** — style, naming, declaration style, and patterns must be consistent across and within modules
3. **Production ready** — end every review with a clear verdict on whether the module is production ready, and why if not
4. Arrow functions used only for 1-liners
5. ES2022 `super(message, { cause })` pattern in all Error subclasses
6. No unnecessary exports
7. All routes that call `callScraperApi()` (directly or via `handleOne()`) handle `UpstreamError` → `RouteError(502)`
8. No dead switch cases (e.g. status codes that can never reach `createPrettyStatus()`)
9. HTTP spec compliance: 405 must include `Allow` header; 404/405 use null body
10. English correctness in all names, comments, and error messages
