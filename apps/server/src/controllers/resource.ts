import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { ResourceSchema, TimeSlotSchema, ToggleSlotSchema, BatchToggleSlotSchema } from '@remotely/shared';

export const getResources = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.query;

    const resources = await prisma.resource.findMany({
      where: organizationId ? { branch: { organizationId: String(organizationId) } } : {},
      include: {
        type: true,
        branch: true,
      },
    });

    res.json({ resources });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getResourceDetails = async (req: Request, res: Response) => {
  try {
    const resource = await prisma.resource.findUnique({
      where: { id: req.params.id },
      include: {
        type: true,
        slots: {
          include: {
            _count: {
              select: { reservations: { where: { status: 'CONFIRMED' } } },
            },
          },
          orderBy: { startTime: 'asc' },
        },
      },
    });

    if (!resource) throw new Error('Resource not found');

    res.json({ resource });
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
};

export const createResource = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = ResourceSchema.parse(req.body);
    const startDateInfo = validatedData.startDate ? new Date(validatedData.startDate) : undefined;
    const endDateInfo = validatedData.endDate ? new Date(validatedData.endDate) : undefined;

    const resource = await prisma.resource.create({
      data: {
        ...validatedData,
        startDate: startDateInfo,
        endDate: endDateInfo
      },
    });

    // Removed auto generation of mass virtual slots. 
    // The client generates virtual slots to preserve database space.
    // We only save actual explicit exceptions (Reservations, Manually closed slots).

    res.status(201).json({ resource });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateResource = async (req: AuthRequest, res: Response) => {
  try {
    const resourceId = req.params.id;
    const validatedData = ResourceSchema.parse(req.body);
    const startDateInfo = validatedData.startDate ? new Date(validatedData.startDate) : undefined;
    const endDateInfo = validatedData.endDate ? new Date(validatedData.endDate) : undefined;

    const resource = await prisma.resource.update({
      where: { id: resourceId },
      data: {
        ...validatedData,
        startDate: startDateInfo,
        endDate: endDateInfo
      },
    });

    res.json({ resource });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteResource = async (req: AuthRequest, res: Response) => {
  try {
    const resourceId = req.params.id;

    const slotCount = await prisma.timeSlot.count({ where: { resourceId } });
    if (slotCount > 0) {
      throw new Error(`Cannot delete: This resource has ${slotCount} time slot(s) attached.`);
    }

    await prisma.resource.delete({
      where: { id: resourceId },
    });

    res.json({ message: 'Resource deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const createTimeSlots = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = TimeSlotSchema.parse(req.body);

    const slot = await prisma.timeSlot.create({
      data: {
        ...validatedData,
      },
    });

    res.status(201).json({ slot });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateSlotStatus = async (req: AuthRequest, res: Response) => {
  try {
    const resourceId = req.params.id;
    const slotId = req.params.slotId;
    const { isAvailable, note, startTime, endTime } = ToggleSlotSchema.parse(req.body);

    let slot;
    if (slotId && slotId.length === 36 && slotId !== 'virtual') {
      slot = await prisma.timeSlot.update({
        where: { id: slotId },
        data: { isAvailable, note }
      });
    } else {
      if (!startTime || !endTime) throw new Error("Missing times for virtual slot");

      const existing = await prisma.timeSlot.findFirst({
        where: { resourceId, startTime: new Date(startTime) }
      });

      if (existing) {
        slot = await prisma.timeSlot.update({
          where: { id: existing.id },
          data: { isAvailable, note }
        });
      } else {
        const resource = await prisma.resource.findUnique({ where: { id: resourceId } });
        slot = await prisma.timeSlot.create({
          data: {
            resourceId,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            capacity: resource?.capacity || 1,
            isAvailable,
            note
          }
        });
      }
    }

    res.json({ slot });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateDateStatus = async (req: AuthRequest, res: Response) => {
  try {
    const resourceId = req.params.id;
    const dateStr = req.params.dateStr; // format: YYYY-MM-DD
    const { isAvailable, note } = ToggleSlotSchema.parse(req.body);

    const targetDate = new Date(dateStr);
    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);

    const resource = await prisma.resource.findUnique({ where: { id: resourceId } });
    if (!resource) throw new Error("Resource not found");

    const existingSlots = await prisma.timeSlot.findMany({
      where: {
        resourceId,
        startTime: {
          gte: targetDate,
          lt: nextDate
        }
      }
    });

    const slotDuration = resource.slotDuration || 60;
    const [startH, startM] = (resource.startTime || "09:00").split(':').map(Number);
    const [endH, endM] = (resource.endTime || "18:00").split(':').map(Number);

    let currentSlotTime = new Date(targetDate);
    currentSlotTime.setHours(startH, startM, 0, 0);

    const endSlotTime = new Date(targetDate);
    endSlotTime.setHours(endH, endM, 0, 0);

    const operations = [];

    while (currentSlotTime < endSlotTime) {
      const nextSlotTime = new Date(currentSlotTime.getTime() + slotDuration * 60000);
      if (nextSlotTime > endSlotTime) break;

      const exist = existingSlots.find(s => s.startTime.getTime() === currentSlotTime.getTime());

      if (exist) {
        operations.push(prisma.timeSlot.update({
          where: { id: exist.id },
          data: { isAvailable, note }
        }));
      } else {
        operations.push(prisma.timeSlot.create({
          data: {
            resourceId,
            startTime: new Date(currentSlotTime),
            endTime: new Date(nextSlotTime),
            capacity: resource.capacity,
            isAvailable,
            note
          }
        }));
      }
      currentSlotTime = nextSlotTime;
    }

    await prisma.$transaction(operations);

    res.json({ message: `Updated ${operations.length} slots for date ${dateStr}` });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const batchToggleSlots = async (req: AuthRequest, res: Response) => {
  try {
    const resourceId = req.params.id;
    const { slots, isAvailable, note } = BatchToggleSlotSchema.parse(req.body);

    const resource = await prisma.resource.findUnique({ where: { id: resourceId } });
    if (!resource) throw new Error("Resource not found");

    const operations = [];

    for (const s of slots) {
      if (s.id && s.id.length === 36 && s.id !== 'virtual') {
        operations.push(prisma.timeSlot.update({
          where: { id: s.id },
          data: { isAvailable, note }
        }));
      } else {
        if (!s.startTime || !s.endTime) continue;

        const startTimeDate = new Date(s.startTime);
        
        // Check if DB slot exists by time
        const existing = await prisma.timeSlot.findFirst({
          where: { resourceId, startTime: startTimeDate }
        });

        if (existing) {
          operations.push(prisma.timeSlot.update({
            where: { id: existing.id },
            data: { isAvailable, note }
          }));
        } else {
          operations.push(prisma.timeSlot.create({
            data: {
              resourceId,
              startTime: startTimeDate,
              endTime: new Date(s.endTime),
              capacity: resource.capacity,
              isAvailable,
              note
            }
          }));
        }
      }
    }

    if (operations.length > 0) {
      await prisma.$transaction(operations);
    }

    res.json({ message: `Successfully updated ${operations.length} slots` });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
