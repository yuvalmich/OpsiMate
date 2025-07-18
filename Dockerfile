# Service Peek Simple Dockerfile
# Runs the project as-is without building

FROM node:20-alpine

# Install basic dependencies
RUN apk add --no-cache bash

# Create app user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S servicepeek -u 1001

# Set working directory
WORKDIR /app

# Copy project files
COPY --chown=servicepeek:nodejs . .

# Install dependencies
RUN npm install

# Rebuild native modules for the container architecture
RUN npm rebuild

# Create directories for volume mounts with proper permissions
RUN mkdir -p /app/data/database /app/data/private-keys /app/config && \
    chown -R servicepeek:nodejs /app/data /app/config

# Copy default config file to container
COPY --chown=servicepeek:nodejs default-config.yml /app/config/default-config.yml

# Copy entrypoint script
COPY --chown=servicepeek:nodejs docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

# Switch to non-root user
USER servicepeek

# Expose default ports (backend: 3001, frontend: 8080)
EXPOSE 3001 8080

# Define volumes for persistent data
VOLUME ["/app/data/database", "/app/data/private-keys", "/app/config"]

# Set environment variables
ENV NODE_ENV=development

# Start the application using custom entrypoint
ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["npm", "run", "dev"]
