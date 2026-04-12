"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateReservationStatusSchema = exports.CreateReservationSchema = void 0;
const zod_1 = require("zod");
exports.CreateReservationSchema = zod_1.z.object({
    timeSlotId: zod_1.z.string(),
    userId: zod_1.z.string(),
    notes: zod_1.z.string().optional(),
    metadata: zod_1.z.record(zod_1.z.any()).optional(),
});
exports.UpdateReservationStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'ATTENDED', 'NOSHOW']),
});
