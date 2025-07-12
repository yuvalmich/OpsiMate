import { initializeDb } from './dal/db';
import { createApp } from './app';
import { Logger } from '@service-peek/shared';

const PORT = process.env.PORT || 3001;
const logger = new Logger('server');

// eslint-disable-next-line @typescript-eslint/no-floating-promises
(async () => {
    const db = initializeDb();
    const app = await createApp(db, {enableJobs: true});

    app.listen(PORT, () => {
        logger.info(`Server running on port ${PORT}`);
    });
})();
