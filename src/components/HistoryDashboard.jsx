import React, { useState, useEffect } from 'react';
import { History, TrendingUp, Calendar, Trash2, Eye, GitCompare, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { API_BASE } from '../utils/api';

export default function HistoryDashboard({ userId, onSelectPrediction, onCompare, onClose }) {
    const { t } = useLanguage();
    const [predictions, setPredictions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState([]);

    useEffect(() => {
        if (userId) {
            fetchPredictions();
        }
    }, [userId]);

    const fetchPredictions = async () => {
        try {
            const response = await fetch(`${API_BASE}/api/predictions/${userId}`);
            if (response.ok) {
                const data = await response.json();
                setPredictions(data.predictions || []);
            } else {
                console.error('Failed to fetch predictions:', response.status);
                setPredictions([]);
            }
        } catch (error) {
            console.error('Error fetching predictions:', error);
            setPredictions([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (predictionId) => {
        if (!confirm('Are you sure you want to delete this prediction?')) return;

        try {
            const response = await fetch(`${API_BASE}/api/predictions/${userId}/${predictionId}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                fetchPredictions();
            }
        } catch (error) {
            console.error('Error deleting prediction:', error);
        }
    };

    const toggleSelection = (id) => {
        setSelectedIds(prev => 
            prev.includes(id) 
                ? prev.filter(i => i !== id)
                : [...prev, id]
        );
    };

    const handleCompare = () => {
        if (selectedIds.length >= 2) {
            onCompare(selectedIds);
            setSelectedIds([]);
        }
    };

    if (loading) {
        return (
            <div className="bg-gray-900/80 backdrop-blur-lg rounded-2xl p-8 border border-gray-700/50 shadow-2xl text-center">
                <div className="text-white">{t('loading')}</div>
            </div>
        );
    }

    if (predictions.length === 0) {
        return (
            <div className="bg-gray-900/80 backdrop-blur-lg rounded-2xl p-8 border border-gray-700/50 shadow-2xl text-center">
                <History className="w-16 h-16 text-white/50 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">{t('noPredictions')}</h3>
                <p className="text-white/60">{t('startByCreating')}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <History className="w-8 h-8 text-yellow-300" />
                    <h2 className="text-3xl font-bold text-white">{t('predictionHistory')}</h2>
                </div>
                {onClose && (
                    <button onClick={onClose} className="text-white/60 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                )}
            </div>

            {selectedIds.length >= 2 && (
                <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 backdrop-blur-lg rounded-xl p-4 border border-gray-700/50 flex items-center justify-between">
                    <span className="text-white">
                        {selectedIds.length} {t('predictionsSelected')}
                    </span>
                    <button
                        onClick={handleCompare}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-xl transition-all flex items-center gap-2 border border-purple-500/30"
                    >
                        <GitCompare className="w-5 h-5" />
                        {t('compare')}
                    </button>
                </div>
            )}

            <div className="space-y-4">
                {predictions.map((pred) => {
                    const completedMilestones = pred.progress?.milestones?.filter(m => m.completed).length || 0;
                    const totalMilestones = pred.predictions?.milestones?.length || 0;
                    const progressPercent = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

                    return (
                        <div
                            key={pred.id}
                            className="bg-gray-800/60 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50 hover:bg-gray-700/60 transition-all"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(pred.id)}
                                            onChange={() => toggleSelection(pred.id)}
                                            className="w-5 h-5 rounded"
                                        />
                                        <h3 className="text-xl font-bold text-white">{pred.skill}</h3>
                                        <span className="bg-purple-500/30 text-purple-100 px-3 py-1 rounded-full text-sm capitalize">
                                            {pred.level}
                                        </span>
                                        <span className="bg-pink-500/30 text-pink-100 px-3 py-1 rounded-full text-sm">
                                            {pred.timeframe} {parseFloat(pred.timeframe) === 1 ? t('year') : t('years')}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-white/60 text-sm mb-3">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(pred.createdAt).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <TrendingUp className="w-4 h-4" />
                                            {completedMilestones}/{totalMilestones} {t('milestones')}
                                        </div>
                                    </div>
                                    {totalMilestones > 0 && (
                                        <div className="mb-3">
                                            <div className="flex justify-between text-sm text-white/80 mb-1">
                                                <span>{t('progress')}</span>
                                                <span>{Math.round(progressPercent)}%</span>
                                            </div>
                                            <div className="w-full bg-gray-800/60 rounded-full h-2">
                                                <div
                                                    className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all"
                                                    style={{ width: `${progressPercent}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                    {pred.predictions?.trajectory && (
                                        <p className="text-white/70 text-sm line-clamp-2">
                                            {pred.predictions.trajectory}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={() => onSelectPrediction(pred)}
                                    className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-xl transition-all flex items-center justify-center gap-2"
                                >
                                    <Eye className="w-4 h-4" />
                                    {t('view')}
                                </button>
                                <button
                                    onClick={() => handleDelete(pred.id)}
                                    className="bg-red-500/20 hover:bg-red-500/30 text-red-200 px-4 py-2 rounded-lg font-semibold transition-all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

