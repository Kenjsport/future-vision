import React, { useState, useEffect } from 'react';
import { Map, BookOpen, CheckCircle2, Circle, Clock, Target, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { API_BASE } from '../utils/api';

export default function LearningRoadmap({ skill, level, timeframe }) {
    const { t } = useLanguage();
    const [roadmap, setRoadmap] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        if (skill) {
            generateRoadmap();
        }
    }, [skill, level, timeframe]);

    const generateRoadmap = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/api/learning-roadmap`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ skill, level, timeframe })
            });

            if (response.ok) {
                const data = await response.json();
                setRoadmap(data.roadmap);
            }
        } catch (error) {
            console.error('Error generating roadmap:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!skill || loading) {
        return (
            <div className="bg-gray-900/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 shadow-2xl mt-6">
                <div className="flex items-center gap-3 mb-6">
                    <Map className="w-6 h-6 text-blue-300" />
                    <h2 className="text-2xl font-bold text-white">{t('learningRoadmap')}</h2>
                </div>
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-blue-300 animate-spin" />
                </div>
            </div>
        );
    }

    if (!roadmap) return null;

    const totalWeeks = roadmap.phases?.reduce((sum, phase) => sum + (phase.duration || 0), 0) || 0;

    return (
        <div className="bg-gray-900/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 shadow-2xl mt-6">
            <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <Map className="w-6 h-6 text-blue-300" />
                    <h2 className="text-2xl font-bold text-white">{t('learningRoadmap')}</h2>
                </div>
                <div className="flex items-center gap-4">
                    {totalWeeks > 0 && (
                        <div className="text-right">
                            <div className="text-blue-300 text-xl font-bold">{totalWeeks} {t('weeks')}</div>
                            <div className="text-white/60 text-sm">{t('estimatedTime')}</div>
                        </div>
                    )}
                    <button className="text-white/60 hover:text-white transition-colors">
                        {isExpanded ? (
                            <ChevronUp className="w-6 h-6" />
                        ) : (
                            <ChevronDown className="w-6 h-6" />
                        )}
                    </button>
                </div>
            </div>

            {!isExpanded && (
                <div className="mt-4">
                    {roadmap.overview && (
                        <p className="text-white/70 text-sm line-clamp-2">{roadmap.overview}</p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2">
                        {roadmap.phases?.slice(0, 3).map((phase, idx) => (
                            <div key={idx} className="bg-blue-500/20 border border-blue-500/50 rounded-lg px-3 py-1 text-blue-100 text-sm">
                                {phase.name}
                            </div>
                        ))}
                        {roadmap.phases?.length > 3 && (
                            <div className="bg-gray-700/40 border border-gray-600/50 rounded-lg px-3 py-1 text-white/60 text-sm">
                                +{roadmap.phases.length - 3} {t('more')}
                            </div>
                        )}
                    </div>
                    <p className="text-blue-300 text-sm mt-3 text-center">
                        {t('clickToExpand')} ↓
                    </p>
                </div>
            )}

            {isExpanded && (
                <div className="mt-6">

            {roadmap.overview && (
                <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4 mb-6">
                    <p className="text-blue-100">{roadmap.overview}</p>
                </div>
            )}

            <div className="space-y-6">
                {roadmap.phases?.map((phase, phaseIdx) => (
                    <div key={phaseIdx} className="relative">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                    {phaseIdx + 1}
                                </div>
                                {phaseIdx < roadmap.phases.length - 1 && (
                                    <div className="w-0.5 h-full bg-blue-600/30 mx-auto mt-2" style={{ height: 'calc(100% + 1.5rem)' }} />
                                )}
                            </div>
                            <div className="flex-1 bg-gray-800/60 rounded-xl p-5 border border-gray-700/50">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-xl font-bold text-white">{phase.name}</h3>
                                    {phase.duration && (
                                        <div className="flex items-center gap-1 text-blue-300 text-sm">
                                            <Clock className="w-4 h-4" />
                                            {phase.duration} {t('weeks')}
                                        </div>
                                    )}
                                </div>
                                {phase.description && (
                                    <p className="text-white/70 mb-4">{phase.description}</p>
                                )}

                                {phase.modules && phase.modules.length > 0 && (
                                    <div className="space-y-3">
                                        {phase.modules.map((module, moduleIdx) => (
                                            <div
                                                key={moduleIdx}
                                                className="bg-gray-700/40 rounded-lg p-4 border border-gray-600/30"
                                            >
                                                <div className="flex items-start gap-3 mb-2">
                                                    <BookOpen className="w-5 h-5 text-purple-300 flex-shrink-0 mt-0.5" />
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-white mb-1">
                                                            {module.name}
                                                        </h4>
                                                        {module.description && (
                                                            <p className="text-white/60 text-sm mb-3">
                                                                {module.description}
                                                            </p>
                                                        )}
                                                        {module.resources && module.resources.length > 0 && (
                                                            <div className="space-y-2">
                                                                {module.resources.map((resource, resIdx) => (
                                                                    <div
                                                                        key={resIdx}
                                                                        className="flex items-center gap-2 text-sm"
                                                                    >
                                                                        <Circle className="w-3 h-3 text-white/40" />
                                                                        {resource.url ? (
                                                                            <a
                                                                                href={resource.url}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="text-blue-300 hover:text-blue-200 hover:underline"
                                                                            >
                                                                                {resource.title}
                                                                            </a>
                                                                        ) : (
                                                                            <span className="text-white/70">{resource.title}</span>
                                                                        )}
                                                                        {resource.type && (
                                                                            <span className="text-white/40 text-xs">
                                                                                ({resource.type})
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                        {module.checkpoints && module.checkpoints.length > 0 && (
                                                            <div className="mt-3 space-y-1">
                                                                <div className="text-white/60 text-xs font-semibold mb-2">
                                                                    {t('checkpoints')}:
                                                                </div>
                                                                {module.checkpoints.map((checkpoint, cpIdx) => (
                                                                    <div
                                                                        key={cpIdx}
                                                                        className="flex items-center gap-2 text-sm text-white/70"
                                                                    >
                                                                        <Target className="w-3 h-3 text-green-300" />
                                                                        {checkpoint}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {roadmap.tips && roadmap.tips.length > 0 && (
                <div className="mt-6 bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-5">
                    <h3 className="text-yellow-300 font-bold mb-3 flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        {t('proTips')}
                    </h3>
                    <ul className="space-y-2">
                        {roadmap.tips.map((tip, idx) => (
                            <li key={idx} className="text-yellow-100 text-sm flex items-start gap-2">
                                <span className="text-yellow-300 mt-1">💡</span>
                                <span>{tip}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
                </div>
            )}
        </div>
    );
}

