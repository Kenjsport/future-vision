import React, { useState, useEffect } from 'react';
import { User, Mail, Calendar, TrendingUp, Target, CheckCircle2, LogOut, History } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { API_BASE } from '../utils/api';
import HistoryDashboard from './HistoryDashboard';

export default function AccountPage({ onLogout }) {
    const { user, logout, getAuthHeaders } = useAuth();
    const { t } = useLanguage();
    const [accountData, setAccountData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showHistory, setShowHistory] = useState(false);

    useEffect(() => {
        fetchAccountData();
    }, []);

    const fetchAccountData = async () => {
        try {
            const response = await fetch(`${API_BASE}/api/account/me`, {
                method: 'GET',
                headers: getAuthHeaders(),
            });

            if (response.ok) {
                const data = await response.json();
                setAccountData(data.user);
            } else {
                console.error('Failed to fetch account data');
            }
        } catch (error) {
            console.error('Error fetching account data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        if (onLogout) {
            onLogout();
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 via-indigo-950 to-blue-950 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-blue-500/10 pointer-events-none"></div>
                <div className="text-white text-xl">{t('loading')}</div>
            </div>
        );
    }

    if (showHistory) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 via-indigo-950 to-blue-950 p-4 md:p-8 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-blue-500/10 pointer-events-none"></div>
                <div className="max-w-4xl mx-auto relative z-10">
                    <button
                        onClick={() => setShowHistory(false)}
                        className="mb-6 px-4 py-2 bg-gray-800/60 text-white rounded-lg hover:bg-gray-700/60 border border-gray-700/50 transition-all"
                    >
                        ← {t('back')}
                    </button>
                    <HistoryDashboard
                        userId={user?.email}
                        onSelectPrediction={(pred) => {
                            // Could navigate to prediction view here
                            setShowHistory(false);
                        }}
                        onCompare={(ids) => {
                            // Could navigate to comparison view here
                            setShowHistory(false);
                        }}
                        onClose={() => setShowHistory(false)}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4 md:p-8 text-white">
            <div className="max-w-4xl mx-auto">
                <div className="bg-gray-900/80 backdrop-blur-lg rounded-2xl p-8 border border-gray-700/50 mb-6 shadow-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-3xl font-bold border-2 border-purple-500/30">
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold mb-2">{user?.name || 'User'}</h1>
                                <div className="flex items-center gap-2 text-white/70">
                                    <Mail className="w-4 h-4" />
                                    <span>{user?.email}</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-red-900/40 hover:bg-red-800/50 border border-red-700/50 text-red-200 rounded-lg transition-all flex items-center gap-2"
                        >
                            <LogOut className="w-4 h-4" />
                            {t('logout')}
                        </button>
                    </div>

                    {accountData && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-gray-800/60 rounded-xl p-4 border border-gray-700/50">
                                <div className="flex items-center gap-3 mb-2">
                                    <Target className="w-5 h-5 text-purple-300" />
                                    <span className="text-white/70 text-sm">{t('totalPredictions')}</span>
                                </div>
                                <div className="text-3xl font-bold">{accountData.stats?.totalPredictions || 0}</div>
                            </div>
                            <div className="bg-gray-800/60 rounded-xl p-4 border border-gray-700/50">
                                <div className="flex items-center gap-3 mb-2">
                                    <CheckCircle2 className="w-5 h-5 text-green-300" />
                                    <span className="text-white/70 text-sm">{t('completedPredictions')}</span>
                                </div>
                                <div className="text-3xl font-bold">{accountData.stats?.completedPredictions || 0}</div>
                            </div>
                            <div className="bg-gray-800/60 rounded-xl p-4 border border-gray-700/50">
                                <div className="flex items-center gap-3 mb-2">
                                    <TrendingUp className="w-5 h-5 text-blue-300" />
                                    <span className="text-white/70 text-sm">{t('totalMilestones')}</span>
                                </div>
                                <div className="text-3xl font-bold">{accountData.stats?.totalMilestones || 0}</div>
                            </div>
                        </div>
                    )}

                    <div className="bg-gray-800/60 rounded-xl p-4 border border-gray-700/50 mb-4">
                        <div className="flex items-center gap-2 text-white/70 mb-2">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm">{t('memberSince')}</span>
                        </div>
                        <div className="text-white">
                            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                        </div>
                    </div>

                    <button
                        onClick={() => setShowHistory(true)}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-lg font-semibold hover:shadow-xl transition-all flex items-center justify-center gap-2 border border-purple-500/30"
                    >
                        <History className="w-5 h-5" />
                        {t('viewFullHistory')}
                    </button>
                </div>
            </div>
        </div>
    );
}

