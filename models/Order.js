// models/Order.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');

module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    businessId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Businesses',
        key: 'id',
      },
    },
    status: {
      type: DataTypes.ENUM('Por pagar', 'Pagada', 'Devuelta', 'Cancelada'),
      defaultValue: 'Por pagar',
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    iva: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  });

  // Asociaciones
  Order.associate = (models) => {
    // Relación con User
    Order.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });

    // Relación con Business
    Order.belongsTo(models.Business, {
      foreignKey: 'businessId',
      as: 'business',
    });

    Order.hasMany(models.Product, {
      foreignKey: 'orderId',
      as: 'products',
    });
  };

  return Order;
};

