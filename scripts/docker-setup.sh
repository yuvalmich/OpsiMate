#!/bin/bash

# Service Peek Docker Setup Script
# This script helps set up the Docker environment for Service Peek

set -e

echo "🐳 Service Peek Docker Setup"
echo "=============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_warning "Docker Compose not found. Checking for 'docker compose'..."
    if ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not available. Please install Docker Compose."
        exit 1
    else
        DOCKER_COMPOSE_CMD="docker compose"
        print_status "Found Docker Compose (v2)"
    fi
else
    DOCKER_COMPOSE_CMD="docker-compose"
    print_status "Found Docker Compose (v1)"
fi

# Create data directories
print_info "Creating data directories..."
mkdir -p data/database
mkdir -p data/private-keys

# Set proper permissions
if [[ "$OSTYPE" != "msys" && "$OSTYPE" != "win32" ]]; then
    # Unix-like systems
    chown -R 1001:1001 data/ 2>/dev/null || {
        print_warning "Could not set ownership to 1001:1001. You may need to run with sudo or adjust permissions manually."
    }
fi

print_status "Data directories created"

# Check if config files exist
if [[ ! -f "config.yml" ]]; then
    print_warning "config.yml not found. Creating default config..."
    node scripts/config-helper.js create config.yml || {
        print_error "Could not create config.yml. Please create it manually."
        exit 1
    }
fi

if [[ ! -f "docker-config.yml" ]]; then
    print_status "docker-config.yml already exists"
else
    print_status "docker-config.yml found"
fi

# Function to build and run
build_and_run() {
    print_info "Building Docker image..."
    docker build -t service-peek .
    print_status "Docker image built successfully"

    print_info "Starting Service Peek container..."
    $DOCKER_COMPOSE_CMD up -d
    print_status "Container started"

    # Wait for health check
    print_info "Waiting for application to be ready..."
    sleep 10

    # Check if container is running
    if docker ps | grep -q service-peek-app; then
        print_status "Service Peek is running!"
        print_info "API available at: http://localhost:3001/api/v1"
        print_info "Health check: http://localhost:3001/api/v1/health"
    else
        print_error "Container failed to start. Check logs with: docker logs service-peek-app"
        exit 1
    fi
}

# Function to show usage
show_usage() {
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  setup     Set up directories and build/run the container (default)"
    echo "  build     Build the Docker image only"
    echo "  start     Start the container using docker-compose"
    echo "  stop      Stop the container"
    echo "  restart   Restart the container"
    echo "  logs      Show container logs"
    echo "  status    Show container status"
    echo "  clean     Stop and remove container and image"
    echo "  help      Show this help message"
    echo ""
}

# Parse command line arguments
COMMAND=${1:-setup}

case $COMMAND in
    setup)
        build_and_run
        ;;
    build)
        print_info "Building Docker image..."
        docker build -t service-peek .
        print_status "Docker image built successfully"
        ;;
    start)
        print_info "Starting Service Peek container..."
        $DOCKER_COMPOSE_CMD up -d
        print_status "Container started"
        ;;
    stop)
        print_info "Stopping Service Peek container..."
        $DOCKER_COMPOSE_CMD down
        print_status "Container stopped"
        ;;
    restart)
        print_info "Restarting Service Peek container..."
        $DOCKER_COMPOSE_CMD restart
        print_status "Container restarted"
        ;;
    logs)
        print_info "Showing container logs..."
        docker logs service-peek-app -f
        ;;
    status)
        print_info "Container status:"
        docker ps -a | grep service-peek || echo "No Service Peek containers found"
        echo ""
        print_info "Health status:"
        docker inspect --format='{{.State.Health.Status}}' service-peek-app 2>/dev/null || echo "Health check not available"
        ;;
    clean)
        print_warning "This will stop and remove the container and image. Are you sure? (y/N)"
        read -r response
        if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
            print_info "Stopping and removing container..."
            $DOCKER_COMPOSE_CMD down
            docker rmi service-peek 2>/dev/null || true
            print_status "Cleanup completed"
        else
            print_info "Cleanup cancelled"
        fi
        ;;
    help)
        show_usage
        ;;
    *)
        print_error "Unknown command: $COMMAND"
        show_usage
        exit 1
        ;;
esac

echo ""
print_status "Docker setup completed!"
echo ""
print_info "Useful commands:"
echo "  View logs: docker logs service-peek-app"
echo "  Stop container: $DOCKER_COMPOSE_CMD down"
echo "  Restart: $DOCKER_COMPOSE_CMD restart"
echo "  Shell access: docker exec -it service-peek-app sh"
