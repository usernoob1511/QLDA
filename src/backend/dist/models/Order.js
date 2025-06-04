"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Order extends sequelize_1.Model {
}
Order.init({
    OrderID: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    UserID: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'UserID',
        },
    },
    Status: {
        type: sequelize_1.DataTypes.ENUM('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'),
        allowNull: false,
        defaultValue: 'Pending',
    },
    TotalAmount: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    ShippingAddress: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    ShippingCity: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    ShippingState: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    ShippingZipCode: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    ShippingName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    ShippingEmail: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    ShippingPhone: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
}, {
    sequelize: database_1.sequelize,
    modelName: 'Order',
});
exports.default = Order;
