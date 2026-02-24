import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { MembershipPlan as MembershipPlanEnum } from '@elegant-blog/shared';

interface MembershipPlanAttributes {
  id: string;
  name: string;
  plan: MembershipPlanEnum;
  price: number;
  currency: string;
  durationDays: number;
  description: string;
  features: string[];
  isActive: boolean;
}

interface MembershipPlanCreationAttributes extends Optional<MembershipPlanAttributes, 'id' | 'isActive' | 'currency'> {}

class MembershipPlan extends Model<MembershipPlanAttributes, MembershipPlanCreationAttributes> implements MembershipPlanAttributes {
  public id!: string;
  public name!: string;
  public plan!: MembershipPlanEnum;
  public price!: number;
  public currency!: string;
  public durationDays!: number;
  public description!: string;
  public features!: string[];
  public isActive!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

MembershipPlan.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    plan: {
      type: DataTypes.ENUM(...Object.values(MembershipPlanEnum)),
      allowNull: false,
      unique: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'CNY',
    },
    durationDays: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    features: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'membership_plans',
  }
);

export default MembershipPlan;
