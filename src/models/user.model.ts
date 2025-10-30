import type { LanguageCode } from "./language.model";

export const BUDGET_LEVELS = {
  ECONOMIQUE: 1,
  MOYEN: 2,
  LUXE: 3
} as const;

export type BudgetLevel = typeof BUDGET_LEVELS[keyof typeof BUDGET_LEVELS];

export interface User {
  id: string;
  username: string;
  city?: string;
  country?: string;
  languages: LanguageCode[];
  tripsCount: number;
  description?: string;
  budgetLevel?: number;
  profilePictureUrl?: string;
  isVerified: boolean;
  createdAt: Date;
}

export interface CreateUser {
  id: string;
  username: string;
  city?: string;
  country?: string;
  languages?: LanguageCode[];
  description?: string;
  budgetLevel?: number;
  profilePictureUrl?: string;
}

export interface UpdateUser {
  username?: string;
  city?: string;
  country?: string;
  languages?: LanguageCode[];
  description?: string;
  budgetLevel?: number;
  profilePictureUrl?: string;
}