import {Request, Response, Router} from 'express';

const router = Router();


function healthCheck(req: Request, res: Response) {
    res.send('ok');
}

router.get('/health', healthCheck);

export default router;
