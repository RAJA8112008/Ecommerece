/**
 * =============================================================
 * routes.js — All API Routes, Controllers & Services
 * =============================================================
 * 
 * WHAT ARE ROUTES?
 * Routes are like "addresses" for your API. When the frontend sends
 * a request to "/api/auth/login", Express checks this file to find
 * the matching route and runs the handler function.
 * 
 * WHAT ARE CONTROLLERS?
 * Controllers are the functions that handle each route. They receive
 * the request, do some work (like querying the database), and send
 * back a response.
 * 
 * WHAT ARE SERVICES?
 * Services contain business logic that controllers use — like
 * extracting text from PDFs or calling the AI API.
 * 
 * In a larger project, these would be in separate files.
 * We've combined them here so beginners can see the full flow
 * in one place: Route → Controller → Service → Response.
 * 
 * API ENDPOINTS:
 *   POST   /api/auth/register     — Create new account
 *   POST   /api/auth/login        — Login to account
 *   GET    /api/auth/me           — Get current logged-in user
 *   POST   /api/courses/upload    — Upload PDF & generate course
 *   GET    /api/courses           — Get all user's courses
 *   GET    /api/courses/:id       — Get single course
 *   PUT    /api/courses/:id/progress — Update lesson progress
 *   DELETE /api/courses/:id       — Delete a course
 *   POST   /api/chat              — Chat with AI about course
 * =============================================================
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const Groq = require('groq-sdk');
const { User, Course } = require('./models');

// ─────────────────────────────────────────────
// SETUP — Initialize Groq AI client (if API key exists)
// ─────────────────────────────────────────────
let groq = null;
if (process.env.GROQ_API_KEY) {
  groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
}
const AI_MODEL = 'llama3-70b-8192'; // The AI model we use


// ─────────────────────────────────────────────
// HELPER: Generate JWT Token
// ─────────────────────────────────────────────
// JWT (JSON Web Token) is like a "digital ID card" the server gives
// the user after login. The frontend sends this token with every
// request to prove who they are without logging in each time.
const generateToken = (id) => {
  return jwt.sign(
    { id },                                             // Payload: user's ID
    process.env.JWT_SECRET || 'supersecret-change-me',  // Secret key to sign the token
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }   // Token expires in 7 days
  );
};


// ─────────────────────────────────────────────
// SERVICE: Extract text from PDF file
// ─────────────────────────────────────────────
// Reads a PDF file and pulls out all the text content.
// This text is then sent to AI to generate the course.
const extractTextFromPDF = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);  // Read the PDF file
    const data = await pdfParse(dataBuffer);        // Parse it to extract text
    return data.text || '';
  } catch (error) {
    console.error('PDF parse error:', error.message);
    throw new Error('Failed to extract text from PDF. The file may be corrupted or password-protected.');
  }
};


// ─────────────────────────────────────────────
// SERVICE: Generate course from text using AI
// ─────────────────────────────────────────────
// Takes the extracted PDF text and sends it to Groq AI (Llama 3)
// which returns a structured course with lessons and quizzes.
const generateCourseFromText = async (text, pdfName) => {
  // If no API key, return demo/mock data so the app still works
  if (!groq) {
    console.log('⚠️  No GROQ_API_KEY found — returning mock course data');
    return getMockCourse(pdfName);
  }

  // Limit text length to avoid exceeding AI token limits
  const truncatedText = text.slice(0, 8000);

  // This is the "prompt" — instructions we give to the AI
  const prompt = `You are an expert e-learning course designer. Based on the following PDF content, create a comprehensive, structured e-learning course.

PDF Name: ${pdfName}
PDF Content:
${truncatedText}

Return ONLY a valid JSON object with exactly this structure (no markdown, no extra text):
{
  "title": "Descriptive course title based on content",
  "description": "Engaging course description in 2-3 sentences",
  "difficulty": "beginner",
  "tags": ["tag1", "tag2", "tag3"],
  "lessons": [
    {
      "title": "Lesson title",
      "content": "Comprehensive lesson content with at least 200 words. Include key concepts, examples, and explanations drawn from the PDF.",
      "order": 1
    }
  ],
  "quiz": [
    {
      "question": "A specific question about the content?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Why this answer is correct, referencing the material."
    }
  ]
}

Requirements:
- Create 5-7 detailed lessons that cover the material progressively
- Create 5-10 quiz questions testing understanding
- difficulty must be one of: beginner, intermediate, advanced
- correctAnswer is the 0-based index of the correct option
- Base everything on the actual PDF content provided`;

  try {
    // Call the Groq AI API
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: AI_MODEL,
      temperature: 0.6,    // Lower = more focused, Higher = more creative
      max_tokens: 4096,    // Maximum response length
    });

    const content = completion.choices[0].message.content.trim();

    // Extract JSON from the AI response (sometimes AI adds extra text)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('AI did not return valid JSON');

    const parsed = JSON.parse(jsonMatch[0]);

    // Make sure the response has the required fields
    if (!parsed.title || !Array.isArray(parsed.lessons) || parsed.lessons.length === 0) {
      throw new Error('AI response missing required fields');
    }

    return parsed;
  } catch (error) {
    console.error('AI generation error:', error.message);
    return getMockCourse(pdfName); // Fallback to mock data on error
  }
};


// ─────────────────────────────────────────────
// SERVICE: Chat with AI using course content as context
// ─────────────────────────────────────────────
// The AI reads the PDF content and can answer questions about it.
// This makes the chatbot "aware" of what the course is about.
const chatWithContext = async (messages, pdfContent) => {
  if (!groq) {
    return {
      content: 'AI service is not configured. Please add your GROQ_API_KEY to the backend .env file. Get a free key at https://console.groq.com',
    };
  }

  // "System message" tells the AI how to behave
  const systemMessage = {
    role: 'system',
    content: `You are a helpful, knowledgeable AI tutor. You have studied the following course material thoroughly and can answer detailed questions about it. Be concise, educational, and encouraging.

Course Material:
${pdfContent ? pdfContent.slice(0, 6000) : 'No specific course material provided — answer general questions.'}

Guidelines:
- Reference specific content from the material when relevant
- Provide clear, structured explanations
- Use examples to illustrate concepts
- Keep responses focused and under 300 words unless the question requires more detail`,
  };

  const completion = await groq.chat.completions.create({
    messages: [systemMessage, ...messages],
    model: AI_MODEL,
    temperature: 0.5,
    max_tokens: 1000,
  });

  return { content: completion.choices[0].message.content };
};


// ─────────────────────────────────────────────
// SERVICE: Mock course (demo data when no API key)
// ─────────────────────────────────────────────
const getMockCourse = (pdfName) => ({
  title: `Course: ${(pdfName || 'Uploaded PDF').replace('.pdf', '')}`,
  description:
    'This is a demo course generated without AI. Add your GROQ_API_KEY to the backend .env file to generate real AI-powered courses from your PDF content. Get a free key at https://console.groq.com',
  difficulty: 'beginner',
  tags: ['learning', 'education', 'demo'],
  lessons: [
    {
      title: 'Introduction to the Material',
      content:
        'Welcome to this course! This is a demo lesson generated without AI processing. When you add a GROQ_API_KEY to your .env file, each lesson will be filled with detailed, structured content extracted and synthesized from your actual PDF document. The AI will analyze your document and create meaningful, educational content organized into clear learning objectives. For now, explore the platform features — progress tracking, quizzes, and AI chat are all available in demo mode.',
      order: 1,
    },
    {
      title: 'Core Concepts Overview',
      content:
        'This lesson would normally contain the fundamental concepts extracted from your PDF. AI-powered generation analyzes the document structure, identifies key topics, and creates comprehensive explanations with real examples from the source material. Each lesson is designed to build on the previous one, creating a logical learning progression. To unlock AI-powered content, add GROQ_API_KEY=your_key to the backend .env file.',
      order: 2,
    },
    {
      title: 'Deep Dive: Key Principles',
      content:
        'In a real AI-generated course, this lesson would explore the most important principles from your PDF in depth. The AI breaks down complex topics into digestible explanations, provides real-world examples, and connects concepts to help you understand the subject matter comprehensively. The Groq Llama-3 70B model is used for generation, providing high-quality educational content at no cost.',
      order: 3,
    },
    {
      title: 'Practical Applications',
      content:
        'This lesson focuses on how to apply the concepts covered in previous lessons. AI generation ensures practical examples are directly relevant to your specific document. Whether your PDF covers business strategy, science, programming, history, or any other topic, the AI tailors practical exercises and applications accordingly.',
      order: 4,
    },
    {
      title: 'Summary & Key Takeaways',
      content:
        'The final lesson consolidates everything covered in the course. AI generation produces a comprehensive summary of all key points, creates connections between topics, and provides guidance for further learning. To experience the full power of AI course generation, add your free GROQ_API_KEY from https://console.groq.com to the backend .env file.',
      order: 5,
    },
  ],
  quiz: [
    {
      question: 'What does this platform use to generate courses from PDFs?',
      options: ['ChatGPT', 'Groq AI (Llama 3)', 'Manual editors', 'Template system'],
      correctAnswer: 1,
      explanation: 'CourseAI uses Groq AI with the Llama 3 70B model for fast, high-quality course generation.',
    },
    {
      question: 'How do you enable real AI course generation?',
      options: [
        'Buy a premium plan',
        'Add GROQ_API_KEY to the .env file',
        'Upload a special PDF format',
        'Contact support',
      ],
      correctAnswer: 1,
      explanation: 'Add your free GROQ_API_KEY (from console.groq.com) to the backend .env file to enable AI generation.',
    },
    {
      question: 'Which feature allows you to ask questions about your course material?',
      options: ['Progress tracker', 'Quiz system', 'AI Chat (chatbot)', 'PDF viewer'],
      correctAnswer: 2,
      explanation: 'The AI Chat feature uses your PDF content as context to answer questions about the course material.',
    },
  ],
});


// =============================================================
// ROUTES — Define all API endpoints
// =============================================================

// Create separate routers for each feature area
const authRouter = express.Router();
const courseRouter = express.Router();
const chatRouter = express.Router();


// ─────────────────────────────────────────────
// AUTH ROUTES (Public — no login required)
// ─────────────────────────────────────────────

/**
 * POST /api/auth/register — Create a new user account
 * 
 * The frontend sends: { name, email, password }
 * We create the user in the database and send back a JWT token.
 */
authRouter.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Validate that all fields are provided
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please provide name, email, and password' });
    }

    // Check if email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    // Create user (password gets auto-hashed by the pre-save hook in models.js)
    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    // Send back the token and user info
    res.status(201).json({ token, user });
  } catch (error) {
    next(error); // Pass error to error handler
  }
});

/**
 * POST /api/auth/login — Login to an existing account
 * 
 * The frontend sends: { email, password }
 * We verify credentials and send back a JWT token.
 */
authRouter.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    // Check if user exists AND password matches
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user._id);
    res.json({ token, user });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/auth/me — Get the currently logged-in user's info
 * (Protected route — requires valid JWT token)
 */
authRouter.get('/me', async (req, res, next) => {
  try {
    // Extract token from "Authorization: Bearer <token>" header
    const token = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.split(' ')[1]
      : null;

    if (!token) {
      return res.status(401).json({ error: 'Not authorized — no token provided' });
    }

    // Verify the token and get the user
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecret-change-me');
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ error: 'User no longer exists' });
    }

    res.json({ user });
  } catch (error) {
    return res.status(401).json({ error: 'Not authorized — invalid token' });
  }
});


// ─────────────────────────────────────────────
// AUTH MIDDLEWARE — Protects routes that require login
// ─────────────────────────────────────────────
// This function runs BEFORE the actual route handler.
// It checks the JWT token and attaches the user to `req.user`.
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ error: 'Not authorized — no token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecret-change-me');
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ error: 'User no longer exists' });
    }

    next(); // User is authenticated — continue to the route handler
  } catch (error) {
    return res.status(401).json({ error: 'Not authorized — invalid token' });
  }
};


// ─────────────────────────────────────────────
// COURSE ROUTES (Protected — all require login)
// ─────────────────────────────────────────────

// Apply auth middleware to ALL course routes
courseRouter.use(protect);

/**
 * POST /api/courses/upload — Upload a PDF and start AI course generation
 * 
 * This is the core feature! The flow is:
 * 1. User uploads a PDF file
 * 2. We save a "processing" placeholder course immediately
 * 3. We respond to the user right away (so they're not waiting)
 * 4. In the background: extract PDF text → send to AI → save generated course
 */
const multer = require('multer');
const path = require('path');

// Configure where uploaded files are stored
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    // Create unique filename to avoid conflicts
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Only allow PDF files
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed. Please upload a .pdf file.'), false);
    }
  },
  limits: { fileSize: 20 * 1024 * 1024 }, // Max 20MB
});

courseRouter.post('/upload', upload.single('pdf'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a PDF file' });
    }

    // Step 1: Create a placeholder course with "processing" status
    const course = await Course.create({
      title: req.file.originalname.replace(/\.pdf$/i, ''),
      owner: req.user._id,
      pdfName: req.file.originalname,
      pdfPath: req.file.path,
      status: 'processing',
    });

    // Step 2: Respond immediately (202 = "accepted, processing in background")
    res.status(202).json({
      message: 'PDF uploaded successfully. Course generation started.',
      courseId: course._id,
    });

    // Step 3: Process in the background (async IIFE)
    (async () => {
      try {
        console.log(`📄 Processing PDF: ${req.file.originalname}`);
        const text = await extractTextFromPDF(req.file.path);
        console.log(`🤖 Generating course with AI...`);
        const courseData = await generateCourseFromText(text, req.file.originalname);

        // Step 4: Update the course with the AI-generated content
        await Course.findByIdAndUpdate(course._id, {
          title: courseData.title,
          description: courseData.description,
          difficulty: courseData.difficulty || 'beginner',
          tags: courseData.tags || [],
          lessons: courseData.lessons || [],
          quiz: courseData.quiz || [],
          pdfContent: text.slice(0, 20000), // Store text for chatbot context
          status: 'ready',
        });

        console.log(`✅ Course ready: ${courseData.title}`);
      } catch (err) {
        console.error('❌ Course generation failed:', err.message);
        await Course.findByIdAndUpdate(course._id, { status: 'failed' });
      }
    })();
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/courses — Get all courses belonging to the logged-in user
 */
courseRouter.get('/', async (req, res, next) => {
  try {
    const courses = await Course.find({ owner: req.user._id })
      .select('-pdfContent -pdfPath')  // Don't send large/sensitive fields
      .sort({ createdAt: -1 });         // Newest first

    res.json({ courses });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/courses/:id — Get a single course by its ID
 */
courseRouter.get('/:id', async (req, res, next) => {
  try {
    const course = await Course.findOne({
      _id: req.params.id,
      owner: req.user._id,   // Make sure user owns this course
    }).select('-pdfContent');

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json({ course });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/courses/:id/progress — Update which lessons are completed
 * 
 * The frontend sends: { completedLessons: [0, 1, 2] }
 * We calculate the % progress and save it.
 */
courseRouter.put('/:id/progress', async (req, res, next) => {
  try {
    const { completedLessons } = req.body;

    const course = await Course.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    course.completedLessons = completedLessons || [];
    // Calculate progress percentage
    course.progress =
      course.lessons.length > 0
        ? Math.round((course.completedLessons.length / course.lessons.length) * 100)
        : 0;

    await course.save();

    res.json({
      progress: course.progress,
      completedLessons: course.completedLessons,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/courses/:id — Delete a course and its uploaded PDF
 */
courseRouter.delete('/:id', async (req, res, next) => {
  try {
    const course = await Course.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Clean up the uploaded PDF file from disk
    if (course.pdfPath && fs.existsSync(course.pdfPath)) {
      fs.unlinkSync(course.pdfPath);
    }

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    next(error);
  }
});


// ─────────────────────────────────────────────
// CHAT ROUTES (Protected — requires login)
// ─────────────────────────────────────────────

chatRouter.use(protect);

/**
 * POST /api/chat — Send a message to AI chatbot
 * 
 * The frontend sends: { courseId, messages: [{role, content}, ...] }
 * We fetch the course's PDF content and use it as context for the AI.
 */
chatRouter.post('/', async (req, res, next) => {
  try {
    const { courseId, messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Get the PDF content to give the AI context about the course
    let pdfContent = '';
    if (courseId) {
      const course = await Course.findOne({
        _id: courseId,
        owner: req.user._id,
      }).select('+pdfContent title'); // "+pdfContent" overrides "select: false"

      if (course) {
        pdfContent = course.pdfContent || '';
      }
    }

    // Ask the AI and send the response
    const response = await chatWithContext(messages, pdfContent);
    res.json({ message: response.content });
  } catch (error) {
    next(error);
  }
});


// ─────────────────────────────────────────────
// EXPORT all routers
// ─────────────────────────────────────────────
module.exports = { authRouter, courseRouter, chatRouter };
