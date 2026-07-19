/**
 * =============================================================
 * QuizModal.jsx — A popup window for taking a course quiz
 * =============================================================
 * 
 * Shows one question at a time. After answering all questions,
 * it calculates the score and shows a final result screen.
 * =============================================================
 */

import { useState } from 'react';
import { Trophy, X, CheckCircle2, XCircle, RotateCcw, ChevronRight } from 'lucide-react';

export const QuizModal = ({ quiz, onClose }) => {
  // State variables to track quiz progress
  const [current, setCurrent] = useState(0);            // Which question are we on?
  const [selected, setSelected] = useState(null);       // Which option did the user click?
  const [answers, setAnswers] = useState([]);           // Array of user's answers
  const [showResult, setShowResult] = useState(false);  // Should we show the final score?

  // If there's no quiz data, don't show anything
  if (!quiz || quiz.length === 0) return null;
  
  const question = quiz[current];
  const isAnswered = selected !== null;

  // Called when the user clicks "Next Question"
  const handleNext = () => {
    // Save their answer
    setAnswers([...answers, selected]);
    
    // Move to next question or show results
    if (current + 1 < quiz.length) { 
      setCurrent(current + 1); 
      setSelected(null); 
    } else { 
      setShowResult(true); 
    }
  };

  // Called when the user clicks "Retry"
  const handleRestart = () => { 
    setCurrent(0); 
    setSelected(null); 
    setAnswers([]); 
    setShowResult(false); 
  };

  // Calculate final score
  const score = answers.filter((ans, i) => ans === quiz[i]?.correctAnswer).length;
  const pct = Math.round((score / quiz.length) * 100);
  const optionLabels = ['A', 'B', 'C', 'D'];

  // Helper to figure out what color a quiz option button should be
  const getOptionStyle = (i) => {
    // If they haven't answered yet
    if (!isAnswered) {
      return selected === i 
        ? 'border-violet-500 bg-violet-500/20 text-white' 
        : 'border-violet-500/20 hover:border-violet-500/50 hover:bg-violet-500/8 text-slate-300 cursor-pointer';
    }
    
    // If they HAVE answered, show the correct answer in Green
    if (i === question.correctAnswer) {
      return 'border-emerald-500/60 bg-emerald-500/12 text-emerald-300 cursor-default';
    }
    
    // Show their wrong answer in Red
    if (i === selected && i !== question.correctAnswer) {
      return 'border-red-500/60 bg-red-500/12 text-red-300 cursor-default';
    }
    
    // Gray out the rest
    return 'border-white/8 text-slate-600 opacity-50 cursor-default';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Dark background overlay (clicking it closes the modal) */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* The White Popup Box */}
      <div className="relative w-full max-w-2xl card animate-slide-up max-h-[90vh] overflow-y-auto shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600/30 to-indigo-600/30 border border-violet-500/25 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h2 className="font-display font-bold text-white text-lg leading-tight">Knowledge Quiz</h2>
              <p className="text-slate-500 text-xs">{quiz.length} questions</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/8 rounded-xl text-slate-400 hover:text-white transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* EITHER show the Results OR the Question */}
        {showResult ? (
          // ================= RESULTS SCREEN =================
          <div className="text-center py-6">
            {/* Big Circular Progress Graphic */}
            <div className="w-28 h-28 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: `conic-gradient(#7c3aed ${pct}%, rgba(255,255,255,0.06) ${pct}%)` }}>
              <div className="rounded-full bg-[#07071a] flex items-center justify-center" style={{ width: '84px', height: '84px' }}>
                <span className="font-display font-bold text-2xl gradient-text">{pct}%</span>
              </div>
            </div>
            
            <h3 className="font-display text-2xl font-bold text-white mb-1">
              {pct === 100 ? '🎉 Perfect!' : pct >= 70 ? '🌟 Great Job!' : '📚 Keep Going!'}
            </h3>
            <p className="text-slate-400 mb-8">{score} out of {quiz.length} correct</p>
            
            {/* List out all the questions and their answers */}
            <div className="space-y-2 mb-8 text-left">
              {quiz.map((q, i) => {
                const correct = answers[i] === q.correctAnswer;
                return (
                  <div key={i} className={`flex items-start gap-3 p-3 rounded-xl text-sm border ${correct ? 'bg-emerald-500/8 border-emerald-500/20' : 'bg-red-500/8 border-red-500/20'}`}>
                    {correct ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" /> : <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />}
                    <div>
                      <p className="text-slate-300 font-medium">{q.question}</p>
                      {!correct && <p className="text-slate-500 text-xs mt-0.5">✓ {q.options[q.correctAnswer]}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="flex gap-3">
              <button onClick={handleRestart} className="btn-ghost flex-1 flex items-center justify-center gap-2">
                <RotateCcw className="w-4 h-4" /> Retry
              </button>
              <button onClick={onClose} className="btn-primary flex-1">Done</button>
            </div>
          </div>
        ) : (
          // ================= QUESTION SCREEN =================
          <>
            {/* Small progress bar at the top */}
            <div className="mb-6">
              <div className="flex justify-between text-xs text-slate-500 mb-2">
                <span>Question {current + 1} of {quiz.length}</span>
                <span>{answers.filter((a, i) => a === quiz[i]?.correctAnswer).length} correct</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden bg-white/5">
                <div className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-violet-600 to-indigo-600" style={{ width: `${(current / quiz.length) * 100}%` }}/>
              </div>
            </div>
            
            {/* The Question */}
            <h3 className="font-semibold text-white text-lg mb-5 leading-snug">{question?.question}</h3>
            
            {/* The Multiple Choice Options */}
            <div className="space-y-2.5 mb-5">
              {question?.options?.map((option, i) => (
                <button 
                  key={i} 
                  onClick={() => !isAnswered && setSelected(i)} 
                  disabled={isAnswered} 
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all text-sm border flex items-center gap-3 ${getOptionStyle(i)}`}
                >
                  <span className={`w-6 h-6 rounded-lg border flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                    isAnswered && i === question.correctAnswer ? 'bg-emerald-500/30 border-emerald-500/50 text-emerald-300' 
                    : isAnswered && i === selected ? 'bg-red-500/30 border-red-500/50 text-red-300' 
                    : 'border-current'
                  }`}>
                    {optionLabels[i]}
                  </span>
                  {option}
                </button>
              ))}
            </div>
            
            {/* Show explanation ONLY after they pick an answer */}
            {isAnswered && question?.explanation && (
              <div className="p-4 rounded-xl mb-5 border bg-violet-500/10 border-violet-500/25">
                <p className="text-sm text-violet-200">
                  <span className="font-semibold text-violet-400">Explanation: </span>
                  {question.explanation}
                </p>
              </div>
            )}
            
            {/* Next Button */}
            <button 
              onClick={handleNext} 
              disabled={!isAnswered} 
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {current + 1 < quiz.length ? 'Next Question' : 'See Results'} <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
