import { readData, writeData } from '../../../_data.js';

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

    if (req.method !== 'PUT') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { userId, predictionId } = req.query;
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
}

