import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { RotateCw, Star, CheckCircle, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function FlashcardView({ questions, currentIndex, setCurrentIndex, onStarToggle }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const { user, openAuthModal } = useAuth();

  const currentQ = questions[currentIndex];

  useEffect(() => {
    setIsFlipped(false);
  }, [currentIndex]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        if (currentIndex < questions.length - 1) setCurrentIndex((prev) => prev + 1);
      } else if (e.code === 'KeyS' && currentQ) {
        e.preventDefault();
        handleStarClick();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, questions, currentQ]);

  if (!currentQ) return null;

  const handleStarClick = (e) => {
    if (e) e.stopPropagation();
    if (!user) {
      openAuthModal('login');
      return;
    }
    if (onStarToggle) {
      onStarToggle(currentQ.id);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center">
      
      {/* 3D Card Container (Fit height, no scrollbar) */}
      <div 
        className="w-full min-h-[520px] sm:min-h-[550px] perspective-1000 cursor-pointer my-4 select-none flex flex-col"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="relative w-full h-full min-h-[520px] sm:min-h-[550px] transform-style-3d shadow-xl rounded-3xl"
        >
          {/* FRONT SIDE */}
          <div className="absolute inset-0 w-full h-full backface-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-7 flex flex-col justify-between overflow-hidden">
            
            {/* Top Toolbar */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-bold">
                  {currentQ.questionNum || `Câu ${currentIndex + 1}`}
                </span>
                <span className="text-xs text-slate-400 font-medium">Mặt Trước (Câu Hỏi)</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleStarClick}
                  className={`p-2 rounded-xl border transition-all ${
                    currentQ.isStarred
                      ? 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-500'
                      : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:text-amber-500'
                  }`}
                  title="Đánh dấu sao câu khó (Phím S)"
                >
                  <Star className={`w-5 h-5 ${currentQ.isStarred ? 'fill-amber-400 text-amber-400' : ''}`} />
                </button>
              </div>
            </div>

            {/* Content Front */}
            <div className="my-auto py-3 grow flex flex-col justify-center">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed mb-4">
                {currentQ.content}
              </h3>

              {/* Options Preview */}
              <div className="grid grid-cols-1 gap-2.5">
                {currentQ.options.map((opt) => (
                  <div
                    key={opt.id || opt.key}
                    className="p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-800/50 flex items-start gap-3"
                  >
                    <span className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {opt.key}
                    </span>
                    <span className="text-sm text-slate-700 dark:text-slate-300 leading-normal">
                      {opt.content}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Footer Hint */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800/80 shrink-0">
              <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-medium">
                <RotateCw className="w-4 h-4 animate-spin-slow" /> Nhấp hoặc bấm [Space] để xem Đáp Án
              </span>
              <span>Dùng Phím mũi tên ← → để chuyển câu</span>
            </div>
          </div>

          {/* BACK SIDE */}
          <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-white p-6 sm:p-7 flex flex-col justify-between overflow-hidden border border-blue-500/30 shadow-2xl">
            
            {/* Top Toolbar Back */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Đáp Án Đúng
                </span>
                <span className="text-xs text-slate-400 font-medium">Mặt Sau (Kết Quả)</span>
              </div>

              <button
                onClick={handleStarClick}
                className={`p-2 rounded-xl border transition-all ${
                  currentQ.isStarred
                    ? 'border-amber-500/40 bg-amber-500/10 text-amber-400'
                    : 'border-slate-800 text-slate-400 hover:text-amber-400'
                }`}
              >
                <Star className={`w-5 h-5 ${currentQ.isStarred ? 'fill-amber-400 text-amber-400' : ''}`} />
              </button>
            </div>

            {/* Content Back */}
            <div className="my-auto py-3 grow flex flex-col justify-center">
              <div className="mb-4">
                <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest">Phương án chính xác:</span>
                <div className="mt-2 text-xl sm:text-2xl font-black text-emerald-400 flex items-center gap-2.5">
                  <span className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
                    {currentQ.correctAnswer}
                  </span>
                  <span className="text-sm sm:text-base font-medium text-slate-200">
                    {currentQ.options.find((o) => o.key === currentQ.correctAnswer)?.content || ''}
                  </span>
                </div>
              </div>

              {currentQ.explanation ? (
                <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-800/40 text-blue-200 text-sm leading-relaxed">
                  <div className="font-semibold text-blue-400 flex items-center gap-1.5 mb-1.5">
                    <Sparkles className="w-4 h-4" /> Lời giải / Ghi chú:
                  </div>
                  {currentQ.explanation}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 text-slate-300 text-sm">
                  Ghi nhớ đáp án chuẩn môn MLN122 cho câu hỏi này.
                </div>
              )}
            </div>

            {/* Bottom Footer Hint */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800 shrink-0">
              <span className="flex items-center gap-1 text-blue-400 font-medium">
                <RotateCw className="w-4 h-4" /> Bấm [Space] để xoay lại mặt trước
              </span>
              <span>Câu {currentIndex + 1} / {questions.length}</span>
            </div>

          </div>
        </motion.div>
      </div>

      {/* Navigation Controls */}
      <div className="w-full flex items-center justify-between mt-4">
        <button
          onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 transition-all shadow-sm"
        >
          <ChevronLeft className="w-5 h-5" /> Câu Trước
        </button>

        <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
          {currentIndex + 1} / {questions.length}
        </span>

        <button
          onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
          disabled={currentIndex === questions.length - 1}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-40 transition-all shadow-md shadow-blue-500/20"
        >
          Câu Tiếp <ChevronRight className="w-5 h-5" />
        </button>
      </div>

    </div>
  );
}
