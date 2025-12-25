export interface AlertComment {
	id: string;
	alertId: string;
	userId: string;
	comment: string;
	createdAt: string;
	updatedAt: string;
}

export interface AlertCommentWithUser extends AlertComment {
	userFullName?: string;
	userEmail?: string;
}
