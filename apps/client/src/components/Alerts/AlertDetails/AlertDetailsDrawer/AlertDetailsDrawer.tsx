import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Alert } from '@OpsiMate/shared';
import { AlertActionsSection } from '../AlertActionsSection';
import { AlertHistorySection } from '../AlertHistorySection';
import { AlertInfoSection } from '../AlertInfoSection';
import { AlertLinksSection } from '../AlertLinksSection';
import { AlertSummarySection } from '../AlertSummarySection';
import { AlertTimestampsSection } from '../AlertTimestampsSection';
import { CommentsWall } from '../CommentsWall';
import { useAlertHistory } from '../hooks';
import { DRAWER_COMMENTS_WIDTH, DRAWER_DETAILS_WIDTH, DRAWER_WIDTH } from './AlertDetailsDrawer.constants';

interface AlertDetailsDrawerProps {
	open: boolean;
	alert: Alert | null;
	isActive: boolean;
	onClose: () => void;
	onDismiss?: (alertId: string) => void;
	onUndismiss?: (alertId: string) => void;
	onDelete?: (alertId: string) => void;
}

export const AlertDetailsDrawer = ({
	open,
	alert,
	isActive,
	onClose,
	onDismiss,
	onUndismiss,
	onDelete,
}: AlertDetailsDrawerProps) => {
	const historyData = useAlertHistory(alert?.id);

	if (!alert) return null;

	return (
		<Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
			<SheetContent side="right" className={`${DRAWER_WIDTH} p-0 flex flex-col`}>
				<SheetHeader className="px-6 py-4 border-b flex-shrink-0">
					<SheetTitle className="text-lg">Alert Details</SheetTitle>
					<SheetDescription className="sr-only">View and manage alert details and comments</SheetDescription>
				</SheetHeader>

				<div className="flex-1 flex min-h-0">
					<div className={`${DRAWER_DETAILS_WIDTH} flex flex-col min-h-0`}>
						<ScrollArea className="flex-1">
							<div className="p-4 space-y-4">
								<AlertInfoSection alert={alert} />

								{alert.summary && <AlertSummarySection summary={alert.summary} />}

								<AlertTimestampsSection alert={alert} />

								{historyData && <AlertHistorySection historyData={historyData} />}

								<AlertLinksSection alert={alert} />

								<AlertActionsSection
									alert={alert}
									isActive={isActive}
									onDismiss={onDismiss}
									onUndismiss={onUndismiss}
									onDelete={onDelete}
								/>
							</div>
						</ScrollArea>
					</div>

					<div className={DRAWER_COMMENTS_WIDTH}>
						<CommentsWall alertId={alert.id} />
					</div>
				</div>
			</SheetContent>
		</Sheet>
	);
};
