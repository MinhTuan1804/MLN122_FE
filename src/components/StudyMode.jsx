import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Search, Star, Layers, CheckCircle2, XCircle, Shuffle, RotateCcw, Sparkles, Flame, Zap, Layers2, BookOpen, AlertCircle, Award, CheckSquare, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../services/api';
import FlashcardView from './FlashcardView';
import { useAuth } from '../context/AuthContext';

export default function StudyMode() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('flashcard'); // 'flashcard' | 'practice'
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'starred' | 'wrong' | 'mastered'
  const [currentIndex, setCurrentIndex] = useState(0);

  // Store last question index for each filter category
  const [filterIndexes, setFilterIndexes] = useState({
    all: 0,
    starred: 0,
    wrong: 0,
    mastered: 0,
  });

  // User stats counts for filter badges
  const [counts, setCounts] = useState({ starred: 0, wrong: 0, mastered: 0 });

  // Practice mode state
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [streak, setStreak] = useState(0);
  const [jumpInput, setJumpInput] = useState('');

  const { user, openAuthModal } = useAuth();
  const isInitialStateLoaded = useRef(false);

  // Load user saved position on initial mount / user change
  useEffect(() => {
    loadUserSavedState();
  }, [user?.id]);

  // Reset answer states whenever question or filter changes
  useEffect(() => {
    setSelectedOptions([]);
    setIsAnswered(false);
  }, [currentIndex, filterType, mode]);

  const refreshCounts = async () => {
    if (!user?.id) return;
    try {
      const res = await api.get('/questions/user-state');
      if (res.data) {
        setCounts({
          starred: res.data.starredCount || 0,
          wrong: res.data.wrongCount || 0,
          mastered: res.data.masteredCount || 0,
        });
      }
    } catch (err) {}
  };

  const loadUserSavedState = async () => {
    let savedIndex = 0;
    let savedMode = 'flashcard';
    let savedFilter = 'all';

    if (user?.id) {
      const localKey = `mln122_study_state_${user.id}`;
      const localSaved = localStorage.getItem(localKey);
      if (localSaved) {
        try {
          const parsed = JSON.parse(localSaved);
          if (parsed.currentIndex !== undefined) savedIndex = parsed.currentIndex;
          if (parsed.mode) savedMode = parsed.mode;
          if (parsed.filterType) savedFilter = parsed.filterType;
          if (parsed.filterIndexes) setFilterIndexes(parsed.filterIndexes);
        } catch (e) {}
      }

      try {
        const res = await api.get('/questions/user-state');
        if (res.data) {
          if (res.data.lastQuestionIndex !== undefined) savedIndex = res.data.lastQuestionIndex;
          if (res.data.lastStudyMode) savedMode = res.data.lastStudyMode;
          if (res.data.lastFilterType) savedFilter = res.data.lastFilterType;
          setCounts({
            starred: res.data.starredCount || 0,
            wrong: res.data.wrongCount || 0,
            mastered: res.data.masteredCount || 0,
          });
        }
      } catch (err) {
        console.error('Failed to fetch user study state from backend:', err);
      }
    }

    setFilterType(savedFilter);
    setMode(savedMode);
    setCurrentIndex(savedIndex);
    isInitialStateLoaded.current = true;
    fetchQuestions(savedIndex, savedFilter);
  };

  const fetchQuestions = async (targetIndex, currentFilter) => {
    setLoading(true);
    try {
      const res = await api.get('/questions', {
        params: {
          search,
          filterType: currentFilter,
          pageSize: 539,
        },
      });
      const data = res.data.data || [];
      setQuestions(data);

      if (targetIndex >= 0 && targetIndex < data.length) {
        setCurrentIndex(targetIndex);
      } else {
        setCurrentIndex(0);
      }
    } catch (err) {
      console.error('Failed to load questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newType) => {
    if (newType === filterType) return;
    
    setFilterIndexes((prev) => ({ ...prev, [filterType]: currentIndex }));
    setFilterType(newType);
    setSelectedOptions([]);
    setIsAnswered(false);

    const targetIdx = filterIndexes[newType] || 0;
    fetchQuestions(targetIdx, newType);
  };

  // Persist index, mode & filterType whenever updated
  useEffect(() => {
    if (!user?.id || !isInitialStateLoaded.current) return;

    setFilterIndexes((prev) => ({ ...prev, [filterType]: currentIndex }));

    const localKey = `mln122_study_state_${user.id}`;
    localStorage.setItem(localKey, JSON.stringify({
      currentIndex,
      mode,
      filterType,
      filterIndexes: { ...filterIndexes, [filterType]: currentIndex }
    }));

    const timer = setTimeout(() => {
      api.post('/questions/user-state', {
        lastQuestionIndex: currentIndex,
        lastStudyMode: mode,
        lastFilterType: filterType,
      }).catch((err) => console.error('Failed to update user state:', err));
    }, 500);

    return () => clearTimeout(timer);
  }, [currentIndex, mode, filterType, user?.id]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchQuestions(0, filterType);
  };

  const handleResetAllProgress = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn Reset toàn bộ tiến trình học (xóa danh sách câu làm sai, bỏ đánh dấu sao và quay lại Câu 1)?')) return;

    try {
      if (user) {
        await api.post('/questions/user-progress/reset');
        await api.post('/questions/user-state', {
          lastQuestionIndex: 0,
          lastStudyMode: 'flashcard',
          lastFilterType: 'all',
        });
      }

      if (user?.id) {
        localStorage.removeItem(`mln122_study_state_${user.id}`);
      }

      setFilterType('all');
      setCurrentIndex(0);
      setCounts({ starred: 0, wrong: 0, mastered: 0 });
      setFilterIndexes({ all: 0, starred: 0, wrong: 0, mastered: 0 });
      setSelectedOptions([]);
      setIsAnswered(false);
      setStreak(0);

      fetchQuestions(0, 'all');
    } catch (err) {
      console.error('Failed to reset progress:', err);
    }
  };

  const handleStarToggle = async (questionId) => {
    if (!user) {
      openAuthModal('login');
      return;
    }

    try {
      const res = await api.post(`/questions/${questionId}/star`);
      const { isStarred } = res.data;

      setQuestions((prev) =>
        prev.map((q) => (q.id === questionId ? { ...q, isStarred } : q))
      );

      refreshCounts();
    } catch (err) {
      console.error('Failed to toggle star:', err);
    }
  };

  const currentQ = questions[currentIndex];

  // Parse correct answers array for current question
  const correctKeys = (currentQ?.correctAnswer || '')
    .split(',')
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);

  const isMultiSelect = correctKeys.length > 1;

  const handleOptionClick = (key) => {
    if (isAnswered) return;

    if (!isMultiSelect) {
      // Single choice: select and evaluate immediately
      const newSelected = [key];
      setSelectedOptions(newSelected);
      evaluatePracticeAnswer(newSelected);
    } else {
      // Multi choice: toggle option selection
      setSelectedOptions((prev) =>
        prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
      );
    }
  };

  const evaluatePracticeAnswer = async (selectedList) => {
    setIsAnswered(true);

    const isCorrect =
      selectedList.length === correctKeys.length &&
      selectedList.every((k) => correctKeys.includes(k));

    if (isCorrect) {
      setStreak((prev) => prev + 1);
    } else {
      setStreak(0);
    }

    if (user) {
      try {
        await api.post(`/questions/${currentQ.id}/record`, { isCorrect });
        refreshCounts();
      } catch (err) {
        console.error('Failed to record practice answer:', err);
      }
    }
  };

  const handleConfirmMultiAnswer = () => {
    if (isAnswered || selectedOptions.length === 0) return;
    evaluatePracticeAnswer(selectedOptions);
  };

  const nextPracticeQuestion = () => {
    setSelectedOptions([]);
    setIsAnswered(false);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const shuffleQuestions = () => {
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    setQuestions(shuffled);
    setCurrentIndex(0);
    setSelectedOptions([]);
    setIsAnswered(false);
  };

  const isUserAnswerCorrect =
    selectedOptions.length === correctKeys.length &&
    selectedOptions.every((k) => correctKeys.includes(k));

  const handleJumpSubmit = () => {
    if (jumpInput === '') return;
    const num = parseInt(jumpInput, 10);
    if (!isNaN(num) && num >= 1 && num <= questions.length) {
      setCurrentIndex(num - 1);
      setSelectedOptions([]);
      setIsAnswered(false);
    }
    setJumpInput('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Top Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <span className="p-2 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Layers className="w-6 h-6" />
            </span>
            Chế Độ Học Tập MLN122
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Ôn luyện 539 câu hỏi Mác - Lênin với thẻ ghi nhớ 3D hoặc Trả lời trắc nghiệm trực tiếp
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center p-1 bg-slate-200 dark:bg-slate-800 rounded-2xl border border-slate-300 dark:border-slate-700">
          <button
            onClick={() => {
              setMode('flashcard');
              setSelectedOptions([]);
              setIsAnswered(false);
            }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
              mode === 'flashcard'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers2 className="w-4 h-4" /> Thẻ Flashcard 3D
          </button>
          <button
            onClick={() => {
              setMode('practice');
              setSelectedOptions([]);
              setIsAnswered(false);
            }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
              mode === 'practice'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Zap className="w-4 h-4" /> Luyện Tập Ngay
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm mb-8">
        
        {/* Filter Categories */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleFilterChange('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                filterType === 'all'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" /> Tất Cả (539)
            </button>

            <button
              onClick={() => handleFilterChange('starred')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                filterType === 'starred'
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 hover:bg-amber-100 border border-amber-200 dark:border-amber-800/50'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-current" /> Đã Đánh Dấu Sao ({counts.starred})
            </button>

            <button
              onClick={() => handleFilterChange('wrong')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                filterType === 'wrong'
                  ? 'bg-red-600 text-white shadow-md shadow-red-500/20'
                  : 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 border border-red-200 dark:border-red-800/50'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" /> Câu Làm Sai ({counts.wrong})
            </button>

            <button
              onClick={() => handleFilterChange('mastered')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                filterType === 'mastered'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800/50'
              }`}
            >
              <Award className="w-3.5 h-3.5" /> Đã Thông Thạo ({counts.mastered})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetAllProgress}
              className="px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-800/60 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/60 transition-colors flex items-center gap-1.5 text-xs font-medium"
              title="Reset toàn bộ tiến trình học, xóa danh sách làm sai và các câu đánh dấu sao về 0"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Tiến Trình
            </button>

            <button
              onClick={shuffleQuestions}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-xs font-medium"
              title="Trộn ngẫu nhiên danh sách câu hỏi"
            >
              <Shuffle className="w-3.5 h-3.5" /> Trộn Ngẫu Nhiên
            </button>
          </div>
        </div>

        {/* Search input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm từ khóa câu hỏi hoặc số câu (vd: Câu 25)..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </form>

      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="w-full py-20 flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-slate-500 dark:text-slate-400 text-sm">Đang tải danh sách câu hỏi...</p>
        </div>
      ) : questions.length === 0 ? (
        <div className="w-full py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
          <p className="text-slate-500 dark:text-slate-400 text-base font-semibold mb-2">
            Không có câu hỏi nào trong danh sách {filterType === 'starred' ? 'Đã Đánh Dấu Sao' : filterType === 'wrong' ? 'Câu Làm Sai' : filterType === 'mastered' ? 'Đã Thông Thạo' : ''}.
          </p>
          <p className="text-xs text-slate-400">
            Hãy bắt đầu học và đánh dấu ⭐ hoặc thực hiện luyện tập/thi thử để tự động tích lũy ngân hàng câu hỏi ôn tập nhé!
          </p>
        </div>
      ) : mode === 'flashcard' ? (
        <FlashcardView
          questions={questions}
          currentIndex={currentIndex}
          setCurrentIndex={setCurrentIndex}
          onStarToggle={handleStarToggle}
        />
      ) : (
        /* PRACTICE MODE */
        <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          
          {/* Header info */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-bold">
                {currentQ.questionNum || `Câu ${currentIndex + 1}`}
              </span>

              {isMultiSelect && (
                <span className="px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 text-xs font-bold border border-purple-200 dark:border-purple-800 flex items-center gap-1">
                  <CheckSquare className="w-3.5 h-3.5" /> Chọn nhiều đáp án ({correctKeys.length} câu đúng)
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> Streak: {streak}
              </span>

              <button
                onClick={() => handleStarToggle(currentQ.id)}
                className="text-slate-400 hover:text-amber-400 transition-colors p-1"
                title="Đánh dấu sao câu hỏi"
              >
                <Star className={`w-5 h-5 ${currentQ.isStarred ? 'fill-amber-400 text-amber-400' : ''}`} />
              </button>
            </div>
          </div>

          {/* Question text */}
          <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-relaxed mb-6">
            {currentQ.content}
          </h2>

          {/* Options grid */}
          <div className="space-y-3 mb-6">
            {currentQ.options.map((opt) => {
              const isSelected = selectedOptions.includes(opt.key);
              const isCorrectOpt = correctKeys.includes(opt.key);
              
              let styleClass = 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200';

              if (isAnswered) {
                if (isCorrectOpt) {
                  styleClass = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200 font-medium';
                } else if (isSelected && !isCorrectOpt) {
                  styleClass = 'border-red-500 bg-red-50 dark:bg-red-950/50 text-red-900 dark:text-red-200';
                }
              } else if (isSelected) {
                styleClass = 'border-purple-600 bg-purple-50/80 dark:bg-purple-950/60 text-purple-900 dark:text-purple-200 ring-2 ring-purple-500/30 font-medium';
              }

              return (
                <button
                  key={opt.id || opt.key}
                  disabled={isAnswered}
                  onClick={() => handleOptionClick(opt.key)}
                  className={`w-full p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${styleClass}`}
                >
                  <span className={`w-7 h-7 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                    isAnswered && isCorrectOpt
                      ? 'bg-emerald-500 text-white'
                      : isAnswered && isSelected
                      ? 'bg-red-500 text-white'
                      : isSelected
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}>
                    {isSelected && !isAnswered ? <Check className="w-4 h-4" /> : opt.key}
                  </span>
                  <span className="text-base leading-relaxed">{opt.content}</span>
                </button>
              );
            })}
          </div>

          {/* Confirm Multi-Answer Button */}
          {isMultiSelect && !isAnswered && (
            <button
              onClick={handleConfirmMultiAnswer}
              disabled={selectedOptions.length === 0}
              className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-700 active:scale-[0.99] disabled:opacity-40 text-white font-bold shadow-lg shadow-purple-500/25 transition-all text-sm flex items-center justify-center gap-2 mb-6"
            >
              <CheckSquare className="w-4.5 h-4.5" /> Xác Nhận Đáp Án ({selectedOptions.length} phương án đã chọn)
            </button>
          )}

          {/* Feedback Explanation */}
          {isAnswered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 text-blue-900 dark:text-blue-200 mb-6"
            >
              <div className="flex items-center gap-2 font-bold mb-1.5">
                {isUserAnswerCorrect ? (
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-5 h-5" /> Chính xác!
                  </span>
                ) : (
                  <span className="text-red-600 dark:text-red-400 flex items-center gap-1">
                    <XCircle className="w-5 h-5" /> Chưa đúng! Đáp án đúng là {currentQ.correctAnswer}
                  </span>
                )}
              </div>
              {currentQ.explanation && (
                <p className="text-sm text-slate-700 dark:text-slate-300 mt-2">
                  <strong>Giải thích:</strong> {currentQ.explanation}
                </p>
              )}
            </motion.div>
          )}

          {/* Practice Mode Navigation Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-5 border-t border-slate-100 dark:border-slate-800 mt-6">
            {/* Previous Question Button */}
            <button
              onClick={() => {
                if (currentIndex > 0) {
                  setCurrentIndex((prev) => prev - 1);
                }
              }}
              disabled={currentIndex === 0}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" /> Câu Trước
            </button>

            {/* Question Counter & Editable Jump Input */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-700/60 text-xs font-bold text-slate-600 dark:text-slate-300 shadow-inner">
                <span>Câu</span>
                <input
                  type="number"
                  min="1"
                  max={questions.length}
                  value={jumpInput !== '' ? jumpInput : currentIndex + 1}
                  onChange={(e) => setJumpInput(e.target.value)}
                  onFocus={(e) => e.target.select()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleJumpSubmit();
                      e.target.blur();
                    }
                  }}
                  onBlur={handleJumpSubmit}
                  className="w-14 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-1 py-0.5 text-center text-xs font-black text-blue-600 dark:text-blue-400 outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                  title="Nhập số câu và ấn Enter để chuyển nhanh"
                />
                <span>/ {questions.length}</span>
              </div>

              {isAnswered && (
                <button
                  onClick={() => {
                    setSelectedOptions([]);
                    setIsAnswered(false);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-1"
                  title="Làm lại câu hỏi này"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Làm Lại
                </button>
              )}
            </div>

            {/* Next Question Button */}
            <button
              onClick={() => {
                if (currentIndex < questions.length - 1) {
                  setCurrentIndex((prev) => prev + 1);
                }
              }}
              disabled={currentIndex === questions.length - 1}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-xs disabled:opacity-30 shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
            >
              Câu Tiếp Theo <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
