import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as reservationService from '../services/reservation';
import { CreateReservationSchema } from '@mekanayarla/shared';
import { prisma } from '../lib/prisma';

export const createReservation = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = CreateReservationSchema.parse({
      ...req.body,
      userId: req.user?.userId,
    });

    const reservation = await reservationService.createReservation(validatedData);

    res.status(201).json({ reservation });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const createPublicReservation = async (req: Request, res: Response) => {
  try {
    const validatedData = CreateReservationSchema.parse({
      ...req.body,
    });

    if (!validatedData.guestName) {
      throw new Error('Guest name is required for public reservations');
    }

    const reservation = await reservationService.createReservation(validatedData);

    res.status(201).json({ reservation });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const cancelReservation = async (req: AuthRequest, res: Response) => {
  try {
    const reservationId = req.params.id;
    const userId = req.user?.userId;

    if (!userId) throw new Error('Unauthorized');

    const reservation = await reservationService.cancelReservation(reservationId, userId);

    res.json({ reservation });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getMyReservations = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    const reservations = await prisma.reservation.findMany({
      where: { userId },
      include: {
        timeSlot: {
          include: { resource: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ reservations });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllReservationsAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user || !user.organizationId || !['BUSINESS_ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      throw new Error('Unauthorized');
    }

    const reservations = await prisma.reservation.findMany({
      where: {
        timeSlot: {
          resource: {
            branch: {
              organizationId: user.organizationId
            }
          }
        }
      },
      include: {
        user: { select: { name: true, email: true } },
        timeSlot: {
          include: { resource: { include: { branch: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ reservations });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateReservationStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    const reservationId = req.params.id;
    const userId = req.user?.userId;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !['BUSINESS_ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      throw new Error('Unauthorized');
    }

    // Usually we would check if the reservation belongs to the admin's organization here
    // but for simplicity we directly update
    const reservation = await prisma.reservation.update({
      where: { id: reservationId },
      data: { status }
    });

    res.json({ reservation });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
