import express from 'express';
import cors from 'cors';
import healthRouter from './api/health';
import {ViewBL} from './bl/custom-views/custom-view.bl';
import { ServiceRepository} from './dal/serviceRepository';
import {initializeDb} from "./dal/db";
import createV1Router from "./api/v1/v1";
import {ProviderController} from "./api/v1/providers/controller";
import {ProviderBL} from "./bl/providers/provider.bl";
import {ProviderRepository} from "./dal/providerRepository";
import {ServiceController} from "./api/v1/services/controller";
import {ViewController} from "./api/v1/views/controller";
import {ViewRepository} from "./dal/viewRepository";
import {RefreshJob} from "./jobs/refresh-job";
import {TagRepository} from './dal/tagRepository';
import {TagController} from "./api/v1/tags/controller";
import {IntegrationController} from "./api/v1/integrations/controller";
import {IntegrationRepository} from "./dal/integrationRepository";
import {IntegrationBL} from "./bl/integrations/integration.bl";
import {Logger} from "@service-peek/shared";

const logger: Logger = new Logger('server');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Enable CORS for all routes
app.use(cors({
  origin: 'http://localhost:8080', // Allow requests from the client
  credentials: true, // Allow credentials (cookies, etc.)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

const dbInstance = initializeDb()

// Repositories
const providerRepo = new ProviderRepository(dbInstance)
const serviceRepo = new ServiceRepository(dbInstance)
const viewRepo = new ViewRepository(dbInstance)
const tagRepo = new TagRepository(dbInstance)
const integrationRepo = new IntegrationRepository(dbInstance)

// BL
const providerBL = new ProviderBL(providerRepo, serviceRepo)
const integrationBL = new IntegrationBL(integrationRepo)

// Controllers
const providerController = new ProviderController(providerBL)
const serviceController = new ServiceController(providerRepo, serviceRepo) // todo: change to work with BL layer
const viewController = new ViewController(new ViewBL(viewRepo))
const tagController = new TagController(tagRepo, serviceRepo)
const integrationController = new IntegrationController(integrationBL)

// API routes
app.use('/', healthRouter);
app.use('/api/v1', createV1Router(providerController, serviceController, viewController, tagController, integrationController));

// Initialize database tables
// todo: move it from here.
providerRepo.initProvidersTable()
  .then(() => {
    logger.info('Providers table initialized');
  })
  .catch(err => {
    logger.error('Failed to initialize providers table:', err);
  });

serviceRepo.initServicesTable()
  .then(() => {
    logger.info('Services table initialized');
  })
  .catch(err => {
    logger.error('Failed to initialize services table:', err);
  });

viewRepo.initViewsTable()
  .then(() => {
    logger.info('Views tables initialized');
  })
  .catch(err => {
    logger.error('Failed to initialize views tables:', err);
  });

tagRepo.initTagsTables()
    .then(() => {
        logger.info('Tags tables initialized');
    })
    .catch(err => {
        logger.error('Failed to initialize tags tables:', err);
    });

integrationRepo.initIntegrationsTable()
    .then(() => {
        logger.info('Tags tables initialized');
    })
    .catch(err => {
        logger.error('Failed to initialize tags tables:', err);
    });

// this job refreshes the services status periodically.
(new RefreshJob(providerBL, serviceRepo)).startRefreshJob()

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
