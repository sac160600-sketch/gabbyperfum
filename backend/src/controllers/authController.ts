import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prismaClient';

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET no está configurado o es demasiado corto (min 32 caracteres).');
  }
  return secret;
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    // Validaciones básicas
    if (!email || !password || !name) {
      res.status(400).json({ message: 'Email, contraseña y nombre son obligatorios.' });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ message: 'La contraseña debe tener al menos 8 caracteres.' });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }
    
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Forzar rol Cliente — solo un superadmin puede crear admins manualmente
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name, role: 'Cliente' }
    });
    
    res.status(201).json({ message: 'User registered successfully', userId: user.id });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email y contraseña son obligatorios.' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }
    
    const payload = { id: user.id, email: user.email, role: user.role };
    const token = jwt.sign(payload, getJwtSecret(), { expiresIn: '8h' });
    
    res.json({ token, user: payload });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
