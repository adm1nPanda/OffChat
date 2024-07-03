const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Incident = sequelize.define('Incident', {
    ttp: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    severity: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false
    },
    tags: {
        type: DataTypes.STRING
    },
    assigned_user: {
        type: DataTypes.STRING
    }
}, {
    timestamps: true
});

module.exports = Incident;
