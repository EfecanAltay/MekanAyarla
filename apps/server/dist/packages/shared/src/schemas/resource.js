"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeSlotSchema = exports.ResourceSchema = exports.ResourceTypeSchema = void 0;
const zod_1 = require("zod");
exports.ResourceTypeSchema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    description: zod_1.z.string().optional(),
    config: zod_1.z.record(zod_1.z.any()).optional(),
});
exports.ResourceSchema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    typeId: zod_1.z.string(),
    description: zod_1.z.string().optional(),
    capacity: zod_1.z.number().int().min(1),
    availableDate: zod_1.z.string().optional(),
    startTime: zod_1.z.string().optional(),
    endTime: zod_1.z.string().optional(),
    slotDuration: zod_1.z.number().int().positive().optional(),
    active: zod_1.z.boolean().default(true),
    branchId: zod_1.z.string(),
});
exports.TimeSlotSchema = zod_1.z.object({
    resourceId: zod_1.z.string(),
    startTime: zod_1.z.string().datetime(),
    endTime: zod_1.z.string().datetime(),
    capacity: zod_1.z.number().int().min(1).optional(), // Override default resource capacity
});
