import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface CartAttributes {
  CartID: number;
  UserID: number;
  ProductID: number;
  Quantity: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CartCreationAttributes extends Optional<CartAttributes, 'CartID'> {}

class Cart extends Model<CartAttributes, CartCreationAttributes> {
  public CartID!: number;
  public UserID!: number;
  public ProductID!: number;
  public Quantity!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Cart.init(
  {
    CartID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    UserID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'UserID',
      },
    },
    ProductID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Products',
        key: 'ProductID',
      },
    },
    Quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
      },
    },
  },
  {
    sequelize,
    modelName: 'Cart',
    tableName: 'Carts',
    indexes: [
      {
        unique: true,
        fields: ['UserID', 'ProductID'],
      },
    ],
  }
);

export default Cart; 