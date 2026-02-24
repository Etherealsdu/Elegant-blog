import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { PaymentProvider, PaymentStatus } from '@elegant-blog/shared';

interface PaymentAttributes {
  id: string;
  userId: string;
  subscriptionId?: string;
  amount: number;
  currency: string;
  provider: PaymentProvider;
  providerPaymentId?: string;
  status: PaymentStatus;
  description: string;
}

interface PaymentCreationAttributes extends Optional<PaymentAttributes, 'id' | 'status' | 'currency'> {}

class Payment extends Model<PaymentAttributes, PaymentCreationAttributes> implements PaymentAttributes {
  public id!: string;
  public userId!: string;
  public subscriptionId!: string;
  public amount!: number;
  public currency!: string;
  public provider!: PaymentProvider;
  public providerPaymentId!: string;
  public status!: PaymentStatus;
  public description!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Payment.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    subscriptionId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'CNY',
    },
    provider: {
      type: DataTypes.ENUM(...Object.values(PaymentProvider)),
      allowNull: false,
    },
    providerPaymentId: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(PaymentStatus)),
      defaultValue: PaymentStatus.PENDING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'payments',
  }
);

export default Payment;
