import React, { useState, useEffect } from 'react';
import { TrendingUp, Target, Award, Calendar, BarChart3, X } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useLanguage } from '../contexts/LanguageContext';
import { API_BASE } from '../utils/api';

export default function AnalyticsDashboard({ userId, onClose }) {
    const { t } = useLanguage();
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userId) {
            fetchAnalytics();
        }
    }, [userId]);

    const fetchAnalytics = async () => {
        try {
            const response = await fetch(`${API_BASE}/api/analytics/${userId}`);
            if (response.ok) {
                const data = await response.json();
                setAnalytics(data.analytics);
            }
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-gray-900/80 backdrop-blur-lg rounded-2xl p-8 border border-gray-700/50 shadow-2xl text-center">
                <div className="text-white">{t('loading')}</div>
            </div>
        );
    }

    if (!analytics || analytics.totalPredictions === 0) {
        return (
            <div className="bg-gray-900/80 backdrop-blur-lg rounded-2xl p-8 border border-gray-700/50 shadow-2xl text-center">
                <BarChart3 className="w-16 h-16 text-white/50 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">{t('noAnalyticsData')}</h3>
                <p className="text-white/60">{t('createPredictionsToSeeAnalytics')}</p>
            </div>
        );
    }

    // Prepare data for charts
    const progressData = analytics.progressOverTime
        .slice(-10)
        .map((item, idx) => ({
            name: item.skill?.substring(0, 10) || `Prediction ${idx + 1}`,
            progress: Math.round(item.progress),
            date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        }));

    const monthlyData = Object.entries(analytics.monthlyActivity)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([month, count]) => ({
            month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            predictions: count
        }));

    const skillData = analytics.topSkills?.map((item, idx) => ({
        name: item.skill,
        value: item.count,
        fill: ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'][idx % 5]
    })) || [];

    const COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <BarChart3 className="w-8 h-8 text-purple-300" />
                    <h2 className="text-3xl font-bold text-white">{t('analyticsDashboard')}</h2>
                </div>
                {onClose && (
                    <button onClick={onClose} className="text-white/60 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50">
                    <div className="flex items-center gap-3 mb-2">
                        <Target className="w-6 h-6 text-purple-300" />
                        <h3 className="text-white/80 text-sm">{t('totalPredictions')}</h3>
                    </div>
                    <p className="text-3xl font-bold text-white">{analytics.totalPredictions}</p>
                </div>

                <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50">
                    <div className="flex items-center gap-3 mb-2">
                        <Award className="w-6 h-6 text-green-300" />
                        <h3 className="text-white/80 text-sm">{t('completedMilestones')}</h3>
                    </div>
                    <p className="text-3xl font-bold text-white">
                        {analytics.completedMilestones}/{analytics.totalMilestones}
                    </p>
                </div>

                <div className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50">
                    <div className="flex items-center gap-3 mb-2">
                        <TrendingUp className="w-6 h-6 text-blue-300" />
                        <h3 className="text-white/80 text-sm">{t('completionRate')}</h3>
                    </div>
                    <p className="text-3xl font-bold text-white">
                        {Math.round(analytics.completionRate)}%
                    </p>
                </div>

                <div className="bg-gradient-to-br from-yellow-900/40 to-orange-900/40 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50">
                    <div className="flex items-center gap-3 mb-2">
                        <BarChart3 className="w-6 h-6 text-yellow-300" />
                        <h3 className="text-white/80 text-sm">{t('averageProgress')}</h3>
                    </div>
                    <p className="text-3xl font-bold text-white">
                        {Math.round(analytics.averageProgress)}%
                    </p>
                </div>
            </div>

            {/* Progress Over Time Chart */}
            {progressData.length > 0 && (
                <div className="bg-gray-900/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 shadow-2xl">
                    <h3 className="text-xl font-bold text-white mb-4">{t('progressOverTime')}</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={progressData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis 
                                dataKey="name" 
                                stroke="#e0e0e0"
                                tick={{ fill: '#e0e0e0', fontSize: 12 }}
                                angle={-45}
                                textAnchor="end"
                                height={80}
                            />
                            <YAxis 
                                stroke="#e0e0e0"
                                tick={{ fill: '#e0e0e0', fontSize: 12 }}
                                label={{ value: 'Progress (%)', angle: -90, position: 'insideLeft', fill: '#e0e0e0' }}
                            />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    borderRadius: '8px',
                                    color: '#fff'
                                }}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="progress" 
                                stroke="#8b5cf6" 
                                strokeWidth={3}
                                dot={{ fill: '#8b5cf6', r: 5 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Monthly Activity Chart */}
            {monthlyData.length > 0 && (
                <div className="bg-gray-900/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 shadow-2xl">
                    <h3 className="text-xl font-bold text-white mb-4">{t('monthlyActivity')}</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={monthlyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis 
                                dataKey="month" 
                                stroke="#e0e0e0"
                                tick={{ fill: '#e0e0e0', fontSize: 12 }}
                                angle={-45}
                                textAnchor="end"
                                height={80}
                            />
                            <YAxis 
                                stroke="#e0e0e0"
                                tick={{ fill: '#e0e0e0', fontSize: 12 }}
                            />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    borderRadius: '8px',
                                    color: '#fff'
                                }}
                            />
                            <Bar dataKey="predictions" fill="#10b981" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Top Skills Chart */}
            {skillData.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-900/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-4">{t('topSkills')}</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={skillData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {skillData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        borderRadius: '8px',
                                        color: '#fff'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="bg-gray-900/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-4">{t('skillBreakdown')}</h3>
                        <div className="space-y-3">
                            {analytics.topSkills?.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between">
                                    <span className="text-white">{item.skill}</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-32 bg-gray-800/60 rounded-full h-2">
                                            <div
                                                className="h-2 rounded-full"
                                                style={{
                                                    width: `${(item.count / analytics.totalPredictions) * 100}%`,
                                                    backgroundColor: COLORS[idx % COLORS.length]
                                                }}
                                            />
                                        </div>
                                        <span className="text-white/60 text-sm w-8 text-right">
                                            {item.count}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

