export type TripMemberStatus = 'interested' | 'applied' | 'accepted' | 'declined' | 'waitlist';

export interface TripMember {
  tripId: string;
  userId: string;
  status: TripMemberStatus;
  joinedAt: Date;
}

export interface CreateTripMember {
  tripId: string;
  userId: string;
  status: TripMemberStatus;
}

export interface UpdateTripMember {
  status: TripMemberStatus;
}