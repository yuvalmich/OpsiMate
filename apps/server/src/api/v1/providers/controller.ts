import {Request, Response} from "express";
import * as providerRepo from "../../../dal/providerRepository";
import {AddBulkServiceSchema, CreateProviderSchema} from "@service-peek/shared";
import {z} from "zod";
import {providerConnectorFactory} from "../../../bl/providers/provider-connector/providerConnectorFactory";
import {
    getAllProviders,
    createProvider,
    updateProvider,
    deleteProvider,
    addServicesToProvider, discoverServicesInProvider
} from "../../../bl/providers/provider.bl";
import {ProviderNotFound} from "../../../bl/providers/ProviderNotFound";

export async function getProvidersHandler(_: Request, res: Response) {
    try {
        const providers = await getAllProviders()
        res.json({success: true, data: {providers}});
    } catch (error) {
        console.error('Error getting providers:', error);
        res.status(500).json({success: false, error: 'Internal server error'});
    }
}

export async function createProviderHandler(req: Request, res: Response) {
    try {
        const providerToCreate = CreateProviderSchema.parse(req.body);

        const createdProvider = await createProvider({...providerToCreate, createdAt: Date.now()});
        res.status(201).json({success: true, data: createdProvider});
    } catch (error) {

        if (error instanceof z.ZodError) {
            res.status(400).json({success: false, error: 'Validation error', details: error.errors});
        } else {
            console.error('Error creating provider:', error);
            res.status(500).json({success: false, error: 'Internal server error'});
        }
    }
}

export async function updateProviderHandler(req: Request, res: Response) {
    try {
        const providerId = parseInt(req.params.providerId);
        if (isNaN(providerId)) {
            return res.status(400).json({success: false, error: 'Invalid provider ID'});
        }

        // Validate the request data
        const validatedData = CreateProviderSchema.parse(req.body);

        const updatedProvider = await updateProvider(providerId, validatedData)

        res.json({success: true, data: updatedProvider, message: 'Provider updated successfully'});
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({success: false, error: 'Validation error', details: error.errors});
        } else if (error instanceof ProviderNotFound) {
            res.status(404).json({success: false, error: `Provider ${error.provider} not found`});
        } else {
            console.error('Error updating provider:', error);
            res.status(500).json({success: false, error: 'Internal server error'});
        }
    }
}


export async function deleteProviderHandler(req: Request, res: Response) {
    try {
        const providerId = parseInt(req.params.providerId);
        if (isNaN(providerId)) {
            return res.status(400).json({success: false, error: 'Invalid provider ID'});
        }

        await deleteProvider(providerId)

        res.json({success: true, message: 'Provider and associated services deleted successfully'});
    } catch (error) {
        if (error instanceof ProviderNotFound) {
            res.status(404).json({success: false, error: `Provider ${error.provider} not found`});
        }

        console.error('Error deleting provider:', error);
        res.status(500).json({success: false, error: 'Internal server error'});
    }
}

export async function bulkAddServicesHandler(req: Request, res: Response) {
    try {
        const providerId = parseInt(req.params.providerId);
        if (isNaN(providerId)) {
            return res.status(400).json({success: false, error: 'Invalid provider ID'});
        }
        const validatedData = AddBulkServiceSchema.parse(req.body);

        const newServices = await addServicesToProvider(providerId, validatedData)

        res.status(201).json({success: true, data: newServices});
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({success: false, error: 'Validation error', details: error.errors});
        } else if (error instanceof ProviderNotFound) {
            res.status(404).json({success: false, error: `Provider ${error.provider} not found`});
        } else {
            console.error('Error storing services:', error);
            res.status(500).json({success: false, error: 'Internal server error'});
        }
    }
}


export async function discoverServicesInProviderHandler(req: Request, res: Response) {
    try {
        const providerId = parseInt(req.params.providerId);
        if (isNaN(providerId)) {
            return res.status(400).json({success: false, error: 'Invalid provider ID'});
        }
        const discoversServices = await discoverServicesInProvider(providerId)
        return res.json({success: true, data: discoversServices});


    } catch (error) {
        console.error('Error getting provider instances:', error);
        res.status(500).json({success: false, error: 'Internal server error'});
    }
}