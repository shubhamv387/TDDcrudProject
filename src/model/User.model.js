const DataType = require('sequelize');
const sequelize = require('../utils/db');

const User = sequelize.define('user', {
  id: {
    type: DataType.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  username: {
    type: DataType.STRING,
    unique: true,
    allowNull: false,
  },
  email: {
    type: DataType.STRING,
    unique: [true, 'E-mail already exists'],
    allowNull: false,
  },
  password: {
    type: DataType.STRING,
    allowNull: false,
  },
});

module.exports = User;
