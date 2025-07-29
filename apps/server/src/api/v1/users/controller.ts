import { Request, Response } from 'express';
import { z } from 'zod';
import { UserBL } from '../../../bl/users/user.bl';
import {CreateUserSchema, Logger, LoginSchema, RegisterSchema, Role, UpdateUserRoleSchema, UpdateProfileSchema} from '@service-peek/shared';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from '../../../middleware/auth';
import { User } from '@service-peek/shared';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme-secret';
const logger = new Logger('api/v1/users/controller');

export class UsersController {
    constructor(private userBL: UserBL) {}

    registerHandler = async (req: Request, res: Response) => {
        try {
            const { email, fullName, password } = RegisterSchema.parse(req.body);
            const result = await this.userBL.register(email, fullName, password);
            const token = jwt.sign(result, JWT_SECRET, { expiresIn: '7d' });
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

    createUserHandler = async (req: AuthenticatedRequest, res: Response) => {
        if (!req.user || req.user.role !== Role.Admin) {
            return res.status(403).json({ success: false, error: 'Forbidden: Admins only' });
        }
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

    updateUserRoleHandler = async (req: AuthenticatedRequest, res: Response) => {
        if (!req.user || req.user.role !== Role.Admin) {
            return res.status(403).json({ success: false, error: 'Forbidden: Admins only' });
        }
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
            const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
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

    getAllUsersHandler = async (req: AuthenticatedRequest, res: Response) => {
        if (!req.user || req.user.role !== Role.Admin) {
            return res.status(403).json({ success: false, error: 'Forbidden: Admins only' });
        }
        try {
            const users = await this.userBL.getAllUsers();
            res.status(200).json({ success: true, data: users });
        } catch {
            res.status(500).json({ success: false, error: 'Internal server error' });
        }
    };

    deleteUserHandler = async (req: AuthenticatedRequest, res: Response) => {
        if (!req.user || req.user.role !== Role.Admin) {
            return res.status(403).json({ success: false, error: 'Forbidden: Admins only' });
        }
        const userId = parseInt(req.params.id);
        if (isNaN(userId)) {
            return res.status(400).json({ success: false, error: 'Invalid user ID' });
        }
        try {
            const user = await this.userBL.getUserById(userId);
            if (!user) {
                return res.status(404).json({ success: false, error: 'User not found' });
            }
            await this.userBL.deleteUser(userId);
            res.status(200).json({ success: true, message: 'User deleted successfully' });
        } catch (error) {
            logger.error('Error deleting user:', error);
            res.status(500).json({ success: false, error: 'Internal server error' });
        }
    };

    /**
     * Checks if any users exist in the database.
     * Returns { exists: true } if at least one user exists, otherwise { exists: false }.
     */
    usersExistHandler = async (req: Request, res: Response) => {
        try {
            const exists = await this.userBL.usersExist();
            res.status(200).json({ success: true, exists });
        } catch {
            res.status(500).json({ success: false, error: 'Internal server error' });
        }
    };

    updateProfileHandler = async (req: AuthenticatedRequest, res: Response) => {
        if (!req.user) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        try {
            const { fullName, newPassword } = UpdateProfileSchema.parse(req.body);
            const updatedUser = await this.userBL.updateProfile(req.user.id, fullName, newPassword);
            
            const responseData: { user: User; token?: string } = { user: updatedUser };
            
            // If password was changed, generate a new token
            if (newPassword) {
                const token = jwt.sign(updatedUser, JWT_SECRET, { expiresIn: '7d' });
                responseData.token = token;
            }
            
            res.status(200).json({ success: true, data: responseData });
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ success: false, error: 'Validation error', details: error.errors });
            } else if (error instanceof Error && error.message === 'User not found') {
                res.status(404).json({ success: false, error: error.message });
            } else {
                logger.error('Error updating profile:', error);
                res.status(500).json({ success: false, error: 'Internal server error' });
            }
        }
    };
} 