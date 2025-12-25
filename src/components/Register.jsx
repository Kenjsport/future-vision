import React, { useState } from 'react';
import { User, Mail, Lock, X, Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

export default function Register({ setPage, email, setEmail, password, setPassword, name, setName }) {
    const { t } = useLanguage();
    const { register } = useAuth();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!email || !password || !name) {
            setError(t('pleaseFillAllFields'));
            return;
        }

        setLoading(true);
        setError('');

        const result = await register(email, password, name);

        if (result.success) {
            setPage('account');
        } else {
            setError(result.error || t('registrationFailed'));
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 via-indigo-950 to-blue-950 flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-blue-500/10 pointer-events-none"></div>
            <div className="max-w-md w-full bg-gray-900/80 backdrop-blur-lg rounded-2xl p-8 border border-gray-700/50 shadow-2xl relative z-10">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-white">{t('registration')}</h2>
                    <button onClick={() => setPage('landing')} className="text-white/60 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-white/80 mb-2">{t('name')}</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3.5 w-5 h-5 text-white/50" />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-800/60 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                placeholder={t('yourName')}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-white/80 mb-2">{t('email')}</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3.5 w-5 h-5 text-white/50" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-800/60 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                placeholder={t('emailPlaceholder')}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-white/80 mb-2">{t('password')}</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3.5 w-5 h-5 text-white/50" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-800/60 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                placeholder={t('passwordPlaceholder')}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-500/20 border border-red-400 text-red-100 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleRegister}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border border-purple-500/30"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                {t('creatingAccount')}
                            </>
                        ) : (
                            t('createAccount')
                        )}
                    </button>

                    <div className="text-center">
                        <button
                            onClick={() => setPage('login')}
                            className="text-purple-300 hover:text-purple-200 text-sm"
                        >
                            {t('alreadyHaveAccount')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
