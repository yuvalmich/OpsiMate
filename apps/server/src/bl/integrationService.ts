import { Request, Response } from 'express';
import { z } from 'zod';
import { CreateProviderSchema, BulkServiceSchema, Provider } from '@service-peek/shared';
import * as providerRepo from '../dal/providerRepository';
import * as serviceRepo from '../dal/serviceRepository';
import * as sshClient from '../dal/sshClient';
import {providerConnectorFactory} from "./providers/providerConnectorFactory";

export async function createProvider(req: Request, res: Response) {
  try {
    const validatedData = CreateProviderSchema.parse(req.body);
    const result = await providerRepo.createProvider(validatedData);
    const provider = await providerRepo.getProviderById(result.lastID);
    res.status(201).json({ success: true, data: provider });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, error: 'Validation error', details: error.errors });
    } else {
      console.error('Error creating provider:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
}

export async function getProviderInstance(req: Request, res: Response) {
  try {
    const providerId = parseInt(req.params.providerId);
    if (isNaN(providerId)) {
      return res.status(400).json({ success: false, error: 'Invalid provider ID' });
    }
    const provider = await providerRepo.getProviderById(providerId);
    if (!provider) {
      return res.status(404).json({ success: false, error: 'Provider not found' });
    }
    try {
      const providerConnector = providerConnectorFactory(provider.provider_type)
      if (!providerConnector) {
        return res.status(501).json({ success: false, error: 'Provider not implemented' });
      }
      const containers = await providerConnector.connectAndListContainers(provider, provider.private_key_filename);
      res.json({ success: true, data: { provider, containers } });
    } catch (sshError) {
      console.error('SSH/Docker error:', sshError);
      res.status(500).json({ success: false, error: sshError instanceof Error ? sshError.message : 'Unknown SSH/Docker error' });
    }
  } catch (error) {
    console.error('Error getting provider instances:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

export async function bulkAddServices(req: Request, res: Response) {
  try {
    const providerId = parseInt(req.params.providerId);
    if (isNaN(providerId)) {
      return res.status(400).json({ success: false, error: 'Invalid provider ID' });
    }
    const validatedData = BulkServiceSchema.parse(req.body);
    const provider = await providerRepo.getProviderById(providerId);
    if (!provider) {
      return res.status(404).json({ success: false, error: 'Provider not found' });
    }
    const storedServices = await serviceRepo.bulkCreateServices(providerId, validatedData.service_names, provider.provider_ip);
    res.status(201).json({ success: true, data: storedServices });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, error: 'Validation error', details: error.errors });
    } else {
      console.error('Error storing services:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
}

export async function getProviders(req: Request, res: Response) {
  try {
    const providers = await providerRepo.getAllProviders();
    res.json({ success: true, data: providers });
  } catch (error) {
    console.error('Error getting providers:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

export async function getProviderServices(req: Request, res: Response) {
  try {
    const providerId = parseInt(req.params.providerId);
    if (isNaN(providerId)) {
      return res.status(400).json({ success: false, error: 'Invalid provider ID' });
    }
    const services = await serviceRepo.getServicesByProviderId(providerId);
    res.json({ success: true, data: services });
  } catch (error) {
    console.error('Error getting services:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

export async function deleteProvider(req: Request, res: Response) {
  try {
    const providerId = parseInt(req.params.providerId);
    if (isNaN(providerId)) {
      return res.status(400).json({ success: false, error: 'Invalid provider ID' });
    }
    
    // Check if provider exists
    const provider = await providerRepo.getProviderById(providerId);
    if (!provider) {
      return res.status(404).json({ success: false, error: 'Provider not found' });
    }
    
    // Delete the provider and its associated services
    await providerRepo.deleteProvider(providerId);
    
    res.json({ success: true, message: 'Provider and associated services deleted successfully' });
  } catch (error) {
    console.error('Error deleting provider:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

export async function updateProvider(req: Request, res: Response) {
  try {
    const providerId = parseInt(req.params.providerId);
    if (isNaN(providerId)) {
      return res.status(400).json({ success: false, error: 'Invalid provider ID' });
    }
    
    // Validate the request data
    const validatedData = CreateProviderSchema.parse(req.body);
    
    // Check if provider exists
    const provider = await providerRepo.getProviderById(providerId);
    if (!provider) {
      return res.status(404).json({ success: false, error: 'Provider not found' });
    }
    
    // Update the provider
    await providerRepo.updateProvider(providerId, validatedData);
    
    // Get the updated provider
    const updatedProvider = await providerRepo.getProviderById(providerId);
    
    res.json({ success: true, data: updatedProvider, message: 'Provider updated successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, error: 'Validation error', details: error.errors });
    } else {
      console.error('Error updating provider:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
} 