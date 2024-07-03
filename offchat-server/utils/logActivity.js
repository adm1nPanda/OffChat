const ActivityLog = require('../models/ActivityLog');

const logActivity = async (user, action_type, details, related_entity = null) => {
    try {
        console.log(`Logging activity: ${action_type} by ${user}`); // Add logging here
        await ActivityLog.create({ user, action_type, details, related_entity });
    } catch (error) {
        console.error('Error logging activity:', error);
    }
};

module.exports = logActivity;
