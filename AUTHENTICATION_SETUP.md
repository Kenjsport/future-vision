# Authentication Setup Guide

## Overview

FutureVision now includes JWT-based authentication with persistent user accounts. Users can register, log in, and access their account page where all their predictions and history are stored.

## Features

- ✅ JWT token-based authentication
- ✅ Secure password hashing with bcrypt
- ✅ Persistent user accounts
- ✅ Account page with user stats and history
- ✅ Protected routes (account page requires login)
- ✅ Automatic token verification on app load

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/verify` - Verify JWT token

### Account
- `GET /api/account/me` - Get current user account info (requires authentication)

## Environment Variables

For production (Vercel), add these environment variables:

1. **JWT_SECRET** - A secure random string for signing JWT tokens
   - Generate one: `openssl rand -base64 32`
   - Example: `JWT_SECRET=your-super-secret-key-here`

2. **GEMINI_API_KEY** - Your Google Gemini API key (already required)

## How It Works

1. **Registration**: User creates account with email, password, and name
   - Password is hashed with bcrypt
   - JWT token is generated and returned
   - User data is stored in `data.json` (or database in production)

2. **Login**: User logs in with email/password
   - Password is verified against stored hash
   - JWT token is generated and returned
   - Token is stored in localStorage

3. **Token Management**: 
   - Token is stored in `localStorage` as `futurevision_token`
   - Token is automatically verified on app load
   - Token expires after 30 days

4. **Account Page**:
   - Requires authentication (redirects to login if not authenticated)
   - Shows user profile, stats, and full history
   - All predictions are linked to user's email

## Data Storage

Currently uses file-based storage (`data.json`). For production:

- **Recommended**: Use a database (MongoDB, PostgreSQL, etc.)
- **Vercel Option**: Use Vercel KV or Vercel Postgres
- Update `api/_data.js` to use your database instead of in-memory storage

## User Flow

1. User visits landing page
2. Clicks "Log In" or "Create Account"
3. After successful auth, redirected to Account page
4. Account page shows:
   - User profile (name, email, member since)
   - Statistics (total predictions, completed, milestones)
   - Button to view full history
5. User can access main app features from account page
6. All predictions are saved to their account

## Security Notes

- Passwords are hashed with bcrypt (10 rounds)
- JWT tokens expire after 30 days
- Tokens are verified on each protected route access
- Change `JWT_SECRET` in production to a secure random string

## Testing

1. Start the server: `npm run server`
2. Start the frontend: `npm run dev`
3. Try registering a new account
4. Log out and log back in
5. Check that your predictions persist

