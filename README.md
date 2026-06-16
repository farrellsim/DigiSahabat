# DigiSahabat

DigiSahabat is a digital literacy learning app for beginner learners, especially indigenous and rural communities who may prefer simple, friendly, voice-supported guidance. The showcase build combines a React Native mobile app with a lightweight backend for PIN login, learning modules, quizzes, progress, badges, friends, leaderboards, and DigiBuddy, an AI helper powered by Gemini.

The project is designed as a final-year capstone prototype: polished enough to demo a complete learning journey, but intentionally simple enough to run locally.

## Features

- 6-digit PIN login and signup
- Learning module flow with lessons and quiz questions
- Progress tracking and completion rewards
- Badge system with the demo `Tech Explorer` badge
- Friends list and friend requests by username
- Weekly and friends leaderboard
- DigiBuddy AI chat
- Voice transcription endpoint using Gemini
- Demo seed account and demo friends

## Tech Stack

### Mobile App

- Expo React Native
- Expo Router
- NativeWind / Tailwind-style styling
- Zustand
- Expo Speech and voice-related packages

### Backend

- Node.js with ESM
- Fastify
- PostgreSQL
- Drizzle ORM
- Zod validation
- Argon2 PIN hashing
- Gemini API for chat and transcription

## Project Structure

```text
.
├── app/                  # Expo Router screens
├── src/                  # Mobile app source helpers, data, constants, stores
├── server/
│   ├── index.js          # Fastify backend entry point
│   ├── src/
│   │   ├── ai/           # DigiBuddy chat and transcription routes
│   │   ├── auth/         # PIN auth and bearer token helpers
│   │   ├── badges/       # Badge endpoints
│   │   ├── db/           # Drizzle client, schema, migration SQL, seed script
│   │   ├── friends/      # Friend request endpoints
│   │   ├── leaderboard/  # Leaderboard endpoints
│   │   ├── modules/      # Learning module and lesson endpoints
│   │   ├── progress/     # Progress endpoints
│   │   ├── quiz/         # Quiz endpoints
│   │   └── users/        # Profile endpoints
│   └── package.json
└── package.json          # Expo app package
```

## Prerequisites

- Node.js 20 or newer
- npm
- PostgreSQL running locally
- Gemini API key
- Expo Go app or an iOS/Android simulator

## Environment Variables

Create `server/.env`:

```env
GEMINI_API_KEY=your-gemini-api-key
PORT=4000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/digisahabat
BETTER_AUTH_SECRET=replace-this-with-random-secret
BETTER_AUTH_URL=http://localhost:4000
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:3b
```

Notes:
- This project currently keeps using Gemini for `/chat`, `/transcribe`, `/ai/chat`, and `/ai/voice-transcribe`.
- Ollama variables are included because they are part of the original PRD, but Ollama is not required for this implementation.
- Replace `BETTER_AUTH_SECRET` with any long random string for local use.

If the mobile app needs an API URL env file, use:

```env
EXPO_PUBLIC_API_URL=http://localhost:4000
EXPO_PUBLIC_DEMO_MODE=true
```

For Android emulator:

```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:4000
```

For a physical phone, replace `localhost` with your computer's LAN IP address.

## Install

Install mobile dependencies from the project root:

```bash
npm install
```

Install backend dependencies:

```bash
cd server
npm install
```

## Database Setup

Create the local database:

```bash
createdb digisahabat
```

Push the Drizzle schema:

```bash
cd server
npm run db:push
```

Seed demo data:

```bash
npm run seed
```

Demo login:

```text
Username: auntylela
PIN:      123456
```

Seeded demo friends:

```text
pakdin
siti01
uncleman
```

## Run Locally

Start the backend:

```bash
cd server
npm run dev
```

The API runs on:

```text
http://localhost:4000
```

Health check:

```bash
curl http://localhost:4000/health
```

Start the Expo app from the project root:

```bash
npm start
```

Then open the app in Expo Go, an iOS simulator, or an Android emulator.

## Important Backend Endpoints

### Auth

```http
POST /auth/signup-pin
POST /auth/login-pin
POST /auth/logout
GET  /auth/me
POST /auth/change-pin
```

### Users

```http
GET   /users/me
PATCH /users/me
PATCH /users/me/username
PATCH /users/me/phone
```

### Learning

```http
GET  /modules
GET  /modules/:moduleId
GET  /modules/:moduleId/lessons
GET  /lessons/:lessonId
GET  /modules/:moduleId/quiz
POST /quiz/:quizId/submit
```

### Progress, Badges, Friends, Leaderboard

```http
GET  /progress/me
POST /progress/lesson-complete
POST /progress/module-complete
GET  /badges
GET  /badges/me
GET  /friends
POST /friends/request
POST /friends/accept
POST /friends/remove
GET  /leaderboard/weekly
GET  /leaderboard/friends
```

### AI

```http
POST /ai/chat
POST /ai/voice-transcribe
POST /chat
POST /transcribe
GET  /health
```

The `/chat`, `/transcribe`, and `/health` routes are kept for compatibility with the earlier backend.

## Example API Calls

Login:

```bash
curl -X POST http://localhost:4000/auth/login-pin \
  -H "Content-Type: application/json" \
  -d '{"identifier":"auntylela","pin":"123456"}'
```

Ask DigiBuddy:

```bash
curl -X POST http://localhost:4000/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What is a scam message?"}'
```

Get modules:

```bash
curl http://localhost:4000/modules
```

## Local Development Notes

- Protected endpoints require an `Authorization: Bearer <token>` header from `/auth/login-pin`.
- PINs are never stored directly; they are hashed with Argon2.
- The seed script expects PostgreSQL to be running and reachable from `DATABASE_URL`.
- If `npm run seed` fails with `ECONNREFUSED`, start PostgreSQL or check your database URL.
- If the mobile app cannot reach the backend on a physical phone, use your laptop's local network IP instead of `localhost`.

## Showcase Flow

1. Log in as `auntylela` with PIN `123456`.
2. Open the Learning Tech Devices module.
3. Read the lessons.
4. Complete the quiz.
5. Earn the Tech Explorer badge.
6. Check leaderboard progress.
7. Add or view friends.
8. Ask DigiBuddy a digital safety question.

## Scripts

Root app:

```bash
npm start      # Start Expo
npm run ios    # Run iOS build
npm run android
npm test
```

Backend:

```bash
npm run dev        # Start backend
npm run start      # Start backend
npm run db:push    # Push Drizzle schema to PostgreSQL
npm run seed       # Insert demo data
```

## Status

This is a showcase prototype, not a production system. It is built to demonstrate the complete DigiSahabat learning experience locally with realistic backend data and AI-assisted digital literacy support.
