import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class PostTag extends Model {
  public postId!: string;
  public tagId!: string;
}

PostTag.init(
  {
    postId: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },
    tagId: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },
  },
  {
    sequelize,
    tableName: 'post_tags',
    timestamps: false,
  }
);

export default PostTag;
