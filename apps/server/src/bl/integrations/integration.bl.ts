import { IntegrationRepository } from "../../dal/integrationRepository";
import { Integration } from "@service-peek/shared";

export class IntegrationBL {
    constructor(private integrationRepo: IntegrationRepository) {}

    async getAllIntegrations(): Promise<Integration[]> {
        try {
            console.log("Starting to fetch all integrations...");
            const integrations = await this.integrationRepo.getAllIntegrations();
            console.log(`Fetched ${integrations.length} integrations.`);
            return integrations;
        } catch (error) {
            console.log("Unable to fetch integrations");
            throw error;
        }
    }

    async createIntegration(integrationToCreate: Omit<Integration, 'id' | 'createdAt'>): Promise<Integration> {
        try {
            console.log("Starting to create integration:", integrationToCreate);
            const { lastID } = await this.integrationRepo.createIntegration(integrationToCreate);
            console.log("Integration created with ID:", lastID);

            const createdIntegration = await this.integrationRepo.getIntegrationById(lastID);
            console.log("Fetched created integration:", createdIntegration);

            return createdIntegration;
        } catch (error) {
            console.error("Error creating integration:", error);
            throw error;
        }
    }

    async updateIntegration(integrationId: number, integrationToUpdate: Omit<Integration, 'id' | 'createdAt'>): Promise<Integration> {
        console.log("Starting to update integration:", integrationId);
        await this.validateIntegrationExists(integrationId);

        try {
            await this.integrationRepo.updateIntegration(integrationId, integrationToUpdate);
            console.log("Updated integration with ID:", integrationId);
            return await this.integrationRepo.getIntegrationById(integrationId);
        } catch (error) {
            console.error("Error updating integration:", error);
            throw error;
        }
    }

    async deleteIntegration(integrationId: number): Promise<void> {
        console.log("Starting to delete integration:", integrationId);
        await this.validateIntegrationExists(integrationId);

        try {
            await this.integrationRepo.deleteIntegration(integrationId);
        } catch (error) {
            console.error(`Error deleting integration [${integrationId}]:`, error);
            throw error;
        }
    }

    private async validateIntegrationExists(integrationId: number): Promise<void> {
        const integration = await this.integrationRepo.getIntegrationById(integrationId);
        if (!integration) {
            throw new Error(`Integration with ID ${integrationId} does not exist.`);
        }
    }
}
