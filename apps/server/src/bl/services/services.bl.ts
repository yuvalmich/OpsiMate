import * as providerRepo from "../../dal/providerRepository";
import * as serviceRepo from "../../dal/serviceRepository";
import {ProviderNotFound} from "../providers/ProviderNotFound";
import {Service} from "@service-peek/shared";

export const createService = async (providerId: number, serviceToCreate: Omit<Service, 'id' | 'createdAt'>): Promise<Service> => {
    const provider = await providerRepo.getProviderById(providerId);

    if (!provider) {
        console.error("No provider found with id " + providerId);
        throw new ProviderNotFound(providerId);
    }

    const {lastID} = await serviceRepo.createService(serviceToCreate);
    console.log("service created", lastID);

    const service = await serviceRepo.getServiceById(lastID)

    if (!service) {
        console.error("No service found with id " + lastID);
        throw new ProviderNotFound(providerId);
    }

    return service
}

