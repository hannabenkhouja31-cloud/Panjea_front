export interface TripMember {
    user: {
        id: string;
        username: string;
        profilePictureUrl?: string;
    };
    status: string;
    joinedAt: string;
}

export interface PendingRequest {
    user: {
        id: string;
        username: string;
        profilePictureUrl?: string;
    };
    joinedAt: string;
}

export interface Organizer {
    id: string;
    username: string;
    profilePictureUrl?: string;
    isVerified?: boolean;
    city?: string;
    country?: string;
    description?: string;
    isDeleted?: boolean;
}