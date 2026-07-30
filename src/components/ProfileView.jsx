import React, { useEffect, useState } from 'react';
import { History, Award, CheckCircle, Clock, Calendar, ChevronRight, User, Star, Layers } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ExamResultView from './ExamResultView';

export default function ProfileView({ onStartNewExam }) {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedAttempt, setSelectedAttempt] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profileRes, historyRes] = await Promise.all([
        api.get('/auth/me'),
        api.get('/exam/history'),
      ]);
      setProfileData(profileRes.data);
      setHistory(historyRes.data || []);
    } catch (err) {
      console.error('Failed to load profile data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewAttemptDetail = async (attemptId) => {
    try {
      const res = await api.get(`/exam/history/${attemptId}`);
      setSelectedAttempt(res.data);
    } catch (err) {
      console.error('Failed to load attempt detail:', err);
    }
  };

  if (selectedAttempt) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6">
        <button
          onClick={() => setSelectedAttempt(null)}
          className="mb-4 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          ← Quay Lại Danh Sách Lịch Sử Bài Thi
        </button>
        <ExamResultView
          result={selectedAttempt}
          onRetake={() => {
            setSelectedAttempt(null);
            if (onStartNewExam) onStartNewExam();
          }}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 text-sm">Đang tải lịch sử học tập & bài thi...</p>
      </div>
    );
  }

  const stats = profileData?.stats || {
    totalExams: history.length,
    averageScore: history.length > 0 ? (history.reduce((acc, curr) => acc + curr.score, 0) / history.length).toFixed(2) : 0,
    starredQuestions: 0,
    masteredQuestions: 0,
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Profile Header */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xl mb-8 flex flex-col sm:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center font-black text-3xl shrink-0">
          {user?.username?.charAt(0).toUpperCase() || 'U'}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold">{user?.username}</h1>
            <span className="px-3 py-0.5 rounded-full bg-white/20 text-xs font-semibold">Tài khoản Sinh viên</span>
          </div>
          <p className="text-blue-100 text-sm mt-1">{user?.email}</p>
          <p className="text-xs text-blue-200 mt-2">
            Đã tham gia từ: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'Mới tham gia'}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <p className="text-xs text-slate-500 mb-1">Tổng Bài Thi</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalExams}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <p className="text-xs text-slate-500 mb-1">Điểm Trung Bình</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.averageScore}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <p className="text-xs text-slate-500 mb-1">Câu Đánh Dấu Sao</p>
          <p className="text-2xl font-bold text-amber-500">{stats.starredQuestions}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <p className="text-xs text-slate-500 mb-1">Đã Thông Thạo</p>
          <p className="text-2xl font-bold text-emerald-500">{stats.masteredQuestions}</p>
        </div>
      </div>

      {/* Exam History Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <History className="w-5 h-5 text-blue-600" /> Lịch Sử 60p Bài Thi Đã Làm
        </h2>

        {history.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            Bạn chưa thực hiện bài thi thử 60 phút nào. Hãy bắt đầu ngay nhé!
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item) => (
              <div
                key={item.id}
                onClick={() => handleViewAttemptDetail(item.id)}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-all flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base shrink-0 ${
                    item.isPassed ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400' : 'bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400'
                  }`}>
                    {item.score}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {item.isPassed ? 'ĐẠT YÊU CẦU' : 'CHƯA ĐẠT'}
                      </span>
                      <span className="text-xs text-slate-400">({item.correctCount}/60 câu đúng)</span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(item.completedAt).toLocaleString('vi-VN')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {Math.floor(item.timeSpentSeconds / 60)} phút {item.timeSpentSeconds % 60} giây
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400">
                  Xem lại chi tiết <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
}
