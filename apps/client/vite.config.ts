import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import * as yaml from 'js-yaml';
import * as fs from 'fs';

// Load configuration
function loadConfig() {
  try {
    const configPath = path.resolve(__dirname, '../../config.yml');
    if (fs.existsSync(configPath)) {
      const configFile = fs.readFileSync(configPath, 'utf8');
      return yaml.load(configFile) as any;
    }
  } catch (error) {
    console.warn('Could not load config.yml, using defaults');
  }
  return {
    client: { port: 8080, api_url: 'http://localhost:3001/api/v1' },
    server: { port: 3001 }
  };
}

const config = loadConfig();

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: config.client.port,
  },
  define: {
    // Make config values available as environment variables
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify(config.client.api_url),
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
