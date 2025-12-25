// API utility to handle different environments
const getApiUrl = () => {
    // In development, use localhost if server is running
    // In production (Vercel), use relative paths
    if (import.meta.env.DEV) {
        return 'http://localhost:3001';
    }
    // In production, use relative paths (same domain)
    // Vercel will serve API routes from /api/*
    return 'https://future-vision-backend.onrender.com';
};

export const API_BASE = getApiUrl();

export const apiRequest = async (endpoint, options = {}) => {
    const url = `${API_BASE}${endpoint}`;
    return fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });
};

