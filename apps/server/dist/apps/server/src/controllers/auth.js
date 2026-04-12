"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.me = exports.logout = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../lib/prisma");
const shared_1 = require("@remotely/shared");
const register = async (req, res) => {
    try {
        const validatedData = shared_1.RegisterSchema.parse(req.body);
        const existingUser = await prisma_1.prisma.user.findUnique({
            where: { email: validatedData.email },
        });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(validatedData.password, 10);
        const user = await prisma_1.prisma.$transaction(async (tx) => {
            let organizationId;
            if (validatedData.role === 'BUSINESS_ADMIN' && validatedData.organizationName) {
                const org = await tx.organization.create({
                    data: { name: validatedData.organizationName },
                });
                organizationId = org.id;
            }
            return tx.user.create({
                data: {
                    email: validatedData.email,
                    password: hashedPassword,
                    name: validatedData.name,
                    role: validatedData.role,
                    organizationId,
                },
            });
        });
        const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role, organizationId: user.organizationId }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 86400000, // 1 day
        });
        res.status(201).json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                organizationId: user.organizationId,
            },
        });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const validatedData = shared_1.LoginSchema.parse(req.body);
        const user = await prisma_1.prisma.user.findUnique({
            where: { email: validatedData.email },
        });
        if (!user || !(await bcryptjs_1.default.compare(validatedData.password, user.password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role, organizationId: user.organizationId }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 86400000,
        });
        res.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                organizationId: user.organizationId,
            },
        });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.login = login;
const logout = (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out' });
};
exports.logout = logout;
const me = async (req, res) => {
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { id: true, email: true, name: true, role: true, organizationId: true },
    });
    res.json({ user });
};
exports.me = me;
