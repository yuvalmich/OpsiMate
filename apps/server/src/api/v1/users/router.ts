import PromiseRouter from 'express-promise-router';
import { UsersController } from './controller';

export default function createUsersRouter(usersController: UsersController) {
    const router = PromiseRouter();

    // POST /register - first admin registration
    router.post('/register', usersController.registerHandler);

    // POST /users - admin creates new user
    router.post('/users', usersController.createUserHandler);

    // POST /login - user login
    router.post('/login', usersController.loginHandler);

    return router;
} 