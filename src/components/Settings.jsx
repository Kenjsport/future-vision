import React from 'react';
import { Moon, Sun, Trash2, Download, Settings as SettingsIcon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useHistory } from '../contexts/HistoryContext';

export default function Settings() {
    const { theme, toggleTheme } = useTheme();
    const { history, clearHistory } = useHistory();

    const exportAllData = () => {
        const dataStr = JSON.stringify(history, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `futurevision-data-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 via-indigo-950 to-blue-950 p-4 md:p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-blue-500/10 pointer-events-none"></div>
            <div className="max-w-2xl mx-auto relative z-10">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                        <SettingsIcon className="w-10 h-10" />
                        Settings
                    </h1>
                    <p className="text-purple-200">Customize your experience</p>
                </div>

                <div className="space-y-6">
                    {/* Theme Settings */}
                    <div className="bg-gray-900/80 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50 shadow-2xl">
                        <h2 className="text-2xl font-bold mb-4">Appearance</h2>
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold mb-1">Theme</h3>
                                <p className="text-purple-200 text-sm">
                                    Current: {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                                </p>
                            </div>
                            <button
                                onClick={toggleTheme}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all border border-purple-500/30"
                            >
                                {theme === 'dark' ? (
                                    <>
                                        <Sun className="w-5 h-5" />
                                        Switch to Light
                                    </>
                                ) : (
                                    <>
                                        <Moon className="w-5 h-5" />
                                        Switch to Dark
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Data Management */}
                    <div className="bg-gray-900/80 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50 shadow-2xl">
                        <h2 className="text-2xl font-bold mb-4">Data Management</h2>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between pb-4 border-b border-gray-700/30">
                                <div>
                                    <h3 className="text-lg font-semibold mb-1">Export Data</h3>
                                    <p className="text-purple-200 text-sm">
                                        Download all your predictions as JSON
                                    </p>
                                </div>
                                <button
                                    onClick={exportAllData}
                                    disabled={history.length === 0}
                                    className="flex items-center gap-2 px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/50 text-blue-100 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Download className="w-5 h-5" />
                                    Export
                                </button>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold mb-1">Clear All Data</h3>
                                    <p className="text-purple-200 text-sm">
                                        Delete all predictions and progress ({history.length} items)
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        if (confirm('⚠️ This will permanently delete all your predictions and progress. Are you sure?')) {
                                            clearHistory();
                                            alert('All data cleared successfully!');
                                        }
                                    }}
                                    disabled={history.length === 0}
                                    className="flex items-center gap-2 px-6 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-400/50 text-red-100 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Trash2 className="w-5 h-5" />
                                    Clear All
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* About */}
                    <div className="bg-gray-900/80 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50 shadow-2xl">
                        <h2 className="text-2xl font-bold mb-4">About</h2>
                        <div className="space-y-2 text-purple-200">
                            <p><strong>Version:</strong> 2.0.0</p>
                            <p><strong>Features:</strong> AI Predictions, Progress Tracking, Export Tools</p>
                            <p><strong>Storage:</strong> All data stored locally on your device</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
