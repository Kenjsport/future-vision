import React from 'react';
import { Sparkles, Moon, Sun, History, Settings, Home, LogOut } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function Header({ user, page, setPage, onLogout }) {
    const { theme, toggleTheme } = useTheme();

    return (
        <header className="bg-gray-900/80 backdrop-blur-lg border-b border-gray-700/50 mb-8 shadow-lg">
            <div className="max-w-6xl mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Sparkles className="w-8 h-8 text-yellow-300 animate-pulse" />
                        <h1 className="text-2xl font-bold text-white">FutureVision</h1>
                    </div>

                    <nav className="flex items-center gap-2">
                        <button
                            onClick={() => setPage('main')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${page === 'main'
                                    ? 'bg-purple-500 text-white'
                                    : 'text-gray-300 hover:text-white hover:bg-gray-800/60'
                                }`}
                        >
                            <Home className="w-4 h-4" />
                            <span className="hidden md:inline">Home</span>
                        </button>

                        <button
                            onClick={() => setPage('history')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${page === 'history'
                                    ? 'bg-purple-500 text-white'
                                    : 'text-gray-300 hover:text-white hover:bg-gray-800/60'
                                }`}
                        >
                            <History className="w-4 h-4" />
                            <span className="hidden md:inline">History</span>
                        </button>

                        <button
                            onClick={() => setPage('settings')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${page === 'settings'
                                    ? 'bg-purple-500 text-white'
                                    : 'text-gray-300 hover:text-white hover:bg-gray-800/60'
                                }`}
                        >
                            <Settings className="w-4 h-4" />
                            <span className="hidden md:inline">Settings</span>
                        </button>

                        <button
                            onClick={toggleTheme}
                            className="px-4 py-2 rounded-lg font-medium transition-all text-gray-300 hover:text-white hover:bg-gray-800/60"
                            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                        >
                            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </button>

                        {user && (
                            <button
                                onClick={onLogout}
                                className="px-4 py-2 rounded-lg font-medium transition-all text-gray-300 hover:text-white hover:bg-gray-800/60 flex items-center gap-2"
                                title="Logout"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="hidden md:inline">Logout</span>
                            </button>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
}
