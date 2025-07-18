#!/usr/bin/env node

/**
 * Configuration Helper Script
 * Simple utility to read and modify Service Peek configuration
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const CONFIG_PATH = path.join(__dirname, '..', 'config.yml');

function loadConfig() {
  try {
    const configFile = fs.readFileSync(CONFIG_PATH, 'utf8');
    return yaml.load(configFile);
  } catch (error) {
    console.error('Error loading config file:', error.message);
    process.exit(1);
  }
}

function saveConfig(config) {
  try {
    const yamlStr = yaml.dump(config, {
      indent: 2,
      lineWidth: 80,
      noRefs: true
    });
    fs.writeFileSync(CONFIG_PATH, yamlStr);
    console.log('✅ Configuration saved successfully!');
  } catch (error) {
    console.error('Error saving config file:', error.message);
    process.exit(1);
  }
}

function showConfig() {
  const config = loadConfig();
  console.log('\n📋 Current Service Peek Configuration:\n');
  console.log(`Server Port: ${config.server.port}`);
  console.log(`Server Host: ${config.server.host}`);
  console.log(`Client Port: ${config.client.port}`);
  console.log(`API URL: ${config.client.api_url}`);
  console.log(`Database Path: ${config.database.path}`);
  console.log(`Private Keys Path: ${config.security.private_keys_path}`);
  console.log('');
}

function setServerPort(port) {
  const config = loadConfig();
  const newPort = parseInt(port, 10);
  if (isNaN(newPort) || newPort < 1 || newPort > 65535) {
    console.error('❌ Invalid port number. Must be between 1 and 65535.');
    process.exit(1);
  }
  
  config.server.port = newPort;
  // Update client API URL to match new server port
  config.client.api_url = `http://localhost:${newPort}/api/v1`;
  
  saveConfig(config);
  console.log(`✅ Server port updated to ${newPort}`);
  console.log(`✅ Client API URL updated to ${config.client.api_url}`);
}

function setClientPort(port) {
  const config = loadConfig();
  const newPort = parseInt(port, 10);
  if (isNaN(newPort) || newPort < 1 || newPort > 65535) {
    console.error('❌ Invalid port number. Must be between 1 and 65535.');
    process.exit(1);
  }
  
  config.client.port = newPort;
  saveConfig(config);
  console.log(`✅ Client port updated to ${newPort}`);
}

function setDatabasePath(dbPath) {
  const config = loadConfig();
  // Convert to absolute path if relative path is provided
  const absolutePath = path.isAbsolute(dbPath) ? dbPath : path.resolve(process.cwd(), dbPath);
  config.database.path = absolutePath;
  saveConfig(config);
  console.log(`✅ Database path updated to ${absolutePath}`);
}

function setPrivateKeysPath(keysPath) {
  const config = loadConfig();
  // Convert to absolute path if relative path is provided
  const absolutePath = path.isAbsolute(keysPath) ? keysPath : path.resolve(process.cwd(), keysPath);
  config.security.private_keys_path = absolutePath;
  saveConfig(config);
  console.log(`✅ Private keys path updated to ${absolutePath}`);
}

function showHelp() {
  console.log(`
🔧 Service Peek Configuration Helper

Usage: node scripts/config-helper.js <command> [arguments]

Commands:
  show                     Show current configuration
  set-server-port <port>   Set server port (also updates client API URL)
  set-client-port <port>   Set client port
  set-db-path <path>       Set database file path
  set-keys-path <path>     Set private keys directory path
  help                     Show this help message

Examples:
  node scripts/config-helper.js show
  node scripts/config-helper.js set-server-port 3002
  node scripts/config-helper.js set-client-port 8081
  node scripts/config-helper.js set-db-path "./data/my_database.db"
  node scripts/config-helper.js set-keys-path "apps/server/data/keys"
`);
}

// Main execution
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'show':
    showConfig();
    break;
  case 'set-server-port':
    if (!args[1]) {
      console.error('❌ Port number required');
      process.exit(1);
    }
    setServerPort(args[1]);
    break;
  case 'set-client-port':
    if (!args[1]) {
      console.error('❌ Port number required');
      process.exit(1);
    }
    setClientPort(args[1]);
    break;
  case 'set-db-path':
    if (!args[1]) {
      console.error('❌ Database path required');
      process.exit(1);
    }
    setDatabasePath(args[1]);
    break;
  case 'set-keys-path':
    if (!args[1]) {
      console.error('❌ Private keys path required');
      process.exit(1);
    }
    setPrivateKeysPath(args[1]);
    break;
  case 'help':
  case '--help':
  case '-h':
    showHelp();
    break;
  default:
    console.error('❌ Unknown command. Use "help" to see available commands.');
    process.exit(1);
}
