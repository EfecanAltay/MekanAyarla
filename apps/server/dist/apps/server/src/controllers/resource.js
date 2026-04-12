"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTimeSlots = exports.deleteResource = exports.updateResource = exports.createResource = exports.getResourceDetails = exports.getResources = void 0;
const prisma_1 = require("../lib/prisma");
const shared_1 = require("@remotely/shared");
const getResources = async (req, res) => {
    try {
        const { organizationId } = req.query;
        const resources = await prisma_1.prisma.resource.findMany({
            where: organizationId ? { branch: { organizationId: String(organizationId) } } : {},
            include: {
                type: true,
                branch: true,
            },
        });
        res.json({ resources });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.getResources = getResources;
const getResourceDetails = async (req, res) => {
    try {
        const resource = await prisma_1.prisma.resource.findUnique({
            where: { id: req.params.id },
            include: {
                type: true,
                slots: {
                    where: { startTime: { gte: new Date() } },
                    include: {
                        _count: {
                            select: { reservations: { where: { status: 'CONFIRMED' } } },
                        },
                    },
                    orderBy: { startTime: 'asc' },
                },
            },
        });
        if (!resource)
            throw new Error('Resource not found');
        res.json({ resource });
    }
    catch (error) {
        res.status(404).json({ message: error.message });
    }
};
exports.getResourceDetails = getResourceDetails;
const createResource = async (req, res) => {
    try {
        const validatedData = shared_1.ResourceSchema.parse(req.body);
        const availableDateInfo = validatedData.availableDate ? new Date(validatedData.availableDate) : undefined;
        const resource = await prisma_1.prisma.resource.create({
            data: {
                ...validatedData,
                availableDate: availableDateInfo
            },
        });
        // Auto-generate slots
        if (availableDateInfo && validatedData.startTime && validatedData.endTime) {
            const slotDuration = validatedData.slotDuration || 60;
            const [startH, startM] = validatedData.startTime.split(':').map(Number);
            const [endH, endM] = validatedData.endTime.split(':').map(Number);
            let currentSlotTime = new Date(availableDateInfo);
            currentSlotTime.setHours(startH, startM, 0, 0);
            const endSlotTime = new Date(availableDateInfo);
            endSlotTime.setHours(endH, endM, 0, 0);
            const slotsToCreate = [];
            while (currentSlotTime < endSlotTime) {
                const nextSlotTime = new Date(currentSlotTime.getTime() + slotDuration * 60000);
                if (nextSlotTime > endSlotTime)
                    break;
                slotsToCreate.push({
                    resourceId: resource.id,
                    startTime: new Date(currentSlotTime),
                    endTime: new Date(nextSlotTime),
                    capacity: resource.capacity
                });
                currentSlotTime = nextSlotTime;
            }
            if (slotsToCreate.length > 0) {
                await prisma_1.prisma.timeSlot.createMany({
                    data: slotsToCreate
                });
            }
        }
        res.status(201).json({ resource });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.createResource = createResource;
const updateResource = async (req, res) => {
    try {
        const resourceId = req.params.id;
        const validatedData = shared_1.ResourceSchema.parse(req.body);
        const availableDateInfo = validatedData.availableDate ? new Date(validatedData.availableDate) : undefined;
        const resource = await prisma_1.prisma.resource.update({
            where: { id: resourceId },
            data: {
                ...validatedData,
                availableDate: availableDateInfo
            },
        });
        res.json({ resource });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.updateResource = updateResource;
const deleteResource = async (req, res) => {
    try {
        const resourceId = req.params.id;
        const slotCount = await prisma_1.prisma.timeSlot.count({ where: { resourceId } });
        if (slotCount > 0) {
            throw new Error(`Cannot delete: This resource has ${slotCount} time slot(s) attached.`);
        }
        await prisma_1.prisma.resource.delete({
            where: { id: resourceId },
        });
        res.json({ message: 'Resource deleted successfully' });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.deleteResource = deleteResource;
const createTimeSlots = async (req, res) => {
    try {
        const validatedData = shared_1.TimeSlotSchema.parse(req.body);
        const slot = await prisma_1.prisma.timeSlot.create({
            data: {
                ...validatedData,
            },
        });
        res.status(201).json({ slot });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.createTimeSlots = createTimeSlots;
