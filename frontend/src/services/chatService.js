/**
 * =============================================================
 * chatService.js — Backend connection for AI Chat
 * =============================================================
 * 
 * This file contains functions that talk to the backend specifically
 * for the AI Chatbot feature.
 * =============================================================
 */

import api from './api';

// Send a chat message to the AI
export const sendMessage = async (courseId, messages) => {
  // We send the ID of the course so the backend knows WHICH PDF to use as context
  // We also send the history of messages so the AI remembers the conversation
  const { data } = await api.post('/chat', { courseId, messages });
  
  return data.message; // Return the AI's reply
};
