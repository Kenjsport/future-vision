import { GoogleGenerativeAI } from '@google/generative-ai';

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

    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: { message: 'Prompt is required' } });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({
            error: {
                message: 'GEMINI_API_KEY is not configured. Please add your API key to the Vercel environment variables. Get your key from: https://makersuite.google.com/app/apikey'
            }
        });
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
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
}

