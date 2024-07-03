const { Sequelize } = require('sequelize');

// Initialize SQLite database
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite'  // Path to the SQLite database file
});

module.exports = sequelize;
