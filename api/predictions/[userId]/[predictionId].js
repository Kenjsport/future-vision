import { readData, writeData } from '../../_data.js';

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

    const { userId, predictionId } = req.query;

    if (req.method === 'GET') {
        try {
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
    } else if (req.method === 'DELETE') {
        try {
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
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}

