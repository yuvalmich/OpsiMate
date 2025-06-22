import express from 'express';
import cors from 'cors';
import integrationRouter from './api/integration';
import healthRouter from './api/health';

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
app.use('/api/v1', integrationRouter);
app.use('/', healthRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
