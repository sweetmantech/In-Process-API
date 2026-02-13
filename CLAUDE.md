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

#### Route Handler Pattern

```typescript
// @/lib/messages/validateMessageIdBody.ts - Validation helper
export const validateMessageIdBody = async (request: NextRequest) => {
  const body = await request.json();
  const validationResult = validate(messageIdSchema, body);
  if (!validationResult.success) {
    return validationResult.response;
  }
  return validationResult.data;
};

// @/lib/messages/indexMomentHandler.ts - Business logic handler
const indexMomentHandler = async (messageId: string) => {
  // ... business logic
  return NextResponse.json({ success: true, data });
};

// @/app/api/message/index-moment/route.ts - Thin route file
export async function POST(req: NextRequest) {
  try {
    const validated = await validateMessageIdBody(req);
    if (validated instanceof NextResponse) {
      return validated;
    }
    const { messageId } = validated;
    return indexMomentHandler(messageId);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}
```

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

#### Supabase Egress Optimization

- **Select only needed fields** - Use `.select('field1, field2')` instead of `.select('*')` to reduce data transfer
- **Limit entries** - Use `.limit()`, `.range()`, or pagination to avoid fetching unnecessary rows
- **Optimize client code** - Reduce the number of queries by batching or caching where possible
- **Minimal returns on mutations** - For `.insert()` and `.update()`, omit `.select()` if the returned row data is not needed
- **Exclude unneeded tables from backups** - When running manual backups through Supavisor, remove unneeded tables and reduce backup frequency

### Blockchain

- **Mainnet:** Base (chain ID 8453)
- **Testnet:** Base Sepolia (chain ID 84532)
- Toggle via `NEXT_PUBLIC_IS_TESTNET` env var

## Path Aliases

- `@/*` → `./src/*`
