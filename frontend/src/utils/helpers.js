/**
 * =============================================================
 * helpers.js — Small utility functions used across the app
 * =============================================================
 * 
 * Putting these small helper functions here keeps our React
 * components clean and prevents us from writing the same
 * logic multiple times.
 * =============================================================
 */

// Takes a full name "John Doe" and returns the initials "JD"
export const getInitials = (name) => {
  if (!name) return '?';
  
  // Split the name by spaces, grab the first letter of each word,
  // join them back together, capitalize, and take max 2 letters.
  return name.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Converts raw bytes (e.g., 1048576) into a readable size (e.g., "1.0 MB")
export const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  
  // Calculate which unit (KB, MB, etc.) to use based on the number size
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

// Configuration for course difficulty colors used on cards and details
export const difficultyColor = {
  beginner: { 
    bg: 'bg-emerald-500/15', 
    text: 'text-emerald-300', 
    border: 'border-emerald-500/25' 
  },
  intermediate: { 
    bg: 'bg-amber-500/15', 
    text: 'text-amber-300', 
    border: 'border-amber-500/25' 
  },
  advanced: { 
    bg: 'bg-rose-500/15', 
    text: 'text-rose-300', 
    border: 'border-rose-500/25' 
  },
};
