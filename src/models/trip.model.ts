import type { TripMedia } from './trip-media.model';

export interface DateRange {
  start: string;
  end: string;
}

export interface Trip {
  id: string;
  title: string;
  destinationCountry: string;
  summary?: string;
  monthYear: DateRange;
  minDays: number;
  maxDays: number;
  budgetEur?: number;
  minAge?: number;
  maxAge?: number;
  organizerId: string;
  createdAt: Date;
  media?: TripMedia[];
}

export interface CreateTrip {
  title: string;
  destinationCountry: string;
  summary?: string;
  monthYear: DateRange;
  minDays: number;
  maxDays: number;
  budgetEur?: number;
  minAge?: number;
  maxAge?: number;
  organizerId: string;
  temporaryMediaIds?: string[];
}

export interface UpdateTrip {
  title?: string;
  destinationCountry?: string;
  summary?: string;
  monthYear?: DateRange;
  minDays?: number;
  maxDays?: number;
  budgetEur?: number;
  minAge?: number;
  maxAge?: number;
}