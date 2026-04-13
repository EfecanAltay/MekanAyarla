import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { LoginSchema, RegisterSchema, ChangePasswordSchema } from '@mekanayarla/shared';

export const register = async (req: Request, res: Response) => {
  try {
    const validatedData = RegisterSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    const user = await prisma.$transaction(async (tx) => {
      let organizationId: string | undefined;

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

    const token = jwt.sign(
      { userId: user.id, role: user.role, organizationId: user.organizationId },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1d' }
    );

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
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const validatedData = LoginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (!user || !(await bcrypt.compare(validatedData.password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role, organizationId: user.organizationId },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1d' }
    );

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
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
};

export const me = async (req: any, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
    select: { id: true, email: true, name: true, role: true, organizationId: true },
  });
  res.json({ user });
};

export const changePassword = async (req: any, res: Response) => {
  try {
    const { currentPassword, newPassword } = ChangePasswordSchema.parse(req.body);
    const userId = req.user.userId;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Current password incorrect' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    res.json({ message: 'Password changed successfully' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteAccount = async (req: any, res: Response) => {
  try {
    const { password } = req.body;
    const userId = req.user.userId;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Incorrect password' });

    await prisma.user.delete({ where: { id: userId } });

    res.clearCookie('token');
    res.json({ message: 'Account deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
