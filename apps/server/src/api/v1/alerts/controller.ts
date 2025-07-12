import { Request, Response } from "express";
import { Logger } from "@service-peek/shared";
import { AlertBL } from "../../../bl/alerts/alert.bl";

const logger: Logger = new Logger('server');

export class AlertController {
    constructor(private alertBL: AlertBL) {}

    async getAlerts(req: Request, res: Response) {
        try {
            const alerts = await this.alertBL.getAllAlerts();
            res.json({ success: true, data: { alerts } });
        } catch (error) {
            logger.error('Error getting alerts:', error);
            res.status(500).json({ success: false, error: 'Internal server error' });
        }
    }
} 