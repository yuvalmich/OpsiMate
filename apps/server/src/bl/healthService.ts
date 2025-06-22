import { Request, Response } from 'express';

export async function healthCheck(req: Request, res: Response) {
  // TODO: Implement health check logic
  res.send('ok');
} 