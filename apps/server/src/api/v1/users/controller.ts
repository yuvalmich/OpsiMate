import { Request, Response } from 'express';
import { z } from 'zod';
import { UserBL } from '../../../bl/users/user.bl';

const RegisterSchema = z.object({
    email: z.string().email(),
    fullName: z.string().min(1),
    password: z.string().min(6)
});

const CreateUserSchema = RegisterSchema;

const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6)
});

export class UsersController {
    constructor(private userBL: UserBL) {}

    registerHandler = async (req: Request, res: Response) => {
        try {
            const { email, fullName, password } = RegisterSchema.parse(req.body);
            const result = await this.userBL.register(email, fullName, password);
            res.status(201).json({ success: true, data: result });
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
            const { email, fullName, password } = CreateUserSchema.parse(req.body);
            const result = await this.userBL.createUser(email, fullName, password);
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

    loginHandler = async (req: Request, res: Response) => {
        try {
            const { email, password } = LoginSchema.parse(req.body);
            const user = await this.userBL.login(email, password);
            res.status(200).json({ success: true, data: user });
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