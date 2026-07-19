/**
 * =============================================================
 * ChatPage.jsx — Where you can chat with the AI tutor
 * =============================================================
 * 
 * Shows a list of messages (ChatBubbles) and a text input box.
 * Sends your message to the AI and displays the response.
 * =============================================================
 */

import { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Sparkles, Send, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

import { getCourse } from '../services/courseService';
import { sendMessage } from '../services/chatService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ChatBubble } from '../components/ChatBubble';

export const ChatPage = () => {
  const { id } = useParams(); // Get course ID from URL
  
  // State variables for the chat
  const [input, setInput] = useState(''); // Whatever the user is typing right now
  
  // The list of messages in the chat (starts with a greeting from AI)
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I have read this course material thoroughly. What would you like to know?' }
  ]);
  
  const [isTyping, setIsTyping] = useState(false); // Is the AI thinking?
  
  // "Refs" allow us to directly access HTML elements on the page
  const messagesEndRef = useRef(null); // Used to scroll to bottom of chat
  const inputRef = useRef(null);       // Used to auto-focus the text box

  // Fetch the course details (so we can show the title)
  const { data: course, isLoading } = useQuery({ 
    queryKey: ['course', id], 
    queryFn: () => getCourse(id) 
  });

  // Whenever messages change, automatically scroll down to the bottom
  useEffect(() => { 
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); 
  }, [messages, isTyping]);
  
  // When the page loads, automatically put the cursor in the text box
  useEffect(() => { 
    if (!isLoading && course) setTimeout(() => inputRef.current?.focus(), 100); 
  }, [isLoading, course]);

  if (isLoading) return <LoadingSpinner fullScreen />;
  if (!course) return <div className="pt-24 text-center text-red-400">Course not found.</div>;

  // Called when the user presses Enter or clicks Send
  const handleSubmit = async (e) => {
    e.preventDefault(); // Stop the form from refreshing the page
    if (!input.trim()) return; // Don't send empty messages

    // 1. Add the user's message to the chat history
    const newMessages = [...messages, { role: 'user', content: input.trim() }];
    setMessages(newMessages);
    setInput(''); // Clear the text box
    setIsTyping(true); // Show the "AI is thinking" bubbles

    try {
      // 2. Send the entire chat history to the backend
      const responseContent = await sendMessage(id, newMessages.map((m) => ({ role: m.role, content: m.content })));
      
      // 3. Add the AI's reply to the chat history
      setMessages([...newMessages, { role: 'assistant', content: responseContent }]);
    } catch (err) {
      toast.error('Failed to send message');
      setMessages(messages); // Revert to old messages on failure
    } finally {
      setIsTyping(false); // Hide the "thinking" bubbles
      setTimeout(() => inputRef.current?.focus(), 100); // Focus back on text box
    }
  };

  return (
    <div className="pt-20 px-4 sm:px-6 max-w-4xl mx-auto min-h-screen flex flex-col h-screen">
      
      {/* Header */}
      <div className="flex items-center justify-between py-4 shrink-0">
        <Link to={`/courses/${id}`} className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Course
        </Link>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs text-violet-300 font-medium">
          <Sparkles className="w-3.5 h-3.5" /> Context-Aware AI Chat
        </div>
      </div>
      <div className="mb-4">
        <h1 className="font-display font-bold text-2xl text-white truncate">{course.title}</h1>
      </div>

      {/* Main Chat Area Box */}
      <div className="card p-0 flex-1 flex flex-col overflow-hidden mb-6 border-violet-500/20 shadow-2xl shadow-violet-900/10">
        
        {/* The scrolling list of messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar bg-black/20">
          
          {/* Warning if PDF text was too big to save */}
          {!course.pdfContent && course.status === 'ready' && (
            <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex items-start gap-3 mb-6">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-200">
                Warning: The PDF content for this course was not saved. The AI may not be able to answer specific questions about the text.
              </p>
            </div>
          )}
          
          {/* Render all the messages using the ChatBubble component */}
          {messages.map((msg, idx) => (
            <ChatBubble key={idx} message={msg} />
          ))}
          
          {/* Show a little animated loader while waiting for AI */}
          {isTyping && (
            <div className="flex items-center gap-3 animate-fade-in">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-900/60 to-indigo-900/60 border border-violet-500/25 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-violet-300" />
              </div>
              <div className="glass px-4 py-3 rounded-2xl rounded-tl-sm border-violet-500/15">
                <div className="dot-loader"><span /><span /><span /></div>
              </div>
            </div>
          )}
          
          {/* Invisible element at the bottom that we scroll down to */}
          <div ref={messagesEndRef} />
        </div>

        {/* The Text Input Area at the bottom */}
        <div className="p-4 bg-white/5 border-t border-violet-500/10 shrink-0">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input 
              ref={inputRef} 
              type="text" 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              placeholder="Ask a question about the course material..." 
              className="flex-1 bg-black/30 border border-violet-500/20 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all" 
              disabled={isTyping} 
            />
            <button 
              type="submit" 
              disabled={!input.trim() || isTyping} 
              className="btn-primary p-3 rounded-xl flex items-center justify-center shrink-0" 
              title="Send message"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          <div className="text-center mt-3">
            <p className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
              AI can make mistakes. Verify important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
