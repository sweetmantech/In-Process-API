# In-Process API

A Next.js API-only project built with TypeScript.

## Getting Started

Install dependencies:

```bash
pnpm install
```

Run the development server:

```bash
pnpm dev
```

The API will be available at [http://localhost:3000](http://localhost:3000).

## API Routes

API routes are located in `src/app/api/`. Example route:

- `GET /api/hello` - Returns a hello message

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

## Project Structure

```
.
├── src/
│   └── app/
│       └── api/          # API routes
├── next.config.ts        # Next.js configuration
├── tsconfig.json         # TypeScript configuration
└── package.json
```
