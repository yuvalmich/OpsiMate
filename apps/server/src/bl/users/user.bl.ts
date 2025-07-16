import { UserRepository } from '../../dal/userRepository';
import { UserRow } from '../../dal/models';
import bcrypt from 'bcrypt';
import { Role, User } from '@service-peek/shared';

export class UserBL {
    constructor(private userRepo: UserRepository) {}

    async register(email: string, fullName: string, password: string): Promise<{ id: number; email: string; role: 'admin' }> {
        const userCount = await this.userRepo.countUsers();
        if (userCount > 0) {
            throw new Error('Registration is disabled after first admin');
        }
        const hash = await bcrypt.hash(password, 10);
        const result = await this.userRepo.createUser(email, hash, fullName, 'admin');
        return { id: result.lastID, email, role: 'admin' };
    }

    async createUser(email: string, fullName: string, password: string, role: Role): Promise<{ id: number; email: string; role: Role }> {
        const hash = await bcrypt.hash(password, 10);
        const result = await this.userRepo.createUser(email, hash, fullName, role);
        return { id: result.lastID, email, role };
    }

    async updateUserRole(email: string, newRole: Role): Promise<void> {
        await this.userRepo.updateUserRole(email, newRole);
    }

    async login(email: string, password: string): Promise<Omit<UserRow, 'password_hash'>> {
        const user = await this.userRepo.findByEmail(email);
        if (!user) {
            throw new Error('Invalid email or password');
        }
        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) {
            throw new Error('Invalid email or password');
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password_hash, ...userInfo } = user;
        return userInfo;
    }

    async getAllUsers(): Promise<User[]> {
        const users = await this.userRepo.getAllUsers();
        return users.map(u => ({
            id: u.id,
            email: u.email,
            fullName: u.full_name,
            role: u.role as Role,
            createdAt: u.created_at,
        }));
    }
} 