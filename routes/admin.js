const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');

// Register new admin
router.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'All fields required' });
    try {
        const exists = await Admin.findOne({ username });
        if (exists) return res.status(409).json({ error: 'Username already exists' });
        const admin = new Admin({ username, password });
        await admin.save();
        res.status(201).json({ message: 'Admin registered' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to register admin' });
    }
});

// Admin login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username, password });
    if (!admin) return res.status(401).json({ error: 'Invalid credentials' });
    res.json({ message: 'Login successful' });
});

module.exports = router;