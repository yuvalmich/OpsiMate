import {DiscoveredService, Provider, Service, ServiceType} from "@service-peek/shared";
import * as sshClient from "../../../dal/sshClient";
import {ProviderConnector} from "./providerConnector";
import {Logger} from "@service-peek/shared";

const logger = new Logger('VMProviderConnector');

export class VMProviderConnector implements ProviderConnector {
    async discoverServices(provider: Provider): Promise<DiscoveredService[]> {
        try {
            // Only discover Docker containers, systemd services are added manually
            const dockerServices = await sshClient.connectAndListContainers(provider);
            
            // Return only Docker services
            return dockerServices;
        } catch (error: any) {
            logger.error('Error discovering services:', error);
            // If Docker discovery fails, return empty array
            if (error.message?.includes('Docker is not installed')) {
                logger.info('Docker is not installed, returning empty service list');
                return [];
            }
            throw error;
        }
    }

    async startService(provider: Provider, serviceName: string, serviceType?: ServiceType): Promise<void> {
        if (serviceType === ServiceType.SYSTEMD) {
            return sshClient.startSystemService(provider, serviceName);
        } else {
            // Default to Docker service
            return sshClient.startService(provider, serviceName);
        }
    }

    async stopService(provider: Provider, serviceName: string, serviceType?: ServiceType): Promise<void> {
        if (serviceType === ServiceType.SYSTEMD) {
            return sshClient.stopSystemService(provider, serviceName);
        } else {
            // Default to Docker service
            return sshClient.stopService(provider, serviceName);
        }
    }

    async getServiceLogs(provider: Provider, service: Service): Promise<string[]> {
        if (service.serviceType === ServiceType.SYSTEMD) {
            return sshClient.getSystemServiceLogs(provider, service.name);
        } else {
            // Default to Docker service
            return sshClient.getServiceLogs(provider, service.name);
        }
    }
    async testConnection(provider: Provider): Promise<boolean> {
        return sshClient.testConnection(provider);
    }
}
