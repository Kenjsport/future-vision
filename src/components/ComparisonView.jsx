import React, { useState, useEffect } from 'react';
import { GitCompare, X, TrendingUp, Calendar } from 'lucide-react';
import { API_BASE } from '../utils/api';
import { useLanguage } from '../contexts/LanguageContext';

export default function ComparisonView({ userId, predictionIds, onClose }) {
    const { t } = useLanguage();
    const [predictions, setPredictions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userId && predictionIds && predictionIds.length > 0) {
            fetchPredictions();
        }
    }, [userId, predictionIds]);

    const fetchPredictions = async () => {
        try {
            const response = await fetch(`${API_BASE}/api/predictions/${userId}`);
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/71323d95-debc-4ecf-a311-79ceedb88b4e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ComparisonView.jsx:16',message:'fetchPredictions response',data:{ok:response.ok,status:response.status,userId,predictionIdsCount:predictionIds?.length||0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'I'})}).catch(()=>{});
            // #endregion
            if (response.ok) {
                const data = await response.json();
                const filtered = (data.predictions || []).filter(p => predictionIds.includes(p.id));
                setPredictions(filtered);
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

    if (loading) {
        return (
            <div className="bg-gray-900/80 backdrop-blur-lg rounded-2xl p-8 border border-gray-700/50 shadow-2xl text-center">
                <div className="text-white">{t('loadingComparison')}</div>
            </div>
        );
    }

    if (predictions.length < 2) {
        return (
            <div className="bg-gray-900/80 backdrop-blur-lg rounded-2xl p-8 border border-gray-700/50 shadow-2xl text-center">
                <p className="text-white">{t('needAtLeast2')}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <GitCompare className="w-8 h-8 text-purple-300" />
                    <h2 className="text-3xl font-bold text-white">{t('comparePredictions')}</h2>
                </div>
                {onClose && (
                    <button onClick={onClose} className="text-white/60 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                )}
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {predictions.map((pred, idx) => (
                    <div key={pred.id} className="bg-gray-800/60 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50">
                        <h3 className="text-xl font-bold text-white mb-2">{pred.skill}</h3>
                        <div className="space-y-2 text-sm text-white/70">
                            <div className="flex items-center gap-2">
                                <span className="bg-purple-500/30 text-purple-100 px-2 py-1 rounded text-xs capitalize">
                                    {pred.level}
                                </span>
                                <span className="bg-pink-500/30 text-pink-100 px-2 py-1 rounded text-xs">
                                    {pred.timeframe} {parseFloat(pred.timeframe) === 1 ? t('year') : t('years')}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                {new Date(pred.createdAt).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" />
                                {pred.predictions?.milestones?.length || 0} {t('milestones')}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Milestones Comparison */}
            <div className="bg-gray-900/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 shadow-2xl">
                <h3 className="text-xl font-bold text-white mb-4">{t('milestonesComparison')}</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-700/50">
                                <th className="text-left text-white/80 py-2">{t('period')}</th>
                                {predictions.map((pred, idx) => (
                                    <th key={pred.id} className="text-left text-white/80 py-2 px-4">
                                        {pred.skill}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {Array.from({ length: Math.max(0, ...predictions.map(p => p.predictions?.milestones?.length || 0)) }).map((_, milestoneIdx) => (
                                <tr key={milestoneIdx} className="border-b border-gray-700/30">
                                    <td className="text-white/60 py-3">
                                        {predictions[0]?.predictions?.milestones?.[milestoneIdx]?.period || `${t('milestone')} ${milestoneIdx + 1}`}
                                    </td>
                                    {predictions.map((pred) => (
                                        <td key={pred.id} className="py-3 px-4">
                                            {pred.predictions?.milestones?.[milestoneIdx] ? (
                                                <div>
                                                    <p className="text-white text-sm">{pred.predictions.milestones[milestoneIdx].achievement}</p>
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {pred.predictions.milestones[milestoneIdx].skills?.map((skill, i) => (
                                                            <span key={i} className="bg-purple-500/30 text-purple-100 px-2 py-0.5 rounded text-xs">
                                                                {skill}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-white/30 text-sm">-</span>
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Opportunities Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {predictions.map((pred) => (
                    <div key={pred.id} className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50">
                        <h4 className="text-lg font-bold text-white mb-3">{pred.skill} - {t('opportunities')}</h4>
                        <ul className="space-y-2">
                            {pred.predictions?.opportunities?.map((opp, idx) => (
                                <li key={idx} className="text-green-100 text-sm flex items-start gap-2">
                                    <span className="text-green-300 font-bold mt-1">+</span>
                                    <span>{opp}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            {/* Risks Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {predictions.map((pred) => (
                    <div key={pred.id} className="bg-gradient-to-br from-orange-900/40 to-red-900/40 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50">
                        <h4 className="text-lg font-bold text-white mb-3">{pred.skill} - {t('risks')}</h4>
                        <ul className="space-y-2">
                            {pred.predictions?.risks?.map((risk, idx) => (
                                <li key={idx} className="text-orange-100 text-sm flex items-start gap-2">
                                    <span className="text-orange-300 font-bold mt-1">!</span>
                                    <span>{risk}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
}

