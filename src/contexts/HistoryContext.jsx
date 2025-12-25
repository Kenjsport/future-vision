import React, { createContext, useContext, useState, useEffect } from 'react';

const HistoryContext = createContext();

export const useHistory = () => {
    const context = useContext(HistoryContext);
    if (!context) {
        throw new Error('useHistory must be used within HistoryProvider');
    }
    return context;
};

export const HistoryProvider = ({ children }) => {
    const [history, setHistory] = useState(() => {
        const saved = localStorage.getItem('futureSimulatorHistory');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('futureSimulatorHistory', JSON.stringify(history));
    }, [history]);

    const addPrediction = (predictionData) => {
        const newPrediction = {
            id: Date.now(),
            ...predictionData,
            progress: {},
            createdAt: new Date().toISOString()
        };

        setHistory(prev => {
            const updated = [newPrediction, ...prev];
            // Keep only last 50 predictions
            return updated.slice(0, 50);
        });

        return newPrediction.id;
    };

    const deletePrediction = (id) => {
        setHistory(prev => prev.filter(item => item.id !== id));
    };

    const clearHistory = () => {
        setHistory([]);
    };

    const updateProgress = (id, milestoneIndex, completed) => {
        setHistory(prev => prev.map(item => {
            if (item.id === id) {
                return {
                    ...item,
                    progress: {
                        ...item.progress,
                        [milestoneIndex]: completed
                    }
                };
            }
            return item;
        }));
    };

    const getPrediction = (id) => {
        return history.find(item => item.id === id);
    };

    return (
        <HistoryContext.Provider value={{
            history,
            addPrediction,
            deletePrediction,
            clearHistory,
            updateProgress,
            getPrediction
        }}>
            {children}
        </HistoryContext.Provider>
    );
};
