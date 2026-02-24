import app from './app';
import config from './config';
import { connectDatabase } from './config/database';
import { MembershipService } from './services/membership.service';
import logger from './utils/logger';
import fs from 'fs';
import path from 'path';

const start = async () => {
  try {
    // Ensure upload directory exists
    const uploadDir = path.join(__dirname, '..', config.upload.dir);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Ensure logs directory exists
    const logsDir = path.join(__dirname, '..', 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    // Connect to database
    await connectDatabase();

    // Seed default membership plans
    await MembershipService.seedDefaultPlans();
    logger.info('Default membership plans seeded');

    // Start server
    app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port} in ${config.env} mode`);
      logger.info(`API available at http://localhost:${config.port}/api`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();
