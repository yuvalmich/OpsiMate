import { Request, Response } from 'express';
import { z } from 'zod';
import { CreateProviderSchema, BulkServiceSchema, CreateServiceSchema, UpdateServiceSchema, ServiceIdSchema, Provider, Service } from '@service-peek/shared';
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

// Service CRUD Operations

// Create a new service
export async function createService(req: Request, res: Response) {
  try {
    // Validate the request data
    const validatedData = CreateServiceSchema.parse(req.body);
    
    // Check if provider exists
    const provider = await providerRepo.getProviderById(validatedData.provider_id);
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