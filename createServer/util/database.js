const Sequelize = require('sequelize');

const sequelize = new Sequelize('learn-node', 'root', 'root', { dialect: 'mysql', host: 'localhost' });

module.exports = sequelize;