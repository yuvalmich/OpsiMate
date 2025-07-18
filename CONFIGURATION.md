# Service Peek Configuration Guide

Service Peek uses a centralized YAML configuration file to manage all application settings. This guide explains how to configure and customize your Service Peek deployment.

## Configuration File Location

The main configuration file is located at:
```
/config.yml
```

## Configuration Structure

```yaml
# Server configuration
server:
  port: 3001  # Backend API server port
  host: "localhost"  # Use "0.0.0.0" for Docker

# Client configuration  
client:
  port: 8080  # Frontend development server port
  api_url: "http://localhost:3001/api/v1"  # Backend API URL

# Database configuration
database:
  path: "/absolute/path/to/service_peek.db"  # SQLite database file path (absolute path recommended)

# Security configuration
security:
  private_keys_path: "/absolute/path/to/private-keys"  # SSH private keys directory (absolute path recommended)
```

## How Configuration Works

### Server-Side Configuration
- **Port & Host**: The server reads these values from the config file and allows environment variable overrides
- **Database Path**: Automatically resolved relative to the server's working directory
- **Private Keys Path**: Used by SSH and Kubernetes connectors to locate authentication keys

### Client-Side Configuration
- **Port**: Vite development server uses this port from the config file
- **API URL**: Automatically injected as `VITE_API_BASE_URL` environment variable

### Environment Variable Overrides
You can override configuration values using environment variables:
```bash
# Override server port
PORT=3002 npm run dev

# Override server host
HOST=0.0.0.0 npm run dev
```

## Configuration Methods

### Method 1: Direct File Editing
Edit the `config.yml` file directly:
```yaml
server:
  port: 3002  # Change server port
  host: "0.0.0.0"  # Bind to all interfaces

client:
  port: 8081  # Change client port
  api_url: "http://localhost:3002/api/v1"  # Update API URL
```

### Method 2: Configuration Helper Script
Use the provided helper script for easy configuration changes:

```bash
# Show current configuration
node scripts/config-helper.js show

# Set server port (automatically updates client API URL)
node scripts/config-helper.js set-server-port 3002

# Set client port
node scripts/config-helper.js set-client-port 8081

# Set database path
node scripts/config-helper.js set-db-path "./data/my_database.db"

# Set private keys path
node scripts/config-helper.js set-keys-path "apps/server/data/keys"
```

## Common Configuration Scenarios

### Development Environment
```yaml
server:
  port: 3001
  host: "localhost"

client:
  port: 8080
  api_url: "http://localhost:3001/api/v1"

database:
  path: "/Users/username/project/service-peek/apps/server/data/service_peek.db"

security:
  private_keys_path: "/Users/username/project/service-peek/apps/server/data/private-keys"
```

### Docker Deployment
```yaml
server:
  port: 3001
  host: "0.0.0.0"  # Bind to all interfaces for container access

client:
  port: 8080
  api_url: "http://localhost:3001/api/v1"

database:
  path: "/apps/server/data/service_peek.db"  # Mounted volume path (absolute)

security:
  private_keys_path: "/apps/server/data/private-keys"  # Mounted volume path (absolute)
```

### Production Environment
```yaml
server:
  port: 80
  host: "0.0.0.0"

client:
  port: 8080
  api_url: "https://your-domain.com/api/v1"  # Production API URL

database:
  path: "/var/lib/service-peek/service_peek.db"  # Production database path (absolute)

security:
  private_keys_path: "/etc/service-peek/private-keys"  # Secure keys location (absolute)
```

## Path Handling

The configuration system supports both absolute and relative paths:

### Absolute Paths (Recommended)
- **Database Path**: Use full absolute paths like `/Users/username/project/service-peek/apps/server/data/service_peek.db`
- **Private Keys Path**: Use full absolute paths like `/Users/username/project/service-peek/apps/server/data/private-keys`
- **Benefits**: More predictable, works consistently across different environments

### Relative Paths (Legacy Support)
- Still supported for backward compatibility
- Resolved relative to the server's working directory
- May cause issues in containerized environments

### Helper Script Path Conversion
The configuration helper script automatically converts relative paths to absolute paths:
```bash
# This will convert to absolute path automatically
node scripts/config-helper.js set-db-path "./apps/server/data/service_peek.db"
```

## Configuration Validation

The application includes built-in configuration validation:
- **Required fields**: Server port, database path, and private keys path must be specified
- **Fallback defaults**: If config file is missing or invalid, the application uses sensible defaults
- **Type checking**: Port numbers are validated to ensure they're valid integers
- **Path resolution**: Supports both absolute and relative paths with proper resolution

## Troubleshooting

### Config File Not Found
If the config file is missing, the application will:
1. Log a warning message
2. Use default configuration values
3. Continue running normally

### Invalid Configuration
If the config file contains invalid values:
1. The application logs an error
2. Falls back to default configuration
3. Continues running with defaults

### Port Conflicts
If the configured ports are already in use:
1. The application will fail to start
2. Check for other services using the same ports
3. Update the configuration to use available ports

## Best Practices

1. **Version Control**: Keep your `config.yml` in version control for team consistency
2. **Environment Specific**: Use different config files for different environments
3. **Security**: Never commit sensitive information like private keys to version control
4. **Documentation**: Document any custom configuration changes for your team
5. **Testing**: Test configuration changes in development before deploying to production

## Integration with Existing Systems

The configuration system is designed to work seamlessly with:
- **Docker**: Supports container-friendly host binding and volume mounts
- **Environment Variables**: Allows runtime overrides without file changes
- **CI/CD**: Easy to modify configuration during deployment pipelines
- **Development Tools**: Integrates with Vite, TypeScript, and other development tools
