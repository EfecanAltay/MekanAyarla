import { prisma } from '../lib/prisma';
import { CreateReservationInput, ReservationStatus } from '@mekanayarla/shared';

/**
 * Creates a reservation ensuring that capacity limits are respected.
 * Uses a database transaction to prevent overbooking from concurrent requests.
 */
export const createReservation = async (input: CreateReservationInput) => {
  return prisma.$transaction(async (tx) => {
    // 1. Lock the time slot for update to prevent concurrent reservation counts from being stale
    // We use a raw query because Prisma's interactive transactions don't natively support FOR UPDATE on a findUnique easily without raw.
    // However, we can also use a 'count' check followed by 'create' in a REPEATABLE READ transaction.
    // For maximum safety, we'll use a raw query to lock the slot row.

    await tx.$executeRaw`SELECT id FROM "TimeSlot" WHERE id = ${input.timeSlotId} FOR UPDATE`;

    // 2. Clear stale reservations (optional but good for consistency)
    // 3. Fetch slot and its current reservation count
    const slot = await tx.timeSlot.findUnique({
      where: { id: input.timeSlotId },
      include: {
        resource: true,
        _count: {
          select: {
            reservations: {
              where: { status: { in: [ReservationStatus.CONFIRMED, ReservationStatus.PENDING] } },
            },
          },
        },
      },
    });

    if (!slot) {
      throw new Error('Time slot not found');
    }

    const effectiveCapacity = slot.capacity ?? slot.resource.capacity;
    const currentCount = slot._count.reservations;

    // 4. Check capacity
    if (currentCount >= effectiveCapacity) {
      // Logic for waitlist could go here if enabled
      throw new Error('Slot is full');
    }

    // 5. Create reservation
    return tx.reservation.create({
      data: {
        userId: input.userId,
        timeSlotId: input.timeSlotId,
        notes: input.notes,
        metadata: input.metadata,
        status: (slot.resource as any).requiresApproval
          ? ReservationStatus.PENDING
          : ReservationStatus.CONFIRMED,
      },
    });
  });
};

export const cancelReservation = async (reservationId: string, userId: string) => {
  // Logic for cancellation deadlines and waitlist promotion
  return prisma.$transaction(async (tx) => {
    const reservation = await tx.reservation.findUnique({
      where: { id: reservationId },
      include: { timeSlot: true },
    });

    if (!reservation) throw new Error('Reservation not found');
    if (reservation.userId !== userId) throw new Error('Unauthorized');

    const updated = await tx.reservation.update({
      where: { id: reservationId },
      data: { status: ReservationStatus.CANCELLED },
    });

    // Check waitlist and promote if necessary
    const nextOnWaitlist = await tx.waitlist.findFirst({
      where: { timeSlotId: reservation.timeSlotId, status: 'WAITING' },
      orderBy: { position: 'asc' },
    });

    if (nextOnWaitlist) {
      // Promote waitlist user
      await tx.reservation.create({
        data: {
          userId: nextOnWaitlist.userId,
          timeSlotId: reservation.timeSlotId,
          status: ReservationStatus.CONFIRMED,
        },
      });

      await tx.waitlist.update({
        where: { id: nextOnWaitlist.id },
        data: { status: 'PROMOTED' },
      });
    }

    return updated;
  });
};
