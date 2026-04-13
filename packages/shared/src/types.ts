export const UserRole = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  BUSINESS_ADMIN: 'BUSINESS_ADMIN',
  STAFF: 'STAFF',
  CUSTOMER: 'CUSTOMER',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const ReservationStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  ATTENDED: 'ATTENDED',
  NOSHOW: 'NOSHOW',
} as const;
export type ReservationStatus = (typeof ReservationStatus)[keyof typeof ReservationStatus];

export const WaitlistStatus = {
  WAITING: 'WAITING',
  PROMOTED: 'PROMOTED',
  CANCELLED: 'CANCELLED',
} as const;
export type WaitlistStatus = (typeof WaitlistStatus)[keyof typeof WaitlistStatus];

export const ResourceCategory = {
  LESSON: 'lesson',
  THEATER: 'theater',
  DRIVING: 'driving',
  ONLINE: 'online',
  CAFE: 'cafe',
  TABLE: 'table',
  ROOM: 'room',
  GYM: 'gym',
  TRANSPORT: 'transport',
  OTHER: 'other',
} as const;
export type ResourceCategory = (typeof ResourceCategory)[keyof typeof ResourceCategory];

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organizationId?: string;
  organizationName?: string;
}

export interface BusinessConfig {
  allowWaitlist: boolean;
  autoConfirm: boolean;
  maxBookingsPerUserPerDay: number;
  cancellationDeadlineHours: number;
}
