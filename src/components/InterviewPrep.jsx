import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Loader2, Sparkles, CheckCircle2, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { API_BASE } from '../utils/api';

export default function InterviewPrep({ skill, level = 'intermediate' }) {
    const { t } = useLanguage();
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        if (skill) {
            generateQuestions();
        }
    }, [skill, level]);

    const generateQuestions = async () => {
        setGenerating(true);
        try {
            const response = await fetch(`${API_BASE}/api/interview-prep`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ skill, level })
            });

            if (response.ok) {
                const data = await response.json();
                setQuestions(data.questions || []);
                setCurrentQuestionIndex(0);
            }
        } catch (error) {
            console.error('Error generating questions:', error);
        } finally {
            setGenerating(false);
        }
    };

    const submitAnswer = async () => {
        if (!userAnswer.trim()) return;

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/api/interview-prep/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    skill,
                    question: currentQuestion.question,
                    userAnswer,
                    level
                })
            });

            if (response.ok) {
                const data = await response.json();
                setFeedback(data.feedback);
            }
        } catch (error) {
            console.error('Error getting feedback:', error);
        } finally {
            setLoading(false);
        }
    };

    const nextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setUserAnswer('');
            setFeedback(null);
        }
    };

    if (!skill) return null;

    const currentQuestion = questions[currentQuestionIndex];

    return (
        <div className="bg-gray-900/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 shadow-2xl mt-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <MessageSquare className="w-6 h-6 text-purple-300" />
                    <h2 className="text-2xl font-bold text-white">{t('interviewPreparation')}</h2>
                    <span className="bg-purple-500/30 text-purple-100 px-3 py-1 rounded-full text-xs capitalize">
                        {level}
                    </span>
                </div>
                <button
                    onClick={generateQuestions}
                    disabled={generating}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                    {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {t('newQuestions')}
                </button>
            </div>

            {generating ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="w-12 h-12 text-purple-300 animate-spin mb-4" />
                    <p className="text-white/60">{t('generatingQuestions')}</p>
                </div>
            ) : questions.length === 0 ? (
                <div className="text-center text-white/60 py-12">
                    <MessageSquare className="w-16 h-16 mx-auto mb-4 text-white/30" />
                    <p>{t('noQuestionsAvailable')}</p>
                </div>
            ) : currentQuestion ? (
                <div className="space-y-6">
                    <div className="bg-gray-800/60 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="text-white/60 text-sm">
                                {t('question')} {currentQuestionIndex + 1} {t('of')} {questions.length}
                            </div>
                            <div className="bg-purple-500/30 text-purple-100 px-3 py-1 rounded-full text-xs">
                                {currentQuestion.type || 'Technical'}
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-4">
                            {currentQuestion.question}
                        </h3>
                        {currentQuestion.hint && (
                            <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-3 text-blue-100 text-sm">
                                💡 {t('hint')}: {currentQuestion.hint}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-white font-semibold mb-2">
                            {t('yourAnswer')}
                        </label>
                        <textarea
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            placeholder={t('typeYourAnswer')}
                            className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 min-h-[150px]"
                            rows="6"
                        />
                        <button
                            onClick={submitAnswer}
                            disabled={loading || !userAnswer.trim() || loading}
                            className="mt-4 w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    {t('analyzing')}
                                </>
                            ) : (
                                <>
                                    <Send className="w-5 h-5" />
                                    {t('getFeedback')}
                                </>
                            )}
                        </button>
                    </div>

                    {feedback && (
                        <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 rounded-xl p-6 border border-green-500/50">
                            <div className="flex items-center gap-2 mb-4">
                                <CheckCircle2 className="w-5 h-5 text-green-300" />
                                <h4 className="text-lg font-bold text-white">{t('aiFeedback')}</h4>
                            </div>
                            <div className="space-y-4">
                                {feedback.strengths && feedback.strengths.length > 0 && (
                                    <div>
                                        <h5 className="text-green-300 font-semibold mb-2">{t('strengths')}:</h5>
                                        <ul className="space-y-1">
                                            {feedback.strengths.map((strength, idx) => (
                                                <li key={idx} className="text-green-100 text-sm flex items-start gap-2">
                                                    <span className="text-green-300 mt-1">✓</span>
                                                    <span>{strength}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {feedback.improvements && feedback.improvements.length > 0 && (
                                    <div>
                                        <h5 className="text-yellow-300 font-semibold mb-2">{t('improvements')}:</h5>
                                        <ul className="space-y-1">
                                            {feedback.improvements.map((improvement, idx) => (
                                                <li key={idx} className="text-yellow-100 text-sm flex items-start gap-2">
                                                    <span className="text-yellow-300 mt-1">→</span>
                                                    <span>{improvement}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {feedback.score && (
                                    <div className="bg-gray-800/60 rounded-lg p-4">
                                        <div className="text-white/80 text-sm mb-1">{t('overallScore')}</div>
                                        <div className="text-3xl font-bold text-green-300">
                                            {feedback.score}/10
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3">
                        {currentQuestionIndex > 0 && (
                            <button
                                onClick={() => {
                                    setCurrentQuestionIndex(currentQuestionIndex - 1);
                                    setUserAnswer('');
                                    setFeedback(null);
                                }}
                                className="flex-1 bg-gray-800/60 text-white px-4 py-2 rounded-lg hover:bg-gray-700/60 transition-all"
                            >
                                {t('previous')}
                            </button>
                        )}
                        {currentQuestionIndex < questions.length - 1 ? (
                            <button
                                onClick={nextQuestion}
                                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:shadow-xl transition-all"
                            >
                                {t('nextQuestion')}
                            </button>
                        ) : (
                            <button
                                onClick={generateQuestions}
                                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg hover:shadow-xl transition-all"
                            >
                                {t('practiceMore')}
                            </button>
                        )}
                    </div>
                </div>
            ) : null}
        </div>
    );
}

