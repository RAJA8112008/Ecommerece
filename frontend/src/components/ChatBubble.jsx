/**
 * =============================================================
 * ChatBubble.jsx — A single message bubble in the AI Chat
 * =============================================================
 * 
 * Shows a message either from the user (right side, purple)
 * or from the AI (left side, gray).
 * =============================================================
 */

import { User, BookOpen } from 'lucide-react';

export const ChatBubble = ({ message }) => {
  const isUser = message.role === 'user';
  
  return (
    // 'flex-row-reverse' puts the user's avatar on the right side
    <div className={`flex items-start gap-3 animate-fade-in ${isUser ? 'flex-row-reverse' : ''}`}>
      
      {/* Avatar Icon */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
        isUser 
          ? 'bg-gradient-to-br from-violet-500 to-indigo-600' 
          : 'bg-gradient-to-br from-violet-900/60 to-indigo-900/60 border border-violet-500/25'
      }`}>
        {isUser ? <User className="w-4 h-4 text-white" /> : <BookOpen className="w-4 h-4 text-violet-300" />}
      </div>
      
      {/* Message Bubble Box */}
      <div className={`max-w-xl px-4 py-3 rounded-2xl text-sm leading-relaxed ${
        isUser 
          ? 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-tr-sm shadow-lg shadow-violet-500/20' 
          : 'glass border border-violet-500/15 text-slate-300 rounded-tl-sm'
      }`}>
        {/* Support multi-line text by splitting on \n */}
        {message.content.split('\n').map((line, i, arr) => (
          <span key={i}>
            {line}
            {i < arr.length - 1 && <br />}
          </span>
        ))}
      </div>
      
    </div>
  );
};
