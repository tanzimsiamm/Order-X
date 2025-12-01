import { createServer } from 'http';
import app from './app';
import config from './shared/config/env';
import logger from './shared/utils/logger.util';
import { initializeSocket } from './shared/socket/socket';

const PORT = config.port

async function main() {
  const httpServer = createServer(app);

  initializeSocket(httpServer);

  httpServer.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT}`);
  });

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Rejection:', reason);
    httpServer.close(() => process.exit(1));
  });

  process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception:', err);
    process.exit(1);
  });
}

main();
