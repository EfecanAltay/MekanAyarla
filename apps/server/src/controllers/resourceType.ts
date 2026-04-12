import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { ResourceTypeSchema } from '@remotely/shared';

// Get all resource types for the user's organization
export const getResourceTypes = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.organizationId) throw new Error('Unauthorized');

    const resourceTypes = await prisma.resourceType.findMany({
      where: { organizationId: user.organizationId },
      include: {
        _count: {
          select: { resources: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ resourceTypes });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// Create a new Resource Type
export const createResourceType = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!user || !user.organizationId || !['BUSINESS_ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      throw new Error('Unauthorized');
    }

    const validatedData = ResourceTypeSchema.parse(req.body);

    const resourceType = await prisma.resourceType.create({
      data: {
        ...validatedData,
        organizationId: user.organizationId
      }
    });

    res.status(201).json({ resourceType });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// Update a Resource Type
export const updateResourceType = async (req: AuthRequest, res: Response) => {
  try {
    const typeId = req.params.id;
    const userId = req.user?.userId;
    
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.organizationId || !['BUSINESS_ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      throw new Error('Unauthorized');
    }

    const validatedData = ResourceTypeSchema.parse(req.body);

    // Ensure it belongs to the admin's organization before updating
    const existing = await prisma.resourceType.findUnique({ where: { id: typeId } });
    if (!existing || existing.organizationId !== user.organizationId) {
      throw new Error('Resource Type not found or unauthorized');
    }

    const resourceType = await prisma.resourceType.update({
      where: { id: typeId },
      data: validatedData
    });

    res.json({ resourceType });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a Resource Type
export const deleteResourceType = async (req: AuthRequest, res: Response) => {
  try {
    const typeId = req.params.id;
    const userId = req.user?.userId;
    
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.organizationId || !['BUSINESS_ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      throw new Error('Unauthorized');
    }

    // Ensure it belongs to the admin's organization
    const existing = await prisma.resourceType.findUnique({ where: { id: typeId } });
    if (!existing || existing.organizationId !== user.organizationId) {
      throw new Error('Resource Type not found or unauthorized');
    }

    // Check if any resources are attached
    const attachedResources = await prisma.resource.count({ where: { typeId } });
    if (attachedResources > 0) {
      throw new Error(`Cannot delete: ${attachedResources} resource(s) are currently attached to this type.`);
    }

    await prisma.resourceType.delete({
      where: { id: typeId }
    });

    res.json({ message: 'Resource type deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
