import { z } from 'zod';

export const ResourceTypeSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  config: z.record(z.any()).optional(),
});

export const ResourceSchema = z.object({
  name: z.string().min(2),
  typeId: z.string(),
  description: z.string().optional(),
  capacity: z.number().int().min(1),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  slotDuration: z.number().int().positive().optional(),
  active: z.boolean().default(true),
  branchId: z.string(),
  offDays: z.array(z.number()).optional(),
  offHours: z.array(z.string()).optional(),
});

export const TimeSlotSchema = z.object({
  resourceId: z.string(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  capacity: z.number().int().min(1).optional(), // Override default resource capacity
});

export type CreateTimeSlotInput = z.infer<typeof TimeSlotSchema>;
export type CreateResourceInput = z.infer<typeof ResourceSchema>;

export const ToggleSlotSchema = z.object({
  startTime: z.string().datetime().optional(), // Now accepted for virtual slots
  endTime: z.string().datetime().optional(),
  isAvailable: z.boolean(),
  note: z.string().optional(),
});
export type ToggleSlotInput = z.infer<typeof ToggleSlotSchema>;

export const BatchToggleSlotSchema = z.object({
  slots: z.array(z.object({
    id: z.string(),
    startTime: z.string().datetime().optional(),
    endTime: z.string().datetime().optional(),
  })),
  isAvailable: z.boolean(),
  note: z.string().optional(),
});
export type BatchToggleSlotInput = z.infer<typeof BatchToggleSlotSchema>;

