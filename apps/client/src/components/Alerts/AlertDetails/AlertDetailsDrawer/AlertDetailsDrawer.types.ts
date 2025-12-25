import { Alert } from '@OpsiMate/shared';

export interface AlertDetailsDrawerProps {
	open: boolean;
	alert: Alert | null;
	isActive: boolean;
	onClose: () => void;
	onDismiss?: (alertId: string) => void;
	onUndismiss?: (alertId: string) => void;
	onDelete?: (alertId: string) => void;
}
