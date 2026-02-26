/**
 * 用户数据模型
 *
 * 对应数据库 users 表，存储所有用户信息。
 * 支持邮箱注册和第三方 OAuth 登录（GitHub、Google、微信、支付宝）。
 *
 * 安全特性：
 * - 密码使用 bcrypt 加盐哈希存储（salt rounds = 12）
 * - toJSON() 自动剔除 password 字段，防止密码泄露
 * - 用户名仅允许字母、数字、下划线和连字符
 */
import { DataTypes, Model, Optional } from 'sequelize';
import bcrypt from 'bcryptjs';
import sequelize from '../config/database';
import { UserRole, AuthProvider } from '@elegant-blog/shared';

interface UserAttributes {
  id: string;
  email: string;
  username: string;
  displayName: string;
  password?: string;
  avatar?: string;
  bio?: string;
  role: UserRole;              // 角色：user（普通用户）、author（作者）、admin（管理员）
  provider: AuthProvider;       // 注册来源：local / github / google / wechat / alipay
  providerId?: string;          // 第三方平台的用户 ID
  isEmailVerified: boolean;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'role' | 'provider' | 'isEmailVerified'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public email!: string;
  public username!: string;
  public displayName!: string;
  public password!: string;
  public avatar!: string;
  public bio!: string;
  public role!: UserRole;
  public provider!: AuthProvider;
  public providerId!: string;
  public isEmailVerified!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  /** 验证密码是否匹配（用于邮箱登录） */
  public async comparePassword(candidatePassword: string): Promise<boolean> {
    if (!this.password) return false;
    return bcrypt.compare(candidatePassword, this.password);
  }

  /** 序列化时自动移除密码字段，防止泄露 */
  public toJSON(): object {
    const values = { ...this.get() } as Record<string, unknown>;
    delete values.password;
    return values;
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 50],                  // 长度限制：3 - 50 字符
        is: /^[a-zA-Z0-9_-]+$/i,      // 仅允许字母、数字、下划线、连字符
      },
    },
    displayName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: true,  // OAuth 登录的用户没有密码
    },
    avatar: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM(...Object.values(UserRole)),
      defaultValue: UserRole.USER,
      allowNull: false,
    },
    provider: {
      type: DataTypes.ENUM(...Object.values(AuthProvider)),
      defaultValue: AuthProvider.LOCAL,
      allowNull: false,
    },
    providerId: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    isEmailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'users',
    hooks: {
      // 创建用户前：对密码进行 bcrypt 哈希
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(12);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      // 更新用户前：如果密码发生变化，重新哈希
      beforeUpdate: async (user) => {
        if (user.changed('password') && user.password) {
          const salt = await bcrypt.genSalt(12);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  }
);

export default User;
