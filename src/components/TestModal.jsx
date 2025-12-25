import React from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function TestModal({ setShowTest, testStep, setTestStep, testAnswers, setTestAnswers, setCurrentLevel }) {
    const { t } = useLanguage();
    
    const testQuestions = [
        {
            q: t('testQuestion1'),
            options: [t('testOption1_1'), t('testOption1_2'), t('testOption1_3'), t('testOption1_4')]
        },
        {
            q: t('testQuestion2'),
            options: [t('testOption2_1'), t('testOption2_2'), t('testOption2_3'), t('testOption2_4')]
        },
        {
            q: t('testQuestion3'),
            options: [t('testOption3_1'), t('testOption3_2'), t('testOption3_3'), t('testOption3_4')]
        },
        {
            q: t('testQuestion4'),
            options: [t('testOption4_1'), t('testOption4_2'), t('testOption4_3'), t('testOption4_4')]
        }
    ];

    const handleTestAnswer = (answerIndex) => {
        const newAnswers = [...testAnswers, answerIndex];
        setTestAnswers(newAnswers);

        if (testStep < testQuestions.length - 1) {
            setTestStep(testStep + 1);
        } else {
            const avg = newAnswers.reduce((a, b) => a + b, 0) / newAnswers.length;
            if (avg < 1) setCurrentLevel('beginner');
            else if (avg < 2.5) setCurrentLevel('intermediate');
            else setCurrentLevel('advanced');

            setShowTest(false);
            setTestStep(0);
            setTestAnswers([]);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="max-w-lg w-full bg-gradient-to-br from-gray-900 to-gray-800 backdrop-blur-lg rounded-2xl p-8 border border-gray-700/50 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-white">{t('test')}</h3>
                    <button
                        onClick={() => {
                            setShowTest(false);
                            setTestStep(0);
                            setTestAnswers([]);
                        }}
                        className="text-white/60 hover:text-white"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="mb-6">
                    <div className="flex gap-2 mb-4">
                        {testQuestions.map((_, idx) => (
                            <div
                                key={idx}
                                className={`h-2 flex-1 rounded-full ${idx <= testStep ? 'bg-purple-500' : 'bg-gray-800/60'
                                    }`}
                            />
                        ))}
                    </div>
                    <p className="text-white/60 text-sm">
                        {t('question')} {testStep + 1} {t('of')} {testQuestions.length}
                    </p>
                </div>

                <div className="mb-8">
                    <h4 className="text-xl text-white font-semibold mb-6">
                        {testQuestions[testStep].q}
                    </h4>
                    <div className="space-y-3">
                        {testQuestions[testStep].options.map((option, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleTestAnswer(idx)}
                                className="w-full text-left px-6 py-4 bg-gray-800/60 hover:bg-gray-700/60 border border-gray-700/50 rounded-lg text-white transition-all"
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
