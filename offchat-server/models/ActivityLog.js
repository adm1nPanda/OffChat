const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const ActivityLog = sequelize.define('ActivityLog', {
    user: {
        type: DataTypes.STRING,
        allowNull: false
    },
    action_type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    details: {
        type: DataTypes.TEXT
    },
    related_entity: {
        type: DataTypes.STRING
    }
}, {
    timestamps: true
});

module.exports = ActivityLog;
