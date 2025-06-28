import { NodeSSH } from 'node-ssh';
import path from 'path';
import fs from 'fs';
import {Provider} from "@service-peek/shared";

const PRIVATE_KEYS_DIR = path.join(__dirname, '../../data/private-keys');

function getKeyPath(filename: string) {
  const filePath = path.join(PRIVATE_KEYS_DIR, filename);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Key not found: ${filePath}`);
  }
  return filePath;
}

export async function connectAndListContainers(provider: Provider) {
  const ssh = new NodeSSH();
  const privateKeyPath = getKeyPath(provider.privateKeyFilename);

  await ssh.connect({
    host: provider.providerIp,
    username: provider.username,
    privateKeyPath: privateKeyPath,
    port: provider.SSHPort,
  });

  // Check if docker is available
  const dockerCheck = await ssh.execCommand('docker --version');
  if (dockerCheck.code !== 0) {
    ssh.dispose();
    throw new Error('Docker is not installed or not accessible');
  }

  const result = await ssh.execCommand('sudo docker ps -a --format "{{.Names}}\t{{.Status}}\t{{.Image}}"');
  ssh.dispose();

  return result.stdout
    .split('\n')
    .filter(line => line.trim())
    .map(line => {
      const [name, status, image] = line.split('\t');
      return {
        service_name: name,
        service_status: status.toLowerCase().includes('up') ? 'running' : 'stopped',
        service_ip: provider.providerIp,
        image: image
      };
    });
}

export async function startService(
    provider: Provider,
    serviceName: string
): Promise<void> {
  const ssh = new NodeSSH();
  try {
    await ssh.connect({
      host: provider.providerIp,
      username: provider.username,
      privateKeyPath: getKeyPath(provider.privateKeyFilename),
      port: provider.SSHPort,
    });

    const result = await ssh.execCommand(`sudo docker start ${serviceName}`);
    if (result.code !== 0) {
      throw new Error(`Failed to start ${serviceName}: ${result.stderr}`);
    }
  } finally {
    ssh.dispose();
  }
}

export async function stopService(
    provider: Provider,
    serviceName: string
): Promise<void> {
  const ssh = new NodeSSH();
  try {
    await ssh.connect({
      host: provider.providerIp,
      username: provider.username,
      privateKeyPath: getKeyPath(provider.privateKeyFilename),
      port: provider.SSHPort,
    });

    const result = await ssh.execCommand(`sudo docker stop ${serviceName}`);
    if (result.code !== 0) {
      throw new Error(`Failed to stop ${serviceName}: ${result.stderr}`);
    }
  } finally {
    ssh.dispose();
  }
}

export async function getServiceLogs(provider: Provider, serviceName: string): Promise<string[]> {
  const ssh = new NodeSSH();

  try {
    await ssh.connect({
      host: provider.providerIp,
      username: provider.username,
      privateKeyPath: getKeyPath(provider.privateKeyFilename),
      port: provider.SSHPort,
    });

    const cmd = `sudo docker logs --since 1h ${serviceName} 2>&1 | grep -i err | tail -n 10`

    const result = await ssh.execCommand(cmd);

    if (result.code !== 0) {
      throw new Error(result.stderr || 'Failed to retrieve service logs');
    }

    // Split logs into an array, filter out empty lines
    const logs = result.stdout
        .split('\n')
        .filter(line => line.trim().length > 0);

    return logs.length > 0 ? logs : ['No error logs found in the last 24 hours'];

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Failed to get logs for service ${serviceName}: ${errorMessage}`);
  } finally {
    ssh.dispose();
  }
}
