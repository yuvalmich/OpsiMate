# Service Peek Docker Deployment Guide

This guide covers how to build and run Service Peek using Docker containers.

## Quick Start

### Using Docker Compose (Recommended)

1. **Create data directories:**
   ```bash
   mkdir -p data/database data/private-keys
   ```

2. **Start the application:**
   ```bash
   docker-compose up -d
   ```

3. **Access the application:**
   - API: http://localhost:3001/api/v1
   - Health check: http://localhost:3001/api/v1/health

### Using Docker Commands

1. **Build the image:**
   ```bash
   docker build -t service-peek .
   ```

2. **Run the container:**
   ```bash
   docker run -d \
     --name service-peek-app \
     -p 3001:3001 \
     -v $(pwd)/data/database:/app/data/database \
     -v $(pwd)/data/private-keys:/app/data/private-keys \
     service-peek
   ```

## Configuration

### Default Ports

- **Backend API**: 3001 (exposed by default)
- **Frontend**: 8080 (development only, not included in production container)

### Volume Mounts

The container expects two volume mounts for persistent data:

1. **Database Volume**: `/app/data/database`
   - Mount your local database directory here
   - Example: `-v $(pwd)/data/database:/app/data/database`

2. **Private Keys Volume**: `/app/data/private-keys`
   - Mount your SSH private keys directory here
   - Example: `-v $(pwd)/data/private-keys:/app/data/private-keys`

### Custom Configuration

#### Method 1: Mount Custom Config File
```bash
docker run -d \
  --name service-peek-app \
  -p 3001:3001 \
  -v $(pwd)/data/database:/app/data/database \
  -v $(pwd)/data/private-keys:/app/data/private-keys \
  -v $(pwd)/docker-config.yml:/app/config.yml:ro \
  service-peek
```

#### Method 2: Environment Variables
```bash
docker run -d \
  --name service-peek-app \
  -p 3001:3001 \
  -e CONFIG_FILE=/app/custom-config.yml \
  -v $(pwd)/data/database:/app/data/database \
  -v $(pwd)/data/private-keys:/app/data/private-keys \
  -v $(pwd)/custom-config.yml:/app/custom-config.yml:ro \
  service-peek
```

## Docker Compose Configuration

### Basic Setup

```yaml
version: '3.8'

services:
  service-peek:
    build: .
    ports:
      - "3001:3001"
    volumes:
      - ./data/database:/app/data/database
      - ./data/private-keys:/app/data/private-keys
    restart: unless-stopped
```

### Advanced Setup with Custom Config

```yaml
version: '3.8'

services:
  service-peek:
    build: .
    ports:
      - "3001:3001"
    volumes:
      - ./data/database:/app/data/database
      - ./data/private-keys:/app/data/private-keys
      - ./docker-config.yml:/app/config.yml:ro
    environment:
      - NODE_ENV=production
      - PORT=3001
      - HOST=0.0.0.0
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/api/v1/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Node.js environment | `production` |
| `CONFIG_FILE` | Path to config file | `/app/config.yml` |
| `PORT` | Server port override | `3001` |
| `HOST` | Server host override | `0.0.0.0` |

## Security Considerations

### Container Security
- Runs as non-root user (`servicepeek:nodejs`)
- Uses `dumb-init` for proper signal handling
- Minimal Alpine Linux base image
- Only production dependencies included

### Data Security
- Database and private keys are stored in mounted volumes
- Volumes should have appropriate file permissions
- Consider using Docker secrets for sensitive configuration

### Network Security
- Only exposes necessary ports (3001 by default)
- Uses bridge network by default
- Consider using custom networks for multi-container setups

## Troubleshooting

### Common Issues

1. **Permission Denied Errors**
   ```bash
   # Fix volume permissions
   sudo chown -R 1001:1001 data/
   ```

2. **Port Already in Use**
   ```bash
   # Use different port
   docker run -p 3002:3001 service-peek
   ```

3. **Config File Not Found**
   ```bash
   # Verify config file exists and is mounted correctly
   docker exec service-peek-app ls -la /app/config.yml
   ```

### Debugging

1. **View container logs:**
   ```bash
   docker logs service-peek-app
   ```

2. **Access container shell:**
   ```bash
   docker exec -it service-peek-app sh
   ```

3. **Check health status:**
   ```bash
   docker inspect --format='{{.State.Health.Status}}' service-peek-app
   ```

## Production Deployment

### Recommended Setup

1. **Use specific image tags:**
   ```bash
   docker build -t service-peek:v1.0.0 .
   ```

2. **Use external volumes:**
   ```bash
   docker volume create service-peek-db
   docker volume create service-peek-keys
   ```

3. **Use environment-specific configs:**
   ```bash
   # Create production config
   cp docker-config.yml production-config.yml
   # Edit production-config.yml for your environment
   ```

4. **Set up monitoring:**
   ```yaml
   services:
     service-peek:
       # ... other config
       logging:
         driver: "json-file"
         options:
           max-size: "10m"
           max-file: "3"
   ```

### Scaling Considerations

- Database is SQLite (single instance)
- For high availability, consider:
  - Load balancer in front of multiple containers
  - Shared network storage for database
  - Database replication strategy

## Build Optimization

### Multi-stage Build Benefits
- Smaller production image (only runtime dependencies)
- Faster deployment (cached layers)
- Better security (no build tools in production)

### Build Arguments
```bash
# Build with specific Node.js version
docker build --build-arg NODE_VERSION=18-alpine -t service-peek .
```

### Image Size Optimization
- Uses Alpine Linux (minimal base image)
- Multi-stage build removes build dependencies
- `.dockerignore` excludes unnecessary files
- Production-only npm install

## Monitoring and Health Checks

### Built-in Health Check
The container includes a health check that verifies:
- HTTP server is responding
- API endpoint is accessible
- Application is ready to serve requests

### Custom Health Checks
```bash
# Manual health check
curl -f http://localhost:3001/api/v1/health

# Docker health check status
docker inspect --format='{{.State.Health}}' service-peek-app
```

## Backup and Recovery

### Database Backup
```bash
# Backup database
docker exec service-peek-app sqlite3 /app/data/database/service_peek.db ".backup /tmp/backup.db"
docker cp service-peek-app:/tmp/backup.db ./backup-$(date +%Y%m%d).db
```

### Volume Backup
```bash
# Backup entire data directory
tar -czf service-peek-backup-$(date +%Y%m%d).tar.gz data/
```

This Docker setup provides a production-ready deployment of Service Peek with proper security, monitoring, and data persistence.
