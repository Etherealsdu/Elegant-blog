import { Sequelize } from 'sequelize';
import config from './index';
import logger from '../utils/logger';

const sequelize = new Sequelize(config.database.url, {
  dialect: 'postgres',
  logging: config.database.logging ? (msg) => logger.debug(msg) : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    timestamps: true,
    underscored: true,
  },
});

export const connectDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully');
    await sequelize.sync({ alter: config.env === 'development' });
    logger.info('Database models synchronized');
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    throw error;
  }
};

export default sequelize;
