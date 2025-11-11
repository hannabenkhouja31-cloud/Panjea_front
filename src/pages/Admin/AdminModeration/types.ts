export interface Report {
    id: string;
    reportedUser: {
        id: string;
        username: string;
        reportedCount: number;
        isBanned: boolean;
        bannedReason?: string;
        bannedAt?: string;
        bannedUntil?: string;
        uniqueReportersCount: number;
    };
    reporterUser: {
        id: string;
        username: string;
    };
    reason: string;
    description: string;
    status: string;
    actionTaken?: string;
    banDuration?: number;
    createdAt: string;
}

export interface AdminStats {
    pendingCount: number;
    resolvedCount: number;
    bannedUsersCount: number;
    totalReportsCount: number;
}