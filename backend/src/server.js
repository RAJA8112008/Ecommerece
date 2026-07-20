/**
 * =============================================================
 * server.js — Main Backend Entry Point
 * =============================================================
 * 
 * This is the FIRST file that runs when you start the backend.
 * It does 4 things:
 *   1. Connects to the MongoDB database
 *   2. Creates the Express web server
 *   3. Adds security & utility middleware
 *   4. Registers all API routes and starts listening
 * 
 * HOW TO RUN:
 *   npm run dev   (uses nodemon — auto-restarts on file changes)
 *   npm start     (production mode)
 * 
 * WHAT IS EXPRESS?
 * Express is a web framework for Node.js. It makes it easy to
 * create a server that listens for HTTP requests (GET, POST, etc.)
 * and sends back responses.
 * 
 * WHAT IS MIDDLEWARE?
 * Middleware functions run BETWEEN receiving a request and sending
 * a response. They can modify the request, add security headers,
 * log requests, parse JSON bodies, etc. Think of them as "filters"
 * that every request passes through.
 * =============================================================
 */

// ─────────────────────────────────────────────
// Load environment variables from .env file
// ─────────────────────────────────────────────
// The .env file contains secrets (like database URL, API keys)
// that we don't want to hardcode in our source code.
const dotenv = require('dotenv');
dotenv.config();

// ─────────────────────────────────────────────
// Import required packages
// ─────────────────────────────────────────────
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const path = require('path');

// Import our routes (all API endpoints are defined in routes.js)
const { authRouter, courseRouter, chatRouter } = require('./routes');


// ─────────────────────────────────────────────
// STEP 1: Connect to MongoDB Database
// ─────────────────────────────────────────────
// MongoDB is a "NoSQL" database that stores data as JSON-like documents.
// Mongoose is the library we use to interact with MongoDB from Node.js.
const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ecourse';
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    console.error('💡 Make sure MongoDB is running or set MONGO_URI in .env');
    process.exit(1); // Stop the server if we can't connect to the database
  }
};

// Connect to database immediately
connectDB();


// ─────────────────────────────────────────────
// STEP 2: Create Express Application
// ─────────────────────────────────────────────
const app = express();


// ─────────────────────────────────────────────
// STEP 3: Add Middleware (runs on EVERY request)
// ─────────────────────────────────────────────

// HELMET — Adds security headers to protect against common attacks
app.use(helmet({ crossOriginResourcePolicy: false }));

// CORS — Allows our frontend to talk to our backend.
// Without CORS, browsers block requests between different domains/ports.
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://ecommerece-gold-zeta.vercel.app',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. curl, mobile apps, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  })
);

// MORGAN — Logs every request to the console (useful for debugging)
// Example output: "GET /api/courses 200 25ms"
app.use(morgan('dev'));

// BODY PARSERS — Converts incoming JSON/form data into JavaScript objects
// Without this, req.body would be undefined!
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// STATIC FILES — Serves uploaded PDFs from the /uploads folder
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// RATE LIMITING — Prevents abuse by limiting requests per IP
// Max 100 requests per 15 minutes per IP address
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);


// ─────────────────────────────────────────────
// STEP 4: Register API Routes
// ─────────────────────────────────────────────
// Each router handles a group of related endpoints.
// The first argument is the URL prefix.
app.use('/api/auth', authRouter);       // /api/auth/login, /api/auth/register, etc.
app.use('/api/courses', courseRouter);   // /api/courses, /api/courses/:id, etc.
app.use('/api/chat', chatRouter);       // /api/chat

// Health check endpoint — useful to verify the server is running
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date(), env: process.env.NODE_ENV });
});


// ─────────────────────────────────────────────
// GLOBAL ERROR HANDLER
// ─────────────────────────────────────────────
// This catches any errors thrown in route handlers.
// Instead of crashing the server, it sends a clean error response.
// Express knows this is an error handler because it has 4 parameters.
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle specific error types with user-friendly messages
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  }
  if (err.code === 11000) { // Duplicate key (e.g., email already exists)
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already in use`;
  }
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired, please login again';
  }
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message = 'File size too large. Max 20MB allowed.';
  }

  res.status(statusCode).json({ error: message });
});


// ─────────────────────────────────────────────
// START THE SERVER
// ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV}`);
  console.log(`🤖 AI: ${process.env.GROQ_API_KEY ? 'Groq connected' : 'Mock mode (add GROQ_API_KEY)'}\n`);
});

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "E-Commerce Backend is running 🚀",
  });
});
module.exports = app;
