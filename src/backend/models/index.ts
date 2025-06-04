import { Sequelize } from 'sequelize';
import { sequelize } from '../config/database';
import User from './User';
import Product from './Product';
import Category from './Category';
import Cart from './Cart';
import Order from './Order';

// Initialize models
const models = {
  User,
  Product,
  Category,
  Cart,
  Order
};

// Define associations
Category.hasMany(Product, {
  foreignKey: 'CategoryID',
  as: 'categoryProducts'
});

Product.belongsTo(Category, {
  foreignKey: 'CategoryID',
  as: 'productCategory'
});

User.hasMany(Cart, {
  foreignKey: 'UserID',
  as: 'userCarts'
});

Cart.belongsTo(User, {
  foreignKey: 'UserID',
  as: 'cartUser'
});

Cart.belongsTo(Product, {
  foreignKey: 'ProductID',
  as: 'cartProduct'
});

Product.hasMany(Cart, {
  foreignKey: 'ProductID',
  as: 'productCarts'
});

User.hasMany(Order, {
  foreignKey: 'UserID',
  as: 'userOrders'
});

Order.belongsTo(User, {
  foreignKey: 'UserID',
  as: 'orderUser'
});

// Order-Product Many-to-Many relationship
Order.belongsToMany(Product, {
  through: 'OrderItems',
  foreignKey: 'OrderID',
  otherKey: 'ProductID',
  as: 'orderProducts'
});

Product.belongsToMany(Order, {
  through: 'OrderItems',
  foreignKey: 'ProductID',
  otherKey: 'OrderID',
  as: 'productOrders'
});

export { User, Product, Category, Cart, Order };
export { sequelize }; 