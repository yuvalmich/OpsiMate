/* eslint-disable @typescript-eslint/no-misused-promises */
import PromiseRouter from 'express-promise-router';
import { UsersController } from './controller';
import { authenticateJWT } from '../../middleware/auth';

export default function createUsersRouter(usersController: UsersController) {
    const router = PromiseRouter();

    // POST /users - admin creates new user
    router.post('/users', usersController.createUserHandler);

    // PATCH /users/role - update user role
    router.patch('/users/role', usersController.updateUserRoleHandler);

    return router;
} 