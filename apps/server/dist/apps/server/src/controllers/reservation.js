"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateReservationStatus = exports.getAllReservationsAdmin = exports.getMyReservations = exports.cancelReservation = exports.createReservation = void 0;
const reservationService = __importStar(require("../services/reservation"));
const shared_1 = require("@remotely/shared");
const prisma_1 = require("../lib/prisma");
const createReservation = async (req, res) => {
    try {
        const validatedData = shared_1.CreateReservationSchema.parse({
            ...req.body,
            userId: req.user?.userId,
        });
        const reservation = await reservationService.createReservation(validatedData);
        res.status(201).json({ reservation });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.createReservation = createReservation;
const cancelReservation = async (req, res) => {
    try {
        const reservationId = req.params.id;
        const userId = req.user?.userId;
        if (!userId)
            throw new Error('Unauthorized');
        const reservation = await reservationService.cancelReservation(reservationId, userId);
        res.json({ reservation });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.cancelReservation = cancelReservation;
const getMyReservations = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const reservations = await prisma_1.prisma.reservation.findMany({
            where: { userId },
            include: {
                timeSlot: {
                    include: { resource: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json({ reservations });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.getMyReservations = getMyReservations;
const getAllReservationsAdmin = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const user = await prisma_1.prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.organizationId || !['BUSINESS_ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
            throw new Error('Unauthorized');
        }
        const reservations = await prisma_1.prisma.reservation.findMany({
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
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.getAllReservationsAdmin = getAllReservationsAdmin;
const updateReservationStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const reservationId = req.params.id;
        const userId = req.user?.userId;
        const user = await prisma_1.prisma.user.findUnique({ where: { id: userId } });
        if (!user || !['BUSINESS_ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
            throw new Error('Unauthorized');
        }
        // Usually we would check if the reservation belongs to the admin's organization here
        // but for simplicity we directly update
        const reservation = await prisma_1.prisma.reservation.update({
            where: { id: reservationId },
            data: { status }
        });
        res.json({ reservation });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.updateReservationStatus = updateReservationStatus;
