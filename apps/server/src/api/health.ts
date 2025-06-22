import { Router } from 'express';
import * as healthService from '../bl/healthService';

const router = Router();

router.get('/health', healthService.healthCheck);

export default router; 