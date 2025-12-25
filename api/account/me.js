import jwt from 'jsonwebtoken';
import { readData } from '../_data.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware to verify token
const verifyToken = (req) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('No token provided');
    }
    const token = authHeader.substring(7);
    return jwt.verify(token, JWT_SECRET);
};

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const decoded = verifyToken(req);
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
        if (error.message === 'No token provided' || error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        console.error('Get account error:', error);
        res.status(500).json({ error: error.message || 'Failed to get account info' });
    }
}

