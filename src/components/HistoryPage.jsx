import React from 'react';
import { Clock, Trash2, TrendingUp, Calendar } from 'lucide-react';
import { useHistory } from '../contexts/HistoryContext';

export default function HistoryPage({ setPage, setSelectedPredictionId }) {
    const { history, deletePrediction, clearHistory } = useHistory();

    const formatDate = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const calculateProgress = (item) => {
        if (!item.predictions?.milestones) return 0;
        const total = item.predictions.milestones.length;
        const completed = Object.values(item.progress || {}).filter(Boolean).length;
        return Math.round((completed / total) * 100);
    };

    if (history.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4 md:p-8 text-white">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center py-20">
                        <Clock className="w-20 h-20 text-purple-300 mx-auto mb-6 opacity-50" />
                        <h2 className="text-3xl font-bold mb-4">No Predictions Yet</h2>
                        <p className="text-purple-200 mb-8">
                            Start by creating your first prediction to see your future path!
                        </p>
                        <button
                            onClick={() => setPage('main')}
                            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-2xl transition-all"
                        >
                            Create Prediction
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4 md:p-8 text-white">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">Prediction History</h1>
                        <p className="text-purple-200">
                            {history.length} {history.length === 1 ? 'prediction' : 'predictions'} saved
                        </p>
                    </div>
                    {history.length > 0 && (
                        <button
                            onClick={() => {
                                if (confirm('Are you sure you want to clear all history?')) {
                                    clearHistory();
                                }
                            }}
                            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-400/50 text-red-100 rounded-lg transition-all flex items-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            Clear All
                        </button>
                    )}
                </div>

                <div className="space-y-4">
                    {history.map((item) => {
                        const progress = calculateProgress(item);
                        return (
                            <div
                                key={item.id}
                                className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all cursor-pointer group"
                                onClick={() => {
                                    setSelectedPredictionId(item.id);
                                    setPage('prediction-detail');
                                }}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-purple-200 transition-colors">
                                            {item.skill}
                                        </h3>
                                        <div className="flex flex-wrap gap-3 text-sm text-purple-200">
                                            <span className="flex items-center gap-1">
                                                <TrendingUp className="w-4 h-4" />
                                                {item.level}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {item.timeframe} {item.timeframe === '1' ? 'year' : 'years'}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                {formatDate(item.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (confirm('Delete this prediction?')) {
                                                deletePrediction(item.id);
                                            }
                                        }}
                                        className="p-2 text-red-300 hover:text-red-100 hover:bg-red-500/20 rounded-lg transition-all"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Progress Bar */}
                                <div className="mb-3">
                                    <div className="flex justify-between text-sm text-purple-200 mb-2">
                                        <span>Progress</span>
                                        <span>{progress}%</span>
                                    </div>
                                    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                                        <div
                                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-500"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Preview */}
                                <p className="text-purple-100 line-clamp-2">
                                    {item.predictions?.trajectory}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
