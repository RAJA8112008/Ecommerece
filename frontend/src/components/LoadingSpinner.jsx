/**
 * =============================================================
 * LoadingSpinner.jsx — A simple animated loading circle
 * =============================================================
 * 
 * Reusable component to show while data is being fetched.
 * Supports a "fullScreen" mode that dims the background.
 * =============================================================
 */

import React from 'react';

export const LoadingSpinner = ({ fullScreen = false, size = 'md', text = 'Loading...' }) => {
  // Define exact Tailwind classes for different sizes
  const sizes = { 
    sm: 'w-5 h-5', 
    md: 'w-8 h-8', 
    lg: 'w-12 h-12' 
  };
  
  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      {/* The actual spinning circle */}
      <div 
        className={`${sizes[size]} rounded-full border-2 border-violet-500/20 border-t-violet-500 animate-spin`} 
      />
      {text && <p className="text-slate-400 text-sm">{text}</p>}
    </div>
  );

  // If fullScreen is true, wrap the spinner in a screen-covering backdrop
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#07071a]/80 backdrop-blur-sm z-50">
        {spinner}
      </div>
    );
  }
  
  return spinner;
};
