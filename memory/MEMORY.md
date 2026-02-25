# In-Process API — Project Memory

## Wayfinder Integration (2026-02-26)

All Arweave **reads** go through `@ar.io/wayfinder-core` for dynamic gateway selection.

### Key files

- `src/lib/arweave/wayfinderClient.ts` — singleton `createWayfinderClient` with `HashVerificationStrategy` (trusts arweave.net). Exports `getArweaveGateway(): Promise<URL>` for gateway selection.
- `src/lib/arweave/readFromArweave.ts` — `wayfinderClient.request('ar://txId')` for direct data reads with full routing + verification pipeline.
- `src/lib/protocolSdk/ipfs/gateway.ts` — `getFetchableUrl` is **async**. `ar://` URLs resolve via `getArweaveGateway()`, IPFS via static gateway, HTTPS pass-through.
- `src/app/api/arweave/[...path]/route.ts` — proxy uses `getArweaveGateway()` + raw fetch for arbitrary API paths (no verification needed).

### Pattern

- `getFetchableUrl(uri)` must always be `await`-ed — it is async.
- Tests that use `ar://` URLs must mock `@/lib/arweave/wayfinderClient` with `getArweaveGateway: vi.fn().mockResolvedValue(new URL('https://ar-io.net'))`.
- Tests that mock `getFetchableUrl` must use `mockResolvedValue` (not `mockReturnValue`).

### Wayfinder defaults

- Gateway provider: `TrustedPeersGatewaysProvider` → `permagate.io/ar-io/peers` (691+ gateways), cached 300s in-memory.
- Routing: `RandomRoutingStrategy` — no per-request pinging overhead.
- Verification: `HashVerificationStrategy` (SHA-256 vs arweave.net) — only on `wayfinderClient.request()` calls.
- Logger: warn/error only (debug/info suppressed to avoid noise).

## Arweave Uploads (unchanged)

- `src/lib/arweave/uploadToArweave.ts` — uses `arweave` npm package, posts directly to `arweave.net`.
