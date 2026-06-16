# DigiSahabat Upgrade PRD & Developer Instructions

**Project:** DigiSahabat — Digital Literacy Assessment and Learning App for Indigenous Communities  
**Platform:** React Native mobile app with lightweight backend  
**Purpose of this document:** Provide a practical product requirements document and implementation guide for upgrading the current final-year project prototype into a cleaner, more impressive showcase build.

---

## 1. Product Summary

DigiSahabat is a mobile learning application designed to help Orang Asli and indigenous communities learn basic digital skills in a simple, friendly, and culturally sensitive way. The upgraded version should feel like a lightweight Duolingo-style digital literacy app: easy onboarding, simple lessons, quizzes, achievements, badges, progress tracking, a leaderboard, friends, offline-friendly module access, and a voice-enabled AI companion.

The new version does **not** need to be production-ready. The goal is to create a polished showcase that demonstrates one complete learning journey: user signs in with a 6-digit PIN, sees the home dashboard, starts a lesson, answers a quiz, earns a badge, appears on the leaderboard, adds friends using username, and talks to the AI assistant.

---

## 2. Current Prototype Review

Based on the uploaded Figma screen exports, the current prototype already includes the following screens:

- Splash screen
- Sign-up screen
- Login screen with 6-digit PIN
- Language selection screen
- Home screen
- Learning modules screen
- Module overview screen
- Learning content screens
- Quiz screens with correct and incorrect states
- Completion and badge screen
- AI chatbot screen
- AI Talk screen
- Profile screen
- Edit profile screen
- Settings screen
- Change PIN, username, and phone number modals

### What is working well

- The green colour palette is friendly and appropriate for an educational app.
- The app already has a clear direction: learning, quiz, badge, AI assistant, profile, and settings.
- The use of large cards and rounded buttons is good for beginner users.
- The PIN login flow is suitable for users who may not want to remember complex passwords.
- The AI Talk screen already has a good visual starting point with the listening wave animation.

### Main areas to improve

- Make the navigation flow more consistent and easier to understand.
- Make lesson progression feel more rewarding and guided.
- Improve spacing, hierarchy, typography, and empty states.
- Add small animations to make the app feel modern without overwhelming users.
- Make the AI chatbot more useful by giving it a clear personality and safe scope.
- Add backend support for users, progress, badges, friends, leaderboard, and AI requests.
- Replace Gemini API with an open-source AI model served from the backend.
- Implement fake download/local transfer animations for showcase purposes.

---

## 3. Product Goals

### Primary goals

1. Help beginner users learn basic digital skills through short visual lessons.
2. Provide a simple PIN-based login experience instead of password-based login.
3. Showcase one complete learning path with one lesson, one quiz, one badge, and one leaderboard update.
4. Showcase an AI companion that can be used through both text and voice.
5. Demonstrate offline-first thinking through fake module download and local transfer animations.
6. Improve the UI/UX so the app looks polished, calm, smooth, and easy to use.

### Secondary goals

1. Make the app structure scalable for future real modules.
2. Add a simple backend with PostgreSQL for realistic data handling.
3. Use Better Auth where useful for user/session management, while keeping 6-digit PIN login as the main user-facing authentication method.
4. Keep implementation simple enough for a final-year showcase.

---

## 4. Non-Goals

The upgraded showcase version does **not** need to include:

- Real production deployment.
- Real app store release.
- Real payment features.
- Fully working offline module transfer between phones.
- Fully trained AI model.
- Full support for all Orang Asli languages.
- Advanced admin dashboard.
- Real-time multiplayer or real-time chat.
- Enterprise-grade security.

---

## 5. Target Users

### 5.1 Learner

A beginner user from an indigenous community who wants to learn basic digital skills. This user may have low digital confidence, limited internet access, and may prefer simple visuals, audio guidance, and short lessons.

### 5.2 Facilitator / Community Helper

A teacher, volunteer, or community helper who may help users set up accounts, explain lessons, or guide them through learning activities.

### 5.3 Demo Evaluator

A lecturer, examiner, or project reviewer who wants to see that the system is functional, inclusive, and technically complete.

---

## 6. Product Principles

1. **Simple first** — every screen should be understandable within three seconds.
2. **Low cognitive load** — avoid too many options on one screen.
3. **Voice-friendly** — important instructions should have an audio option.
4. **Large tap targets** — buttons should be easy to press.
5. **Minimal text** — use short sentences and icons.
6. **Friendly encouragement** — reward effort, not only correctness.
7. **Offline-aware** — the app should give the impression that learning can continue with poor connectivity.
8. **Culturally respectful** — avoid stereotypes, overused tribal visuals, or language that sounds patronising.

---

## 7. Recommended Tech Stack

## 7.1 Frontend Mobile App

Use **Expo React Native with TypeScript**.

Recommended packages:

- **Expo Router** — file-based routing and cleaner navigation.
- **NativeWind** — Tailwind-style styling for React Native.
- **React Native Reanimated** — smooth UI animations.
- **Moti** — easier animated components on top of Reanimated.
- **Lottie React Native** — success, badge, download, and transfer animations.
- **Lucide React Native** — clean icon system.
- **Zustand** — lightweight state management.
- **TanStack Query** — API fetching and caching.
- **React Hook Form + Zod** — form handling and validation.
- **Expo SQLite** — local progress/module cache.
- **Expo SecureStore** — store session token securely.
- **Expo Speech** — text-to-speech for lesson and AI responses.
- **React Native Voice or backend Whisper endpoint** — speech-to-text for AI Talk.
- **Expo Haptics** — light feedback for quiz answers, badges, and button taps.

### Frontend UI style

- Minimal, warm, clean, and friendly.
- Keep the current green identity but make it more consistent.
- Use soft background gradients only on major screens like Splash, AI Talk, and Completion.
- Use white cards with soft shadows and rounded corners.
- Use large icons and short labels.
- Avoid dense paragraphs.

---

## 7.2 Backend

Use a lightweight TypeScript backend.

Recommended stack:

- **Node.js + Fastify** or **Hono**
- **PostgreSQL**
- **Drizzle ORM**
- **Better Auth** for users/session-related foundation
- **Zod** for request validation
- **Pino** for logging
- **Docker Compose** for PostgreSQL and local AI services
- **Ollama** for open-source LLM serving

Recommended backend approach:

- Keep the backend simple and demo-focused.
- Store users, PIN hash, lessons, quizzes, progress, badges, friendships, leaderboard points, and AI chat logs.
- Use Better Auth for user/session tables where possible, but implement a custom PIN login endpoint because the app does not use traditional passwords.

---

## 7.3 Open-Source AI Replacement for Gemini

Replace Gemini API with a backend-hosted open-source model.

Recommended demo setup:

- **Ollama** as the local model server.
- Suggested models:
  - `qwen2.5:3b` for lightweight multilingual support.
  - `llama3.2:3b` for general chat.
  - `phi3:mini` if the laptop has limited resources.

For the showcase, the mobile app should **not** call Ollama directly. The app should call your backend API:

```text
Mobile App -> Backend /ai/chat -> Ollama -> Backend -> Mobile App
```

This keeps the app cleaner and makes it easier to swap models later.

### Voice AI approach

For the demo AI Talk feature:

1. User taps and holds the microphone button.
2. App records speech or uses speech recognition.
3. Speech is converted to text.
4. Text is sent to `/ai/chat`.
5. AI returns a short answer.
6. App reads the answer aloud using `Expo Speech`.

For a simple showcase, speech-to-text can be handled in one of three ways:

| Option | Difficulty | Recommendation |
|---|---:|---|
| Device speech recognition | Medium | Good if it works reliably on demo phone |
| Backend Whisper / faster-whisper | Medium/High | Good but heavier setup |
| Fake transcript animation | Easy | Acceptable for backup demo mode |

Add a fallback mode called **Demo Voice Mode**. In this mode, when the user taps the mic, the app shows a listening animation and uses a pre-filled sample question such as:

> “How do I know if a message is a scam?”

The AI then responds using the actual chatbot endpoint or a mocked response if Ollama is not running.

---

## 8. Authentication Requirements

## 8.1 PIN-based login

The app should use a **6-digit PIN** instead of a password.

### Sign-up fields

- Display name
- Username
- Phone number, optional for showcase
- 6-digit PIN
- Confirm PIN
- Preferred language

### Login fields

- Username or phone number
- 6-digit PIN

### Rules

- PIN must be exactly 6 digits.
- Do not store the PIN in plain text.
- Store `pinHash` in the backend database using Argon2 or bcrypt.
- Add simple rate limiting for login attempts.
- After successful login, return a session token.
- Store the session token using SecureStore.

### Demo shortcut

For demo purposes, create one seeded account:

```text
Username: auntylela
PIN: 123456
Display name: Aunty Lela
```

---

## 9. App Navigation Structure

Use bottom tabs for main sections:

1. **Home**
2. **Learn**
3. **DigiBuddy**
4. **Friends**
5. **Profile**

### Suggested routes

```text
/
/(auth)/splash
/(auth)/language
/(auth)/login
/(auth)/signup
/(auth)/reset-pin

/(tabs)/home
/(tabs)/learn
/(tabs)/digibuddy
/(tabs)/friends
/(tabs)/profile

/lesson/[moduleId]
/lesson/[moduleId]/content/[lessonId]
/lesson/[moduleId]/quiz/[quizId]
/lesson/[moduleId]/complete

/settings
/settings/edit-profile
/settings/change-pin
/settings/change-username
/settings/change-phone

/ai/talk
/download/[moduleId]
/transfer/[moduleId]
```

---

## 10. UI/UX Upgrade Instructions

## 10.1 Global design system

### Colours

Use the current green identity, but define it properly:

```text
Primary Green: #6AB99D
Dark Green: #2F7D62
Light Mint: #EAF7F1
Soft Cream: #FFF8E8
Text Dark: #1F2933
Text Muted: #6B7280
Success Green: #22C55E
Warning Yellow: #FBBF24
Error Red: #EF4444
Card White: #FFFFFF
```

### Typography

Use a clean rounded font if available:

- Heading: Nunito Sans / Poppins / Inter
- Body: Inter / System font

Text sizes:

```text
Screen title: 24–28px
Section title: 18–20px
Body text: 14–16px
Small helper text: 12–13px
Button text: 15–16px
```

### Buttons

Primary button:

- Rounded corners: 16–20px
- Height: 52–56px
- Clear label with icon where useful

Secondary button:

- White background
- Green border
- Green text

Disabled button:

- Low opacity
- Clear disabled state

### Accessibility

- Minimum tap size: 44px.
- Use clear contrast.
- Avoid small text on pale backgrounds.
- Add audio icon beside lesson instructions.
- Use simple words and short sentences.

---

## 10.2 Screen-by-screen improvements

### Splash Screen

Current idea is good. Improve by adding:

- Soft animated logo scale-in.
- Tagline fade-in.
- Auto-navigate after 1.5 seconds.

Suggested tagline:

> Your friendly guide to digital skills

---

### Language Selection Screen

Improve by adding:

- Larger language cards.
- Small explanation: “Choose the language you are most comfortable with.”
- Language options:
  - Bahasa Malaysia
  - English
  - Demo: Semai / Temiar locked or labelled “Coming soon”

For showcase, only Bahasa Malaysia and English need to work.

---

### Login Screen

Improve by adding:

- Friendly welcome text.
- 6 large PIN boxes.
- Number keypad if possible.
- “Forgot PIN?” link.
- “Continue as Guest” button for demo.

Suggested copy:

```text
Welcome back
Enter your username and 6-digit PIN to continue learning.
```

---

### Home Screen

Home should feel like the learning hub.

Recommended cards:

1. **Greeting card**
   - “Selamat pagi, Aunty Lela” or “Hi, Aunty Lela”
   - Current streak: 3 days
   - XP: 120

2. **Continue Learning card**
   - Module: Learning Tech Devices
   - Progress: 50%
   - Button: Continue

3. **Quick actions**
   - DigiBuddy AI
   - Download Modules
   - My Badges
   - Friends

4. **Daily Tip**
   - Example: “Never share your PIN with anyone.”

---

### Learning Modules Screen

Make modules easier to scan.

Each module card should include:

- Module image/icon
- Title
- Short description
- Difficulty label
- Estimated time
- Progress bar
- Status: Not Started / In Progress / Completed
- Download button

For the showcase, include 3 modules but only make 1 fully functional:

1. Learning Tech Devices — functional
2. Internet Safety — locked or preview only
3. Using Online Services — locked or preview only

---

### Module Overview Screen

Show:

- Hero image
- Module title
- One-sentence description
- What users will learn
- Number of parts
- Estimated time
- Start / Continue button
- Download module button

Add a simple progress stepper:

```text
Part 1 -> Part 2 -> Quiz -> Badge
```

---

### Learning Content Screen

Use a card-based lesson format.

Each lesson page should have:

- Large image or illustration
- Short title
- Simple explanation
- Audio button
- “I understand” or “Next” button
- Progress indicator: Part 1 of 3

Avoid long paragraphs. Use simple chunking.

---

### Quiz Screen

Improve by adding:

- One question per screen.
- Large answer cards.
- Immediate feedback after selecting answer.
- Explanation after each answer.
- Haptic feedback.
- Progress indicator.

Correct feedback:

```text
Correct! Well done.
Printers use paper to print documents and pictures.
```

Incorrect feedback:

```text
Not quite. The correct answer is B.
The paper goes in the paper tray.
```

---

### Completion and Badge Screen

Make this screen more celebratory.

Add:

- Lottie confetti animation.
- Badge card animation.
- XP earned.
- Button to share progress locally.
- Button to view leaderboard.

Suggested badge:

```text
Badge earned: Tech Explorer
Reason: Completed the Learning Tech Devices module.
Reward: +50 XP
```

---

### AI Chatbot Screen

Rename the AI assistant to **DigiBuddy**.

Chatbot requirements:

- Short friendly answers.
- Explain step-by-step.
- Avoid technical jargon.
- Buttons for suggested questions.
- Microphone shortcut to AI Talk.
- Text-to-speech button for every AI answer.

Suggested prompt chips:

```text
What is a scam message?
How do I use a printer?
What is Wi-Fi?
How do I create a safe PIN?
```

---

### AI Talk Screen

Keep the current listening visual direction, but polish it.

States:

1. Idle — “Tap to ask DigiBuddy”
2. Listening — waveform animation
3. Thinking — pulsing mascot animation
4. Speaking — animated sound waves
5. Error — “I could not hear that. Please try again.”

Add a “Back to chat” button.

---

### Profile Screen

Show:

- Avatar
- Display name
- Username
- Level
- XP
- Badges
- Learning progress
- Friends count
- Settings shortcut

---

### Friends Screen

Add a dedicated screen for friends.

Features:

- Search/add friend by username.
- Show pending requests.
- Show friends list.
- Show friend XP and badge count.

Demo usernames:

```text
pakdin
siti01
uncleman
```

---

### Leaderboard Screen

Leaderboard can be inside Friends or Home.

Show:

- Weekly leaderboard
- User rank
- XP points
- Badge count

Example leaderboard:

| Rank | User | XP |
|---:|---|---:|
| 1 | Aunty Lela | 120 |
| 2 | Pak Din | 95 |
| 3 | Siti | 80 |

---

## 11. Showcase MVP Scope

The upgraded prototype only needs one complete vertical slice.

### Must-have showcase flow

1. User opens app.
2. User selects language.
3. User logs in using username + 6-digit PIN.
4. User lands on Home.
5. User opens Learning Tech Devices module.
6. User watches/reads one lesson.
7. User answers one quiz with correct/incorrect feedback.
8. User earns the Tech Explorer badge.
9. User sees XP added to leaderboard.
10. User adds a friend using username.
11. User opens DigiBuddy chatbot.
12. User asks a question by text.
13. User opens AI Talk and speaks or uses demo voice mode.
14. User sees fake module download animation.
15. User sees fake local transfer animation.

---

## 12. Learning Content Requirements

## 12.1 Module: Learning Tech Devices

### Module summary

This module teaches users about common technology devices and how they are used in daily life.

### Lesson 1: What is technology?

**Simple explanation:**

Technology is a tool that helps us do things faster or easier. A phone helps us call family. A printer helps us print documents. The internet helps us find information.

**Audio narration:**

> Technology means tools that help us in daily life. Some examples are phones, printers, and the internet.

### Lesson 2: What is a printer?

**Simple explanation:**

A printer is a device that prints words or pictures onto paper. People use printers for forms, school work, letters, and documents.

**Key point:**

Paper goes into the paper tray.

### Lesson 3: Safe device use

**Simple explanation:**

Do not press unknown links. Do not share your PIN. Ask someone you trust if you are unsure.

---

## 12.2 Quiz for Learning Tech Devices

### Question 1

**Question:** What is the main function of a printer?

A. Make phone calls  
B. Print documents  
C. Play music

**Correct answer:** B

**Correct feedback:**

> Correct! A printer is used to print documents and pictures.

**Incorrect feedback:**

> Not quite. The correct answer is B. A printer prints documents and pictures.

### Question 2

**Question:** Where does the paper go in a printer?

A. On top  
B. In the paper tray  
C. Behind the printer

**Correct answer:** B

**Correct feedback:**

> Correct! Paper usually goes in the paper tray.

**Incorrect feedback:**

> Not quite. The paper goes in the paper tray.

### Question 3

**Question:** What should you do if you receive a strange message asking for your PIN?

A. Share your PIN quickly  
B. Ignore it or ask someone you trust  
C. Send it to more people

**Correct answer:** B

**Correct feedback:**

> Correct! Never share your PIN. Ask someone you trust if you are unsure.

**Incorrect feedback:**

> Be careful. You should never share your PIN with anyone.

---

## 13. Badge and Achievement Requirements

## 13.1 Badge: Tech Explorer

**Trigger:** User completes Learning Tech Devices module quiz.  
**Reward:** +50 XP  
**Visual:** Friendly mascot holding a small device icon.  
**Message:**

```text
Congratulations!
You earned the Tech Explorer badge.
You completed your first digital skills lesson.
```

## 13.2 Achievement types for future expansion

| Achievement | Trigger | Reward |
|---|---|---:|
| First Step | Complete first lesson | 10 XP |
| Tech Explorer | Complete Learning Tech Devices | 50 XP |
| Safe Learner | Complete Internet Safety quiz | 50 XP |
| Helpful Friend | Add first friend | 20 XP |
| DigiBuddy Chat | Ask AI one question | 10 XP |
| 3-Day Streak | Learn for 3 days | 30 XP |

---

## 14. Fake Download and Local Transfer Animation

The current prototype does not need real offline module downloading or real phone-to-phone transfer. Implement fake but believable animations.

## 14.1 Fake module download

### User flow

1. User taps “Download Module”.
2. Bottom sheet opens.
3. Shows module size, for example “12 MB”.
4. Progress bar animates from 0% to 100% in 3 seconds.
5. Shows success state: “Module saved for offline learning.”
6. Module card displays “Downloaded”.

### Animation states

```text
Preparing module...
Downloading lesson images...
Saving quiz...
Ready for offline learning!
```

### Important note

This is only a UI simulation for showcase. Add a code comment:

```ts
// TODO: Replace fake download animation with real offline module caching.
```

---

## 14.2 Fake local transfer

### User flow

1. User taps “Share Module Nearby”.
2. Screen shows two phone illustrations.
3. Animated dots move from one phone to another.
4. Progress reaches 100%.
5. Success message: “Module transferred successfully.”

### Animation states

```text
Looking for nearby device...
Connecting...
Sending module...
Transfer complete!
```

### Important note

This is only a UI simulation for showcase. Add a code comment:

```ts
// TODO: Replace fake transfer with Bluetooth/Wi-Fi Direct/Nearby Share implementation.
```

---

## 15. Backend Requirements

## 15.1 API modules

The backend should contain:

1. Auth module
2. User module
3. Lesson module
4. Quiz module
5. Progress module
6. Badge module
7. Friends module
8. Leaderboard module
9. AI module

---

## 15.2 API endpoints

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
GET    /users/me
PATCH  /users/me
PATCH  /users/me/username
PATCH  /users/me/phone
```

### Lessons

```http
GET /modules
GET /modules/:moduleId
GET /modules/:moduleId/lessons
GET /lessons/:lessonId
```

### Quizzes

```http
GET  /modules/:moduleId/quiz
POST /quiz/:quizId/submit
```

### Progress

```http
GET  /progress/me
POST /progress/lesson-complete
POST /progress/module-complete
```

### Badges

```http
GET /badges/me
GET /badges
```

### Friends

```http
GET  /friends
POST /friends/request
POST /friends/accept
POST /friends/remove
```

### Leaderboard

```http
GET /leaderboard/weekly
GET /leaderboard/friends
```

### AI

```http
POST /ai/chat
POST /ai/voice-transcribe
```

For showcase, `/ai/voice-transcribe` can be mocked or skipped if the app uses device speech recognition.

---

## 16. Database Schema

Use PostgreSQL with Drizzle ORM.

### users

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  phone_number TEXT UNIQUE,
  preferred_language TEXT DEFAULT 'en',
  avatar_url TEXT,
  pin_hash TEXT NOT NULL,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  streak_count INTEGER DEFAULT 0,
  last_active_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### modules

```sql
CREATE TABLE modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  difficulty TEXT DEFAULT 'beginner',
  estimated_minutes INTEGER DEFAULT 5,
  image_url TEXT,
  is_published BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### lessons

```sql
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES modules(id),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  audio_text TEXT,
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### quizzes

```sql
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES modules(id),
  title TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### quiz_questions

```sql
CREATE TABLE quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES quizzes(id),
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_option_id TEXT NOT NULL,
  explanation TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);
```

### user_progress

```sql
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  module_id UUID REFERENCES modules(id),
  lesson_id UUID REFERENCES lessons(id),
  status TEXT DEFAULT 'not_started',
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### badges

```sql
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_url TEXT,
  xp_reward INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### user_badges

```sql
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  badge_id UUID REFERENCES badges(id),
  earned_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);
```

### friendships

```sql
CREATE TABLE friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES users(id),
  receiver_id UUID REFERENCES users(id),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(requester_id, receiver_id)
);
```

### ai_chat_messages

```sql
CREATE TABLE ai_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 17. Seed Data Requirements

Create a seed script that inserts demo data.

### Demo user

```json
{
  "displayName": "Aunty Lela",
  "username": "auntylela",
  "pin": "123456",
  "preferredLanguage": "en",
  "xp": 70,
  "level": 2
}
```

### Demo module

```json
{
  "title": "Learning Tech Devices",
  "description": "Learn about common technology devices and how they are used in daily life.",
  "difficulty": "Beginner",
  "estimatedMinutes": 5
}
```

### Demo badge

```json
{
  "code": "tech_explorer",
  "name": "Tech Explorer",
  "description": "Completed the Learning Tech Devices module.",
  "xpReward": 50
}
```

### Demo friends

```json
[
  { "displayName": "Pak Din", "username": "pakdin", "xp": 95 },
  { "displayName": "Siti", "username": "siti01", "xp": 80 },
  { "displayName": "Uncle Man", "username": "uncleman", "xp": 60 }
]
```

---

## 18. AI Assistant Requirements

## 18.1 Assistant name

Use **DigiBuddy**.

## 18.2 Assistant personality

DigiBuddy should be:

- Friendly
- Patient
- Simple
- Encouraging
- Non-judgemental
- Clear and practical

## 18.3 System prompt

Use this backend system prompt:

```text
You are DigiBuddy, a friendly digital literacy helper for beginner learners. 
Explain things in very simple words. Use short sentences. Avoid technical jargon. 
Be patient, encouraging, and respectful. 
Focus on digital literacy topics such as smartphones, internet safety, scams, printers, online forms, Wi-Fi, passwords, PINs, and basic apps. 
If the user asks something outside digital learning, politely guide them back. 
Never ask for private information such as PINs, passwords, bank details, or IC numbers. 
If the user mentions a scam, tell them not to click links, not to share codes, and to ask a trusted person for help.
```

## 18.4 Example AI interactions

### User

```text
What is Wi-Fi?
```

### DigiBuddy

```text
Wi-Fi is a way for your phone to connect to the internet without using a cable. 
When you connect to Wi-Fi, you can open websites, send messages, or watch videos.
```

### User

```text
Someone asked me for my PIN.
```

### DigiBuddy

```text
Please do not share your PIN. 
A real bank, shop, or app should not ask for your private PIN in a message. 
If you are unsure, ask someone you trust before pressing anything.
```

---

## 19. Frontend File Structure

Recommended Expo structure:

```text
digisahabat/
├── apps/
│   ├── mobile/
│   │   ├── app/
│   │   │   ├── _layout.tsx
│   │   │   ├── index.tsx
│   │   │   ├── (auth)/
│   │   │   │   ├── _layout.tsx
│   │   │   │   ├── splash.tsx
│   │   │   │   ├── language.tsx
│   │   │   │   ├── login.tsx
│   │   │   │   ├── signup.tsx
│   │   │   │   └── reset-pin.tsx
│   │   │   ├── (tabs)/
│   │   │   │   ├── _layout.tsx
│   │   │   │   ├── home.tsx
│   │   │   │   ├── learn.tsx
│   │   │   │   ├── digibuddy.tsx
│   │   │   │   ├── friends.tsx
│   │   │   │   └── profile.tsx
│   │   │   ├── lesson/
│   │   │   │   └── [moduleId]/
│   │   │   │       ├── index.tsx
│   │   │   │       ├── content/[lessonId].tsx
│   │   │   │       ├── quiz/[quizId].tsx
│   │   │   │       └── complete.tsx
│   │   │   ├── ai/
│   │   │   │   └── talk.tsx
│   │   │   ├── settings/
│   │   │   │   ├── index.tsx
│   │   │   │   ├── edit-profile.tsx
│   │   │   │   ├── change-pin.tsx
│   │   │   │   ├── change-username.tsx
│   │   │   │   └── change-phone.tsx
│   │   │   ├── download/[moduleId].tsx
│   │   │   └── transfer/[moduleId].tsx
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── common/
│   │   │   │   ├── lesson/
│   │   │   │   ├── quiz/
│   │   │   │   ├── ai/
│   │   │   │   ├── badges/
│   │   │   │   └── friends/
│   │   │   ├── constants/
│   │   │   │   ├── colours.ts
│   │   │   │   ├── typography.ts
│   │   │   │   └── routes.ts
│   │   │   ├── hooks/
│   │   │   ├── lib/
│   │   │   │   ├── api.ts
│   │   │   │   ├── auth.ts
│   │   │   │   ├── speech.ts
│   │   │   │   ├── storage.ts
│   │   │   │   └── sqlite.ts
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── modules.service.ts
│   │   │   │   ├── quiz.service.ts
│   │   │   │   ├── progress.service.ts
│   │   │   │   ├── friends.service.ts
│   │   │   │   └── ai.service.ts
│   │   │   ├── store/
│   │   │   │   ├── auth.store.ts
│   │   │   │   ├── progress.store.ts
│   │   │   │   └── ui.store.ts
│   │   │   ├── types/
│   │   │   └── utils/
│   │   ├── assets/
│   │   │   ├── images/
│   │   │   ├── animations/
│   │   │   └── icons/
│   │   ├── package.json
│   │   └── app.json
```

---

## 20. Backend File Structure

```text
digisahabat/
├── apps/
│   ├── api/
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── env.ts
│   │   │   ├── db/
│   │   │   │   ├── client.ts
│   │   │   │   ├── schema.ts
│   │   │   │   ├── migrations/
│   │   │   │   └── seed.ts
│   │   │   ├── auth/
│   │   │   │   ├── auth.config.ts
│   │   │   │   ├── auth.routes.ts
│   │   │   │   ├── pin.service.ts
│   │   │   │   └── auth.middleware.ts
│   │   │   ├── users/
│   │   │   │   ├── users.routes.ts
│   │   │   │   └── users.service.ts
│   │   │   ├── modules/
│   │   │   │   ├── modules.routes.ts
│   │   │   │   └── modules.service.ts
│   │   │   ├── quiz/
│   │   │   │   ├── quiz.routes.ts
│   │   │   │   └── quiz.service.ts
│   │   │   ├── progress/
│   │   │   │   ├── progress.routes.ts
│   │   │   │   └── progress.service.ts
│   │   │   ├── badges/
│   │   │   │   ├── badges.routes.ts
│   │   │   │   └── badges.service.ts
│   │   │   ├── friends/
│   │   │   │   ├── friends.routes.ts
│   │   │   │   └── friends.service.ts
│   │   │   ├── leaderboard/
│   │   │   │   ├── leaderboard.routes.ts
│   │   │   │   └── leaderboard.service.ts
│   │   │   ├── ai/
│   │   │   │   ├── ai.routes.ts
│   │   │   │   ├── ai.service.ts
│   │   │   │   └── prompts.ts
│   │   │   └── utils/
│   │   ├── package.json
│   │   ├── drizzle.config.ts
│   │   └── Dockerfile
├── docker-compose.yml
├── package.json
└── README.md
```

---

## 21. Environment Variables

### Backend `.env`

```env
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/digisahabat
BETTER_AUTH_SECRET=replace-this-with-random-secret
BETTER_AUTH_URL=http://localhost:4000
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:3b
```

### Mobile `.env`

```env
EXPO_PUBLIC_API_URL=http://localhost:4000
EXPO_PUBLIC_DEMO_MODE=true
```

For Android emulator, use:

```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:4000
```

---

## 22. Demo Mode Requirements

Add a clear `DEMO_MODE` flag.

When `DEMO_MODE=true`:

- The app can log in using the seeded demo user.
- Fake download animation is enabled.
- Fake transfer animation is enabled.
- AI Talk can use demo transcript if speech recognition fails.
- Locked modules can show preview cards.
- Leaderboard can include seeded users.

This prevents the showcase from breaking if the backend or AI service has issues.

---

## 23. Acceptance Criteria

The upgraded showcase is considered successful when:

1. User can open the app and select a language.
2. User can sign in using username and 6-digit PIN.
3. Home screen displays learning progress, XP, and quick actions.
4. User can open the Learning Tech Devices module.
5. User can complete at least one lesson.
6. User can complete a quiz with correct and incorrect feedback.
7. User receives the Tech Explorer badge.
8. User XP updates after completing the module.
9. Leaderboard displays the demo user and seeded friends.
10. User can send a friend request by username.
11. User can chat with DigiBuddy using text.
12. User can open AI Talk and receive a spoken response.
13. Fake download animation completes successfully.
14. Fake local transfer animation completes successfully.
15. App UI feels clean, smooth, minimalistic, and consistent.

---

## 24. Suggested Development Phases

## Phase 1: Project setup

- Set up Expo app with TypeScript.
- Set up backend with Fastify/Hono.
- Set up PostgreSQL with Docker Compose.
- Set up Drizzle ORM.
- Create seed data.

## Phase 2: UI foundation

- Add design tokens.
- Create reusable components:
  - AppButton
  - AppCard
  - ProgressBar
  - BadgeCard
  - LessonCard
  - QuizOption
  - ScreenHeader
  - BottomNav

## Phase 3: Authentication

- Build sign-up and login screens.
- Implement 6-digit PIN validation.
- Store session securely.
- Add demo account.

## Phase 4: Learning flow

- Build modules list.
- Build module overview.
- Build lesson content.
- Build quiz flow.
- Build completion and badge screen.

## Phase 5: Social and gamification

- Add XP calculation.
- Add badges.
- Add leaderboard.
- Add friends by username.

## Phase 6: AI chatbot

- Set up Ollama.
- Add backend `/ai/chat` endpoint.
- Build DigiBuddy chat UI.
- Add suggested questions.

## Phase 7: AI Talk

- Add voice/listening screen.
- Add speech-to-text or demo transcript.
- Add text-to-speech response.
- Add fallback mode.

## Phase 8: Demo polish

- Add Lottie animations.
- Add fake download flow.
- Add fake transfer flow.
- Add loading states and error states.
- Test full demo script.

---

## 25. Demo Script

Use this sequence during presentation:

1. Open DigiSahabat.
2. Select English or Bahasa Malaysia.
3. Log in as:

```text
Username: auntylela
PIN: 123456
```

4. Show Home dashboard.
5. Tap Learning Tech Devices.
6. Tap Start Module.
7. Read one lesson and tap audio button.
8. Continue to quiz.
9. Choose a wrong answer first to show feedback.
10. Choose the correct answer to show success.
11. Complete the module.
12. Show Tech Explorer badge.
13. Open leaderboard and show updated XP.
14. Add friend by username: `pakdin`.
15. Open DigiBuddy chatbot.
16. Ask: “What is a scam message?”
17. Open AI Talk.
18. Ask by voice or use demo mode question.
19. Show fake download module animation.
20. Show fake local transfer animation.

---

## 26. Important Development Notes

- This version is for showcase, not real deployment.
- Do not claim that fake download or fake transfer is fully functional.
- Keep all AI answers short and beginner-friendly.
- Do not let the AI request private information.
- Keep the PIN flow simple but hash the PIN on the backend.
- Prioritise UI polish and a reliable demo journey over building too many incomplete features.
- Make every screen feel complete, even if the data is seeded or mocked.

---

## 27. Final Recommended Build Priority

If time is limited, build in this order:

1. Login with PIN
2. Home dashboard
3. Learning module list
4. One lesson
5. One quiz
6. Badge completion
7. Leaderboard
8. Add friend by username
9. AI chatbot text
10. AI Talk voice/demo mode
11. Fake download animation
12. Fake transfer animation
13. Profile/settings polish

---

## 28. Summary

The upgraded DigiSahabat should become a clean, friendly, and convincing educational app prototype. The key is not to build too many real production features. Instead, focus on a complete and polished learning journey that clearly demonstrates the project’s purpose: helping beginner learners gain digital confidence through accessible lessons, quizzes, rewards, friends, and a supportive AI companion.
