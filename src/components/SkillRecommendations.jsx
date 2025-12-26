import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, Clock, Target, Loader2, RefreshCw, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { API_BASE } from '../utils/api';

export default function SkillRecommendations({ userId, onSelectSkill }) {
    const { t } = useLanguage();
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPanel, setShowPanel] = useState(false);

    useEffect(() => {
        if (userId && showPanel) {
            fetchRecommendations();
        }
    }, [userId, showPanel]);

    const fetchRecommendations = async () => {
        setLoading(true);
        setError('');
        
        try {
            const response = await fetch(`${API_BASE}/api/recommendations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });

            if (response.ok) {
                const data = await response.json();
                setRecommendations(data.recommendations || []);
            } else {
                const errorData = await response.json();
                setError(errorData.error?.message || t('failedToLoadRecommendations'));
            }
        } catch (err) {
            setError(t('failedToLoadRecommendations'));
            console.error('Error fetching recommendations:', err);
        } finally {
            setLoading(false);
        }
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty?.toLowerCase()) {
            case 'beginner':
                return 'bg-green-500/20 border-green-500/50 text-green-200';
            case 'intermediate':
                return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-200';
            case 'advanced':
                return 'bg-red-500/20 border-red-500/50 text-red-200';
            default:
                return 'bg-blue-500/20 border-blue-500/50 text-blue-200';
        }
    };

    const getImpactColor = (impact) => {
        switch (impact?.toLowerCase()) {
            case 'high':
                return 'text-green-300';
            case 'medium':
                return 'text-yellow-300';
            case 'low':
                return 'text-blue-300';
            default:
                return 'text-white';
        }
    };

    return (
        <>
            <button
                onClick={() => setShowPanel(true)}
                className="px-4 py-2 rounded-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-xl transition-all flex items-center gap-2 border border-purple-500/30"
            >
                <Sparkles className="w-5 h-5" />
                {t('skillRecommendations')}
            </button>

            {showPanel && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-gray-900/95 backdrop-blur-lg rounded-2xl w-full max-w-3xl border border-gray-700/50 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="flex justify-between items-center p-6 border-b border-gray-700/50">
                            <div className="flex items-center gap-3">
                                <Sparkles className="w-6 h-6 text-yellow-300" />
                                <h3 className="text-2xl font-bold text-white">{t('skillRecommendations')}</h3>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={fetchRecommendations}
                                    disabled={loading}
                                    className="p-2 rounded-lg bg-gray-800/60 text-white hover:bg-gray-700/60 transition-all disabled:opacity-50"
                                    title={t('refresh')}
                                >
                                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                                </button>
                                <button
                                    onClick={() => setShowPanel(false)}
                                    className="text-white/60 hover:text-white"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <Loader2 className="w-12 h-12 text-purple-300 animate-spin mb-4" />
                                    <p className="text-white/60">{t('generatingRecommendations')}</p>
                                </div>
                            ) : error ? (
                                <div className="bg-red-500/20 border border-red-400 text-red-100 px-4 py-3 rounded-lg">
                                    {error}
                                </div>
                            ) : recommendations.length === 0 ? (
                                <div className="text-center text-white/60 py-12">
                                    <Sparkles className="w-16 h-16 mx-auto mb-4 text-white/30" />
                                    <p>{t('noRecommendationsAvailable')}</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <p className="text-white/70 text-sm mb-6">
                                        {t('recommendationsDescription')}
                                    </p>
                                    {recommendations.map((rec, idx) => (
                                        <div
                                            key={idx}
                                            className="bg-gray-800/60 rounded-xl p-6 border border-gray-700/50 hover:border-purple-500/50 transition-all"
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h4 className="text-xl font-bold text-white">
                                                            {rec.skill}
                                                        </h4>
                                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getDifficultyColor(rec.difficulty)}`}>
                                                            {rec.difficulty || 'intermediate'}
                                                        </span>
                                                    </div>
                                                    <p className="text-white/70 mb-4">{rec.reason}</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-5 h-5 text-blue-300" />
                                                    <div>
                                                        <p className="text-white/60 text-xs">{t('timeToLearn')}</p>
                                                        <p className="text-white font-semibold">
                                                            {rec.timeToLearn || 3} {t('months')}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <TrendingUp className="w-5 h-5 text-green-300" />
                                                    <div>
                                                        <p className="text-white/60 text-xs">{t('careerImpact')}</p>
                                                        <p className={`font-semibold ${getImpactColor(rec.careerImpact)}`}>
                                                            {rec.careerImpact || 'medium'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Target className="w-5 h-5 text-purple-300" />
                                                    <div>
                                                        <p className="text-white/60 text-xs">{t('relatedSkills')}</p>
                                                        <p className="text-white font-semibold text-sm">
                                                            {rec.relatedSkills?.slice(0, 2).join(', ') || '-'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {rec.relatedSkills && rec.relatedSkills.length > 0 && (
                                                <div className="mb-4">
                                                    <p className="text-white/60 text-xs mb-2">{t('relatedSkills')}:</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {rec.relatedSkills.map((skill, i) => (
                                                            <span
                                                                key={i}
                                                                className="bg-purple-500/30 text-purple-100 px-3 py-1 rounded-full text-xs"
                                                            >
                                                                {skill}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {onSelectSkill && (
                                                <button
                                                    onClick={() => {
                                                        onSelectSkill(rec.skill);
                                                        setShowPanel(false);
                                                    }}
                                                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-xl transition-all"
                                                >
                                                    {t('startLearning')} {rec.skill}
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

