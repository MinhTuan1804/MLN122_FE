import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import HomeView from './components/HomeView';
import StudyMode from './components/StudyMode';
import ExamView from './components/ExamView';
import ExamResultView from './components/ExamResultView';
import ProfileView from './components/ProfileView';
import { Lock, LogIn, UserPlus, ShieldAlert } from 'lucide-react';

function AppContent() {
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'study' | 'exam' | 'result' | 'profile'
  const [examResult, setExamResult] = useState(null);
  const { user, openAuthModal } = useAuth();

  const handleTabChange = (tab) => {
    if (tab !== 'home' && !user) {
      openAuthModal('login');
      return;
    }
    setActiveTab(tab);
  };

  const handleExamComplete = (resultData) => {
    setExamResult(resultData);
    setActiveTab('result');
  };

  const handleRetakeExam = () => {
    setExamResult(null);
    if (!user) {
      openAuthModal('login');
      return;
    }
    setActiveTab('exam');
  };

  const renderContent = () => {
    if (activeTab !== 'home' && !user) {
      return (
        <div className="max-w-xl mx-auto px-4 py-16 text-center">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8" />
            </div>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Yêu Cầu Đăng Nhập Tài Khoản
            </h2>

            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
              Bạn cần Đăng ký hoặc Đăng nhập tài khoản trước khi truy cập Chế độ Học Flashcard và Thi Thử 60 phút để hệ thống lưu tiến trình học & lịch sử bài làm cá nhân.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => openAuthModal('login')}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" /> Đăng Nhập Ngay
              </button>

              <button
                onClick={() => openAuthModal('register')}
                className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" /> Đăng Ký Tài Khoản
              </button>
            </div>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'study':
        return <StudyMode />;
      case 'exam':
        return <ExamView onExamComplete={handleExamComplete} />;
      case 'result':
        return <ExamResultView result={examResult} onRetake={handleRetakeExam} />;
      case 'profile':
        return <ProfileView onStartNewExam={() => handleTabChange('exam')} />;
      case 'home':
      default:
        return <HomeView setActiveTab={handleTabChange} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-500 selection:text-white transition-colors duration-300">
      
      <Navbar activeTab={activeTab} setActiveTab={handleTabChange} />
      
      <main className="pb-16">
        {renderContent()}
      </main>

      <AuthModal />

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 MLN122 Quiz Application. 539 câu hỏi Mác - Lênin chuẩn.</p>
          <p>Phát triển với ReactJS, .NET 8, PostgreSQL & Docker.</p>
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
