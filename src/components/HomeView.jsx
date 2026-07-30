import React from 'react';
import { BookOpen, GraduationCap, Clock, Award, CheckCircle2, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function HomeView({ setActiveTab }) {
  const { user, openAuthModal } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* HERO SECTION */}
      <div className="relative rounded-3xl bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white p-8 sm:p-12 overflow-hidden border border-blue-500/30 shadow-2xl mb-12">
        
        {/* Decorative background glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider mb-6">
            <Sparkles className="w-4 h-4 text-blue-400" /> Hệ Thống Ôn Thi Trắc Nghiệm Thông Minh
          </div>

          <h1 className="text-3xl sm:text-5xl font-black leading-tight tracking-tight mb-4">
            Ôn Thi & Luyện Tập Môn <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-300 bg-clip-text text-transparent">MLN122</span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-8">
            Học tập hiệu quả với ngân hàng <strong>539 câu hỏi & đáp án chuẩn</strong> (Kinh Tế Chính Trị Mác - Lênin). Đầy đủ chế độ lật thẻ 3D Quizlet và Thi thử 60 câu trong 60 phút!
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => setActiveTab('study')}
              className="px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-base shadow-xl shadow-blue-500/30 transition-all flex items-center gap-2"
            >
              <GraduationCap className="w-5 h-5" /> Học Flashcards Ngay
            </button>

            <button
              onClick={() => setActiveTab('exam')}
              className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 text-white font-semibold text-base border border-white/20 backdrop-blur-md transition-all flex items-center gap-2"
            >
              <Clock className="w-5 h-5 text-emerald-400" /> Vào Thi Thử 60 Phút
            </button>
          </div>
        </div>
      </div>

      {/* FEATURE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        
        {/* Feature 1 */}
        <div 
          onClick={() => setActiveTab('study')}
          className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Thẻ Flashcards 3D (Quizlet)
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
            Lật thẻ 3D siêu mượt, hỗ trợ phím tắt [Space] lật thẻ, phím mũi tên chuyển câu và phím [S] đánh dấu câu khó.
          </p>
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            Khám phá Chế độ Học <ArrowRight className="w-4 h-4" />
          </span>
        </div>

        {/* Feature 2 */}
        <div 
          onClick={() => setActiveTab('exam')}
          className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Thi Thử 60 Câu / 60 Phút
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
            Rút ngẫu nhiên 60 câu từ ngân hàng 539 câu, đếm ngược thời gian 60:00, bảng câu hỏi 1-60 drawer và nộp bài chấm điểm.
          </p>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            Bắt đầu bài thi ngay <ArrowRight className="w-4 h-4" />
          </span>
        </div>

        {/* Feature 3 */}
        <div 
          onClick={() => user ? setActiveTab('profile') : openAuthModal('login')}
          className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Lưu Tiến Trình Cá Nhân (JWT)
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
            Đăng ký/Đăng nhập bảo mật JWT (thời hạn token 7 ngày) giúp lưu lại danh sách câu bookmark, điểm số và lịch sử các lần thi.
          </p>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            {user ? 'Xem Hồ Sơ & Lịch Sử' : 'Đăng Nhập Tài Khoản'} <ArrowRight className="w-4 h-4" />
          </span>
        </div>

      </div>

    </div>
  );
}
