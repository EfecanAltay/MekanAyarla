import { z } from 'zod';

export const CreateReservationSchema = z.object({
  timeSlotId: z.string(),
  userId: z.string().optional(),
  guestName: z.string().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export const UpdateReservationStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'ATTENDED', 'NOSHOW']),
});

export type CreateReservationInput = z.infer<typeof CreateReservationSchema>;
export type UpdateReservationStatusInput = z.infer<typeof UpdateReservationStatusSchema>;
