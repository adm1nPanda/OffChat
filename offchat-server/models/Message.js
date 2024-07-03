const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Message = sequelize.define('Message', {
    username: {
        type: DataTypes.STRING,
        allowNull: false
    },
    content: {
        type: DataTypes.STRING,
        allowNull: false
    },
    pinned: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    timestamps: true // This will add the createdAt and updatedAt fields automatically
});

module.exports = Message;
