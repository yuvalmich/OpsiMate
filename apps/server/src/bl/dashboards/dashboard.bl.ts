import { AuditActionType, AuditResourceType, Dashboard, User } from '@OpsiMate/shared';
import { DashboardRepository } from '../../dal/dashboardRepository.ts';
import { AuditBL } from '../audit/audit.bl';

export class DashboardBL {
	constructor(
		private dashboardRepository: DashboardRepository,
		private auditBL: AuditBL
	) {}

	async getAllDashboards(): Promise<Dashboard[]> {
		return await this.dashboardRepository.getAllDashboards();
	}

	async createDashboard(dashboard: Omit<Dashboard, 'createdAt' | 'id'>, user: User): Promise<number> {
		const dasboardId = await this.dashboardRepository.createDashboard(dashboard);

		await this.auditBL.logAction({
			actionType: AuditActionType.CREATE,
			resourceType: AuditResourceType.DASHBOARD,
			resourceId: dasboardId.toString(),
			userId: user.id,
			userName: user.fullName,
			resourceName: dashboard.name,
		});

		return dasboardId;
	}

	async deleteDashboard(id: string): Promise<boolean> {
		const existingDashboard = await this.dashboardRepository.getDashboardById(id);
		if (!existingDashboard) {
			return false;
		}

		return await this.dashboardRepository.deleteDashboard(id);
	}

	async updateDashboard(dashboardId: string, createDashboardRequest: any, user: User) {

	}
}
