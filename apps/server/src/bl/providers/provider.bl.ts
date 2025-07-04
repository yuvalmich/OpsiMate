import { DiscoveredService, Provider, Service } from "@service-peek/shared";
import { ProviderNotFound } from "./ProviderNotFound";
import { providerConnectorFactory } from "./provider-connector/providerConnectorFactory";
import * as serviceRepo from "../../dal/serviceRepository";
import {ProviderRepository} from "../../dal/providerRepository";
import {ServiceRepository} from "../../dal/serviceRepository";

export class ProviderBL {
    constructor(private providerRepo: ProviderRepository,
                private serviceRepo: ServiceRepository) {}

    async getAllProviders(): Promise<Provider[]> {
        try {
            console.log("Starting to fetch all providers...");
            const providers = await this.providerRepo.getAllProviders();
            console.log(`Fetched ${providers.length} providers.`);
            return providers;
        } catch (error) {
            console.log("Unable to fetch providers");
            throw error;
        }
    }

    async createProvider(providerToCreate: Omit<Provider, 'id'>): Promise<Provider> {
        try {
            console.log("Starting to create provider:", providerToCreate);
            const { lastID } = await this.providerRepo.createProvider(providerToCreate);
            console.log("Provider created with ID:", lastID);

            const createdProvider = await this.providerRepo.getProviderById(lastID);
            console.log("Fetched created provider:", createdProvider);

            return createdProvider;
        } catch (error) {
            console.error("Error creating provider:", error);
            throw error;
        }
    }

    async updateProvider(providerId: number, providerToUpdate: Omit<Provider, 'id' | 'createdAt'>): Promise<Provider> {
        console.log("Starting to update provider:", providerId);
        await this.validateProviderExists(providerId);

        try {
            await this.providerRepo.updateProvider(providerId, providerToUpdate);
            console.log("Updated provider with ID:", providerId);
            return await this.providerRepo.getProviderById(providerId);
        } catch (error) {
            console.error("Error updating provider:", error);
            throw error;
        }
    }

    async deleteProvider(providerId: number): Promise<void> {
        console.log("Starting to delete provider:", providerId);
        await this.validateProviderExists(providerId);

        try {
            await this.providerRepo.deleteProvider(providerId);
        } catch (error) {
            console.error(`Error deleting provider [${providerId}]:`, error);
            throw error;
        }
    }

    async discoverServicesInProvider(providerId: number): Promise<DiscoveredService[]> {
        try {
            const provider = await this.providerRepo.getProviderById(providerId);
            console.log("Fetched provider:", provider);

            const providerConnector = providerConnectorFactory(provider.providerType);
            return await providerConnector.discoverServices(provider);
        } catch (error) {
            console.error("Error discovering services in provider:", error);
            throw new Error(`Failed to discover services for provider ${providerId}`);
        }
    }

    async addServicesToProvider(
        providerId: number,
        services: Omit<Service, 'id' | 'providerId' | 'createdAt'>[]
    ): Promise<Service[]> {
        console.log(`Starting to add services [${services.length}] to provider:`, providerId);
        await this.validateProviderExists(providerId);
        return await this.serviceRepo.bulkCreateServices(providerId, services);
    }

    private async validateProviderExists(providerId: number): Promise<void> {
        try {
            console.log("Validating Provider Exists:", providerId);
            await this.providerRepo.getProviderById(providerId);
        } catch (error) {
            console.error("Error fetching provider for validation:", error);
            throw new ProviderNotFound(providerId);
        }
    }
}
