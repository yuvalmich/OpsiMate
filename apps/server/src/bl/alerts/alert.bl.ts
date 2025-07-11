import { AlertRepository } from "../../dal/alertRepository";
import { AlertRow } from "../../dal/models";
import { Logger } from "@service-peek/shared";

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
}