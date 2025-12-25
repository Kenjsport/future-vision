// Shared data storage module for Vercel serverless functions
// NOTE: This uses in-memory storage which resets on each deployment
// For production, replace this with a database (Vercel KV, MongoDB, PostgreSQL, etc.)

let dataStore = {
    users: {},
    predictions: {}
};

// Initialize from environment variable if available (for persistence across deployments)
if (typeof process !== 'undefined' && process.env.DATA_STORE) {
    try {
        dataStore = JSON.parse(process.env.DATA_STORE);
    } catch (e) {
        console.error('Failed to parse DATA_STORE:', e);
    }
}

export const readData = () => {
    return { ...dataStore };
};

export const writeData = (data) => {
    dataStore = { ...data };
    // In production, save to database here
    // For now, we could save to Vercel KV or another service
};

export const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

