import * as providerRepo from "../../dal/providerRepository";
import {DiscoveredService, Provider, Service} from "@service-peek/shared";
import {ProviderNotFound} from "./ProviderNotFound";
import * as serviceRepo from "../../dal/serviceRepository";
import {providerConnectorFactory} from "./provider-connector/providerConnectorFactory";

const getAllProviders = async (): Promise<Provider[]> => {
    try {
        console.log("Starting to fetch all providers...");
        const providers = await providerRepo.getAllProviders();
        console.log(`Fetched ${providers.length} providers.`);

        return providers;
    } catch (error) {
        console.log("Unable to fetch providers");
        throw error;
    }
}

const createProvider = async (providerToCreate: Omit<Provider, 'id'>): Promise<Provider> => {
    try {
        console.log("Starting to create provider:", providerToCreate);
        const providerIdResponse = await providerRepo.createProvider(providerToCreate);
        console.log("Provider created with ID:", providerIdResponse.lastID);

        const createdProvider = await providerRepo.getProviderById(providerIdResponse.lastID)
        console.log("Fetched created provider:", createdProvider);

        return createdProvider;
    } catch (error) {
        console.error("Error creating provider:", error);
        throw error;
    }
}

const updateProvider = async (providerId: number, providerToUpdate: Omit<Provider, 'id' | 'createdAt'>): Promise<Provider> => {
    console.log("Starting to update provider:", providerId);
    await validateProviderExists(providerId)

    console.log("Updating provider with ID:", providerId, "with data:", providerToUpdate);
    try {
        await providerRepo.updateProvider(providerId, providerToUpdate);
        console.log("Updated provider with ID:", providerId);
        return await providerRepo.getProviderById(providerId);
    } catch (error) {
        console.error("Error updating provider:", error);
        throw error;
    }
}

const discoverServicesInProvider = async (providerId: number): Promise<DiscoveredService[]> => {
    try {
        const provider = await providerRepo.getProviderById(providerId);
        console.log("Fetched provider:", provider);

        const providerConnector = providerConnectorFactory(provider.providerType)

        return await providerConnector.connectAndListContainers(provider, provider.privateKeyFilename);

    } catch (error) {
        console.error("Error discovering services in provider:", error);

        throw new Error(`Failed to discover services for provider ${providerId}`);
    }
}

const deleteProvider = async (providerId: number): Promise<void> => {
    console.log("Starting to delete provider:", providerId);
    await validateProviderExists(providerId)

    try {
        await providerRepo.deleteProvider(providerId);
    } catch (error) {
        console.error(`Error deleting provider [${providerId}]:`, error);
        throw error;
    }
}

const addServicesToProvider = async (providerId: number, services: Omit<Service, 'id' | 'providerId' | 'createdAt'>[]): Promise<Service[]> => {
    console.log(`Starting to add services [${services.length}] to provider:`, providerId);
    await validateProviderExists(providerId)

    return await serviceRepo.bulkCreateServices(providerId, services);
}

const validateProviderExists = async (providerId: number): Promise<void> => {
    try {
        console.log("Validating Provider Exists", providerId);
        await providerRepo.getProviderById(providerId);
    } catch (error) {
        console.error("Error fetching provider for validation:", error);
        throw new ProviderNotFound(providerId);
    }
}


export {
    getAllProviders,
    createProvider,
    updateProvider,
    deleteProvider,
    addServicesToProvider,
    discoverServicesInProvider
};