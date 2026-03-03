# In-Process API

Backend API for a blockchain-based creative platform managing digital moments (NFTs), collections, and artist profiles.

**Note:** This is an API-only codebase. No client-side code (React hooks, browser APIs, `fetch('/api/...')` calls).

## Tech Stack

- **Framework:** Next.js 16 (App Router, API-only)
- **Language:** TypeScript
- **Database:** Supabase (PostgreSQL)
- **Blockchain:** Viem, Zora Protocol, Base chain
- **Auth:** Privy (tokens), API keys
- **Payments:** Coinbase CDP SDK, 0xSplits
- **Media:** Mux (video), Arweave (decentralized storage)
- **Validation:** Zod v4
- **Package Manager:** pnpm

## Commands

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm format       # Format with Prettier
pnpm format:check # Check formatting
```

## Project Structure

```
src/
├── app/api/           # API route handlers
│   ├── artists/       # Artist profile endpoints
│   ├── collections/   # NFT collection management
│   ├── moment/        # Moment (NFT) endpoints
│   ├── smartwallet/   # Wallet operations
│   ├── payments/      # Payment processing
│   └── ...
├── lib/               # Utilities and services
│   ├── supabase/      # Database operations by table
│   ├── protocolSdk/   # Zora Protocol wrapper
│   ├── privy/         # Auth utilities
│   ├── mux/           # Video processing
│   ├── arweave/       # Decentralized storage
│   └── ...
├── types/             # TypeScript definitions
├── authMiddleware.ts  # Auth middleware
└── errors.ts          # Error definitions
```

## Key Patterns

### Authentication

Two methods supported via `authMiddleware`:

1. **Bearer token** - `Authorization: Bearer <token>` (Privy auth)
2. **API key** - `x-api-key: <key>` header

Both return an `artistAddress` for the authenticated user.

### API Routes

- All routes use `export const dynamic = 'force-dynamic'`
- Zod v4 schemas for input validation (use `.superRefine()` for custom validation)
- Standard error responses with status codes

#### Code Organization (SRP)

Follow the Single Responsibility Principle:

- **One function per file** - Each utility function should be in its own file with a default export
- **Thin route files** - Route handlers should only call validators and handlers
- Separate validation and business logic into `@/lib/<domain>/` files

#### Schema Organization

- **All Zod schemas live in `@/lib/schema/`** — never define schemas inline in route files or handler files
- Use `addressSchema` (`@/lib/schema/addressSchema.ts`) for Ethereum address fields — it validates the hex format and normalizes to lowercase via `getAddress`
- Use the shared `validate()` helper (`@/lib/schema/validate.ts`) for body validation; use `.safeParse()` directly for query param validation in routes
- **Avoid double-validation**: validate at the route layer (raw strings → typed values), then pass typed values to handlers without re-validating

#### Error Propagation

- Always destructure `{ data, error }` from Supabase calls — never ignore `error`
- If `error` is truthy, throw or return a 500 immediately so DB failures are not silently treated as empty results
- Return 400 for missing/invalid params, 403 for authorization failures, 500 for unexpected errors

#### Authorization

- For endpoints that expose private data (e.g. emails), guard with: caller is admin (`ADMIN_ADDRESSES.includes(callerAddress.toLowerCase())`) OR caller is the subject (`callerAddress.toLowerCase() === artistAddress.toLowerCase()`)
- Normalize addresses to lowercase before all comparisons

#### Route Handler Pattern

Each route method follows a strict three-layer split:

1. **`@/lib/<domain>/validate<Action><Type>.ts`** — takes `NextRequest`, runs auth + schema validation, returns validated data or `NextResponse`
2. **`@/lib/<domain>/<action>Handler.ts`** — takes typed validated inputs, contains all business logic
3. **`@/app/api/<route>/route.ts`** — thin, only calls validate → handler → catch

```typescript
// @/lib/emails/validateEmailsQuery.ts - Validation helper
const validateEmailsQuery = async (req: NextRequest) => {
  const authResult = await authMiddleware(req);
  if (authResult instanceof Response) return authResult as NextResponse;
  const result = validate(emailQuerySchema, Object.fromEntries(req.nextUrl.searchParams.entries()));
  if (!result.success) return result.response;
  return { callerAddress: authResult.artistAddress, ...result.data };
};

// @/lib/emails/getEmailsHandler.ts - Business logic handler
const getEmailsHandler = async (callerAddress: string, ...) => {
  // ... business logic
  return NextResponse.json({ ... });
};

// @/app/api/emails/route.ts - Thin route file
export async function GET(req: NextRequest) {
  try {
    const validated = await validateEmailsQuery(req);
    if (validated instanceof NextResponse) return validated;
    const { callerAddress, artist_address, cursor, limit } = validated;
    return getEmailsHandler(callerAddress, artist_address, cursor, limit);
  } catch (e: any) {
    return Response.json({ message: e?.message ?? 'Failed' }, { status: 500 });
  }
}
```

- For **body validation** (POST/DELETE), use the shared `validate()` helper from `@/lib/schema/validate.ts`
- For **query param validation** (GET), use `.safeParse()` directly (params are always strings, may need coercion)
- Auth middleware (`authMiddleware`) belongs in the validator, not the handler or route

### Telnyx Types

Use `InboundMessagePayload` from `telnyx/resources/shared`:

```typescript
import type { InboundMessagePayload } from 'telnyx/resources/shared';
type Media = NonNullable<InboundMessagePayload['media']>[number];
```

### Database

Supabase tables prefixed with `in_process_`:

- `artists`, `moments`, `collections`
- `payments`, `sales`, `notifications`
- `comments`, `api_keys`, `phone_numbers`

#### lib/supabase Functions

Functions in `@/lib/supabase/` are **pure Supabase operations only** — no formatting, transformation, or business logic. They execute a query and return the raw Supabase result (`{ data, error }`). All data shaping belongs in the caller.

```typescript
// CORRECT - pure query, return raw result
const getArtistAddresses = async (socialWallets: string[]) => {
  return supabase
    .from('in_process_artist_social_wallets')
    .select('social_wallet, artist_address, in_process_artists(username)')
    .in('social_wallet', socialWallets);
};

// WRONG - formatting/mapping inside a supabase function
const getArtistAddresses = async (socialWallets: string[]) => {
  const { data } = await supabase...;
  const map: Record<string, string> = {};
  for (const row of data ?? []) map[row.social_wallet] = row.artist_address; // ← not here
  return map;
};
```

#### Supabase Egress Optimization

- **Select only needed fields** - Use `.select('field1, field2')` instead of `.select('*')` to reduce data transfer
- **Limit entries** - Use `.limit()`, `.range()`, or pagination to avoid fetching unnecessary rows
- **Optimize client code** - Reduce the number of queries by batching or caching where possible
- **Minimal returns on mutations** - For `.insert()` and `.update()`, omit `.select()` if the returned row data is not needed
- **Exclude unneeded tables from backups** - When running manual backups through Supavisor, remove unneeded tables and reduce backup frequency

### Blockchain

- **Mainnet:** Base (chain ID 8453)
- **Testnet:** Base Sepolia (chain ID 84532)
- Toggle via `IS_TESTNET` env var

## Path Aliases

- `@/*` → `./src/*`
