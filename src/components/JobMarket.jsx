import React, { useState, useEffect } from 'react';
import { Briefcase, MapPin, DollarSign, ExternalLink, TrendingUp, Clock, Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { API_BASE } from '../utils/api';

export default function JobMarket({ skill, location = 'Remote' }) {
    const { t } = useLanguage();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (skill) {
            fetchJobs();
        }
    }, [skill, location]);

    const fetchJobs = async () => {
        setLoading(true);
        setError('');
        
        try {
            const response = await fetch(`${API_BASE}/api/jobs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ skill, location })
            });

            if (response.ok) {
                const data = await response.json();
                setJobs(data.jobs || []);
            } else {
                setError(t('failedToLoadJobs'));
            }
        } catch (err) {
            setError(t('failedToLoadJobs'));
            console.error('Error fetching jobs:', err);
        } finally {
            setLoading(false);
        }
    };

    const getSalaryColor = (salary) => {
        if (!salary) return 'text-white/60';
        const num = parseInt(salary.replace(/[^0-9]/g, ''));
        if (num > 100000) return 'text-green-300';
        if (num > 70000) return 'text-yellow-300';
        return 'text-blue-300';
    };

    if (!skill) return null;

    return (
        <div className="bg-gray-900/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 shadow-2xl mt-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Briefcase className="w-6 h-6 text-blue-300" />
                    <h2 className="text-2xl font-bold text-white">{t('jobMarket')}</h2>
                    <span className="bg-blue-500/30 text-blue-100 px-3 py-1 rounded-full text-xs">
                        {skill}
                    </span>
                </div>
                <button
                    onClick={fetchJobs}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
                    {t('refresh')}
                </button>
            </div>

            {loading && jobs.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-blue-300 animate-spin" />
                </div>
            ) : error ? (
                <div className="bg-red-500/20 border border-red-400 text-red-100 px-4 py-3 rounded-lg">
                    {error}
                </div>
            ) : jobs.length === 0 ? (
                <div className="text-center text-white/60 py-8">
                    <Briefcase className="w-12 h-12 mx-auto mb-3 text-white/30" />
                    <p>{t('noJobsFound')}</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {jobs.slice(0, 10).map((job, idx) => (
                        <div
                            key={idx}
                            className="bg-gray-800/60 rounded-xl p-5 border border-gray-700/50 hover:border-blue-500/50 transition-all"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-white mb-2 hover:text-blue-300 transition-colors">
                                        {job.title}
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-white/70 mb-3">
                                        {job.company && (
                                            <div className="flex items-center gap-1">
                                                <Briefcase className="w-4 h-4" />
                                                {job.company}
                                            </div>
                                        )}
                                        {job.location && (
                                            <div className="flex items-center gap-1">
                                                <MapPin className="w-4 h-4" />
                                                {job.location}
                                            </div>
                                        )}
                                        {job.type && (
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {job.type}
                                            </div>
                                        )}
                                    </div>
                                    {job.salary && (
                                        <div className={`flex items-center gap-1 font-semibold mb-2 ${getSalaryColor(job.salary)}`}>
                                            <DollarSign className="w-4 h-4" />
                                            {job.salary}
                                        </div>
                                    )}
                                    {job.description && (
                                        <p className="text-white/60 text-sm line-clamp-2 mb-3">
                                            {job.description}
                                        </p>
                                    )}
                                    {job.skills && job.skills.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {job.skills.slice(0, 5).map((skill, i) => (
                                                <span
                                                    key={i}
                                                    className="bg-purple-500/30 text-purple-100 px-2 py-1 rounded text-xs"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            {job.url && (
                                <a
                                    href={job.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all mt-3"
                                >
                                    {t('applyNow')}
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                            )}
                        </div>
                    ))}
                    {jobs.length > 10 && (
                        <div className="text-center text-white/60 text-sm">
                            {t('showingFirst10')} {jobs.length} {t('jobsFound')}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

