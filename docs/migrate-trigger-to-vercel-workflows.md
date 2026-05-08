# Migration Plan: In-Process-Tasks → In-Process-API (Vercel Workflows)

## Background

The `In-Process-Tasks` repo is a standalone Trigger.dev project that runs one background job:
`migrate-mux-to-arweave` — downloads a video from MUX, transcodes if needed, uploads to Arweave,
updates on-chain metadata, then deletes the MUX asset.

The API triggers it via `src/lib/trigger.dev/triggerMuxMigration.ts` → `tasks.trigger(...)` → Trigger.dev cloud.

Goal: eliminate the separate repo and Trigger.dev dependency by running the same job as a
**Vercel Workflow** inside the API.

---

## Architecture

### Before
```
API → tasks.trigger('migrate-mux-to-arweave') → Trigger.dev Cloud → In-Process-Tasks
```

### After
```
API → start(migrateMuxToArweaveWorkflow) → Vercel Workflows (within API)
```

---

## Vercel Workflows SDK

- Package: `workflow` (npm)
- Docs: https://workflow-sdk.dev / https://vercel.com/docs/workflows
- Key directives: `'use workflow'` (durable orchestrator), `'use step'` (isolated retryable unit)
- Sleep: `import { sleep } from 'workflow'` — suspends with zero compute cost
- Trigger from API route: `import { start } from 'workflow/api'`
- Fatal (no-retry) error: `import { FatalError } from 'workflow'`
- Config: wrap `next.config.ts` with `withWorkflow()` from `workflow/next`

---

## Phase 1: Install & Configure

```bash
pnpm add workflow
pnpm add fluent-ffmpeg ffmpeg-static
pnpm add -D @types/fluent-ffmpeg
```

`next.config.ts`:
```typescript
import { withWorkflow } from 'workflow/next';
export default withWorkflow(nextConfig);
```

**Binary size:** `ffmpeg-static` bundles a single 77MB static ffmpeg binary (linux-x64).
This is well under Vercel's 250MB per-function limit. ✅

**Note on ffprobe:** `ffmpeg-static` does not include a separate `ffprobe` binary.
In `probeVideo.ts`, use `ffmpeg -i <file>` and parse stderr output to detect codec —
do not add `@ffprobe-installer/ffprobe` (76MB). See Phase 2 notes below.

**pnpm build scripts:** add `ffmpeg-static` to `pnpm.onlyBuiltDependencies` in `package.json`,
then run `pnpm rebuild ffmpeg-static` to download the binary.

---

## Phase 2: Port Utility Files

### Files to add to API (currently only in In-Process-Tasks)

| Source (Tasks) | Target (API) | Notes |
|---|---|---|
| `src/video/probeVideo.ts` | `src/lib/video/probeVideo.ts` | Add `ffmpeg.setFfmpegPath` + `ffmpeg.setFfprobePath` via `@ffmpeg-installer` |
| `src/video/transcodeToH264.ts` | `src/lib/video/transcodeToH264.ts` | Same ffmpeg path setup |
| `src/video/transcodeIfH265.ts` | `src/lib/video/transcodeIfH265.ts` | Replace `logger` → `console.log` |
| `src/mux/downloadVideo.ts` | `src/lib/mux/downloadVideo.ts` | Replace `retry.fetch` → native fetch inside a step |
| `src/mux/findMuxAssetIdFromPlaybackUrl.ts` | `src/lib/mux/findMuxAssetIdFromPlaybackUrl.ts` | Replace `logger` → `console.log` |
| `src/viem/getUri.ts` | `src/lib/viem/getUri.ts` | Pure port, no Trigger.dev deps |
| `src/moment/updateMomentMetadata.ts` | `src/lib/moment/updateMomentMetadata.ts` | Replace `logger` → `console.log` |

### Files already in API (verify they match Tasks versions)

| API file | Notes |
|---|---|
| `src/lib/arweave/uploadToArweave.ts` | Tasks version has `retry.onThrow` — API version is missing retry logic. Restore it. |
| `src/lib/arweave/uploadJson.ts` | Matches |
| `src/lib/arweave/logArweaveUpload.ts` | API version uses `next/server`'s `after()` — fine to keep |
| `src/lib/arweave/turboClient.ts` | Matches |
| `src/lib/arweave/patchFetch.ts` | Matches |
| `src/lib/coinbase/getOrCreateSmartWallet.ts` | Matches |
| `src/lib/coinbase/sendUserOperation.ts` | Matches |
| `src/lib/viem/getUpdateTokenURICall.ts` | Matches |
| `src/lib/mux/deleteAsset.ts` | Equivalent of Tasks' `deleteMuxAsset.ts` |

### Trigger.dev primitive replacements

| Trigger.dev | Replacement |
|---|---|
| `logger.log/error/warn` | `console.log/error/warn` |
| `retry.onThrow(fn, opts)` | `'use step'` function — auto-retries on any thrown error |
| `retry.fetch(url, opts)` | Native `fetch` inside a `'use step'` function |
| `wait.for({ minutes: 10 })` | `await sleep('10 minutes')` |
| `schemaTask({ id, schema, run })` | Workflow function + step functions + API route |
| `FatalError` (no-retry) | `throw new FatalError(...)` from `workflow` |

---

## Phase 3: Create the Workflow

New file: `src/workflows/migrateMuxToArweave.ts`

```typescript
import { sleep, FatalError } from 'workflow';
import { Address } from 'viem';
// ... import step functions

export async function migrateMuxToArweaveWorkflow(payload: {
  collectionAddress: string;
  tokenId: string;
  chainId: number;
  artistAddress: string;
}) {
  'use workflow';

  const tokenUri       = await getTokenUriStep(payload);
  const metadata       = await fetchMetadataStep(tokenUri);

  if (!metadata.content?.uri?.includes('mux.com'))
    throw new FatalError('Not a MUX token — skip retry');

  const videoFile      = await downloadVideoStep(metadata.content.uri);
  const transcodedFile = await transcodeStep(videoFile);
  const uploadResult   = await uploadToArweaveStep(transcodedFile, payload.artistAddress);
  const metadataUri    = await uploadMetadataStep({ metadata, uploadResult });

  await sleep('10 minutes'); // Arweave block propagation — zero compute cost

  const txHash = await updateOnChainStep({ ...payload, metadataUri, metadata });

  if (metadata.animation_url?.includes('stream.mux.com'))
    await deleteMuxAssetStep(metadata.animation_url);

  return {
    success: true,
    arweaveUri: uploadResult.arweave_uri,
    metadataUri,
    transactionHash: txHash,
  };
}
```

Each step function lives in its own file under `src/lib/` and is decorated with `'use step'`.

### Step payload size warning

Vercel Workflows supports 50MB per step payload. Video files can be 80MB+.
Steps that produce large binary data should write to a **temp file path** and pass only
the path string between steps — not the `File`/`Buffer` object itself.
This is already the pattern in Tasks' `downloadVideo.ts` (streams to disk).

---

## Phase 4: Update the Trigger Wrapper

`triggerMuxMigration` is called from **4 places** in the API:

- `src/lib/moment/createMoment.ts`
- `src/lib/moment/createMoments.ts`
- `src/lib/moment/updateMomentURI.ts`
- `src/lib/collection/updateCollectionURI.ts`

Do not touch those callers. Instead, replace the body of
`src/lib/trigger.dev/triggerMuxMigration.ts`:

```typescript
// Before
import { tasks } from '@trigger.dev/sdk';
await tasks.trigger('migrate-mux-to-arweave', payload);

// After
import { start } from 'workflow/api';
import { migrateMuxToArweaveWorkflow } from '@/workflows/migrateMuxToArweave';
await start(migrateMuxToArweaveWorkflow, [payload]);
```

Same external interface, all 4 callers unchanged.

---

## Phase 5: Add a Direct API Endpoint (Optional)

New route: `src/app/api/moment/migrate/route.ts`

Purpose: allow manual triggering of migrations via HTTP (admin use / bulk backfill).
Follows the standard validate → handler → catch pattern.
Schema: reuse or adapt `migrateMuxSchema` from Tasks' `src/schemas/migrateMuxSchema.ts`.

---

## Phase 6: Cleanup

1. Update 4 test files that mock `@trigger.dev/sdk`'s `tasks`:
   - `src/lib/trigger.dev/__tests__/triggerMuxMigration.test.ts`
   - `src/lib/moment/__tests__/createMoment.test.ts`
   - `src/lib/moment/__tests__/updateMomentURI.test.ts`
   - `src/lib/collection/__tests__/updateCollectionURI.test.ts`
   
   Mock `start` from `workflow/api` instead of `tasks.trigger`.

2. Remove `@trigger.dev/sdk` from `package.json` (verify no other usages first).

3. Delete or rename `src/lib/trigger.dev/` → `src/lib/workflow/`.

4. Remove `TRIGGER_SECRET_KEY` / `TRIGGER_PROJECT_ID` env vars from Vercel + `.env`.

5. Archive `In-Process-Tasks` repo once production is confirmed stable for 1+ week.

---

## Key Risks

| Risk | Impact | Mitigation |
|---|---|---|
| FFmpeg binaries (~50MB) push bundle over Vercel's 250MB limit | Build fails | Validate in Phase 1 before writing any other code |
| Step payload > 50MB for large videos | Runtime error | Pass temp file paths between steps, not File objects |
| Long transcode time hits Vercel Function timeout | Job killed mid-run | Verify Vercel Workflows max duration config; Fluid Compute should support it |
| `workflow` SDK is new/preview — unexpected gaps | Blocked mid-migration | Keep Trigger.dev wired in parallel until Vercel Workflow path is proven in prod |

---

## Execution Order

| Phase | Work | Estimated Time |
|---|---|---|
| 1 | Install deps, update next.config.ts, verify build | 1 hr |
| 2 | Port utility files, replace Trigger.dev primitives | 1 day |
| 3 | Write the workflow + step functions, test locally | 1 day |
| 4 | Swap triggerMuxMigration body, update tests | 2 hr |
| 5 | Add direct API endpoint | 1 hr |
| 6 | Cleanup, env var removal, archive Tasks repo | 1 hr |

**Total: ~3–4 days**

---

## Reference

- Vercel Workflows docs: https://vercel.com/docs/workflows
- Workflow SDK docs: https://workflow-sdk.dev
- In-Process-Tasks repo: `/home/misuka/Documents/GitHub/InProcess/In-Process-Tasks`
- Current trigger wrapper: `src/lib/trigger.dev/triggerMuxMigration.ts`
- Current task definition: `In-Process-Tasks/src/tasks/migrateMuxToArweaveTask.ts`
- Core migration logic: `In-Process-Tasks/src/moment/migrateMuxToArweave.ts`
