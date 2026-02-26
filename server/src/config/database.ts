/**
 * 数据库连接与初始化
 *
 * 使用 Sequelize ORM 连接 PostgreSQL 数据库。
 * - 连接池配置：最大 10 个连接，空闲超时 10 秒
 * - 开发环境：启用 alter 模式自动同步表结构（会尝试修改已有表）
 * - 生产环境：仅创建不存在的表，不修改已有表结构
 *
 * 警告：生产环境的表结构变更应通过 Sequelize Migrations 管理，
 *       不要依赖 sync() 的自动同步功能。
 */
import { Sequelize } from 'sequelize';
import config from './index';
import logger from '../utils/logger';

const sequelize = new Sequelize(config.database.url, {
  dialect: 'postgres',
  logging: config.database.logging ? (msg) => logger.debug(msg) : false,
  pool: {
    max: 10,        // 连接池最大连接数
    min: 0,         // 连接池最小连接数
    acquire: 30000, // 获取连接的最大等待时间（毫秒）
    idle: 10000,    // 连接空闲多久后释放（毫秒）
  },
  define: {
    timestamps: true,   // 自动添加 createdAt 和 updatedAt 字段
    underscored: true,  // 使用下划线命名风格（如 created_at 而非 createdAt）
  },
});

/**
 * 连接数据库并同步模型
 *
 * 开发环境使用 alter: true 会自动修改表结构以匹配模型定义，
 * 但可能导致数据丢失（如删除列）。生产环境应使用 migration。
 */
export const connectDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully');
    // 开发环境：alter=true 自动调整表结构；生产环境：仅创建新表
    await sequelize.sync({ alter: config.env === 'development' });
    logger.info('Database models synchronized');
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    throw error;
  }
};

export default sequelize;
