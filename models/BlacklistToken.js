const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {

  const BlacklistToken = sequelize.define('BlacklistToken', {
    token: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  });

  return BlacklistToken;
};

