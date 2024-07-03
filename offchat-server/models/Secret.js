const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Secret = sequelize.define('Secret', {
    username: {
        type: DataTypes.STRING,
        allowNull: false
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    secret: {
        type: DataTypes.TEXT,
        allowNull: false
    }
}, {
    timestamps: true
});

module.exports = Secret;
