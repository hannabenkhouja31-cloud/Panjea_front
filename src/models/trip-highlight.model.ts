export interface TripHighlight {
  id: bigint;
  tripId: string;
  position: number;
  text: string;
}

export interface CreateTripHighlight {
  tripId: string;
  position: number;
  text: string;
}

export interface UpdateTripHighlight {
  position?: number;
  text?: string;
}