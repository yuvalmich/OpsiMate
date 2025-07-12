import { AlertRepository } from "../../dal/alertRepository";
import { AlertRow } from "../../dal/models";
import {Alert, Logger} from "@service-peek/shared";

const logger = new Logger('bl/alert.bl');

export class AlertBL {
    constructor(private alertRepo: AlertRepository) {}

    async insertOrUpdateAlert(alert: Omit<AlertRow, 'created_at' | 'is_dismissed'>): Promise<{ changes: number }> {
        try {
            logger.info(`Inserting alert: ${JSON.stringify(alert)}`);
            return await this.alertRepo.insertOrUpdateAlert(alert);
        } catch (error) {
            logger.error("Error inserting alert", error);
            throw error;
        }
    }

    async deleteAlertsNotInIds(ids: string[]): Promise<{ changes: number }> {
        try {
            logger.info(`deleting all alerts except of: ${JSON.stringify(ids)}`);
            return await this.alertRepo.deleteAlertsNotInIds(ids);
        } catch (error) {
            logger.error("Error deleting alerts", error);
            throw error;
        }
    }

    async getAllAlerts(): Promise<Alert[]> {
        try {
            logger.info('Fetching all alerts');
            return await this.alertRepo.getAllAlerts();
        } catch (error) {
            logger.error('Error fetching alerts', error);
            throw error;
        }
    }
}