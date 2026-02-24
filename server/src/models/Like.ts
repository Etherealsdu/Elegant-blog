import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Like extends Model {
  public id!: string;
  public userId!: string;
  public postId?: string;
  public commentId?: string;
  public readonly createdAt!: Date;
}

Like.init(
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
    postId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    commentId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'likes',
    updatedAt: false,
    indexes: [
      { unique: true, fields: ['user_id', 'post_id'], where: { post_id: { $ne: null } } } as any,
      { unique: true, fields: ['user_id', 'comment_id'], where: { comment_id: { $ne: null } } } as any,
    ],
  }
);

export default Like;
