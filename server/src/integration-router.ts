import express from 'express';

const router = express.Router();

// POST /api/v1/integration
router.post('/integration', (req: express.Request, res: express.Response) => {
  res.send('ok');
});

export default router;
