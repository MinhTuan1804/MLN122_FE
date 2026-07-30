import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Flag, AlertTriangle, CheckCircle, ChevronLeft, ChevronRight, Send, Play, Sparkles, HelpCircle, ShieldCheck, Timer, FileText, Target, Settings2 } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ExamView({ onExamComplete, onBackToHome }) {
  const [hasStarted, setHasStarted] = useState(false);
  const [examSession, setExamSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // { questionId: answerKey }
  const [flaggedSet, setFlaggedSet] = useState(new Set()); // Set of questionIds
  
  // Custom exam setup (default: 60 questions, 60 minutes)
  const [customQuestionCount, setCustomQuestionCount] = useState(60);
  const [customTimeLimitMinutes, setCustomTimeLimitMinutes] = useState(60);

  const [timeLeft, setTimeLeft] = useState(3600);
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth();

  // Timer countdown
  useEffect(() => {
    if (!hasStarted || !examSession || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinalSubmit(); // Auto submit when time expires
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [hasStarted, examSession, timeLeft]);

  const startNewExam = async () => {
    setLoading(true);
    const qCount = Math.min(Math.Max(1, parseInt(customQuestionCount) || 60), 539);
    const tLimit = Math.Max(1, parseInt(customTimeLimitMinutes) || 60);

    try {
      const res = await api.post('/exam/start', null, {
        params: {
          questionCount: qCount,
          timeLimitMinutes: tLimit,
        },
      });
      setExamSession(res.data);
      setCurrentIndex(0);
      setUserAnswers({});
      setFlaggedSet(new Set());
      setTimeLeft((res.data.timeLimitMinutes || tLimit) * 60);
      setHasStarted(true);
    } catch (err) {
      console.error('Failed to start exam session:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId, key) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: key,
    }));
  };

  const toggleFlag = (questionId) => {
    setFlaggedSet((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) next.delete(questionId);
      else next.add(questionId);
      return next;
    });
  };

  const handleFinalSubmit = async () => {
    if (isSubmitting || !examSession) return;
    setIsSubmitting(true);

    const answersPayload = examSession.questions.map((q) => ({
      questionId: q.id,
      userAnswer: userAnswers[q.id] || '',
      isFlagged: flaggedSet.has(q.id),
    }));

    const totalTimeLimitSeconds = (examSession.timeLimitMinutes || 60) * 60;
    const timeSpentSeconds = Math.max(1, totalTimeLimitSeconds - timeLeft);

    try {
      const res = await api.post('/exam/submit', {
        timeSpentSeconds,
        answers: answersPayload,
      });

      if (onExamComplete) {
        onExamComplete(res.data);
      }
    } catch (err) {
      console.error('Failed to submit exam:', err);
    } finally {
      setIsSubmitting(false);
      setConfirmSubmitOpen(false);
    }
  };

  // POPUP INTRO SCREEN BEFORE EXAM STARTS
  if (!hasStarted) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 flex items-center justify-center min-h-[80vh]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden"
        >
          {/* Top Decorative Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/25">
              <Clock className="w-8 h-8" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Bài Thi Thử Môn MLN122
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Kinh Tế Chính Trị Mác - Lênin (Bộ 539 câu hỏi chuẩn)
            </p>
          </div>

          {/* Custom Settings Configurator - High-End Redesign */}
          <div className="relative rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-blue-950/40 border border-blue-500/20 backdrop-blur-xl shadow-2xl overflow-hidden mb-7">
            
            {/* Top Header Badge */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400 flex items-center justify-center">
                  <Settings2 className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">Tùy Chỉnh Cấu Hình Bài Thi</h3>
                  <p className="text-xs text-slate-400">Điều chỉnh số lượng câu & thời gian làm bài theo ý muốn</p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider hidden sm:inline-block">
                Cấu Hình Cá Nhân
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Question Count Selector */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-400" /> Số lượng câu hỏi:
                  </label>
                  <span className="text-xs text-slate-400 font-medium">(Tối đa 539 câu)</span>
                </div>

                {/* Sleek Input */}
                <div className="relative flex items-center bg-slate-950/80 border border-slate-800 focus-within:border-blue-500 rounded-2xl p-1.5 transition-all shadow-inner">
                  <input
                    type="number"
                    min="1"
                    max="539"
                    value={customQuestionCount}
                    onChange={(e) => setCustomQuestionCount(e.target.value)}
                    className="w-full bg-transparent px-3 py-1 text-lg font-black text-white outline-none"
                  />
                  <span className="px-3 py-1.5 rounded-xl bg-blue-500/20 text-blue-300 font-bold text-xs shrink-0 border border-blue-500/30">
                    Câu hỏi
                  </span>
                </div>

                {/* Preset Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[10, 20, 30, 60, 100].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setCustomQuestionCount(num)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        parseInt(customQuestionCount) === num
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 ring-1 ring-blue-400 scale-[1.02]'
                          : 'bg-slate-800/60 border border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      {num} câu {num === 60 ? '(Mặc định)' : ''}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Limit Selector */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Timer className="w-3.5 h-3.5 text-indigo-400" /> Thời gian làm bài:
                  </label>
                  <span className="text-xs text-slate-400 font-medium">(Tối đa 180 phút)</span>
                </div>

                {/* Sleek Input */}
                <div className="relative flex items-center bg-slate-950/80 border border-slate-800 focus-within:border-indigo-500 rounded-2xl p-1.5 transition-all shadow-inner">
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={customTimeLimitMinutes}
                    onChange={(e) => setCustomTimeLimitMinutes(e.target.value)}
                    className="w-full bg-transparent px-3 py-1 text-lg font-black text-white outline-none"
                  />
                  <span className="px-3 py-1.5 rounded-xl bg-indigo-500/20 text-indigo-300 font-bold text-xs shrink-0 border border-indigo-500/30">
                    Phút làm bài
                  </span>
                </div>

                {/* Preset Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[15, 30, 45, 60, 90].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setCustomTimeLimitMinutes(mins)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        parseInt(customTimeLimitMinutes) === mins
                          ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30 ring-1 ring-indigo-400 scale-[1.02]'
                          : 'bg-slate-800/60 border border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      {mins} phút {mins === 60 ? '(Mặc định)' : ''}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Specs Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 text-center">
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center justify-center gap-1 mb-1">
                <Timer className="w-3.5 h-3.5" /> Thời Gian Tính
              </span>
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {customTimeLimitMinutes || 60} Phút
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 text-center">
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center justify-center gap-1 mb-1">
                <FileText className="w-3.5 h-3.5" /> Số Cấu Hỏi
              </span>
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {customQuestionCount || 60} Câu
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 text-center">
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center justify-center gap-1 mb-1">
                <Target className="w-3.5 h-3.5" /> Điểm Đạt
              </span>
              <span className="text-2xl font-black text-slate-900 dark:text-white">≥ 5.0 / 10</span>
            </div>
          </div>

          {/* Instructions Rules */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs leading-relaxed text-slate-600 dark:text-slate-300 mb-6">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-2">Quy định & Hướng dẫn làm bài thi:</h3>
            <ul className="space-y-1.5 list-disc list-inside">
              <li>
                Đề thi sẽ rút <strong>ngẫu nhiên {customQuestionCount || 60} câu hỏi</strong> từ bộ 539 câu chuẩn môn MLN122.
              </li>
              <li>
                Đồng hồ đếm ngược <strong>{customTimeLimitMinutes || 60}:00</strong> sẽ bắt đầu tính giờ ngay khi bấm nút bên dưới.
              </li>
              <li>
                Sử dụng bảng <strong>Question Grid (1-{customQuestionCount || 60})</strong> bên phải để chuyển câu và theo dõi trạng thái.
              </li>
              <li>
                Có thể đánh dấu <strong>Flag</strong> cho các câu cần xem lại trước khi bấm <strong>Nộp Bài</strong>.
              </li>
              <li>Khi hết giờ (00:00), hệ thống sẽ tự động thu bài và chấm điểm ngay lập tức.</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={startNewExam}
              disabled={loading}
              className="flex-1 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold shadow-xl shadow-blue-500/25 transition-all text-sm sm:text-base flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" /> Bắt Đầu Làm Bài Thi ({customQuestionCount} câu / {customTimeLimitMinutes}p)
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const currentQ = examSession?.questions?.[currentIndex];
  if (!currentQ) return null;

  const formatTimer = (totalSec) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const totalQuestions = examSession.questions.length;
  const answeredCount = Object.keys(userAnswers).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Exam Header Status Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            Bài Thi Thử MLN122 ({totalQuestions} CÂU)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Đã làm: <strong className="text-blue-600 dark:text-blue-400">{answeredCount}</strong> / {totalQuestions} câu | Đánh dấu: <strong className="text-amber-500">{flaggedSet.size}</strong> câu
          </p>
        </div>

        {/* Timer Box */}
        <div className="flex items-center gap-4">
          <div className={`px-5 py-2.5 rounded-2xl border font-mono font-black text-xl flex items-center gap-2 ${
            timeLeft < 300
              ? 'bg-red-50 dark:bg-red-950/60 border-red-500 text-red-600 dark:text-red-400 animate-pulse'
              : 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400'
          }`}>
            <Clock className="w-5 h-5" />
            {formatTimer(timeLeft)}
          </div>

          <button
            onClick={() => setConfirmSubmitOpen(true)}
            className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-600/25 transition-all text-sm flex items-center gap-2"
          >
            <Send className="w-4 h-4" /> Nộp Bài
          </button>
        </div>
      </div>

      {/* Main Exam Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left: Active Question Panel */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col justify-between min-h-[500px]">
            
            <div>
              {/* Question Header bar */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-bold">
                    Câu {currentIndex + 1} / {totalQuestions}
                  </span>
                  <span className="text-xs text-slate-400">ID: {currentQ.questionNum}</span>
                </div>

                <button
                  onClick={() => toggleFlag(currentQ.id)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all ${
                    flaggedSet.has(currentQ.id)
                      ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Flag className={`w-3.5 h-3.5 ${flaggedSet.has(currentQ.id) ? 'fill-amber-400' : ''}`} />
                  {flaggedSet.has(currentQ.id) ? 'Đã đánh dấu Flag' : 'Đánh dấu xem lại'}
                </button>
              </div>

              {/* Question Content */}
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-relaxed mb-6">
                {currentQ.content}
              </h2>

              {/* Options */}
              <div className="space-y-3">
                {currentQ.options.map((opt) => {
                  const isSelected = userAnswers[currentQ.id] === opt.key;
                  return (
                    <button
                      key={opt.id || opt.key}
                      onClick={() => handleSelectOption(currentQ.id, opt.key)}
                      className={`w-full p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 ring-2 ring-blue-500/30 font-medium'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <span className={`w-7 h-7 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}>
                        {opt.key}
                      </span>
                      <span className="text-base leading-relaxed">{opt.content}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Nav Controls */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800 mt-8">
              <button
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="px-5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs sm:text-sm disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" /> Câu Trước
              </button>

              <button
                onClick={() => setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                disabled={currentIndex === totalQuestions - 1}
                className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs sm:text-sm disabled:opacity-30 transition-all shadow-md shadow-blue-500/20 flex items-center gap-1.5"
              >
                Câu Tiếp Theo <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

        {/* Right: Question Navigation Grid Drawer */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xl sticky top-24">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                DANH SÁCH {totalQuestions} CÂU
              </h3>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2.5 py-1 rounded-full">
                {answeredCount}/{totalQuestions}
              </span>
            </div>

            {/* Grid Legend */}
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-4 px-1">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-blue-600" /> Đã chọn
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-amber-400" /> Đánh dấu
              </span>
            </div>

            {/* Grid Buttons */}
            <div className="grid grid-cols-5 gap-2 max-h-[380px] overflow-y-auto p-1.5">
              {examSession.questions.map((q, idx) => {
                const isAnswered = !!userAnswers[q.id];
                const isFlagged = flaggedSet.has(q.id);
                const isCurrent = idx === currentIndex;

                let bgClass = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';

                if (isAnswered) {
                  bgClass = 'bg-blue-600 text-white border-blue-600 font-bold';
                }
                if (isFlagged) {
                  bgClass = 'bg-amber-400 text-slate-900 border-amber-400 font-bold';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-9 rounded-xl border-2 text-xs font-semibold flex items-center justify-center relative transition-all ${bgClass} ${
                      isCurrent
                        ? 'border-cyan-400 ring-2 ring-cyan-400/80 font-black shadow-md shadow-cyan-500/40 z-10'
                        : ''
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setConfirmSubmitOpen(true)}
              className="w-full mt-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-lg shadow-emerald-600/25 transition-all text-sm flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" /> Nộp Bài Thi
            </button>

          </div>
        </div>

      </div>

      {/* CONFIRM SUBMIT MODAL */}
      <AnimatePresence>
        {confirmSubmitOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-7 h-7" />
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Xác Nhận Nộp Bài Thi?
              </h3>

              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                Bạn đã hoàn thành <strong className="text-blue-600 dark:text-blue-400">{answeredCount} / {totalQuestions}</strong> câu hỏi.
                {totalQuestions - answeredCount > 0 && (
                  <span className="block text-amber-600 dark:text-amber-400 font-medium mt-1">
                    Còn {totalQuestions - answeredCount} câu hỏi chưa chọn đáp án!
                  </span>
                )}
              </p>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setConfirmSubmitOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  Tiếp Tục Làm
                </button>

                <button
                  onClick={handleFinalSubmit}
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Nộp Ngay'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
