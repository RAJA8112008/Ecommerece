# AI PDF-to-E-Course Platform — Full Implementation Plan

## Overview
Complete all empty backend and frontend files for a full-stack application that transforms uploaded PDFs into structured e-learning courses using AI (Groq API). The project uses React + Vite (frontend) and Node.js + Express + MongoDB (backend).

## User Review Required

> [!IMPORTANT]
> **Groq API Key Required**: The AI course generation uses Groq's free API. You will need a free Groq API key from https://console.groq.com — add it to the `.env` file as `GROQ_API_KEY`.

> [!IMPORTANT]
> **MongoDB Required**: You need a MongoDB Atlas connection string (free tier). Add it as `MONGO_URI` in the `.env` file.

> [!WARNING]
> **Frontend Framework Change**: The existing `frontend/package.json` is a bare npm init. We will scaffold it as a **Vite + React** project as specified in the README (React 19, Vite, Tailwind CSS).

## Open Questions
None — the README specifies the full tech stack clearly.

---

## Proposed Changes

### Backend (`/backend`)

#### [MODIFY] [package.json](file:///c:/Users/Nitin%20kumar/OneDrive/Desktop/E-commerece/backend/package.json)
Add `openai`-compatible Groq SDK, `helmet`, `express-rate-limit`.

#### [NEW] [.env.example](file:///c:/Users/Nitin%20kumar/OneDrive/Desktop/E-commerece/backend/.env.example)
Template environment variables.

#### [NEW] [src/index.js](file:///c:/Users/Nitin%20kumar/OneDrive/Desktop/E-commerece/backend/src/index.js)
Express app entry point — CORS, morgan, routes, error handler.

#### [NEW] [src/config/db.js](file:///c:/Users/Nitin%20kumar/OneDrive/Desktop/E-commerece/backend/src/config/db.js)
MongoDB connection with Mongoose.

#### [NEW] [src/models/User.js](file:///c:/Users/Nitin%20kumar/OneDrive/Desktop/E-commerece/backend/src/models/User.js)
User schema (name, email, password hash, avatar).

#### [NEW] [src/models/Course.js](file:///c:/Users/Nitin%20kumar/OneDrive/Desktop/E-commerece/backend/src/models/Course.js)
Course schema (title, description, lessons, quizzes, progress, owner).

#### [NEW] [src/middleware/auth.js](file:///c:/Users/Nitin%20kumar/OneDrive/Desktop/E-commerece/backend/src/middleware/auth.js)
JWT verification middleware.

#### [NEW] [src/middleware/upload.js](file:///c:/Users/Nitin%20kumar/OneDrive/Desktop/E-commerece/backend/src/middleware/upload.js)
Multer PDF upload config.

#### [NEW] [src/middleware/errorHandler.js](file:///c:/Users/Nitin%20kumar/OneDrive/Desktop/E-commerece/backend/src/middleware/errorHandler.js)
Global error handler.

#### [NEW] [src/controllers/authController.js](file:///c:/Users/Nitin%20kumar/OneDrive/Desktop/E-commerece/backend/src/controllers/authController.js)
Register, login, getMe endpoints.

#### [NEW] [src/controllers/courseController.js](file:///c:/Users/Nitin%20kumar/OneDrive/Desktop/E-commerece/backend/src/controllers/courseController.js)
Upload PDF → parse → AI generate course, list courses, get course, update progress.

#### [NEW] [src/controllers/chatController.js](file:///c:/Users/Nitin%20kumar/OneDrive/Desktop/E-commerece/backend/src/controllers/chatController.js)
Context-aware chatbot using Groq with PDF content.

#### [NEW] [src/services/aiService.js](file:///c:/Users/Nitin%20kumar/OneDrive/Desktop/E-commerece/backend/src/services/aiService.js)
Groq API calls for course generation and chat.

#### [NEW] [src/services/pdfService.js](file:///c:/Users/Nitin%20kumar/OneDrive/Desktop/E-commerece/backend/src/services/pdfService.js)
PDF parsing with pdf-parse.

#### [NEW] [src/routes/authRoutes.js](file:///c:/Users/Nitin%20kumar/OneDrive/Desktop/E-commerece/backend/src/routes/authRoutes.js)
POST /api/auth/register, /login, GET /api/auth/me.

#### [NEW] [src/routes/courseRoutes.js](file:///c:/Users/Nitin%20kumar/OneDrive/Desktop/E-commerece/backend/src/routes/courseRoutes.js)
POST /api/courses/upload, GET /api/courses, GET /api/courses/:id, PUT /api/courses/:id/progress.

#### [NEW] [src/routes/chatRoutes.js](file:///c:/Users/Nitin%20kumar/OneDrive/Desktop/E-commerece/backend/src/routes/chatRoutes.js)
POST /api/chat.

#### [NEW] [src/utils/generateToken.js](file:///c:/Users/Nitin%20kumar/OneDrive/Desktop/E-commerece/backend/src/utils/generateToken.js)
JWT token generation helper.

---

### Frontend (`/frontend`)

Scaffold as Vite + React + Tailwind CSS project.

#### [MODIFY] [package.json](file:///c:/Users/Nitin%20kumar/OneDrive/Desktop/E-commerece/frontend/package.json)
Full Vite + React dependencies.

#### [NEW] Frontend files:
- `index.html` — HTML entry
- `vite.config.js` — Vite config with API proxy
- `tailwind.config.js` — Tailwind config
- `postcss.config.js` — PostCSS
- `src/main.jsx` — React root
- `src/App.jsx` — Router + layout
- `src/index.css` — Global styles + Tailwind
- `src/context/AuthContext.jsx` — Auth state
- `src/hooks/useAuth.js` — Auth hook
- `src/services/api.js` — Axios instance
- `src/services/courseService.js` — Course API calls
- `src/services/chatService.js` — Chat API calls
- `src/pages/LandingPage.jsx` — Beautiful landing
- `src/pages/LoginPage.jsx` — Login form
- `src/pages/RegisterPage.jsx` — Register form
- `src/pages/DashboardPage.jsx` — User dashboard
- `src/pages/UploadPage.jsx` — PDF upload
- `src/pages/CourseDetailPage.jsx` — Course view
- `src/pages/ChatPage.jsx` — AI chatbot
- `src/components/Navbar.jsx` — Navigation
- `src/components/CourseCard.jsx` — Course card
- `src/components/LessonViewer.jsx` — Lesson display
- `src/components/QuizModal.jsx` — Quiz modal
- `src/components/ProgressBar.jsx` — Progress tracker
- `src/components/ChatBubble.jsx` — Chat message
- `src/components/LoadingSpinner.jsx` — Loading state
- `src/utils/helpers.js` — Utility functions

## Verification Plan

### Automated
```bash
cd backend && npm install && npm run dev
cd frontend && npm install && npm run dev
```

### Manual Verification
1. Open http://localhost:5173 — landing page loads
2. Register/Login — JWT stored in localStorage
3. Upload a PDF — AI generates course structure
4. View course lessons and take quiz
5. Chat with AI about PDF content
