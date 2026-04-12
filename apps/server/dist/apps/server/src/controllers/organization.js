"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrganizationMetadata = void 0;
const prisma_1 = require("../lib/prisma");
const getOrganizationMetadata = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId)
            throw new Error('Unauthorized');
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
            select: { organizationId: true, role: true }
        });
        if (!user?.organizationId) {
            throw new Error('User does not belong to an organization');
        }
        const branches = await prisma_1.prisma.branch.findMany({
            where: { organizationId: user.organizationId },
            select: { id: true, name: true }
        });
        const resourceTypes = await prisma_1.prisma.resourceType.findMany({
            where: { organizationId: user.organizationId },
            select: { id: true, name: true }
        });
        res.json({ branches, resourceTypes });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.getOrganizationMetadata = getOrganizationMetadata;
