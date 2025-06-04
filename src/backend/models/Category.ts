import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface CategoryAttributes {
  CategoryID: number;
  Name: string;
  Description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CategoryCreationAttributes extends Optional<CategoryAttributes, 'CategoryID' | 'Description'> {}

class Category extends Model<CategoryAttributes, CategoryCreationAttributes> {
  public CategoryID!: number;
  public Name!: string;
  public Description!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Add static methods for associations
  public static associate(models: any) {
    Category.hasMany(models.Product, {
      sourceKey: 'CategoryID',
      foreignKey: 'CategoryID',
      as: 'products',
    });
  }
}

Category.init(
  {
    CategoryID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    Name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    Description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Category',
    tableName: 'Categories'
  }
);

export default Category; 