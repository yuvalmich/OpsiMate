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