/**
 * =============================================================
 * Navbar.jsx — The top navigation bar
 * =============================================================
 * 
 * This component is shown at the top of every logged-in page.
 * It contains links to the Dashboard and Upload page, and a 
 * dropdown menu for logging out.
 * =============================================================
 */

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, LogOut, LayoutDashboard, Plus, X, Menu } from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { getInitials } from '../utils/helpers';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false); // Controls the dropdown menu

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/'); // Send them back to the landing page
  };

  // Helper to check if a link is the current active page
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-violet-500/10 h-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between gap-4">
        
        {/* Left Side: Logo */}
        <Link to="/dashboard" className="flex items-center gap-2.5 shrink-0" onClick={() => setMenuOpen(false)}>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-xl gradient-text hidden sm:block">CourseAI</span>
        </Link>

        {/* Middle: Desktop Navigation Links (Hidden on small screens) */}
        <div className="hidden md:flex items-center gap-2">
          <Link
            to="/dashboard"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
              isActive('/dashboard') 
                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/25' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </Link>
          <Link to="/upload" className="btn-primary py-2 px-4 text-sm flex items-center gap-1.5 ml-2">
            <Plus className="w-3.5 h-3.5" /> New Course
          </Link>
        </div>

        {/* Right Side: User Profile Menu */}
        <div className="flex items-center gap-3">
          <div className="relative">
            {/* The profile button you click to open the menu */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 glass px-2.5 py-1.5 rounded-xl hover:bg-white/8 transition-colors border border-violet-500/15"
            >
              {/* User Avatar Circle */}
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {getInitials(user?.name)}
              </div>
              <span className="text-sm text-slate-300 font-medium hidden sm:block max-w-[100px] truncate">
                {user?.name}
              </span>
              {/* Toggle Menu Icon (Hamburger or X) */}
              {menuOpen ? <X className="w-3.5 h-3.5 text-slate-400" /> : <Menu className="w-3.5 h-3.5 text-slate-400" />}
            </button>

            {/* The Dropdown Menu (only shows if menuOpen is true) */}
            {menuOpen && (
              <>
                {/* Invisible backdrop to close menu when clicking outside */}
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                
                <div className="absolute right-0 top-full mt-2 w-52 glass border border-violet-500/20 rounded-2xl overflow-hidden shadow-2xl shadow-black/40 z-20 animate-slide-up">
                  <div className="px-4 py-3 border-b border-violet-500/10">
                    <p className="text-white text-sm font-semibold truncate">{user?.name}</p>
                    <p className="text-slate-500 text-xs truncate mt-0.5">{user?.email}</p>
                  </div>
                  <div className="p-1.5">
                    {/* These links only show in the dropdown on mobile phones */}
                    <Link to="/dashboard" className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-300 hover:bg-violet-500/10 hover:text-white rounded-xl transition-all md:hidden" onClick={() => setMenuOpen(false)}>
                      <LayoutDashboard className="w-4 h-4 text-violet-400" /> Dashboard
                    </Link>
                    <Link to="/upload" className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-300 hover:bg-violet-500/10 hover:text-white rounded-xl transition-all md:hidden" onClick={() => setMenuOpen(false)}>
                      <Plus className="w-4 h-4 text-violet-400" /> New Course
                    </Link>
                    
                    {/* Logout Button */}
                    <button onClick={handleLogout} className="flex items-center gap-2.5 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-all w-full mt-0.5">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
