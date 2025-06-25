import { NodeSSH } from 'node-ssh';
import path from 'path';
import fs from 'fs';
import {Provider} from "@service-peek/shared";

const PRIVATE_KEYS_DIR = path.join(__dirname, '../../data/private-keys');

export async function connectAndListContainers(provider: Provider, privateKeyFilename: string) {
  const ssh = new NodeSSH();
  const privateKeyPath = path.join(PRIVATE_KEYS_DIR, privateKeyFilename);

  if (!fs.existsSync(privateKeyPath)) {
    throw new Error(`Private key file '${privateKeyFilename}' not found in ${PRIVATE_KEYS_DIR}`);
  }

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