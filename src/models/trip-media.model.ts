export interface TripMedia {
  id: bigint;
  tripId: string;
  url: string;
  position: number;
}

export interface CreateTripMedia {
  tripId: string;
  url: string;
  position?: number;
}

export interface UpdateTripMedia {
  url?: string;
  position?: number;
}

export interface TemporaryTripMedia {
  id: string;
  userId: string;
  url: string;
  uploadedAt: string;
}