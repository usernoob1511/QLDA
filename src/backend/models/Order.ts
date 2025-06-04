import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import Product from './Product';

interface OrderAttributes {
  OrderID: number;
  UserID: number;
  Status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  TotalAmount: number;
  ShippingAddress: string;
  ShippingCity: string;
  ShippingState: string;
  ShippingZipCode: string;
  ShippingName: string;
  ShippingEmail: string;
  ShippingPhone: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface OrderCreationAttributes extends Optional<OrderAttributes, 'OrderID'> {}

class Order extends Model<OrderAttributes, OrderCreationAttributes> implements OrderAttributes {
  public OrderID!: number;
  public UserID!: number;
  public Status!: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  public TotalAmount!: number;
  public ShippingAddress!: string;
  public ShippingCity!: string;
  public ShippingState!: string;
  public ShippingZipCode!: string;
  public ShippingName!: string;
  public ShippingEmail!: string;
  public ShippingPhone!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Add typed association methods
  declare getProducts: (options?: { through?: { attributes: string[] } }) => Promise<Product[]>;
  declare addProduct: (product: Product, options?: any) => Promise<void>;
  declare setProducts: (products: Product[]) => Promise<void>;
}

Order.init(
  {
    OrderID: {
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
    Status: {
      type: DataTypes.ENUM('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'),
      allowNull: false,
      defaultValue: 'Pending',
    },
    TotalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    ShippingAddress: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ShippingCity: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ShippingState: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ShippingZipCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ShippingName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ShippingEmail: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ShippingPhone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Order',
  }
);

export default Order; 