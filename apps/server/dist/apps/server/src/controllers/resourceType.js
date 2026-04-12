"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteResourceType = exports.updateResourceType = exports.createResourceType = exports.getResourceTypes = void 0;
const prisma_1 = require("../lib/prisma");
const shared_1 = require("@remotely/shared");
// Get all resource types for the user's organization
const getResourceTypes = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const user = await prisma_1.prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.organizationId)
            throw new Error('Unauthorized');
        const resourceTypes = await prisma_1.prisma.resourceType.findMany({
            where: { organizationId: user.organizationId },
            include: {
                _count: {
                    select: { resources: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ resourceTypes });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.getResourceTypes = getResourceTypes;
// Create a new Resource Type
const createResourceType = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const user = await prisma_1.prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.organizationId || !['BUSINESS_ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
            throw new Error('Unauthorized');
        }
        const validatedData = shared_1.ResourceTypeSchema.parse(req.body);
        const resourceType = await prisma_1.prisma.resourceType.create({
            data: {
                ...validatedData,
                organizationId: user.organizationId
            }
        });
        res.status(201).json({ resourceType });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.createResourceType = createResourceType;
// Update a Resource Type
const updateResourceType = async (req, res) => {
    try {
        const typeId = req.params.id;
        const userId = req.user?.userId;
        const user = await prisma_1.prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.organizationId || !['BUSINESS_ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
            throw new Error('Unauthorized');
        }
        const validatedData = shared_1.ResourceTypeSchema.parse(req.body);
        // Ensure it belongs to the admin's organization before updating
        const existing = await prisma_1.prisma.resourceType.findUnique({ where: { id: typeId } });
        if (!existing || existing.organizationId !== user.organizationId) {
            throw new Error('Resource Type not found or unauthorized');
        }
        const resourceType = await prisma_1.prisma.resourceType.update({
            where: { id: typeId },
            data: validatedData
        });
        res.json({ resourceType });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.updateResourceType = updateResourceType;
// Delete a Resource Type
const deleteResourceType = async (req, res) => {
    try {
        const typeId = req.params.id;
        const userId = req.user?.userId;
        const user = await prisma_1.prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.organizationId || !['BUSINESS_ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
            throw new Error('Unauthorized');
        }
        // Ensure it belongs to the admin's organization
        const existing = await prisma_1.prisma.resourceType.findUnique({ where: { id: typeId } });
        if (!existing || existing.organizationId !== user.organizationId) {
            throw new Error('Resource Type not found or unauthorized');
        }
        // Check if any resources are attached
        const attachedResources = await prisma_1.prisma.resource.count({ where: { typeId } });
        if (attachedResources > 0) {
            throw new Error(`Cannot delete: ${attachedResources} resource(s) are currently attached to this type.`);
        }
        await prisma_1.prisma.resourceType.delete({
            where: { id: typeId }
        });
        res.json({ message: 'Resource type deleted successfully' });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.deleteResourceType = deleteResourceType;
