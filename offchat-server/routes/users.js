const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Endpoint to get all registered users
router.get('/members', async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['username'] // Only return the username field
        });
        res.json(users);
    } catch (error) {
        console.error('Error retrieving members:', error); // Log the error
        res.status(500).send('Error retrieving members');
    }
});

module.exports = router;
