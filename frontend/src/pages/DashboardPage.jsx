/**
 * =============================================================
 * DashboardPage.jsx — The main home screen after logging in
 * =============================================================
 * 
 * Shows some top-level statistics (Total courses, Completed) 
 * and a list of CourseCards.
 * Uses `react-query` to fetch the courses from the backend.
 * =============================================================
 */

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Plus, Award, Clock } from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { getCourses } from '../services/courseService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { CourseCard } from '../components/CourseCard';

export const DashboardPage = () => {
  const { user } = useAuth();
  
  // ================= FETCHING DATA =================
  // React Query automatically fetches our data and remembers (caches) it
  const { data: courses, isLoading, error, refetch } = useQuery({
    queryKey: ['courses'],
    queryFn: getCourses,
  });

  // If a course is currently "processing" (AI is generating it),
  // we want to automatically refresh the page every 5 seconds to check if it's done.
  useEffect(() => {
    const processingCourses = courses?.filter((c) => c.status === 'processing');
    if (processingCourses?.length > 0) {
      const interval = setInterval(refetch, 5000);
      return () => clearInterval(interval);
    }
  }, [courses, refetch]);

  // ================= LOADING / ERROR STATES =================
  if (isLoading) return <LoadingSpinner fullScreen />;
  if (error) return <div className="p-8 text-center text-red-400">Failed to load courses.</div>;

  // ================= CALCULATING STATS =================
  const totalCourses = courses?.length || 0;
  const completedCourses = courses?.filter(c => c.progress === 100)?.length || 0;
  const inProgress = courses?.filter(c => c.progress > 0 && c.progress < 100)?.length || 0;

  return (
    <div className="pt-24 pb-12 px-6 max-w-7xl mx-auto min-h-screen">
      
      {/* 1. Header Area with "Create New Course" button */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="font-display font-bold text-3xl text-white mb-2">
            Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span>
          </h1>
          <p className="text-slate-400 text-sm">Pick up where you left off or start a new topic.</p>
        </div>
        <Link to="/upload" className="btn-primary py-2.5 px-5 flex items-center gap-2 shadow-lg shadow-violet-500/20">
          <Plus className="w-5 h-5" /> Create New Course
        </Link>
      </div>

      {/* 2. Top Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center border border-violet-500/20">
            <BookOpen className="w-6 h-6 text-violet-400" />
          </div>
          <div>
            <p className="text-slate-400 text-sm font-medium mb-0.5">Total Courses</p>
            <p className="text-2xl font-bold text-white">{totalCourses}</p>
          </div>
        </div>
        
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <Award className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <p className="text-slate-400 text-sm font-medium mb-0.5">Completed</p>
            <p className="text-2xl font-bold text-white">{completedCourses}</p>
          </div>
        </div>
        
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
            <Clock className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <p className="text-slate-400 text-sm font-medium mb-0.5">In Progress</p>
            <p className="text-2xl font-bold text-white">{inProgress}</p>
          </div>
        </div>
      </div>

      <h2 className="font-display font-bold text-xl text-white mb-8">Your Courses</h2>

      {/* 3. The Grid of Course Cards (or an empty state) */}
      {totalCourses === 0 ? (
        // Empty State: Shows if you have no courses yet
        <div className="card py-16 text-center border-dashed border-2 border-violet-500/20 bg-violet-500/5">
          <div className="w-16 h-16 rounded-full bg-violet-500/10 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-violet-400" />
          </div>
          <h3 className="font-display font-bold text-xl text-white mb-2">No courses yet</h3>
          <p className="text-slate-400 mb-6 max-w-sm mx-auto">
            Upload your first PDF document to generate an AI-powered course and start learning.
          </p>
          <Link to="/upload" className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create Course
          </Link>
        </div>
      ) : (
        // List of Courses
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard key={course._id} course={course} onDelete={refetch} />
          ))}
        </div>
      )}
      
    </div>
  );
};
