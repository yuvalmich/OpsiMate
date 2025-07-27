import {Request, Response} from "express";
import {z} from "zod";
import {CreateServiceSchema, ServiceIdSchema, UpdateServiceSchema, Logger, ServiceType} from "@service-peek/shared";
import {providerConnectorFactory} from "../../../bl/providers/provider-connector/providerConnectorFactory";
import {ProviderNotFound} from "../../../bl/providers/ProviderNotFound";
import {ServiceNotFound} from "../../../bl/services/ServiceNotFound";
import {ProviderRepository} from "../../../dal/providerRepository";
import {ServiceRepository} from "../../../dal/serviceRepository";
import {checkSystemServiceStatus} from "../../../dal/sshClient";

const logger = new Logger('api/v1/services/controller');

export class ServiceController {
    constructor(private providerRepo: ProviderRepository, private serviceRepo: ServiceRepository) {
    }

    createServiceHandler = async (req: Request, res: Response) => {
        try {
            const validatedData = CreateServiceSchema.parse(req.body);

            const provider = await this.providerRepo.getProviderById(validatedData.providerId);

            if (!provider) {
                logger.error(`No provider found with id ${validatedData.providerId}`);
                throw new ProviderNotFound(validatedData.providerId);
            }

            const {lastID} = await this.serviceRepo.createService(validatedData);
            logger.info(`service created with id ${lastID}`);

            const service = await this.serviceRepo.getServiceById(lastID)

            if (!service) {
                logger.error(`No service found with id ${lastID}`);
                throw new ProviderNotFound(validatedData.providerId);
            }

            // If it's a systemd service, check its actual status
            if (service.serviceType === ServiceType.SYSTEMD) {
                try {
                    const actualStatus = await checkSystemServiceStatus(provider, service.name);

                    // Update the service status in the database
                    await this.serviceRepo.updateService(lastID, {serviceStatus: actualStatus});

                    // Update the service object for the response
                    service.serviceStatus = actualStatus;
                    logger.info(`Updated systemd service ${service.name} status to ${actualStatus}`);
                } catch (error) {
                    logger.error('Failed to check systemd service status:', error);
                    // Continue with unknown status if check fails
                }
            }

            res.status(201).json({
                success: true,
                data: {...service, provider},
                message: 'Service created successfully'
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({success: false, error: 'Validation error', details: error.errors});
            } else if (error instanceof ProviderNotFound) {
                res.status(404).json({success: false, error: `Provider with ID ${error.provider} not found`});
            } else if (error instanceof ServiceNotFound) {
                res.status(404).json({success: false, error: `Service with ID ${error.serviceId} not found`});
            } else {
                logger.error('Error creating service:', error);
                res.status(500).json({success: false, error: 'Internal server error'});
            }
        }
    };

    getAllServicesHandler = async (_req: Request, res: Response) => {
        try {
            const services = await this.serviceRepo.getServicesWithProvider();
            res.json({success: true, data: services});
        } catch (error) {
            logger.error('Error getting services:', error);
            res.status(500).json({success: false, error: 'Internal server error'});
        }
    };

    getServiceByIdHandler = async (req: Request, res: Response) => {
        try {
            const {serviceId} = ServiceIdSchema.parse({serviceId: req.params.serviceId});
            const service = await this.serviceRepo.getServiceWithProvider(serviceId);
            if (!service) {
                return res.status(404).json({success: false, error: 'Service not found'});
            }
            res.json({success: true, data: service});
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({success: false, error: 'Validation error', details: error.errors});
            } else {
                logger.error('Error getting service:', error);
                res.status(500).json({success: false, error: 'Internal server error'});
            }
        }
    };

    updateServiceHandler = async (req: Request, res: Response) => {
        try {
            const {serviceId} = ServiceIdSchema.parse({serviceId: req.params.serviceId});
            const validatedData = UpdateServiceSchema.partial().parse(req.body);
            const service = await this.serviceRepo.getServiceById(serviceId);

            if (!service) {
                return res.status(404).json({success: false, error: 'Service not found'});
            }

            await this.serviceRepo.updateService(serviceId, validatedData);
            const updatedService = await this.serviceRepo.getServiceWithProvider(serviceId);

            res.json({success: true, data: updatedService, message: 'Service updated successfully'});
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({success: false, error: 'Validation error', details: error.errors});
            } else {
                logger.error('Error updating service:', error);
                res.status(500).json({success: false, error: 'Internal server error'});
            }
        }
    };

    deleteServiceHandler = async (req: Request, res: Response) => {
        try {
            const {serviceId} = ServiceIdSchema.parse({serviceId: req.params.serviceId});
            const service = await this.serviceRepo.getServiceById(serviceId);

            if (!service) {
                return res.status(404).json({success: false, error: 'Service not found'});
            }

            await this.serviceRepo.deleteService(serviceId);
            res.json({success: true, message: 'Service deleted successfully'});
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({success: false, error: 'Validation error', details: error.errors});
            } else {
                logger.error('Error deleting service:', error);
                res.status(500).json({success: false, error: 'Internal server error'});
            }
        }
    };

    startServiceHandler = async (req: Request, res: Response) => {
        try {
            const {serviceId} = ServiceIdSchema.parse({serviceId: req.params.serviceId});
            const service = await this.serviceRepo.getServiceWithProvider(serviceId);

            if (!service) {
                return res.status(404).json({success: false, error: 'Service not found'});
            }

            const provider = await this.providerRepo.getProviderById(service.providerId);
            if (!provider) {
                return res.status(404).json({success: false, error: 'Provider not found for this service'});
            }

            const providerConnector = providerConnectorFactory(provider.providerType);
            await providerConnector.startService(provider, service.name, service.serviceType);
            await this.serviceRepo.updateService(serviceId, {serviceStatus: 'running'});

            const updatedService = await this.serviceRepo.getServiceWithProvider(serviceId);
            res.json({success: true, data: updatedService, message: 'Service started successfully'});
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({success: false, error: 'Validation error', details: error.errors});
            } else {
                logger.error('Error starting service:', error);
                const message = error instanceof Error ? error.message : String(error);
                res.status(500).json({success: false, error: 'Internal server error', details: message});
            }
        }
    };

    stopServiceHandler = async (req: Request, res: Response) => {
        try {
            const {serviceId} = ServiceIdSchema.parse({serviceId: req.params.serviceId});
            const service = await this.serviceRepo.getServiceById(serviceId);

            if (!service) {
                return res.status(404).json({success: false, error: 'Service not found'});
            }

            const provider = await this.providerRepo.getProviderById(service.providerId);
            if (!provider) {
                return res.status(404).json({success: false, error: 'Provider not found for this service'});
            }

            const providerConnector = providerConnectorFactory(provider.providerType);
            await providerConnector.stopService(provider, service.name, service.serviceType);
            await this.serviceRepo.updateService(serviceId, {serviceStatus: 'stopped'});

            const updatedService = await this.serviceRepo.getServiceWithProvider(serviceId);
            res.json({success: true, data: updatedService, message: 'Service stopped successfully'});
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({success: false, error: 'Validation error', details: error.errors});
            } else {
                logger.error('Error stopping service:', error);
                const message = error instanceof Error ? error.message : String(error);
                res.status(500).json({success: false, error: 'Internal server error', details: message});
            }
        }
    };

    getServiceLogsHandler = async (req: Request, res: Response) => {
        try {
            const {serviceId} = ServiceIdSchema.parse({serviceId: req.params.serviceId});
            const service = await this.serviceRepo.getServiceById(serviceId);

            if (!service) {
                return res.status(404).json({success: false, error: 'Service not found'});
            }

            const provider = await this.providerRepo.getProviderById(service.providerId);
            if (!provider) {
                return res.status(404).json({success: false, error: 'Provider not found for this service'});
            }

            const providerConnector = providerConnectorFactory(provider.providerType);
            const logs = await providerConnector.getServiceLogs(provider, service);

            res.json({success: true, data: logs, message: 'Service logs retrieved successfully'});
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({success: false, error: 'Validation error', details: error.errors});
            } else {
                logger.error('Error getting logs:', error);
                const message = error instanceof Error ? error.message : String(error);
                res.status(500).json({success: false, error: 'Internal server error', details: message});
            }
        }
    };

    getServicePodsHandler = async (req: Request, res: Response) => {
        try {
            const {serviceId} = ServiceIdSchema.parse({serviceId: req.params.serviceId});
            const service = await this.serviceRepo.getServiceById(serviceId);

            if (!service) {
                return res.status(404).json({success: false, error: 'Service not found'});
            }

            const provider = await this.providerRepo.getProviderById(service.providerId);
            if (!provider) {
                return res.status(404).json({success: false, error: 'Provider not found for this service'});
            }

            const providerConnector = providerConnectorFactory(provider.providerType);
            const pods = await providerConnector.getServicePods(provider, service);

            res.json({success: true, data: pods, message: 'Service pods retrieved successfully'});
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({success: false, error: 'Validation error', details: error.errors});
            } else {
                logger.error('Error getting pods:', error);
                const message = error instanceof Error ? error.message : String(error);
                res.status(500).json({success: false, error: 'Internal server error', details: message});
            }
        }
    };
}
