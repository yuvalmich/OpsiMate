import * as yaml from 'js-yaml';
import * as fs from 'fs';
import * as path from 'path';
import { Logger } from '@service-peek/shared';

const logger = new Logger('config');

export interface ServicePeekConfig {
  server: {
    port: number;
    host: string;
  };
  client: {
    port: number;
    api_url: string;
  };
  database: {
    path: string;
  };
  security: {
    private_keys_path: string;
  };
}

let cachedConfig: ServicePeekConfig | null = null;

export function loadConfig(): ServicePeekConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  try {
    // Try to find config.yml starting from current working directory and going up
    let configPath: string | null = null;
    let currentDir = process.cwd();
    
    // Look for config.yml in current directory and parent directories
    for (let i = 0; i < 5; i++) { // Limit search to 5 levels up
      const possiblePath = path.join(currentDir, 'config.yml');
      if (fs.existsSync(possiblePath)) {
        configPath = possiblePath;
        break;
      }
      const parentDir = path.dirname(currentDir);
      if (parentDir === currentDir) break; // Reached root
      currentDir = parentDir;
    }
    
    if (!configPath) {
      logger.warn(`Config file not found starting from ${process.cwd()}, using defaults`);
      return getDefaultConfig();
    }

    logger.info(`Loading config from: ${configPath}`);
    const configFile = fs.readFileSync(configPath, 'utf8');
    const config = yaml.load(configFile) as ServicePeekConfig;
    
    // Validate required fields
    if (!config.server?.port || !config.database?.path || !config.security?.private_keys_path) {
      logger.error('Invalid config file: missing required fields');
      return getDefaultConfig();
    }

    cachedConfig = config;
    logger.info(`Configuration loaded from ${configPath}`);
    return config;
  } catch (error) {
    logger.error('Error loading config file:', error);
    return getDefaultConfig();
  }
}

function getDefaultConfig(): ServicePeekConfig {
  return {
    server: {
      port: 3001,
      host: 'localhost'
    },
    client: {
      port: 8080,
      api_url: 'http://localhost:3001/api/v1'
    },
    database: {
      path: '../../service_peek.db'
    },
    security: {
      private_keys_path: 'apps/server/data/private-keys'
    }
  };
}

// Helper function to get individual config sections
export function getServerConfig() {
  return loadConfig().server;
}

export function getClientConfig() {
  return loadConfig().client;
}

export function getDatabaseConfig() {
  return loadConfig().database;
}

export function getSecurityConfig() {
  return loadConfig().security;
}
