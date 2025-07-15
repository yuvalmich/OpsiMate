import { Request, Response } from 'express';
import { z } from 'zod';
import { UserBL } from '../../../bl/users/user.bl';
import {CreateUserSchema, LoginSchema, RegisterSchema, UpdateUserRoleSchema} from '@service-peek/shared';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme-secret';

export class UsersController {
    constructor(private userBL: UserBL) {}

    registerHandler = async (req: Request, res: Response) => {
        try {
            const { email, fullName, password } = RegisterSchema.parse(req.body);
            const result = await this.userBL.register(email, fullName, password);
            const token = jwt.sign({ id: result.id, email: result.email, role: result.role }, JWT_SECRET, { expiresIn: '7d' });
            res.status(201).json({ success: true, data: result, token });
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ success: false, error: 'Validation error', details: error.errors });
            } else if (error instanceof Error && error.message === 'Registration is disabled after first admin') {
                res.status(403).json({ success: false, error: error.message });
            } else if (error instanceof Error && error.message.includes('UNIQUE constraint failed: users.email')) {
                res.status(400).json({ success: false, error: 'Email already registered' });
            } else {
                res.status(500).json({ success: false, error: 'Internal server error' });
            }
        }
    };

    createUserHandler = async (req: Request, res: Response) => {
        try {
            const { email, fullName, password, role } = CreateUserSchema.parse(req.body);
            const result = await this.userBL.createUser(email, fullName, password, role);
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ success: false, error: 'Validation error', details: error.errors });
            } else if (error instanceof Error && error.message.includes('UNIQUE constraint failed: users.email')) {
                res.status(400).json({ success: false, error: 'Email already registered' });
            } else {
                res.status(500).json({ success: false, error: 'Internal server error' });
            }
        }
    };

    updateUserRoleHandler = async (req: Request, res: Response) => {
        try {
            const { email, newRole } = UpdateUserRoleSchema.parse(req.body);
            await this.userBL.updateUserRole(email, newRole);
            res.status(200).json({ success: true, message: 'User role updated successfully' });
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ success: false, error: 'Validation error', details: error.errors });
            } else {
                res.status(500).json({ success: false, error: 'Internal server error' });
            }
        }
    };

    loginHandler = async (req: Request, res: Response) => {
        try {
            const { email, password } = LoginSchema.parse(req.body);
            const user = await this.userBL.login(email, password);
            const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
            res.status(200).json({ success: true, data: user, token });
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ success: false, error: 'Validation error', details: error.errors });
            } else if (error instanceof Error && error.message === 'Invalid email or password') {
                res.status(401).json({ success: false, error: error.message });
            } else {
                res.status(500).json({ success: false, error: 'Internal server error' });
            }
        }
    };
} 