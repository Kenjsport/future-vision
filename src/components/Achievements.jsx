import React, { useState, useEffect } from 'react';
import { Trophy, Award, Target, Zap, Star, TrendingUp, Calendar, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { API_BASE } from '../utils/api';

export default function Achievements({ userId }) {
    const { t } = useLanguage();
    const [achievements, setAchievements] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userId) {
            fetchAchievements();
        }
    }, [userId]);

    const fetchAchievements = async () => {
        try {
            const response = await fetch(`${API_BASE}/api/achievements/${userId}`);
            if (response.ok) {
                const data = await response.json();
                setAchievements(data.achievements || []);
                setStats(data.stats || null);
            }
        } catch (error) {
            console.error('Error fetching achievements:', error);
        } finally {
            setLoading(false);
        }
    };

    const getAchievementIcon = (type) => {
        switch (type) {
            case 'first_prediction':
                return <Star className="w-6 h-6" />;
            case 'milestone_master':
                return <Target className="w-6 h-6" />;
            case 'streak':
                return <Zap className="w-6 h-6" />;
            case 'skill_explorer':
                return <TrendingUp className="w-6 h-6" />;
            case 'completionist':
                return <CheckCircle2 className="w-6 h-6" />;
            default:
                return <Award className="w-6 h-6" />;
        }
    };

    const getAchievementColor = (unlocked) => {
        return unlocked
            ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/50'
            : 'bg-gray-800/40 border-gray-700/30 opacity-50';
    };

    if (!userId || loading) return null;

    const unlockedCount = achievements.filter(a => a.unlocked).length;
    const totalCount = achievements.length;

    return (
        <div className="bg-gray-900/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Trophy className="w-6 h-6 text-yellow-300" />
                    <h2 className="text-2xl font-bold text-white">{t('achievements')}</h2>
                </div>
                {stats && (
                    <div className="text-right">
                        <div className="text-yellow-300 text-2xl font-bold">
                            {unlockedCount}/{totalCount}
                        </div>
                        <div className="text-white/60 text-sm">{t('unlocked')}</div>
                    </div>
                )}
            </div>

            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gray-800/60 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-yellow-300 mb-1">
                            {stats.currentStreak || 0}
                        </div>
                        <div className="text-white/60 text-xs">{t('dayStreak')}</div>
                    </div>
                    <div className="bg-gray-800/60 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-purple-300 mb-1">
                            {stats.totalPredictions || 0}
                        </div>
                        <div className="text-white/60 text-xs">{t('predictions')}</div>
                    </div>
                    <div className="bg-gray-800/60 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-green-300 mb-1">
                            {stats.completedMilestones || 0}
                        </div>
                        <div className="text-white/60 text-xs">{t('milestones')}</div>
                    </div>
                    <div className="bg-gray-800/60 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-blue-300 mb-1">
                            {stats.uniqueSkills || 0}
                        </div>
                        <div className="text-white/60 text-xs">{t('skills')}</div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement, idx) => (
                    <div
                        key={idx}
                        className={`rounded-xl p-4 border ${getAchievementColor(achievement.unlocked)}`}
                    >
                        <div className="flex items-start gap-3">
                            <div className={`${achievement.unlocked ? 'text-yellow-300' : 'text-white/30'}`}>
                                {getAchievementIcon(achievement.type)}
                            </div>
                            <div className="flex-1">
                                <h3 className={`font-bold mb-1 ${achievement.unlocked ? 'text-white' : 'text-white/50'}`}>
                                    {achievement.name}
                                </h3>
                                <p className={`text-sm ${achievement.unlocked ? 'text-white/70' : 'text-white/40'}`}>
                                    {achievement.description}
                                </p>
                                {achievement.unlocked && achievement.unlockedAt && (
                                    <div className="flex items-center gap-1 text-xs text-white/60 mt-2">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(achievement.unlockedAt).toLocaleDateString()}
                                    </div>
                                )}
                                {!achievement.unlocked && achievement.progress !== undefined && (
                                    <div className="mt-2">
                                        <div className="w-full bg-gray-800/60 rounded-full h-2">
                                            <div
                                                className="bg-yellow-500 h-2 rounded-full transition-all"
                                                style={{ width: `${Math.min((achievement.progress / achievement.target) * 100, 100)}%` }}
                                            />
                                        </div>
                                        <div className="text-xs text-white/50 mt-1">
                                            {achievement.progress}/{achievement.target}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

