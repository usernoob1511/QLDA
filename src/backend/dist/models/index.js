"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = exports.Order = exports.Cart = exports.Category = exports.Product = exports.User = void 0;
const database_1 = require("../config/database");
Object.defineProperty(exports, "sequelize", { enumerable: true, get: function () { return database_1.sequelize; } });
const User_1 = __importDefault(require("./User"));
exports.User = User_1.default;
const Product_1 = __importDefault(require("./Product"));
exports.Product = Product_1.default;
const Category_1 = __importDefault(require("./Category"));
exports.Category = Category_1.default;
const Cart_1 = __importDefault(require("./Cart"));
exports.Cart = Cart_1.default;
const Order_1 = __importDefault(require("./Order"));
exports.Order = Order_1.default;
// Initialize models
const models = {
    User: User_1.default,
    Product: Product_1.default,
    Category: Category_1.default,
    Cart: Cart_1.default,
    Order: Order_1.default
};
// Define associations
Category_1.default.hasMany(Product_1.default, {
    foreignKey: 'CategoryID',
    as: 'categoryProducts'
});
Product_1.default.belongsTo(Category_1.default, {
    foreignKey: 'CategoryID',
    as: 'productCategory'
});
User_1.default.hasMany(Cart_1.default, {
    foreignKey: 'UserID',
    as: 'userCarts'
});
Cart_1.default.belongsTo(User_1.default, {
    foreignKey: 'UserID',
    as: 'cartUser'
});
Cart_1.default.belongsTo(Product_1.default, {
    foreignKey: 'ProductID',
    as: 'cartProduct'
});
Product_1.default.hasMany(Cart_1.default, {
    foreignKey: 'ProductID',
    as: 'productCarts'
});
User_1.default.hasMany(Order_1.default, {
    foreignKey: 'UserID',
    as: 'userOrders'
});
Order_1.default.belongsTo(User_1.default, {
    foreignKey: 'UserID',
    as: 'orderUser'
});
// Order-Product Many-to-Many relationship
Order_1.default.belongsToMany(Product_1.default, {
    through: 'OrderItems',
    foreignKey: 'OrderID',
    otherKey: 'ProductID',
    as: 'orderProducts'
});
Product_1.default.belongsToMany(Order_1.default, {
    through: 'OrderItems',
    foreignKey: 'ProductID',
    otherKey: 'OrderID',
    as: 'productOrders'
});
