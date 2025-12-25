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

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { skill } = req.query;

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
}

