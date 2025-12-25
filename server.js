// import express from 'express';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import { GoogleGenerativeAI } from '@google/generative-ai';

// dotenv.config();

// const app = express();
// app.use(cors());
// app.use(express.json());

// const PORT = process.env.PORT || 3001;

// // Initialize Gemini
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// app.get('/', (req, res) => {
//     res.send('FutureVision Gemini Proxy Server is running.');
// });

// app.post('/api/predict', async (req, res) => {
//     const { prompt } = req.body;

//     try {
//         const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
//         const result = await model.generateContent(prompt);
//         const response = await result.response;
//         const text = response.text();

//         // Format response to match the frontend expectations or keep it simple
//         res.json({ content: [{ text }] });
//     } catch (error) {
//         console.error('Error proxying to Gemini:', error);
//         res.status(500).json({ error: { message: error.message } });
//     }
// });

// app.listen(PORT, () => {
//     console.log(`Proxy server running at http://localhost:${PORT}`);
// });


import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Safety check - warn but don't exit (allows frontend to load)
if (!process.env.GEMINI_API_KEY) {
    console.warn('⚠️  WARNING: GEMINI_API_KEY is missing in .env');
    console.warn('⚠️  The prediction feature will not work until you add your API key.');
    console.warn('⚠️  Get your API key from: https://makersuite.google.com/app/apikey');
    console.warn('⚠️  Create a .env file in the project root with: GEMINI_API_KEY=your_key_here');
}

// Initialize Gemini (will fail gracefully if no key)
let genAI = null;
if (process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

// Data storage file
const DATA_FILE = path.join(__dirname, 'data.json');

// Initialize data file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ users: {}, predictions: {} }, null, 2));
}

// Helper functions for data storage
const readData = () => {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return { users: {}, predictions: {} };
    }
};

const writeData = (data) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// Generate unique ID
const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

app.get('/', (req, res) => {
    res.send('FutureVision Gemini Proxy Server is running.');
});

// Authentication Routes
// Register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ error: 'Email, password, and name are required' });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Validate password length
        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        const data = readData();
        
        // Check if user already exists
        if (data.users[email]) {
            return res.status(409).json({ error: 'User with this email already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const userId = generateId();
        const user = {
            id: userId,
            email,
            name,
            password: hashedPassword,
            createdAt: new Date().toISOString(),
            predictions: []
        };

        data.users[email] = user;
        
        // Initialize user predictions if not exists
        if (!data.predictions[email]) {
            data.predictions[email] = [];
        }

        writeData(data);

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: error.message || 'Registration failed' });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const data = readData();
        const user = data.users[email];

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: error.message || 'Login failed' });
    }
});

// Verify Token
app.post('/api/auth/verify', async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(401).json({ error: 'Token is required' });
        }

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);
        const data = readData();
        const user = data.users[decoded.email];

        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        res.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }
        console.error('Token verification error:', error);
        res.status(500).json({ error: error.message || 'Token verification failed' });
    }
});

// Get Account Info (requires authentication)
app.get('/api/account/me', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, JWT_SECRET);
        const data = readData();
        const user = data.users[decoded.email];

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get user's predictions count
        const predictions = data.predictions[decoded.email] || [];
        const completedPredictions = predictions.filter(p => 
            p.progress?.milestones?.some(m => m.completed)
        ).length;

        res.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                createdAt: user.createdAt,
                stats: {
                    totalPredictions: predictions.length,
                    completedPredictions,
                    totalMilestones: predictions.reduce((sum, p) => 
                        sum + (p.predictions?.milestones?.length || 0), 0
                    )
                }
            }
        });
    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        console.error('Get account error:', error);
        res.status(500).json({ error: error.message || 'Failed to get account info' });
    }
});

app.post('/api/predict', async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: { message: 'Prompt is required' } });
    }

    if (!genAI) {
        return res.status(500).json({
            error: { 
                message: 'GEMINI_API_KEY is not configured. Please add your API key to the .env file. Get your key from: https://makersuite.google.com/app/apikey'
            }
        });
    }

    try {
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash-lite'
        });

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        res.json({ content: [{ text }] });
    } catch (error) {
        console.error('Error proxying to Gemini:', error);
        res.status(500).json({
            error: { message: error.message || 'Gemini request failed' }
        });
    }
});

// Save prediction
app.post('/api/predictions/save', (req, res) => {
    try {
        const { userId, skill, level, timeframe, predictions } = req.body;
        
        if (!userId || !skill || !predictions) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const data = readData();
        if (!data.predictions[userId]) {
            data.predictions[userId] = [];
        }

        const prediction = {
            id: generateId(),
            skill,
            level,
            timeframe,
            predictions,
            createdAt: new Date().toISOString(),
            progress: {
                milestones: predictions.milestones?.map(() => ({ completed: false, notes: '', completedAt: null })) || []
            }
        };

        data.predictions[userId].unshift(prediction);
        writeData(data);

        res.json({ success: true, prediction });
    } catch (error) {
        console.error('Error saving prediction:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get user predictions
app.get('/api/predictions/:userId', (req, res) => {
    try {
        const { userId } = req.params;
        const data = readData();
        const userPredictions = data.predictions[userId] || [];
        res.json({ predictions: userPredictions });
    } catch (error) {
        console.error('Error fetching predictions:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get single prediction
app.get('/api/predictions/:userId/:predictionId', (req, res) => {
    try {
        const { userId, predictionId } = req.params;
        const data = readData();
        const userPredictions = data.predictions[userId] || [];
        const prediction = userPredictions.find(p => p.id === predictionId);
        
        if (!prediction) {
            return res.status(404).json({ error: 'Prediction not found' });
        }
        
        res.json({ prediction });
    } catch (error) {
        console.error('Error fetching prediction:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update prediction progress
app.put('/api/predictions/:userId/:predictionId/progress', (req, res) => {
    try {
        const { userId, predictionId } = req.params;
        const { milestoneIndex, completed, notes } = req.body;
        
        const data = readData();
        const userPredictions = data.predictions[userId] || [];
        const prediction = userPredictions.find(p => p.id === predictionId);
        
        if (!prediction) {
            return res.status(404).json({ error: 'Prediction not found' });
        }

        if (milestoneIndex !== undefined && prediction.progress.milestones[milestoneIndex]) {
            prediction.progress.milestones[milestoneIndex].completed = completed !== undefined ? completed : !prediction.progress.milestones[milestoneIndex].completed;
            if (notes !== undefined) {
                prediction.progress.milestones[milestoneIndex].notes = notes;
            }
            if (prediction.progress.milestones[milestoneIndex].completed) {
                prediction.progress.milestones[milestoneIndex].completedAt = new Date().toISOString();
            } else {
                prediction.progress.milestones[milestoneIndex].completedAt = null;
            }
        }

        writeData(data);
        res.json({ success: true, prediction });
    } catch (error) {
        console.error('Error updating progress:', error);
        res.status(500).json({ error: error.message });
    }
});

// Delete prediction
app.delete('/api/predictions/:userId/:predictionId', (req, res) => {
    try {
        const { userId, predictionId } = req.params;
        const data = readData();
        
        if (!data.predictions[userId]) {
            return res.status(404).json({ error: 'User not found' });
        }

        data.predictions[userId] = data.predictions[userId].filter(p => p.id !== predictionId);
        writeData(data);

        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting prediction:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get learning resources (mock data - can be enhanced with real API)
app.get('/api/resources/:skill', (req, res) => {
    try {
        const { skill } = req.params;
        const skillLower = skill.toLowerCase();
        
        // Mock resources - in production, integrate with real APIs
        const resources = {
            courses: [
                { title: `${skill} - Complete Course`, platform: 'Coursera', url: `https://www.coursera.org/search?query=${encodeURIComponent(skill)}`, type: 'course' },
                { title: `Learn ${skill}`, platform: 'Udemy', url: `https://www.udemy.com/courses/search/?q=${encodeURIComponent(skill)}`, type: 'course' },
                { title: `${skill} Tutorial`, platform: 'YouTube', url: `https://www.youtube.com/results?search_query=${encodeURIComponent(skill + ' tutorial')}`, type: 'video' }
            ],
            books: [
                { title: `Mastering ${skill}`, author: 'Expert Author', url: `https://www.amazon.com/s?k=${encodeURIComponent(skill)}`, type: 'book' }
            ],
            documentation: [
                { title: `${skill} Documentation`, url: `https://www.google.com/search?q=${encodeURIComponent(skill + ' documentation')}`, type: 'docs' }
            ]
        };

        res.json({ resources });
    } catch (error) {
        console.error('Error fetching resources:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Proxy server running at http://localhost:${PORT}`);
});
