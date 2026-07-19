/**
 * =============================================================
 * CourseDetailPage.jsx — The screen where you actually read a course
 * =============================================================
 * 
 * Shows a sidebar with the list of lessons.
 * The main area shows the current lesson text (LessonViewer).
 * Also handles opening the QuizModal.
 * =============================================================
 */

import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, MessageSquare, Brain, BookOpen, CheckCircle2, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

import { getCourse, updateProgress } from '../services/courseService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ProgressBar } from '../components/ProgressBar';
import { LessonViewer } from '../components/LessonViewer';
import { QuizModal } from '../components/QuizModal';
import { difficultyColor } from '../utils/helpers';

export const CourseDetailPage = () => {
  const { id } = useParams(); // Gets the course ID from the URL (e.g. /courses/123)
  const queryClient = useQueryClient();
  
  const [currentLesson, setCurrentLesson] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);

  // Fetch the course data
  const { data: course, isLoading, error } = useQuery({
    queryKey: ['course', id],
    queryFn: () => getCourse(id),
  });

  // Setup the function to save progress to the backend
  const progressMutation = useMutation({
    mutationFn: (completedLessons) => updateProgress(id, completedLessons),
    onSuccess: (data) => {
      // Update the local data immediately so it feels fast
      queryClient.setQueryData(['course', id], (old) => ({ 
        ...old, 
        progress: data.progress, 
        completedLessons: data.completedLessons 
      }));
    },
  });

  // Whenever the lesson changes, scroll to the top of the page
  useEffect(() => { 
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  }, [currentLesson]);

  if (isLoading) return <LoadingSpinner fullScreen />;
  if (error || !course) return <div className="pt-24 text-center text-red-400">Course not found.</div>;

  // Handles clicking the "Mark Complete" button on a lesson
  const handleToggleComplete = () => {
    const isCompleted = course.completedLessons?.includes(currentLesson);
    let newCompleted;

    if (isCompleted) {
      // If it's already complete, un-complete it (remove it from the array)
      newCompleted = course.completedLessons.filter((l) => l !== currentLesson);
    } else {
      // If it's not complete, add it to the array
      newCompleted = [...(course.completedLessons || []), currentLesson];
      
      // Automatically go to the next lesson after half a second
      if (currentLesson < course.lessons.length - 1) {
        setTimeout(() => setCurrentLesson(c => c + 1), 600);
      } else {
        toast.success('Course completed! Take the quiz.');
      }
    }
    
    // Save to backend
    progressMutation.mutate(newCompleted);
  };

  const diff = difficultyColor[course.difficulty] || difficultyColor.beginner;

  return (
    <div className="pt-24 pb-12 px-4 sm:px-6 max-w-[1400px] mx-auto min-h-screen flex flex-col lg:flex-row gap-8">
      
      {/* ================= SIDEBAR (Course Info & Lesson List) ================= */}
      <aside className="w-full lg:w-80 shrink-0 space-y-6 lg:sticky lg:top-24 h-max">
        
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        
        <div className="card p-5">
          <div className="mb-4">
            <h1 className="font-display font-bold text-xl text-white mb-2 leading-tight">{course.title}</h1>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded flex items-center border ${diff.bg} ${diff.text} ${diff.border}`}>
                {course.difficulty}
              </span>
            </div>
            <ProgressBar value={course.progress} showLabel />
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            <Link to={`/courses/${id}/chat`} className="btn-ghost py-2 px-2 text-xs flex justify-center gap-1.5 w-full">
              <MessageSquare className="w-3.5 h-3.5" /> AI Chat
            </Link>
            <button onClick={() => setShowQuiz(true)} className="btn-primary py-2 px-2 text-xs flex justify-center gap-1.5 w-full bg-gradient-to-r from-emerald-500 to-teal-500 shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-400">
              <Brain className="w-3.5 h-3.5" /> Take Quiz
            </button>
          </div>
        </div>

        {/* Sidebar: List of Lessons */}
        <div className="card p-0 overflow-hidden hidden lg:block">
          <div className="p-4 border-b border-violet-500/10 bg-black/20">
            <h3 className="font-semibold text-white text-sm flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-violet-400" /> Curriculum
            </h3>
          </div>
          <div className="p-2 space-y-1 max-h-[50vh] overflow-y-auto custom-scrollbar">
            {course.lessons?.map((lesson, idx) => {
              const isActive = currentLesson === idx; // Is this the lesson we are currently reading?
              const isCompleted = course.completedLessons?.includes(idx); // Is this lesson marked done?
              
              // A lesson is locked if it's not the first one AND the previous one is not completed
              const isLocked = idx > 0 && !course.completedLessons?.includes(idx - 1) && !isCompleted;

              return (
                <button 
                  key={idx} 
                  onClick={() => !isLocked && setCurrentLesson(idx)} 
                  disabled={isLocked} 
                  className={`w-full text-left p-3 rounded-xl flex items-start gap-3 transition-all text-sm ${
                    isActive ? 'bg-violet-500/15 border border-violet-500/30 text-white' : 
                    isLocked ? 'opacity-50 cursor-not-allowed border border-transparent' : 
                    'hover:bg-white/5 text-slate-300 border border-transparent hover:border-white/10'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {isCompleted ? (
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                    ) : isLocked ? (
                      <div className="w-5 h-5 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center">
                        <Lock className="w-3 h-3" />
                      </div>
                    ) : (
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${isActive ? 'bg-violet-500 text-white' : 'bg-white/10 text-slate-400'}`}>
                        {idx + 1}
                      </div>
                    )}
                  </div>
                  <span className={`line-clamp-2 ${isActive ? 'font-medium' : ''}`}>{lesson.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* ================= MAIN CONTENT AREA (The Reading Section) ================= */}
      <main className="flex-1 max-w-4xl">
        {course.lessons && course.lessons.length > 0 ? (
          <LessonViewer 
            lesson={course.lessons[currentLesson]} 
            lessonIndex={currentLesson} 
            totalLessons={course.lessons.length} 
            isCompleted={course.completedLessons?.includes(currentLesson)} 
            onToggleComplete={handleToggleComplete} 
            onNext={() => setCurrentLesson((c) => Math.min(course.lessons.length - 1, c + 1))} 
            onPrev={() => setCurrentLesson((c) => Math.max(0, c - 1))} 
          />
        ) : (
          <div className="card p-12 text-center text-slate-400">No lessons generated for this course.</div>
        )}
      </main>

      {/* Only render the QuizModal if showQuiz is true */}
      {showQuiz && <QuizModal quiz={course.quiz} onClose={() => setShowQuiz(false)} />}
    </div>
  );
};
