import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. Create Yoga Studio Organization
  const yogaStudio = await prisma.organization.create({
    data: {
      name: 'Zen Yoga Studio',
      resourceTypes: {
        create: { name: 'Lesson' },
      },
      branches: {
        create: { name: 'Downtown' },
      },
      policies: {
        create: {
          maxBookingsPerUser: 2,
          cancellationDeadline: 12,
          autoConfirm: true,
          allowWaitlist: true,
        },
      },
    },
    include: {
      resourceTypes: true,
      branches: true,
    },
  });

  // Create Yoga Admin
  await prisma.user.create({
    data: {
      email: 'admin@zenyoga.com',
      password: hashedPassword,
      name: 'Alice Yoga',
      role: UserRole.BUSINESS_ADMIN,
      organizationId: yogaStudio.id,
    },
  });

  // Create Yoga Resource
  await prisma.resource.create({
    data: {
      name: 'Vinyasa Flow (Mon 6 PM)',
      typeId: yogaStudio.resourceTypes[0].id,
      branchId: yogaStudio.branches[0].id,
      capacity: 15,
      description: 'A 60-minute flow for all levels.',
    },
  });

  // 2. Create Cafe Organization
  const cafe = await prisma.organization.create({
    data: {
      name: 'The Cozy Corner',
      resourceTypes: {
        create: { name: 'Table' },
      },
      branches: {
        create: { name: 'Westside' },
      },
      policies: {
        create: {
          maxBookingsPerUser: 1,
          cancellationDeadline: 2,
          autoConfirm: true,
          allowWaitlist: false,
        },
      },
    },
    include: {
      resourceTypes: true,
      branches: true,
    },
  });

  // Create Cafe Admin
  await prisma.user.create({
    data: {
      email: 'admin@cozycorner.com',
      password: hashedPassword,
      name: 'Bob Coffee',
      role: UserRole.BUSINESS_ADMIN,
      organizationId: cafe.id,
    },
  });

  // Create Cafe Tables
  await prisma.resource.createMany({
    data: [
      {
        name: 'Table 1 (Window)',
        typeId: cafe.resourceTypes[0].id,
        branchId: cafe.branches[0].id,
        capacity: 2,
        description: 'Small table by the window.',
      },
      {
        name: 'Table 2 (Big Corner)',
        typeId: cafe.resourceTypes[0].id,
        branchId: cafe.branches[0].id,
        capacity: 4,
        description: 'Large corner table for groups.',
      },
    ],
  });

  console.log('Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
