"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Category extends sequelize_1.Model {
    // Add static methods for associations
    static associate(models) {
        Category.hasMany(models.Product, {
            sourceKey: 'CategoryID',
            foreignKey: 'CategoryID',
            as: 'products',
        });
    }
}
Category.init({
    CategoryID: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    Name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    Description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
}, {
    sequelize: database_1.sequelize,
    modelName: 'Category',
    tableName: 'Categories'
});
exports.default = Category;
