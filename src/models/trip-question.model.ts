export interface TripQuestion {
  id: number;
  tripId: string;
  authorId: string;
  message: string;
  createdAt: Date;
}

export interface CreateTripQuestion {
  tripId: string;
  authorId: string;
  message: string;
}