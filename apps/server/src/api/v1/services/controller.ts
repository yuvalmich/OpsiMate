import {Request, Response} from "express";
import * as providerRepo from "../../../dal/providerRepository";
import {z} from "zod";
import * as serviceRepo from "../../../dal/serviceRepository";
import {CreateServiceSchema, ServiceIdSchema, UpdateServiceSchema} from "@service-peek/shared";
import {providerConnectorFactory} from "../../../bl/providers/provider-connector/providerConnectorFactory";


// Create a new service
export async function createService(req: Request, res: Response) {
    try {
        // Validate the request data
        const validatedData = CreateServiceSchema.parse(req.body);
        // Check if provider exists
        const provider = await providerRepo.getProviderById(validatedData.providerId);
        if (!provider) {
            return res.status(404).json({ success: false, error: 'Provider not found' });
        }

        // Create the service
        const result = await serviceRepo.createService(validatedData);

        // Get the created service with provider details
        const service = await serviceRepo.getServiceWithProvider(result.lastID);

        res.status(201).json({ success: true, data: service, message: 'Service created successfully' });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ success: false, error: 'Validation error', details: error.errors });
        } else {
            console.error('Error creating service:', error);
            res.status(500).json({ success: false, error: 'Internal server error' });
        }
    }
}

// Get all services with provider details
export async function getAllServices(req: Request, res: Response) {
    try {
        const services = await serviceRepo.getServicesWithProvider();
        res.json({ success: true, data: services });
    } catch (error) {
        console.error('Error getting services:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}

// Get a specific service with provider details
export async function getServiceById(req: Request, res: Response) {
    try {
        // Validate and parse the service ID
        const { serviceId } = ServiceIdSchema.parse({ serviceId: req.params.serviceId });

        // Get the service with provider details
        const service = await serviceRepo.getServiceWithProvider(serviceId);

        if (!service) {
            return res.status(404).json({ success: false, error: 'Service not found' });
        }

        res.json({ success: true, data: service });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ success: false, error: 'Validation error', details: error.errors });
        } else {
            console.error('Error getting service:', error);
            res.status(500).json({ success: false, error: 'Internal server error' });
        }
    }
}

// Update a service
export async function updateService(req: Request, res: Response) {
    try {
        // Validate and parse the service ID
        const { serviceId } = ServiceIdSchema.parse({ serviceId: req.params.serviceId });

        // Validate the request data
        const validatedData = UpdateServiceSchema.partial().parse(req.body);

        // Check if service exists
        const service = await serviceRepo.getServiceById(serviceId);
        if (!service) {
            return res.status(404).json({ success: false, error: 'Service not found' });
        }

        // Update the service
        await serviceRepo.updateService(serviceId, validatedData);

        // Get the updated service with provider details
        const updatedService = await serviceRepo.getServiceWithProvider(serviceId);

        res.json({ success: true, data: updatedService, message: 'Service updated successfully' });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ success: false, error: 'Validation error', details: error.errors });
        } else {
            console.error('Error updating service:', error);
            res.status(500).json({ success: false, error: 'Internal server error' });
        }
    }
}

// Delete a service
export async function deleteService(req: Request, res: Response) {
    try {
        // Validate and parse the service ID
        const { serviceId } = ServiceIdSchema.parse({ serviceId: req.params.serviceId });

        // Check if service exists
        const service = await serviceRepo.getServiceById(serviceId);
        if (!service) {
            return res.status(404).json({ success: false, error: 'Service not found' });
        }

        // Delete the service
        await serviceRepo.deleteService(serviceId);

        res.json({ success: true, message: 'Service deleted successfully' });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ success: false, error: 'Validation error', details: error.errors });
        } else {
            console.error('Error deleting service:', error);
            res.status(500).json({ success: false, error: 'Internal server error' });
        }
    }
}

// Start a service
export async function startService(req: Request, res: Response) {
    try {
        // Validate and parse the service ID
        const { serviceId } = ServiceIdSchema.parse({ serviceId: req.params.serviceId });

        // Get the service with provider details
        const service = await serviceRepo.getServiceWithProvider(serviceId);
        if (!service) {
            return res.status(404).json({ success: false, error: 'Service not found' });
        }
        const provider = service.provider;
        if (!provider) {
            return res.status(404).json({ success: false, error: 'Provider not found for this service' });
        }

        const providerConnector = providerConnectorFactory(provider.providerType)
        await providerConnector.startService(provider, service.service_name);
        // Update service status in DB

        // todo: fix types, serviceStatus is broken
        // await serviceRepo.updateService(serviceId, { serviceStatus: 'running' });
        const updatedService = await serviceRepo.getServiceWithProvider(serviceId);
        res.json({ success: true, data: updatedService, message: 'Service started successfully' });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ success: false, error: 'Validation error', details: error.errors });
        } else {
            console.error('Error starting service:', error);
            res.status(500).json({ success: false, error: 'Internal server error', details: (error as any).message });
        }
    }
}

// Stop a service
export async function stopService(req: Request, res: Response) {
    try {
        // Validate and parse the service ID
        const { serviceId } = ServiceIdSchema.parse({ serviceId: req.params.serviceId });

        // Get the service with provider details
        const service = await serviceRepo.getServiceWithProvider(serviceId);
        if (!service) {
            return res.status(404).json({ success: false, error: 'Service not found' });
        }
        const provider = service.provider;
        if (!provider) {
            return res.status(404).json({ success: false, error: 'Provider not found for this service' });
        }
        const providerConnector = providerConnectorFactory(provider.providerType);
        await providerConnector.stopService(provider, service.service_name);
        // Update service status in DB
        // todo: fix types, serviceStatus is broken
        // await serviceRepo.updateService(serviceId, { serviceStatus: 'stopped' });
        const updatedService = await serviceRepo.getServiceWithProvider(serviceId);
        res.json({ success: true, data: updatedService, message: 'Service stopped successfully' });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ success: false, error: 'Validation error', details: error.errors });
        } else {
            console.error('Error stopping service:', error);
            res.status(500).json({ success: false, error: 'Internal server error', details: (error as any).message });
        }
    }
}

