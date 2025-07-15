/* eslint-disable @typescript-eslint/no-misused-promises */
import PromiseRouter from 'express-promise-router';
import { UsersController } from './controller';

export default function createUsersRouter(usersController: UsersController) {
    const router = PromiseRouter();

    // POST /users - admin creates new user
    router.post('/', usersController.createUserHandler);

    // PATCH /users/role - update user role
    router.patch('/role', usersController.updateUserRoleHandler);

    return router;
} 