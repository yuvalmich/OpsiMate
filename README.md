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

## Docker Usage

### Quick Start with Docker

1. **Create data directories and copy SSH keys:**
   ```bash
   mkdir -p data/database data/private-keys
   cp -r apps/server/data/private-keys/* data/private-keys/
   ```

2. **Build and run the container:**
   ```bash
   docker build -t service-peek .
   docker run -d \
     --name service-peek-app \
     -p 3001:3001 \
     -p 8080:8080 \
     -v $(pwd)/data/database:/app/data/database \
     -v $(pwd)/data/private-keys:/app/data/private-keys \
     -v $(pwd)/container-config.yml:/app/config/config.yml \
     service-peek
   ```

3. **Access the application:**
   - Backend API: http://localhost:3001/api/v1
   - Frontend: http://localhost:8080

### Volume Mounts

The container supports three volume mounts:
- **Database**: `-v $(pwd)/data/database:/app/data/database` (required)
- **Private Keys**: `-v $(pwd)/data/private-keys:/app/data/private-keys` (required)
- **Config File**: `-v $(pwd)/container-config.yml:/app/config/config.yml` (optional)

### Configuration Options

**Default behavior**: Uses the built-in `container-config.yml` if no config is mounted.

**Custom config file**: Mount your own config file:
```bash
docker run -d \
  --name service-peek-app \
  -p 3001:3001 -p 8080:8080 \
  -v $(pwd)/data/database:/app/data/database \
  -v $(pwd)/data/private-keys:/app/data/private-keys \
  -v $(pwd)/my-custom-config.yml:/app/config/config.yml \
  service-peek
```

**Config file priority**:
1. Mounted config file (`/app/config/config.yml`)
2. Default container config (`/app/config/default-config.yml`)
3. Project default config (`/app/config.yml`)

### Verification

To verify the config file mounting is working:

1. **Check container logs**: Look for `Using CONFIG_FILE environment variable: /app/config/config.yml`
2. **Verify database path**: Logs should show the database path from your mounted config
3. **Test API endpoints**: `curl http://localhost:3001/api/v1/providers`

**Example with custom config**:
```bash
# Create custom config with different database name
cp container-config.yml my-custom-config.yml
# Edit database.path to use custom name

# Run with custom config
docker run -d \
  --name service-peek-custom \
  -p 3001:3001 -p 8080:8080 \
  -v $(pwd)/data/database:/app/data/database \
  -v $(pwd)/data/private-keys:/app/data/private-keys \
  -v $(pwd)/my-custom-config.yml:/app/config/config.yml \
  service-peek
```

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