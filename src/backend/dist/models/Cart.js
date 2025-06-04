"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Cart extends sequelize_1.Model {
}
Cart.init({
    CartID: {
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
    ProductID: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Products',
            key: 'ProductID',
        },
    },
    Quantity: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
            min: 1,
        },
    },
}, {
    sequelize: database_1.sequelize,
    modelName: 'Cart',
    tableName: 'Carts',
    indexes: [
        {
            unique: true,
            fields: ['UserID', 'ProductID'],
        },
    ],
});
exports.default = Cart;
