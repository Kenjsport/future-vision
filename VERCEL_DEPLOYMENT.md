# Vercel Deployment Guide

## Setup Instructions

### 1. Environment Variables

In your Vercel project settings, add the following environment variables:

- **GEMINI_API_KEY**: Your Google Gemini API key (get it from https://makersuite.google.com/app/apikey)
- **JWT_SECRET**: A secure random string for JWT token signing (generate with: `openssl rand -base64 32`)

### 2. Deploy to Vercel

1. Install Vercel CLI (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

   Or connect your GitHub repository to Vercel for automatic deployments.

### 3. Important Notes

#### Data Persistence

⚠️ **Current Limitation**: The app uses in-memory storage for predictions, which means:
- Data is lost when the serverless function restarts
- Data is lost on each deployment
- Data is not shared between function invocations

**For Production**, you should replace the in-memory storage with a database:
- **Vercel KV** (recommended for Vercel)
- **MongoDB Atlas** (free tier available)
- **PostgreSQL** (via Vercel Postgres or Supabase)
- **Firebase Firestore**

To use a database, update `api/_data.js` to use your database instead of in-memory storage.

#### Local Development

For local development, you can still use the Express server:

```bash
npm run server
```

This will run `server.js` on `http://localhost:3001`.

The frontend will automatically detect the environment and use:
- `http://localhost:3001` in development
- Relative paths (`/api/*`) in production (Vercel)

### 4. API Routes

All API routes are now serverless functions in the `/api` directory:
- `/api/predict` - Generate predictions
- `/api/predictions/save` - Save a prediction
- `/api/predictions/[userId]` - Get user predictions
- `/api/predictions/[userId]/[predictionId]` - Get/delete single prediction
- `/api/predictions/[userId]/[predictionId]/progress` - Update progress
- `/api/resources/[skill]` - Get learning resources

### 5. Troubleshooting

If you see "Could not connect to proxy server":
- Make sure `GEMINI_API_KEY` is set in Vercel environment variables
- Check Vercel function logs for errors
- Verify the API routes are deployed correctly

