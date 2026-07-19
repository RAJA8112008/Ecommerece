/**
 * =============================================================
 * models.js — All Database Models (User + Course)
 * =============================================================
 * 
 * WHAT IS A MODEL?
 * A model defines the "shape" of data stored in MongoDB (our database).
 * Think of it like a blueprint for a house — it tells the database
 * what fields each document should have, their types, and rules.
 * 
 * We use "Mongoose" — a library that makes working with MongoDB easy.
 * Instead of writing raw database queries, we define schemas (blueprints)
 * and Mongoose handles the rest.
 * 
 * This file contains TWO models:
 * 1. User — stores user accounts (name, email, password)
 * 2. Course — stores AI-generated courses (lessons, quizzes, progress)
 * =============================================================
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// ─────────────────────────────────────────────
// USER MODEL
// ─────────────────────────────────────────────
// This stores information about each registered user.
// "Schema" = the structure/shape of a User document in MongoDB.

const userSchema = new mongoose.Schema(
  {
    // The user's display name
    name: {
      type: String,
      required: [true, 'Name is required'],   // Can't be empty
      trim: true,                              // Removes extra spaces
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    // The user's email (must be unique — no two users can share an email)
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,                            // No duplicate emails allowed
      lowercase: true,                         // Converts to lowercase automatically
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    // The user's password (gets hashed/encrypted before saving)
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    avatar: { type: String, default: '' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

/**
 * PRE-SAVE HOOK — runs BEFORE a user document is saved to the database.
 * 
 * WHY? We never want to store passwords as plain text (security risk!).
 * bcrypt.hash() turns "mypassword123" into something like "$2b$12$xyz..."
 * that can't be reversed. When the user logs in, we compare the hashed versions.
 */
userSchema.pre('save', async function (next) {
  // Only hash the password if it was changed (not on every save)
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12); // 12 = strength of hashing
  next();
});

/**
 * INSTANCE METHOD — comparePassword
 * Used during login to check if the entered password matches the stored hash.
 * Returns true if they match, false if they don't.
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * toJSON override — whenever we send user data to the frontend,
 * this automatically removes the password field so it's never exposed.
 */
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

// Create the User model from the schema
const User = mongoose.model('User', userSchema);


// ─────────────────────────────────────────────
// COURSE MODEL
// ─────────────────────────────────────────────
// This stores everything about an AI-generated course:
// title, description, lessons, quiz questions, and user's progress.

// Sub-schema for individual lessons within a course
const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },   // The actual lesson text
  order: { type: Number, default: 0 },          // Lesson number (1, 2, 3...)
});

// Sub-schema for quiz questions
const quizQuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String }],                   // Array of answer choices
  correctAnswer: { type: Number, required: true }, // Index of correct option (0, 1, 2, or 3)
  explanation: { type: String, default: '' },     // Why this answer is correct
});

// Main course schema
const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    // "owner" links this course to the user who created it (a reference/foreign key)
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    pdfName: { type: String, default: '' },       // Original PDF filename
    pdfPath: { type: String, default: '' },       // Where the PDF is stored on disk
    // The full text extracted from the PDF (used for AI chat context)
    // "select: false" means this field is NOT returned by default (it's big!)
    pdfContent: { type: String, default: '', select: false },
    lessons: [lessonSchema],                       // Array of lesson objects
    quiz: [quizQuestionSchema],                    // Array of quiz questions
    progress: { type: Number, default: 0, min: 0, max: 100 }, // 0-100%
    completedLessons: [{ type: Number }],          // Array of completed lesson indexes
    tags: [{ type: String }],                      // Topic tags
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    // Status of AI course generation
    status: {
      type: String,
      enum: ['processing', 'ready', 'failed'],
      default: 'processing',
    },
  },
  { timestamps: true }
);

// Create the Course model from the schema
const Course = mongoose.model('Course', courseSchema);


// ─────────────────────────────────────────────
// EXPORT both models so other files can use them
// ─────────────────────────────────────────────
module.exports = { User, Course };
