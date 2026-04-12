import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { BranchSchema } from '@remotely/shared';

// Get all branches for the user's organization
export const getBranches = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.organizationId) throw new Error('Unauthorized');

    const branches = await prisma.branch.findMany({
      where: { organizationId: user.organizationId },
      include: {
        _count: {
          select: { resources: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ branches });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// Create a new Branch
export const createBranch = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!user || !user.organizationId || !['BUSINESS_ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      throw new Error('Unauthorized');
    }

    const validatedData = BranchSchema.parse(req.body);

    const branch = await prisma.branch.create({
      data: {
        ...validatedData,
        organizationId: user.organizationId
      }
    });

    res.status(201).json({ branch });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// Update a Branch
export const updateBranch = async (req: AuthRequest, res: Response) => {
  try {
    const branchId = req.params.id;
    const userId = req.user?.userId;
    
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.organizationId || !['BUSINESS_ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      throw new Error('Unauthorized');
    }

    const validatedData = BranchSchema.parse(req.body);

    // Ensure it belongs to the admin's organization before updating
    const existing = await prisma.branch.findUnique({ where: { id: branchId } });
    if (!existing || existing.organizationId !== user.organizationId) {
      throw new Error('Branch not found or unauthorized');
    }

    const branch = await prisma.branch.update({
      where: { id: branchId },
      data: validatedData
    });

    res.json({ branch });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a Branch
export const deleteBranch = async (req: AuthRequest, res: Response) => {
  try {
    const branchId = req.params.id;
    const userId = req.user?.userId;
    
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.organizationId || !['BUSINESS_ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      throw new Error('Unauthorized');
    }

    // Ensure it belongs to the admin's organization
    const existing = await prisma.branch.findUnique({ where: { id: branchId } });
    if (!existing || existing.organizationId !== user.organizationId) {
      throw new Error('Branch not found or unauthorized');
    }

    // Check if any resources are attached
    const attachedResources = await prisma.resource.count({ where: { branchId } });
    if (attachedResources > 0) {
      throw new Error(`Cannot delete: ${attachedResources} resource(s) are currently attached to this branch.`);
    }

    await prisma.branch.delete({
      where: { id: branchId }
    });

    res.json({ message: 'Branch deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
