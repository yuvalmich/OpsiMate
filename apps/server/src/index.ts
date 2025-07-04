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
import { initTagsTables } from './dal/tagRepository';

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

// BL
const providerBL = new ProviderBL(providerRepo, serviceRepo)

// Controllers
const providerController = new ProviderController(providerBL)
const serviceController = new ServiceController(providerRepo, serviceRepo) // todo: change to work with BL layer
const viewController = new ViewController(new ViewBL(viewRepo))

// API routes
app.use('/', healthRouter);
app.use('/api/v1', createV1Router(providerController, serviceController, viewController));

// Initialize database tables
// todo: move it from here.
providerRepo.initProvidersTable()
  .then(() => {
    console.log('Providers table initialized');
  })
  .catch(err => {
    console.error('Failed to initialize providers table:', err);
  });

serviceRepo.initServicesTable()
  .then(() => {
    console.log('Services table initialized');
  })
  .catch(err => {
    console.error('Failed to initialize services table:', err);
  });

viewRepo.initViewsTable()
  .then(() => {
    console.log('Views tables initialized');
  })
  .catch(err => {
    console.error('Failed to initialize views tables:', err);
  });

initTagsTables()
    .then(() => {
        console.log('Tags tables initialized');
    })
    .catch(err => {
        console.error('Failed to initialize tags tables:', err);
    });


// this job refreshes the services status periodically.
(new RefreshJob(providerBL, serviceRepo)).startRefreshJob()

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
