/**
 * =============================================================
 * ProgressBar.jsx — A visual progress bar component
 * =============================================================
 * 
 * Used to show how much of a course the user has completed.
 * It takes a "value" prop between 0 and 100.
 * =============================================================
 */

import React from 'react';

export const ProgressBar = ({ value = 0, className = '', showLabel = false }) => {
  // Ensure the value doesn't go below 0 or above 100
  const clamped = Math.min(100, Math.max(0, value)); 
  
  return (
    <div className={className}>
      {/* Optional text label above the bar */}
      {showLabel && (
        <div className="flex justify-between text-xs text-slate-400 mb-1.5">
          <span>Progress</span>
          <span>{clamped}%</span>
        </div>
      )}
      
      {/* The background track of the bar */}
      <div className="h-1.5 rounded-full overflow-hidden bg-white/5">
        {/* The filled part of the bar (the gradient) */}
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ 
            width: `${clamped}%`, 
            background: 'linear-gradient(90deg, #7c3aed, #4f46e5, #0ea5e9)' 
          }}
        />
      </div>
    </div>
  );
};
