const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const JWT_SECRET = 'your-secret-key-here';

// Helper functions
const readJSONFile = (filename) => {
    return new Promise((resolve, reject) => {
        const filePath = path.join(__dirname, '../data', filename);
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                reject(err);
            } else {
                try {
                    resolve(JSON.parse(data));
                } catch (parseErr) {
                    reject(parseErr);
                }
            }
        });
    });
};

const writeJSONFile = (filename, data) => {
    return new Promise((resolve, reject) => {
        const filePath = path.join(__dirname, '../data', filename);
        fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8', (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

// Task 6: Register New User (3 points)
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // Validation
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        
        const users = await readJSONFile('users.json');
        
        // Check if user already exists
        const existingUser = users.find(user => user.email === email || user.username === username);
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create new user
        const newUser = {
            id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
            username,
            email,
            password: hashedPassword,
            createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        await writeJSONFile('users.json', users);
        
        res.status(201).json({ 
            message: 'User registered successfully',
            user: { id: newUser.id, username: newUser.username, email: newUser.email }
        });
        
    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
});

// Task 7: Login as Registered User (3 points)
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }
        
        const users = await readJSONFile('users.json');
        const user = users.find(u => u.username === username);
        
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, username: user.username },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.json({
            message: 'Login successful',
            token,
            user: { id: user.id, username: user.username, email: user.email }
        });
        
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
});

module.exports = router;