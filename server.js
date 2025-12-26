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

// Get notifications/reminders for user
app.get('/api/notifications/:userId', (req, res) => {
    try {
        const { userId } = req.params;
        const data = readData();
        const userPredictions = data.predictions[userId] || [];
        
        const notifications = [];
        const now = new Date();
        
        userPredictions.forEach(prediction => {
            if (!prediction.predictions?.milestones) return;
            
            prediction.predictions.milestones.forEach((milestone, idx) => {
                const progress = prediction.progress?.milestones?.[idx];
                if (progress?.completed) return; // Skip completed milestones
                
                // Parse period (e.g., "in 3 months", "через 3 месяца")
                const periodMatch = milestone.period?.match(/(\d+)/);
                if (!periodMatch) return;
                
                const months = parseInt(periodMatch[1]);
                const createdAt = new Date(prediction.createdAt);
                const dueDate = new Date(createdAt);
                dueDate.setMonth(dueDate.getMonth() + months);
                
                // Create notification if due within 30 days
                const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
                if (daysUntilDue <= 30 && daysUntilDue >= 0) {
                    notifications.push({
                        id: `${prediction.id}-${idx}`,
                        predictionId: prediction.id,
                        skill: prediction.skill,
                        milestoneIndex: idx,
                        milestone: milestone.achievement,
                        period: milestone.period,
                        dueDate: dueDate.toISOString(),
                        daysUntilDue,
                        priority: daysUntilDue <= 7 ? 'high' : daysUntilDue <= 14 ? 'medium' : 'low'
                    });
                }
            });
        });
        
        // Sort by priority and days until due
        notifications.sort((a, b) => {
            if (a.priority !== b.priority) {
                const priorityOrder = { high: 0, medium: 1, low: 2 };
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            }
            return a.daysUntilDue - b.daysUntilDue;
        });
        
        res.json({ notifications });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get analytics for user
app.get('/api/analytics/:userId', (req, res) => {
    try {
        const { userId } = req.params;
        const data = readData();
        const userPredictions = data.predictions[userId] || [];
        
        const analytics = {
            totalPredictions: userPredictions.length,
            totalMilestones: 0,
            completedMilestones: 0,
            skills: [],
            progressOverTime: [],
            completionRate: 0,
            averageProgress: 0,
            skillDistribution: {},
            monthlyActivity: {}
        };
        
        userPredictions.forEach(prediction => {
            const milestones = prediction.predictions?.milestones || [];
            const progress = prediction.progress?.milestones || [];
            
            analytics.totalMilestones += milestones.length;
            analytics.completedMilestones += progress.filter(p => p.completed).length;
            
            if (prediction.skill) {
                analytics.skills.push(prediction.skill);
                analytics.skillDistribution[prediction.skill] = (analytics.skillDistribution[prediction.skill] || 0) + 1;
            }
            
            const completed = progress.filter(p => p.completed).length;
            const total = milestones.length;
            const progressPercent = total > 0 ? (completed / total) * 100 : 0;
            
            analytics.progressOverTime.push({
                date: prediction.createdAt,
                skill: prediction.skill,
                progress: progressPercent,
                completed,
                total
            });
            
            // Monthly activity
            const month = new Date(prediction.createdAt).toISOString().substring(0, 7);
            analytics.monthlyActivity[month] = (analytics.monthlyActivity[month] || 0) + 1;
        });
        
        analytics.completionRate = analytics.totalMilestones > 0 
            ? (analytics.completedMilestones / analytics.totalMilestones) * 100 
            : 0;
        
        analytics.averageProgress = analytics.progressOverTime.length > 0
            ? analytics.progressOverTime.reduce((sum, p) => sum + p.progress, 0) / analytics.progressOverTime.length
            : 0;
        
        // Sort skills by frequency
        analytics.topSkills = Object.entries(analytics.skillDistribution)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([skill, count]) => ({ skill, count }));
        
        res.json({ analytics });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get skill recommendations
app.post('/api/recommendations', async (req, res) => {
    try {
        const { userId, currentSkills } = req.body;
        
        if (!genAI) {
            return res.status(500).json({
                error: { 
                    message: 'GEMINI_API_KEY is not configured. Please add your API key to the .env file.'
                }
            });
        }
        
        const data = readData();
        const userPredictions = data.predictions[userId] || [];
        
        // Extract skills from user's predictions
        const userSkills = currentSkills || userPredictions.map(p => p.skill).filter(Boolean);
        const skillsList = userSkills.length > 0 ? userSkills.join(', ') : 'beginner';
        
        const prompt = `You are a career development expert. Based on the user's current skills: ${skillsList}, recommend 5 complementary skills they should learn next to advance their career.

For each recommendation, provide:
- skill name
- why it complements their current skills
- difficulty level (beginner/intermediate/advanced)
- estimated time to learn (in months)
- career impact (high/medium/low)

Respond ONLY with valid JSON in this format:
{
  "recommendations": [
    {
      "skill": "Skill Name",
      "reason": "Why this skill complements their current skills",
      "difficulty": "beginner|intermediate|advanced",
      "timeToLearn": 3,
      "careerImpact": "high|medium|low",
      "relatedSkills": ["skill1", "skill2"]
    }
  ]
}`;

        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash-lite'
        });

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            res.json({ recommendations: parsed.recommendations || [] });
        } else {
            throw new Error('Could not parse recommendations from AI response');
        }
    } catch (error) {
        console.error('Error generating recommendations:', error);
        res.status(500).json({ error: error.message || 'Failed to generate recommendations' });
    }
});

// Get job listings (mock - can integrate with real job APIs like Adzuna, Indeed, etc.)
app.post('/api/jobs', async (req, res) => {
    try {
        const { skill, location } = req.body;
        
        // Mock job data - in production, integrate with real job APIs
        const mockJobs = [
            {
                title: `Senior ${skill} Developer`,
                company: 'Tech Corp',
                location: location || 'Remote',
                type: 'Full-time',
                salary: '$90,000 - $130,000',
                description: `We are looking for an experienced ${skill} developer to join our team.`,
                skills: [skill, 'JavaScript', 'React', 'Node.js'],
                url: `https://www.indeed.com/jobs?q=${encodeURIComponent(skill)}`
            },
            {
                title: `${skill} Specialist`,
                company: 'Innovation Labs',
                location: location || 'Remote',
                type: 'Full-time',
                salary: '$80,000 - $120,000',
                description: `Join our team as a ${skill} specialist and work on cutting-edge projects.`,
                skills: [skill, 'Python', 'AWS'],
                url: `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(skill)}`
            },
            {
                title: `Mid-level ${skill} Engineer`,
                company: 'StartupXYZ',
                location: location || 'Remote',
                type: 'Full-time',
                salary: '$70,000 - $100,000',
                description: `We're hiring a ${skill} engineer to help build our platform.`,
                skills: [skill, 'TypeScript', 'Docker'],
                url: `https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${encodeURIComponent(skill)}`
            }
        ];

        res.json({ jobs: mockJobs });
    } catch (error) {
        console.error('Error fetching jobs:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get achievements for user
app.get('/api/achievements/:userId', (req, res) => {
    try {
        const { userId } = req.params;
        const data = readData();
        const userPredictions = data.predictions[userId] || [];
        
        const stats = {
            totalPredictions: userPredictions.length,
            completedMilestones: 0,
            uniqueSkills: new Set(),
            currentStreak: 0
        };

        userPredictions.forEach(prediction => {
            const completed = prediction.progress?.milestones?.filter(m => m.completed).length || 0;
            stats.completedMilestones += completed;
            if (prediction.skill) {
                stats.uniqueSkills.add(prediction.skill);
            }
        });

        stats.uniqueSkills = stats.uniqueSkills.size;

        // Calculate streak (simplified - check last 7 days)
        const recentPredictions = userPredictions
            .filter(p => {
                const date = new Date(p.createdAt);
                const daysAgo = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
                return daysAgo <= 7;
            })
            .length;
        stats.currentStreak = Math.min(recentPredictions, 7);

        const achievements = [
            {
                type: 'first_prediction',
                name: 'First Steps',
                description: 'Created your first prediction',
                unlocked: userPredictions.length > 0,
                unlockedAt: userPredictions.length > 0 ? userPredictions[0]?.createdAt : null
            },
            {
                type: 'milestone_master',
                name: 'Milestone Master',
                description: 'Complete 10 milestones',
                unlocked: stats.completedMilestones >= 10,
                progress: stats.completedMilestones,
                target: 10,
                unlockedAt: stats.completedMilestones >= 10 ? new Date().toISOString() : null
            },
            {
                type: 'streak',
                name: 'Consistent Learner',
                description: 'Maintain a 7-day streak',
                unlocked: stats.currentStreak >= 7,
                progress: stats.currentStreak,
                target: 7,
                unlockedAt: stats.currentStreak >= 7 ? new Date().toISOString() : null
            },
            {
                type: 'skill_explorer',
                name: 'Skill Explorer',
                description: 'Explore 5 different skills',
                unlocked: stats.uniqueSkills >= 5,
                progress: stats.uniqueSkills,
                target: 5,
                unlockedAt: stats.uniqueSkills >= 5 ? new Date().toISOString() : null
            },
            {
                type: 'completionist',
                name: 'Completionist',
                description: 'Complete all milestones in a prediction',
                unlocked: userPredictions.some(p => {
                    const total = p.predictions?.milestones?.length || 0;
                    const completed = p.progress?.milestones?.filter(m => m.completed).length || 0;
                    return total > 0 && completed === total;
                }),
                unlockedAt: userPredictions.find(p => {
                    const total = p.predictions?.milestones?.length || 0;
                    const completed = p.progress?.milestones?.filter(m => m.completed).length || 0;
                    return total > 0 && completed === total;
                })?.createdAt || null
            }
        ];

        res.json({ achievements, stats });
    } catch (error) {
        console.error('Error fetching achievements:', error);
        res.status(500).json({ error: error.message });
    }
});

// Generate interview preparation questions
app.post('/api/interview-prep', async (req, res) => {
    try {
        const { skill, level } = req.body;

        if (!genAI) {
            return res.status(500).json({
                error: { message: 'GEMINI_API_KEY is not configured.' }
            });
        }

        const prompt = `Generate 5 realistic interview questions for a ${level} level ${skill} position. Include a mix of technical, behavioral, and problem-solving questions.

For each question, provide:
- question: The interview question
- type: "Technical", "Behavioral", or "Problem-Solving"
- hint: A helpful hint for answering

Respond ONLY with valid JSON:
{
  "questions": [
    {
      "question": "Question text",
      "type": "Technical",
      "hint": "Hint text"
    }
  ]
}`;

        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            res.json({ questions: parsed.questions || [] });
        } else {
            throw new Error('Could not parse questions from AI response');
        }
    } catch (error) {
        console.error('Error generating interview questions:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get feedback on interview answer
app.post('/api/interview-prep/feedback', async (req, res) => {
    try {
        const { skill, question, userAnswer, level } = req.body;

        if (!genAI) {
            return res.status(500).json({
                error: { message: 'GEMINI_API_KEY is not configured.' }
            });
        }

        const prompt = `You are an expert interviewer evaluating a candidate's answer for a ${level} level ${skill} position.

Question: ${question}
Candidate's Answer: ${userAnswer}

Provide constructive feedback in JSON format:
{
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"],
  "score": 8
}

Score should be 1-10. Be specific and helpful.`;

        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            res.json({ feedback: parsed });
        } else {
            throw new Error('Could not parse feedback from AI response');
        }
    } catch (error) {
        console.error('Error generating feedback:', error);
        res.status(500).json({ error: error.message });
    }
});

// Generate learning roadmap
app.post('/api/learning-roadmap', async (req, res) => {
    try {
        const { skill, level, timeframe } = req.body;

        if (!genAI) {
            return res.status(500).json({
                error: { message: 'GEMINI_API_KEY is not configured.' }
            });
        }

        const prompt = `Create a detailed learning roadmap for ${skill} at ${level} level over ${timeframe} year(s).

Structure it as phases with modules. Each module should have:
- name: Module title
- description: What will be learned
- resources: Array of learning resources with title, url (optional), and type
- checkpoints: Array of skills/achievements to verify learning

Respond ONLY with valid JSON:
{
  "overview": "Brief overview of the roadmap",
  "phases": [
    {
      "name": "Phase name",
      "description": "Phase description",
      "duration": 4,
      "modules": [
        {
          "name": "Module name",
          "description": "Module description",
          "resources": [
            {"title": "Resource name", "url": "https://...", "type": "Course"}
          ],
          "checkpoints": ["Checkpoint 1", "Checkpoint 2"]
        }
      ]
    }
  ],
  "tips": ["Tip 1", "Tip 2"]
}`;

        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            res.json({ roadmap: parsed });
        } else {
            throw new Error('Could not parse roadmap from AI response');
        }
    } catch (error) {
        console.error('Error generating roadmap:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Proxy server running at http://localhost:${PORT}`);
});
