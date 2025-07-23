# OpsiMate

A monorepo for the OpsiMate application built with Turbo.

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
- npm 10+

### Installation

1. Install dependencies for all workspaces:
```bash
npm install
```

2. Build all packages:
```bash
npm run build
```

3. Start development servers:
```bash
npm run dev
```

## Available Scripts

- `npm run build` - Build all packages and apps
- `npm run dev` - Start development servers for all apps
- `npm run lint` - Run linting for all packages
- `npm run clean` - Clean build outputs
- `npm run format` - Format code with Prettier

## Quick Start

### Prerequisites

- Node.js 20+
- Docker (for containerized deployment)
- SSH private keys for service discovery (see `configuration_example/` for setup)

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up configuration:**
   ```bash
   # Copy example config and customize for your environment
   cp configuration_example/config.yml ./config.yml
   # Edit config.yml with your local paths
   ```

3. **Run the application:**
   ```bash
   npm run dev
   ```

4. **Access the application:**
   - Backend API: http://localhost:3001/api/v1
   - Frontend: http://localhost:8080

### Docker Deployment

#### Option 1: Default Configuration (Simplest)

```bash
# Create required directories
mkdir -p data/database data/private-keys
cp -r apps/server/data/private-keys/* data/private-keys/

# Build and run with default config
docker build -t service-peek .
docker run -d \
  --name service-peek-app \
  -p 3001:3001 -p 8080:8080 \
  -v $(pwd)/data/database:/app/data/database \
  -v $(pwd)/data/private-keys:/app/data/private-keys \
  service-peek
```

#### Option 2: Custom Configuration

```bash
# Use example config as starting point
cp configuration_example/container-config.yml my-config.yml
# Edit my-config.yml as needed

# Run with custom config
docker run -d \
  --name service-peek-app \
  -p 3001:3001 -p 8080:8080 \
  -v $(pwd)/data/database:/app/data/database \
  -v $(pwd)/data/private-keys:/app/data/private-keys \
  -v $(pwd)/my-config.yml:/app/config/config.yml \
  service-peek
```

### Configuration

Configuration examples are available in the `configuration_example/` folder:

- **`config.yml`** - Local development configuration
- **`container-config.yml`** - Docker container configuration
- **`custom-docker-config.yml`** - Custom Docker configuration example

See `configuration_example/README.md` for detailed explanations.

### Volume Mounts

The container supports the following volume mounts:
- **Database**: `-v $(pwd)/data/database:/app/data/database` (required for data persistence)
- **Private Keys**: `-v $(pwd)/data/private-keys:/app/data/private-keys` (required for SSH connections)
- **Config File**: `-v $(pwd)/my-config.yml:/app/config/config.yml` (optional for custom configuration)

### Configuration Priority

1. **Custom mounted config** (`/app/config/config.yml`) - if provided via volume mount
2. **Built-in default config** (`/app/config/default-config.yml`) - used when no custom config is mounted

### Verification

To verify your deployment:

1. **Check container logs**: `docker logs service-peek-app`
2. **Test API**: `curl http://localhost:3001/api/v1/providers`
3. **Access frontend**: Open http://localhost:8080 in your browser

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
npm run dev

# Work on server only
cd apps/server
npm run dev

# Work on shared package
cd packages/shared
npm run dev
```

## Building for Production

```bash
# Build all workspaces
npm run build

# Start production server
cd apps/server
npm start
``` 