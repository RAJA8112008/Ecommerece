/**
 * =============================================================
 * CourseCard.jsx — A small preview card for a single course
 * =============================================================
 * 
 * Used on the Dashboard page to list out all the courses you have.
 * It shows the title, difficulty, progress, and buttons to open it.
 * =============================================================
 */

import { Link } from 'react-router-dom';
import { Loader2, CheckCircle2, AlertCircle, Trash2, BookOpen, ChevronRight, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

import { deleteCourse } from '../services/courseService';
import { ProgressBar } from './ProgressBar';
import { difficultyColor } from '../utils/helpers';

export const CourseCard = ({ course, onDelete }) => {
  // Different styles based on the course generation status
  const statusMap = {
    processing: { icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />, label: 'Generating…', color: 'text-amber-400' },
    ready: { icon: <CheckCircle2 className="w-3.5 h-3.5" />, label: 'Ready', color: 'text-emerald-400' },
    failed: { icon: <AlertCircle className="w-3.5 h-3.5" />, label: 'Failed', color: 'text-red-400' },
  };

  const status = statusMap[course.status] || statusMap.processing;
  const diff = difficultyColor[course.difficulty] || difficultyColor.beginner;

  // Called when the trash can icon is clicked
  const handleDelete = async (e) => {
    e.preventDefault(); // Stop the click from opening the course
    e.stopPropagation();
    
    if (!window.confirm('Delete this course? This cannot be undone.')) return;
    
    try {
      await deleteCourse(course._id);
      toast.success('Course deleted');
      onDelete?.(); // Tells the Dashboard to refresh its list
    } catch {
      toast.error('Failed to delete course');
    }
  };

  return (
    <div className="card glass-hover group relative overflow-hidden flex flex-col">
      {/* Delete Button (Appears when you hover over the card) */}
      <button 
        onClick={handleDelete} 
        title="Delete course" 
        className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/15 transition-all opacity-0 group-hover:opacity-100 z-10"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      {/* Status Label (e.g., "Ready" or "Generating...") */}
      <div className={`flex items-center gap-1.5 text-xs font-medium ${status.color} mb-3`}>
        {status.icon} <span>{status.label}</span>
      </div>

      <h3 className="font-display font-bold text-white text-lg leading-tight mb-2 line-clamp-2 pr-6">
        {course.title}
      </h3>
      
      {course.description && (
        <p className="text-slate-400 text-sm leading-relaxed mb-4 line-clamp-2 flex-1">
          {course.description}
        </p>
      )}

      {/* Tags & Difficulty Badges */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {course.difficulty && (
          <span className={`text-xs px-2.5 py-1 rounded-lg font-medium border ${diff.bg} ${diff.text} ${diff.border}`}>
            {course.difficulty}
          </span>
        )}
        {course.lessons?.length > 0 && (
          <span className="text-xs px-2.5 py-1 rounded-lg bg-violet-500/10 text-violet-300 border border-violet-500/20 flex items-center gap-1">
            <BookOpen className="w-3 h-3" /> {course.lessons.length} lessons
          </span>
        )}
      </div>

      {/* Progress Bar */}
      <ProgressBar value={course.progress || 0} showLabel className="mb-4" />

      {/* Action Buttons at the bottom */}
      <div className="mt-auto">
        {course.status === 'ready' && (
          <div className="flex gap-2">
            <Link to={`/courses/${course._id}`} className="btn-primary flex-1 py-2 text-sm flex items-center justify-center gap-1.5">
              Continue <ChevronRight className="w-3.5 h-3.5" />
            </Link>
            <Link to={`/courses/${course._id}/chat`} className="btn-ghost py-2 px-3 text-sm" title="AI Chat">
              <MessageSquare className="w-4 h-4" />
            </Link>
          </div>
        )}
        {course.status === 'processing' && (
          <div className="text-center text-xs text-slate-500 py-2 flex items-center justify-center gap-1.5">
            <Loader2 className="w-3 h-3 animate-spin text-violet-500" /> AI is generating your course…
          </div>
        )}
        {course.status === 'failed' && (
          <div className="text-center text-xs text-red-400 py-2">
            Generation failed. Please try uploading again.
          </div>
        )}
      </div>
    </div>
  );
};
