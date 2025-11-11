export interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    reportReason: string;
    reportDescription: string;
    isSending: boolean;
    onReasonChange: (value: string) => void;
    onDescriptionChange: (value: string) => void;
    onSubmit: () => void;
}

export interface UserProfileHeaderProps {
    profile: any;
    userId: string;
    currentUserId?: string;
    hasReported: boolean;
    reportStatus: 'PENDING' | 'RESOLVED' | 'DISMISSED' | null;
    onOpenReport: () => void;
}