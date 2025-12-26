import React, { useState, useEffect } from 'react';
import { Book, Video, FileText, ExternalLink, Loader2, Sparkles } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { API_BASE } from '../utils/api';

export default function LearningResources({ skill }) {
    const { t } = useLanguage();
    const [resources, setResources] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (skill) {
            fetchResources();
        }
    }, [skill]);

    const fetchResources = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE}/api/resources/${encodeURIComponent(skill)}`);
            if (response.ok) {
                const data = await response.json();
                setResources(data.resources);
            } else {
                console.error('Failed to fetch resources:', response.status);
                setResources(null);
            }
        } catch (error) {
            console.error('Error fetching resources:', error);
            setResources(null);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-gray-900/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                    <Book className="w-6 h-6 text-blue-300" />
                    <h2 className="text-2xl font-bold text-white">{t('learningResources')}</h2>
                </div>
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 text-white/60 animate-spin" />
                </div>
            </div>
        );
    }

    if (!resources) {
        return null;
    }

    const getIcon = (type) => {
        switch (type) {
            case 'course':
                return <Video className="w-5 h-5" />;
            case 'book':
                return <Book className="w-5 h-5" />;
            case 'docs':
                return <FileText className="w-5 h-5" />;
            default:
                return <ExternalLink className="w-5 h-5" />;
        }
    };

    return (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-6">
                <Book className="w-6 h-6 text-blue-300" />
                <h2 className="text-2xl font-bold text-white">{t('learningResources')}</h2>
            </div>

            <div className="space-y-6">
                {/* Featured Learning Platform */}
                <div>
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-yellow-300" />
                        {t('featuredPlatform')}
                    </h3>
                    <a
                        href="https://find-learning-resources.vercel.app/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-gradient-to-r from-yellow-600/30 to-orange-600/30 hover:from-yellow-600/40 hover:to-orange-600/40 border-2 border-yellow-500/50 rounded-lg p-5 transition-all group"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Sparkles className="w-6 h-6 text-yellow-300" />
                                <div>
                                    <p className="text-white font-bold text-lg group-hover:text-yellow-300 transition-colors">
                                        LearnFast
                                    </p>
                                    <p className="text-white/70 text-sm">{t('discoverMoreResources')}</p>
                                </div>
                            </div>
                            <ExternalLink className="w-5 h-5 text-yellow-300 group-hover:text-yellow-200 transition-colors" />
                        </div>
                    </a>
                </div>

                {resources.courses && resources.courses.length > 0 && (
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                            <Video className="w-5 h-5 text-purple-300" />
                            {t('courses')}
                        </h3>
                        <div className="space-y-2">
                            {resources.courses.map((resource, idx) => (
                                <a
                                    key={idx}
                                    href={resource.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block bg-gray-800/60 hover:bg-gray-700/60 border border-gray-700/50 rounded-lg p-4 transition-all group"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {getIcon(resource.type)}
                                            <div>
                                                <p className="text-white font-medium group-hover:text-purple-300 transition-colors">
                                                    {resource.title}
                                                </p>
                                                <p className="text-white/60 text-sm">{resource.platform}</p>
                                            </div>
                                        </div>
                                        <ExternalLink className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                {resources.books && resources.books.length > 0 && (
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                            <Book className="w-5 h-5 text-yellow-300" />
                            {t('books')}
                        </h3>
                        <div className="space-y-2">
                            {resources.books.map((resource, idx) => (
                                <a
                                    key={idx}
                                    href={resource.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block bg-gray-800/60 hover:bg-gray-700/60 border border-gray-700/50 rounded-lg p-4 transition-all group"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {getIcon(resource.type)}
                                            <div>
                                                <p className="text-white font-medium group-hover:text-yellow-300 transition-colors">
                                                    {resource.title}
                                                </p>
                                                {resource.author && (
                                                    <p className="text-white/60 text-sm">{t('by')} {resource.author}</p>
                                                )}
                                            </div>
                                        </div>
                                        <ExternalLink className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                {resources.documentation && resources.documentation.length > 0 && (
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-green-300" />
                            {t('documentation')}
                        </h3>
                        <div className="space-y-2">
                            {resources.documentation.map((resource, idx) => (
                                <a
                                    key={idx}
                                    href={resource.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block bg-gray-800/60 hover:bg-gray-700/60 border border-gray-700/50 rounded-lg p-4 transition-all group"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {getIcon(resource.type)}
                                            <p className="text-white font-medium group-hover:text-green-300 transition-colors">
                                                {resource.title}
                                            </p>
                                        </div>
                                        <ExternalLink className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

