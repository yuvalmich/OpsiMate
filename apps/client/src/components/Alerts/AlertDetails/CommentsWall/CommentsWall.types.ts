import { AlertComment } from '@/hooks/queries/alertComments';

export interface CommentsWallProps {
	alertId: string;
}

export interface CommentItemProps {
	comment: AlertComment;
	currentUserId: string | number;
	userMap: Map<string, { fullName: string; email: string }>;
	onEdit: (commentId: string, newText: string) => void;
	onDelete: (commentId: string) => void;
	isDeleting: boolean;
	isUpdating: boolean;
}

export interface CommentInputProps {
	value: string;
	onChange: (value: string) => void;
	onSubmit: () => void;
	isSubmitting: boolean;
	placeholder?: string;
}
