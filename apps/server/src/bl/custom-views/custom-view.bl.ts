import { AuditActionType, AuditResourceType, View, User } from '@OpsiMate/shared';
import { ViewRepository } from '../../dal/viewRepository';
import { AuditBL } from '../audit/audit.bl';

export class ViewBL {
	constructor(
		private viewRepository: ViewRepository,
		private auditBL: AuditBL
	) {}

	async getAllViews(): Promise<View[]> {
		return await this.viewRepository.getAllViews();
	}

	async getViewById(id: string): Promise<View | null> {
		return await this.viewRepository.getViewById(id);
	}

	async createView(view: Omit<View, 'createdAt' | 'id'>, user: User): Promise<number> {
		const viewId = await this.viewRepository.createView(view);

		await this.auditBL.logAction({
			actionType: AuditActionType.CREATE,
			resourceType: AuditResourceType.VIEW,
			resourceId: viewId.toString(),
			userId: user.id,
			userName: user.fullName,
			resourceName: view.name,
		});

		return viewId;
	}

	async deleteView(id: string): Promise<boolean> {
		const existingView = await this.viewRepository.getViewById(id);
		if (!existingView) {
			return false;
		}

		return await this.viewRepository.deleteView(id);
	}
}
