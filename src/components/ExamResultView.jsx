import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Award, CheckCircle, XCircle, Clock, RefreshCw, Check, X, Sparkles, Flag, BookOpen } from 'lucide-react';

export default function ExamResultView({ result, onRetake }) {
  const [filter, setFilter] = useState('all'); // 'all' | 'correct' | 'wrong' | 'flagged'

  useEffect(() => {
    if (result && result.isPassed) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [result]);

  if (!result) return null;

  const { score, isPassed, correctCount, wrongCount, timeSpentSeconds, totalQuestions, details } = result;
  const flaggedCount = (details || []).filter((d) => d.isFlagged).length;

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m} phút ${s} giây`;
  };

  const filteredDetails = (details || []).filter((d) => {
    if (filter === 'correct') return d.isCorrect;
    if (filter === 'wrong') return !d.isCorrect;
    if (filter === 'flagged') return d.isFlagged;
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Result Hero Banner */}
      <div className={`rounded-3xl p-8 text-center border shadow-2xl relative overflow-hidden mb-8 ${
        isPassed
          ? 'bg-gradient-to-br from-emerald-900 via-slate-900 to-slate-900 border-emerald-500/40 text-white'
          : 'bg-gradient-to-br from-red-950 via-slate-900 to-slate-900 border-red-500/40 text-white'
      }`}>
        
        <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/20">
          <Award className={`w-8 h-8 ${isPassed ? 'text-emerald-400' : 'text-red-400'}`} />
        </div>

        <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-3 ${
          isPassed ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'
        }`}>
          {isPassed ? 'KẾT QUẢ: ĐẠT YÊU CẦU' : 'KẾT QUẢ: CHƯA ĐẠT'}
        </span>

        <h1 className="text-4xl sm:text-5xl font-black mb-2 tracking-tight">
          {score} <span className="text-2xl font-normal text-slate-300">/ 10</span>
        </h1>
        <p className="text-slate-300 text-sm max-w-md mx-auto">
          {isPassed
            ? 'Chúc mừng bạn đã hoàn thành xuất sắc bài thi môn Kinh Tế Chính Trị MLN122!'
            : 'Bạn cần ôn tập kỹ hơn các khái niệm trọng tâm để đạt kết quả cao hơn nhé!'}
        </p>

        {/* Retake Button */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={onRetake}
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2 text-sm"
          >
            <RefreshCw className="w-4 h-4" /> Làm Bài Thi Khác
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Số câu đúng</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">{correctCount} / {totalQuestions}</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Số câu sai</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">{wrongCount}</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Flag className="w-6 h-6 fill-amber-400" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Đã Đánh Dấu Flag</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">{flaggedCount}</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Thời gian làm bài</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">{formatTime(timeSpentSeconds)}</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Xem Lại Chi Tiết {totalQuestions} Câu Hỏi
        </h2>

        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === 'all' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500'
            }`}
          >
            Tất cả ({totalQuestions})
          </button>
          <button
            onClick={() => setFilter('correct')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === 'correct' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500'
            }`}
          >
            Đúng ({correctCount})
          </button>
          <button
            onClick={() => setFilter('wrong')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === 'wrong' ? 'bg-white dark:bg-slate-700 text-red-600 dark:text-red-400 shadow-sm' : 'text-slate-500'
            }`}
          >
            Sai ({wrongCount})
          </button>
          <button
            onClick={() => setFilter('flagged')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
              filter === 'flagged' ? 'bg-white dark:bg-slate-700 text-amber-500 shadow-sm' : 'text-slate-500'
            }`}
          >
            <Flag className="w-3.5 h-3.5 fill-amber-400" /> Đã Flag ({flaggedCount})
          </button>
        </div>
      </div>

      {/* Detailed Review List */}
      <div className="space-y-4">
        {filteredDetails.length === 0 ? (
          <div className="py-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            Không có câu hỏi nào trong danh sách lọc này.
          </div>
        ) : (
          filteredDetails.map((item, idx) => {
            return (
              <div
                key={item.questionId}
                className={`p-6 rounded-2xl border bg-white dark:bg-slate-900 transition-all ${
                  item.isCorrect
                    ? 'border-emerald-200 dark:border-emerald-900/50'
                    : 'border-red-200 dark:border-red-900/50'
                }`}
              >
                {/* Question Header */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-7 h-7 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 ${
                      item.isCorrect ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-500">{item.questionNum}</span>
                    
                    {item.isFlagged && (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 text-xs font-bold flex items-center gap-1 border border-amber-300 dark:border-amber-800">
                        <Flag className="w-3 h-3 fill-amber-400" /> Đã đánh dấu xem lại
                      </span>
                    )}
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                    item.isCorrect ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400'
                  }`}>
                    {item.isCorrect ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                    {item.isCorrect ? 'ĐÚNG' : 'SAI'}
                  </span>
                </div>

                {/* Question Content */}
                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-relaxed mb-4">
                  {item.content}
                </h3>

                {/* Options Breakdown */}
                <div className="grid grid-cols-1 gap-2 mb-4">
                  {(item.options || []).map((opt) => {
                    const isUserPick = item.userAnswer === opt.key;
                    const isCorrectAns = item.correctAnswer === opt.key;

                    let optBg = 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300';
                    
                    if (isCorrectAns) {
                      optBg = 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-semibold';
                    } else if (isUserPick && !isCorrectAns) {
                      optBg = 'bg-red-50 dark:bg-red-950/40 border-red-500 text-red-900 dark:text-red-200';
                    }

                    return (
                      <div
                        key={opt.id || opt.key}
                        className={`p-3 rounded-xl border text-sm flex items-start justify-between gap-3 ${optBg}`}
                      >
                        <div className="flex items-start gap-2.5">
                          <span className={`w-6 h-6 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 ${
                            isCorrectAns ? 'bg-emerald-500 text-white' : isUserPick ? 'bg-red-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          }`}>
                            {opt.key}
                          </span>
                          <span>{opt.content}</span>
                        </div>

                        {isCorrectAns && (
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                            Đáp án đúng
                          </span>
                        )}
                        {isUserPick && !isCorrectAns && (
                          <span className="text-xs font-bold text-red-600 dark:text-red-400 shrink-0">
                            Lựa chọn của bạn
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation Note */}
                {item.explanation && (
                  <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/50 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <strong>Giải thích chi tiết:</strong> {item.explanation}
                    </div>
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
