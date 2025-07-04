# Service Peek

A monorepo for the Service Peek application built with Turbo.

## Structure

```
service-peek/
├── apps/
│   ├── client/          # React frontend (Vite + TypeScript)
│   └── server/          # Node.js backend (Express + TypeScript)
├── packages/
│   └── shared/          # Shared types and validation schemas
├── package.json         # Root workspace configuration
└── turbo.json          # Turbo build configuration
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm 10+

### Installation

1. Install dependencies for all workspaces:
```bash
pnpm install
```

2. Build all packages:
```bash
pnpm run build
```

3. Start development servers:
```bash
pnpm run dev
```

## Available Scripts

- `pnpm run build` - Build all packages and apps
- `pnpm run dev` - Start development servers for all apps
- `pnpm run lint` - Run linting for all packages
- `pnpm run clean` - Clean build outputs
- `pnpm run format` - Format code with Prettier

## Workspaces

### Apps

#### Client (`apps/client`)
React frontend application built with:
- Vite
- TypeScript
- Tailwind CSS
- Radix UI components
- React Router
- React Query

#### Server (`apps/server`)
Node.js backend application built with:
- Express
- TypeScript
- SQLite
- Node SSH
- Zod validation

### Packages

#### Shared (`packages/shared`)
Shared types and validation schemas used by both client and server:
- TypeScript interfaces
- Zod validation schemas
- Common utilities

## Development

Each workspace can be developed independently:

```bash
# Work on client only
cd apps/client
pnpm run dev

# Work on server only
cd apps/server
pnpm run dev

# Work on shared package
cd packages/shared
pnpm run dev
```

## Building for Production

```bash
# Build all workspaces
pnpm run build

# Start production server
cd apps/server
pnpm start
``` 