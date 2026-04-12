import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

export const getOrganizationMetadata = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new Error('Unauthorized');

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true, role: true }
    });

    if (!user?.organizationId) {
      throw new Error('User does not belong to an organization');
    }

    const branches = await prisma.branch.findMany({
      where: { organizationId: user.organizationId },
      select: { id: true, name: true }
    });

    const resourceTypes = await prisma.resourceType.findMany({
      where: { organizationId: user.organizationId },
      select: { id: true, name: true }
    });

    res.json({ branches, resourceTypes });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
