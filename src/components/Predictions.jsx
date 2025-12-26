import React, { useState, useEffect, useCallback } from 'react';
import { TrendingUp, Clock, ChevronRight, CheckCircle2, Circle, Edit2, Save, X } from 'lucide-react';
import CareerPathsGraph from './CareerPathsGraph';
import { useLanguage } from '../contexts/LanguageContext';
import { API_BASE } from '../utils/api';

export default function Predictions({ predictions, predictionId, userId, onProgressUpdate, skill }) {
    const { t } = useLanguage();
    const [milestoneProgress, setMilestoneProgress] = useState([]);
    const [editingNote, setEditingNote] = useState(null);
    const [noteText, setNoteText] = useState('');

    const loadProgress = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE}/api/predictions/${userId}/${predictionId}`);
            if (response.ok) {
                const data = await response.json();
                if (data.prediction?.progress?.milestones && Array.isArray(data.prediction.progress.milestones)) {
                    setMilestoneProgress(data.prediction.progress.milestones);
                }
            } else {
                console.error('Failed to load progress:', response.status);
            }
        } catch (error) {
            console.error('Error loading progress:', error);
        }
    }, [userId, predictionId]);

    useEffect(() => {
        if (predictions?.milestones && Array.isArray(predictions.milestones)) {
            // Initialize progress state
            const initialProgress = predictions.milestones.map((_, idx) => ({
                completed: false,
                notes: '',
                completedAt: null
            }));
            setMilestoneProgress(initialProgress);

            // Load saved progress if predictionId exists
            if (predictionId && userId) {
                loadProgress();
            }
        } else {
            // Reset progress if no milestones
            setMilestoneProgress([]);
        }
    }, [predictions, predictionId, userId, loadProgress]);

    const toggleMilestone = async (idx) => {
        if (idx < 0 || idx >= milestoneProgress.length) {
            console.error('Invalid milestone index:', idx);
            return;
        }
        
        if (!predictionId || !userId) {
            // Just update local state if no backend
            const newProgress = [...milestoneProgress];
            if (newProgress[idx]) {
                newProgress[idx].completed = !newProgress[idx].completed;
                newProgress[idx].completedAt = newProgress[idx].completed ? new Date().toISOString() : null;
                setMilestoneProgress(newProgress);
            }
            return;
        }

        const newProgress = [...milestoneProgress];
        if (newProgress[idx]) {
            newProgress[idx].completed = !newProgress[idx].completed;
            newProgress[idx].completedAt = newProgress[idx].completed ? new Date().toISOString() : null;
            setMilestoneProgress(newProgress);
        }

        try {
            const response = await fetch(`${API_BASE}/api/predictions/${userId}/${predictionId}/progress`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    milestoneIndex: idx,
                    completed: newProgress[idx].completed
                })
            });
            if (response.ok && onProgressUpdate) {
                onProgressUpdate();
            }
        } catch (error) {
            console.error('Error updating progress:', error);
        }
    };

    const saveNote = async (idx) => {
        if (idx < 0 || idx >= milestoneProgress.length) {
            console.error('Invalid milestone index:', idx);
            setEditingNote(null);
            return;
        }
        
        if (!predictionId || !userId) {
            const newProgress = [...milestoneProgress];
            if (newProgress[idx]) {
                newProgress[idx].notes = noteText;
                setMilestoneProgress(newProgress);
            }
            setEditingNote(null);
            return;
        }

        const newProgress = [...milestoneProgress];
        if (newProgress[idx]) {
            newProgress[idx].notes = noteText;
            setMilestoneProgress(newProgress);
        }

        try {
            const response = await fetch(`${API_BASE}/api/predictions/${userId}/${predictionId}/progress`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    milestoneIndex: idx,
                    notes: noteText
                })
            });
            if (response.ok) {
                setEditingNote(null);
                if (onProgressUpdate) onProgressUpdate();
            } else {
                console.error('Failed to save note:', response.status);
            }
        } catch (error) {
            console.error('Error saving note:', error);
        }
    };

    if (!predictions) return null;

    const completedCount = milestoneProgress.filter(m => m.completed).length;
    const totalCount = predictions.milestones?.length || 0;
    const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                    <TrendingUp className="w-6 h-6 text-green-300" />
                    <h2 className="text-2xl font-bold text-white">{t('yourDirection')}</h2>
                </div>
                <p className="text-purple-100 text-lg leading-relaxed">
                    {predictions.trajectory}
                </p>
            </div>

            <div className="bg-gray-900/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Clock className="w-6 h-6 text-yellow-300" />
                        <h2 className="text-2xl font-bold text-white">{t('keyMilestones')}</h2>
                    </div>
                    {totalCount > 0 && (
                        <div className="text-right">
                            <div className="text-white/80 text-sm mb-1">
                                {t('progress')}: {completedCount}/{totalCount} ({Math.round(progressPercent)}%)
                            </div>
                            <div className="w-32 bg-gray-800/60 rounded-full h-2">
                                <div
                                    className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>
                <div className="space-y-4">
                    {predictions.milestones && Array.isArray(predictions.milestones) && predictions.milestones.map((milestone, idx) => {
                        const progress = milestoneProgress[idx] || { completed: false, notes: '', completedAt: null };
                        return (
                            <div
                                key={idx}
                                className={`bg-gray-800/60 rounded-lg p-4 border transition-all ${progress.completed
                                        ? 'border-green-500/50 bg-green-900/30'
                                        : 'border-gray-700/50'
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <button
                                        onClick={() => toggleMilestone(idx)}
                                        className="mt-1 flex-shrink-0"
                                    >
                                        {progress.completed ? (
                                            <CheckCircle2 className="w-6 h-6 text-green-400" />
                                        ) : (
                                            <Circle className="w-6 h-6 text-white/40 hover:text-white/60" />
                                        )}
                                    </button>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <ChevronRight className="w-5 h-5 text-purple-300" />
                                            <span className="text-purple-300 font-semibold">{milestone.period}</span>
                                            {progress.completedAt && (
                                                <span className="text-green-300 text-xs">
                                                    {t('completed')} {new Date(progress.completedAt).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                        <p className={`font-medium mb-2 ${progress.completed ? 'text-green-100 line-through' : 'text-white'}`}>
                                            {milestone.achievement}
                                        </p>
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {milestone.skills?.map((skill, i) => (
                                                <span key={i} className="bg-purple-500/30 text-purple-100 px-3 py-1 rounded-full text-sm">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                        {editingNote === idx ? (
                                            <div className="mt-3 space-y-2">
                                                <textarea
                                                    value={noteText}
                                                    onChange={(e) => setNoteText(e.target.value)}
                                                    placeholder={t('notesPlaceholder')}
                                                    className="w-full px-3 py-2 bg-gray-800/60 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                                    rows="2"
                                                />
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => saveNote(idx)}
                                                        className="bg-green-500 text-white px-4 py-1 rounded-lg text-sm font-semibold hover:bg-green-600 transition-all flex items-center gap-1"
                                                    >
                                                        <Save className="w-4 h-4" />
                                                        {t('save')}
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setEditingNote(null);
                                                            setNoteText('');
                                                        }}
                                                        className="bg-gray-700/60 text-white px-4 py-1 rounded-lg text-sm font-semibold hover:bg-gray-600/60 transition-all flex items-center gap-1 border border-gray-600/50"
                                                    >
                                                        <X className="w-4 h-4" />
                                                        {t('cancel')}
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="mt-2">
                                                {progress.notes ? (
                                                    <div className="bg-gray-800/60 rounded p-2 text-gray-300 text-sm border border-gray-700/50">
                                                        {progress.notes}
                                                        <button
                                                            onClick={() => {
                                                                setEditingNote(idx);
                                                                setNoteText(progress.notes);
                                                            }}
                                                            className="ml-2 text-purple-300 hover:text-purple-200"
                                                        >
                                                            <Edit2 className="w-4 h-4 inline" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => {
                                                            setEditingNote(idx);
                                                            setNoteText('');
                                                        }}
                                                        className="text-purple-300 hover:text-purple-200 text-sm flex items-center gap-1"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                        {t('addNotes')}
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {predictions.opportunities && predictions.opportunities.length > 0 && (
                <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 shadow-2xl">
                    <h2 className="text-2xl font-bold text-white mb-4">🚀 {t('opportunities')}</h2>
                    <ul className="space-y-3">
                        {predictions.opportunities.map((opp, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-green-100">
                                <span className="text-green-300 font-bold mt-1">+</span>
                                <span>{opp}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {predictions.risks && predictions.risks.length > 0 && (
                <div className="bg-gradient-to-br from-orange-900/40 to-red-900/40 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 shadow-2xl">
                    <h2 className="text-2xl font-bold text-white mb-4">⚠️ {t('risks')}</h2>
                    <ul className="space-y-3">
                        {predictions.risks.map((risk, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-orange-100">
                                <span className="text-orange-300 font-bold mt-1">!</span>
                                <span>{risk}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {predictions.nextSteps && predictions.nextSteps.length > 0 && (
                <div className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 shadow-2xl">
                    <h2 className="text-2xl font-bold text-white mb-4">📋 {t('nextSteps')}</h2>
                    <ol className="space-y-3">
                        {predictions.nextSteps.map((step, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-blue-100">
                                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold text-sm">
                                    {idx + 1}
                                </span>
                                <span>{step}</span>
                            </li>
                        ))}
                    </ol>
                </div>
            )}

            {/* Career Paths Graph and Salary Information */}
            {(predictions.careerPaths || predictions.salaryInfo) && (
                <CareerPathsGraph 
                    careerPaths={predictions.careerPaths} 
                    salaryInfo={predictions.salaryInfo}
                    skill={skill}
                />
            )}

        </div>
    );
}
