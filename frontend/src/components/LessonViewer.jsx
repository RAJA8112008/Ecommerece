/**
 * =============================================================
 * LessonViewer.jsx — Displays the actual text of a lesson
 * =============================================================
 * 
 * Used on the CourseDetail page to read through the AI-generated text.
 * =============================================================
 */

import { CheckCircle2, Circle, ChevronLeft, ChevronRight } from 'lucide-react';

export const LessonViewer = ({ 
  lesson, 
  isCompleted, 
  onToggleComplete, 
  lessonIndex, 
  totalLessons, 
  onNext, 
  onPrev 
}) => {
  return (
    <article className="card animate-fade-in">
      {/* Top Header Row */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-violet-500/10">
        <span className="text-xs font-semibold text-violet-400 tracking-wider uppercase">
          Lesson {lessonIndex + 1} / {totalLessons}
        </span>
        
        {/* Mark as Complete Button */}
        <button 
          onClick={onToggleComplete} 
          className={`flex items-center gap-2 text-sm px-4 py-2 rounded-xl font-medium transition-all border ${
            isCompleted 
              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25' 
              : 'bg-white/5 text-slate-400 border-white/10 hover:border-emerald-500/30 hover:text-emerald-400'
          }`}
        >
          {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
          {isCompleted ? 'Completed' : 'Mark Complete'}
        </button>
      </div>

      {/* Lesson Title */}
      <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-6 leading-tight">
        {lesson.title}
      </h2>
      
      {/* Lesson Text (Split by newlines to make paragraphs) */}
      <div className="space-y-4">
        {lesson.content?.split('\n').map((paragraph, i) => 
          paragraph.trim() && (
            <p key={i} className="text-slate-300 leading-relaxed text-base">
              {paragraph.trim()}
            </p>
          )
        )}
      </div>

      {/* Bottom Navigation Row (Previous/Next buttons) */}
      <div className="flex items-center justify-between mt-10 pt-6 border-t border-violet-500/10">
        <button 
          onClick={onPrev} 
          disabled={lessonIndex === 0} 
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed px-3 py-2 rounded-xl hover:bg-white/5"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>
        
        {/* Little dots to show progress */}
        <div className="flex gap-1.5">
          {Array.from({ length: totalLessons }).map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all ${
                i === lessonIndex ? 'w-6 bg-violet-500' : 
                i < lessonIndex ? 'w-1.5 bg-violet-500/40' : 'w-1.5 bg-white/10'
              }`} 
            />
          ))}
        </div>
        
        <button 
          onClick={onNext} 
          disabled={lessonIndex === totalLessons - 1} 
          className="btn-primary py-2 px-5 text-sm flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </article>
  );
};
