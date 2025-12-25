import { readData, writeData, generateId } from '../_data.js';

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

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
}

