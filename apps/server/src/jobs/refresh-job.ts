import { getAllProviders } from '../bl/providers/provider.bl';
import * as serviceRepo from '../dal/serviceRepository';
import { providerConnectorFactory } from '../bl/providers/provider-connector/providerConnectorFactory';
import {DiscoveredService, Provider} from '@service-peek/shared';

const BATCH_SIZE = 10;

async function refreshAllProvidersServices() {
    const providers = await getAllProviders();
    const batches = chunkArray(providers, BATCH_SIZE);

    for (const batch of batches) {
        await Promise.all(batch.map(refreshProviderServicesSafely));
    }
}

async function refreshProviderServicesSafely(provider: Provider): Promise<void> {
    try {
        await refreshProviderServices(provider);
    } catch (err) {
        console.error(`Failed to refresh services for provider ${provider.id}:`, err);
    }
}

async function refreshProviderServices(provider: Provider): Promise<void> {
    const connector = providerConnectorFactory(provider.providerType);
    const discoveredServices: DiscoveredService[] = await connector.discoverServices(provider);
    const dbServices = await serviceRepo.getServicesByProviderId(provider.id);

    for (const dbService of dbServices) {
        const matchedService = findMatchingService(discoveredServices, dbService.name);

        // Update service status only if it is different to reduce db calls.
        if (matchedService && matchedService.serviceStatus !== dbService.serviceStatus) {
            await serviceRepo.updateService(dbService.id, {
                serviceStatus: matchedService.serviceStatus
            });
        }
    }
}

function findMatchingService(discoveredServices: DiscoveredService[], dbServiceName: string): DiscoveredService | undefined {
    return discoveredServices.find(
        ds => ds.name.trim().toLowerCase() === dbServiceName.trim().toLowerCase()
    );
}

function chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
}

export function startRefreshJob() {
    console.log('[Job] Starting refreshAllProvidersServices job (every 10 minutes)');

    // Run immediately on startup (optional)
    refreshAllProvidersServices().catch((err) =>
        console.error('[Job] Initial run failed:', err)
    );

    // Then run every 10 minutes
    setInterval(async () => {
        console.log('[Job] Running refreshAllProvidersServices');
        try {
            await refreshAllProvidersServices();
        } catch (err) {
            console.error('[Job] Failed to refresh services:', err);
        }
    }, 10 * 1000);
}