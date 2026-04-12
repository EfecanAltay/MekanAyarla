export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  BUSINESS_ADMIN = 'BUSINESS_ADMIN',
  STAFF = 'STAFF',
  CUSTOMER = 'CUSTOMER',
}

export enum ReservationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  ATTENDED = 'ATTENDED',
  NOSHOW = 'NOSHOW',
}

export enum WaitlistStatus {
  WAITING = 'WAITING',
  PROMOTED = 'PROMOTED',
  CANCELLED = 'CANCELLED',
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organizationId?: string;
}

export interface BusinessConfig {
  allowWaitlist: boolean;
  autoConfirm: boolean;
  maxBookingsPerUserPerDay: number;
  cancellationDeadlineHours: number;
}
