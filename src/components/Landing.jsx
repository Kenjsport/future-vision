import React from 'react';
import { Sparkles } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

export default function Landing({ setPage }) {
    const { t } = useLanguage();
    const { isAuthenticated } = useAuth();
    
    const skipAuth = () => {
        setPage('main');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 via-indigo-950 to-blue-950 flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-blue-500/10 pointer-events-none"></div>
            <div className="max-w-md w-full relative z-10">
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Sparkles className="w-12 h-12 text-yellow-400 animate-pulse" />
                        <h1 className="text-5xl font-bold text-white">{t('futureSimulator')}</h1>
                    </div>
                    <p className="text-gray-300 text-lg">
                        {t('findOutWhere')}
                    </p>
                </div>

                <div className="space-y-4">
                    {isAuthenticated ? (
                        <>
                            <button
                                onClick={() => setPage('account')}
                                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-semibold hover:shadow-2xl transition-all border border-purple-500/30"
                            >
                                {t('goToAccount')}
                            </button>
                            <button
                                onClick={skipAuth}
                                className="w-full bg-gray-800/60 backdrop-blur-lg border border-gray-700/50 text-white py-4 rounded-xl font-semibold hover:bg-gray-700/60 transition-all"
                            >
                                {t('continueToApp')}
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => setPage('login')}
                                className="w-full bg-gray-800/60 backdrop-blur-lg border border-gray-700/50 text-white py-4 rounded-xl font-semibold hover:bg-gray-700/60 transition-all"
                            >
                                {t('logIn')}
                            </button>
                            <button
                                onClick={() => setPage('register')}
                                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-semibold hover:shadow-2xl transition-all border border-purple-500/30"
                            >
                                {t('createAccount')}
                            </button>
                            <button
                                onClick={skipAuth}
                                className="w-full bg-transparent border-2 border-gray-700/50 text-white py-4 rounded-xl font-semibold hover:border-gray-600 transition-all"
                            >
                                {t('continueWithoutRegistration')}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
