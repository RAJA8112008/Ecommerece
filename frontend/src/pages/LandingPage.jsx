import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen, Zap, Brain, MessageSquare,
  ChevronRight, Star, Upload, BarChart3, Sparkles,
} from 'lucide-react';

const features = [
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'Instant AI Generation',
    desc: 'Upload any PDF and our Groq AI instantly structures it into a comprehensive course with lessons tailored to the content.',
    color: 'from-violet-600/20 to-indigo-600/20',
    border: 'border-violet-500/20',
    iconColor: 'text-violet-400',
  },
  {
    icon: <Brain className="w-6 h-6" />,
    title: 'Smart Quiz Generation',
    desc: 'Automatically generate knowledge-check quizzes with detailed explanations, keeping learners engaged.',
    color: 'from-indigo-600/20 to-blue-600/20',
    border: 'border-indigo-500/20',
    iconColor: 'text-indigo-400',
  },
  {
    icon: <MessageSquare className="w-6 h-6" />,
    title: 'PDF-Aware Chatbot',
    desc: 'Chat with an AI that has thoroughly read your PDF and answers questions based on your specific content.',
    color: 'from-cyan-600/20 to-teal-600/20',
    border: 'border-cyan-500/20',
    iconColor: 'text-cyan-400',
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: 'Progress Tracking',
    desc: 'Track your learning journey with visual progress indicators, lesson completion, and achievement metrics.',
    color: 'from-emerald-600/20 to-green-600/20',
    border: 'border-emerald-500/20',
    iconColor: 'text-emerald-400',
  },
];

const steps = [
  { step: '01', icon: <Upload className="w-8 h-8" />, title: 'Upload Your PDF', desc: 'Drag and drop any PDF document — textbooks, research papers, manuals, anything.' },
  { step: '02', icon: <Sparkles className="w-8 h-8" />, title: 'AI Transforms It', desc: 'Groq\'s Llama 3 AI analyzes your content and generates structured lessons and quizzes.' },
  { step: '03', icon: <BookOpen className="w-8 h-8" />, title: 'Learn Interactively', desc: 'Work through lessons, take quizzes, and chat with AI for personalized support.' },
];

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.12 } } };

/**
 * LandingPage Component
 * 
 * This is the very first page users see when they visit our website!
 * It's often called the "Home" page or "Landing" page.
 * It contains a navigation bar, a hero section (the main big text), 
 * a features section, and a footer.
 * 
 * For beginners:
 * - We use 'framer-motion' (imported as 'motion') to make things animate smoothly when they appear.
 * - We use 'lucide-react' for all the cool little icons (like Zap, Brain, MessageSquare).
 * - React components like this one return a mix of HTML and JavaScript, called JSX.
 */
export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden">

      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-violet-500/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <BookOpen className="w-4.5 h-4.5 text-white" style={{ width: 18, height: 18 }} />
            </div>
            <span className="font-display font-bold text-xl gradient-text">CourseAI</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">
              Sign in
            </Link>
            <Link to="/register" className="btn-primary py-2 px-5 text-sm">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-28 pb-20">
        {/* Animated background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/6 w-[500px] h-[500px] rounded-full blur-3xl opacity-60"
            style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)' }} />
          <div className="absolute bottom-1/4 right-1/6 w-[500px] h-[500px] rounded-full blur-3xl opacity-60 animate-pulse-slow"
            style={{ background: 'radial-gradient(circle, rgba(79,70,229,0.15) 0%, transparent 70%)', animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full blur-3xl"
            style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.07) 0%, transparent 70%)' }} />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            {/* Badge */}
            <motion.div variants={fadeUp}>
              <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm text-violet-300 mb-8 border border-violet-500/20">
                <Star className="w-3.5 h-3.5 fill-violet-400 text-violet-400" />
                <span>Powered by Groq AI · Lightning-fast course generation</span>
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              className="font-display text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-6 leading-tight tracking-tight"
            >
              Turn Any PDF Into
              <br />
              <span className="gradient-text">An Interactive Course</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-lg sm:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed text-balance"
            >
              Upload a PDF. AI generates structured lessons, quizzes, and activates an intelligent chatbot — all in seconds. Zero setup required.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="btn-primary text-base px-8 py-3.5 flex items-center gap-2">
                Start Learning for Free
                <ChevronRight className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
              </Link>
              <Link to="/login" className="btn-ghost text-base px-8 py-3.5">
                Sign In
              </Link>
            </motion.div>
          </motion.div>

          {/* Hero UI mockup */}
          <motion.div
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mt-20"
          >
            <div className="glass rounded-3xl p-1 border border-violet-500/20 shadow-2xl shadow-violet-900/30 overflow-hidden">
              <div className="rounded-[22px] overflow-hidden"
                style={{ background: 'rgba(7, 7, 26, 0.9)' }}
              >
                {/* Window bar */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-violet-500/10">
                  {['#f87171', '#fbbf24', '#34d399'].map(c => (
                    <div key={c} className="w-3 h-3 rounded-full" style={{ background: c }} />
                  ))}
                  <div className="flex-1 mx-4">
                    <div className="h-5 rounded-md mx-auto w-48" style={{ background: 'rgba(255,255,255,0.05)' }} />
                  </div>
                </div>
                {/* Mock content */}
                <div className="p-6 flex gap-5 min-h-[220px]">
                  {/* Sidebar */}
                  <div className="w-44 shrink-0 space-y-1.5">
                    <div className="h-5 rounded-lg mb-3" style={{ background: 'rgba(139,92,246,0.25)', width: '80%' }} />
                    {[
                      { w: '100%', active: false },
                      { w: '90%', active: true },
                      { w: '85%', active: false },
                      { w: '75%', active: false },
                      { w: '95%', active: false },
                    ].map((l, i) => (
                      <div key={i}
                        className="h-8 rounded-xl flex items-center px-3 transition-all"
                        style={{
                          background: l.active ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.04)',
                          border: l.active ? '1px solid rgba(139,92,246,0.3)' : '1px solid transparent',
                        }}
                      >
                        <div className="h-2 rounded" style={{ width: l.w, background: l.active ? '#8b5cf6' : 'rgba(255,255,255,0.12)' }} />
                      </div>
                    ))}
                  </div>
                  {/* Main content */}
                  <div className="flex-1 space-y-3">
                    <div className="h-5 rounded w-3/5" style={{ background: 'rgba(255,255,255,0.12)' }} />
                    <div className="h-2.5 rounded w-full" style={{ background: 'rgba(255,255,255,0.05)' }} />
                    <div className="h-2.5 rounded w-5/6" style={{ background: 'rgba(255,255,255,0.05)' }} />
                    <div className="h-2.5 rounded w-4/5" style={{ background: 'rgba(255,255,255,0.05)' }} />
                    <div className="h-2.5 rounded w-full" style={{ background: 'rgba(255,255,255,0.05)' }} />
                    <div className="grid grid-cols-2 gap-3 mt-5">
                      {[0, 1, 2, 3].map(i => (
                        <div key={i} className="h-14 rounded-xl p-3 glass border border-violet-500/10">
                          <div className="h-1.5 w-10 rounded mb-2" style={{ background: 'rgba(139,92,246,0.5)' }} />
                          <div className="h-1.5 rounded" style={{ background: 'rgba(255,255,255,0.08)' }} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.p variants={fadeUp} className="text-violet-400 text-sm font-semibold tracking-widest uppercase mb-4">
              Features
            </motion.p>
            <motion.h2 variants={fadeUp} className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
              Everything you need to <span className="gradient-text">learn faster</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-slate-400 text-lg max-w-xl mx-auto">
              Our platform combines cutting-edge AI with intuitive design and proven pedagogy.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={stagger}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {features.map((f) => (
              <motion.div key={f.title} variants={fadeUp}
                className={`card glass-hover group cursor-default bg-gradient-to-br ${f.color} border ${f.border}`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${f.iconColor} mb-4 transition-transform group-hover:scale-110`}
                  style={{ background: 'rgba(255,255,255,0.05)' }}
                >
                  {f.icon}
                </div>
                <h3 className="font-display font-bold text-white text-lg mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-24 px-6 relative">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.p variants={fadeUp} className="text-violet-400 text-sm font-semibold tracking-widest uppercase mb-4">
              How It Works
            </motion.p>
            <motion.h2 variants={fadeUp} className="font-display text-4xl md:text-5xl font-bold text-white">
              Three steps to <span className="gradient-text">mastery</span>
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid md:grid-cols-3 gap-8"
          >
            {steps.map((s, i) => (
              <motion.div key={s.step} variants={fadeUp} className="relative text-center">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-3/4 w-1/2 h-px"
                    style={{ background: 'linear-gradient(90deg, rgba(139,92,246,0.4), transparent)' }} />
                )}
                <div className="w-20 h-20 rounded-2xl mx-auto mb-5 flex items-center justify-center text-violet-400"
                  style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(139,92,246,0.2)' }}
                >
                  {s.icon}
                </div>
                <div className="text-5xl font-display font-black gradient-text opacity-20 mb-2 -mt-2">{s.step}</div>
                <h3 className="font-display font-bold text-xl text-white mb-2">{s.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-28 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="card gradient-border text-center py-16 px-8"
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4 text-balance">
              Ready to transform your <span className="gradient-text">learning?</span>
            </h2>
            <p className="text-slate-400 text-lg mb-10 max-w-md mx-auto">
              Join learners turning their PDFs into powerful, interactive courses — completely free.
            </p>
            <Link to="/register" className="btn-primary text-base px-10 py-4 inline-flex items-center gap-2">
              Get Started — It's Free
              <ChevronRight className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-8 px-6 border-t border-violet-500/10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-display font-bold gradient-text">CourseAI</span>
          </div>
          <p className="text-slate-600 text-sm">© 2024 CourseAI · Built with Groq AI + React + Node.js</p>
        </div>
      </footer>
    </div>
  );
}
