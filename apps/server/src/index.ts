import express from 'express';
import cors from 'cors';
import healthRouter from './api/health';
import v1Router from './api/v1/v1';
import { customViewService } from './bl/custom-views/custom-view.bl';
import { initServicesTable } from './dal/serviceRepository';
import { startRefreshJob } from "./jobs/refresh-job";

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

// API routes
app.use('/', healthRouter);
app.use('/api/v1', v1Router);

// Initialize database tables
initProvidersTable()
  .then(() => {
    console.log('Providers table initialized');
  })
  .catch(err => {
    console.error('Failed to initialize providers table:', err);
  });

initServicesTable()
  .then(() => {
    console.log('Services table initialized');
  })
  .catch(err => {
    console.error('Failed to initialize services table:', err);
  });

customViewService.initViewsTables()
  .then(() => {
    console.log('Views tables initialized');
  })
  .catch(err => {
    console.error('Failed to initialize views tables:', err);
  });

// this job refreshes the services status periodically.
startRefreshJob()

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
