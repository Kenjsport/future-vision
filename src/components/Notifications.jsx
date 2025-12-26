import React, { useState, useEffect } from 'react';
import { Bell, X, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { API_BASE } from '../utils/api';

export default function Notifications({ userId, onViewPrediction }) {
    const { t } = useLanguage();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPanel, setShowPanel] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (userId) {
            fetchNotifications();
            // Refresh every 5 minutes
            const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
            return () => clearInterval(interval);
        }
    }, [userId]);

    const fetchNotifications = async () => {
        try {
            const response = await fetch(`${API_BASE}/api/notifications/${userId}`);
            if (response.ok) {
                const data = await response.json();
                setNotifications(data.notifications || []);
                setUnreadCount(data.notifications?.length || 0);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDismiss = (notificationId) => {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high':
                return 'bg-red-500/20 border-red-500/50 text-red-200';
            case 'medium':
                return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-200';
            default:
                return 'bg-blue-500/20 border-blue-500/50 text-blue-200';
        }
    };

    const getPriorityIcon = (priority) => {
        switch (priority) {
            case 'high':
                return <AlertCircle className="w-4 h-4" />;
            case 'medium':
                return <Clock className="w-4 h-4" />;
            default:
                return <CheckCircle2 className="w-4 h-4" />;
        }
    };

    if (!userId) return null;

    return (
        <>
            <button
                onClick={() => setShowPanel(!showPanel)}
                className="relative px-4 py-2 rounded-lg font-semibold bg-gray-800/60 text-white hover:bg-gray-700/60 border border-gray-700/50 transition-all flex items-center gap-2"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {showPanel && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-end p-4 pt-20">
                    <div className="bg-gray-900/95 backdrop-blur-lg rounded-2xl w-full max-w-md border border-gray-700/50 shadow-2xl max-h-[80vh] overflow-hidden flex flex-col">
                        <div className="flex justify-between items-center p-6 border-b border-gray-700/50">
                            <div className="flex items-center gap-3">
                                <Bell className="w-6 h-6 text-yellow-300" />
                                <h3 className="text-2xl font-bold text-white">{t('notifications')}</h3>
                                {unreadCount > 0 && (
                                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                                        {unreadCount}
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={() => setShowPanel(false)}
                                className="text-white/60 hover:text-white"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4">
                            {loading ? (
                                <div className="text-center text-white/60 py-8">{t('loading')}</div>
                            ) : notifications.length === 0 ? (
                                <div className="text-center text-white/60 py-8">
                                    <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-500/50" />
                                    <p>{t('noNotifications')}</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={`p-4 rounded-lg border ${getPriorityColor(notification.priority)}`}
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    {getPriorityIcon(notification.priority)}
                                                    <span className="font-semibold text-sm">
                                                        {notification.skill}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => handleDismiss(notification.id)}
                                                    className="text-white/60 hover:text-white"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <p className="text-sm mb-2">{notification.milestone}</p>
                                            <div className="flex items-center justify-between text-xs">
                                                <span>{notification.period}</span>
                                                <span>
                                                    {notification.daysUntilDue === 0
                                                        ? t('dueToday')
                                                        : notification.daysUntilDue === 1
                                                        ? t('dueTomorrow')
                                                        : `${notification.daysUntilDue} ${t('days')} ${t('remaining')}`}
                                                </span>
                                            </div>
                                            {onViewPrediction && (
                                                <button
                                                    onClick={() => {
                                                        onViewPrediction(notification.predictionId);
                                                        setShowPanel(false);
                                                    }}
                                                    className="mt-2 text-xs underline hover:no-underline"
                                                >
                                                    {t('viewPrediction')}
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

