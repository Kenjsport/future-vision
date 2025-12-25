import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

function TimeHorizonSlider({ value, onChange }) {
    const { t } = useLanguage();
    const [isDragging, setIsDragging] = useState(false);
    const sliderRef = useRef(null);
    
    // Create markers: full years (1-10) and half years (0.5, 1.5, ..., 9.5)
    const markers = [];
    for (let i = 0; i <= 10; i++) {
        markers.push(i); // Full years
        if (i < 10) {
            markers.push(i + 0.5); // Half years
        }
    }
    markers.sort((a, b) => a - b);
    
    const min = 0;
    const max = 10;
    const step = 0.5;
    
    const handleMouseDown = (e) => {
        setIsDragging(true);
        updateValue(e);
    };
    
    const handleMouseMove = (e) => {
        if (isDragging) {
            updateValue(e);
        }
    };
    
    const handleMouseUp = () => {
        setIsDragging(false);
    };
    
    const updateValue = (e) => {
        if (!sliderRef.current) return;
        
        const rect = sliderRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        const newValue = Math.round((min + (max - min) * percentage) / step) * step;
        onChange(String(newValue));
    };
    
    const handleMarkerClick = (markerValue) => {
        onChange(String(markerValue));
    };
    
    useEffect(() => {
        if (isDragging) {
            const handleMouseMoveWrapper = (e) => handleMouseMove(e);
            const handleMouseUpWrapper = () => handleMouseUp();
            
            document.addEventListener('mousemove', handleMouseMoveWrapper);
            document.addEventListener('mouseup', handleMouseUpWrapper);
            return () => {
                document.removeEventListener('mousemove', handleMouseMoveWrapper);
                document.removeEventListener('mouseup', handleMouseUpWrapper);
            };
        }
    }, [isDragging]);
    
    const currentValue = parseFloat(value) || 0;
    const percentage = ((currentValue - min) / (max - min)) * 100;
    
    const formatValue = (val) => {
        const num = parseFloat(val);
        if (num === 0) return '0';
        if (num === 1) return `1 ${t('year')}`;
        if (num % 1 === 0) {
            return `${num} ${t('years')}`;
        }
        // For half years, show as "X.5 years" or "X.5 year" if 0.5
        if (num === 0.5) return `0.5 ${t('year')}`;
        return `${num} ${t('years')}`;
    };
    
    return (
        <div className="w-full">
            <div className="mb-4">
                <div className="text-white font-semibold text-lg mb-2">
                    {formatValue(value)}
                </div>
            </div>
            
            <div 
                ref={sliderRef}
                className="relative w-full h-16 cursor-pointer"
                onMouseDown={handleMouseDown}
            >
                {/* Track */}
                <div className="absolute top-1/2 left-0 right-0 h-2 bg-gray-800/60 rounded-full transform -translate-y-1/2">
                    {/* Filled portion */}
                    <div 
                        className="absolute top-0 left-0 h-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                    />
                </div>
                
                {/* Markers */}
                {markers.map((marker) => {
                    const markerPercentage = ((marker - min) / (max - min)) * 100;
                    const isFullYear = marker % 1 === 0;
                    const isActive = Math.abs(parseFloat(value) - marker) < 0.25;
                    
                    return (
                        <div
                            key={marker}
                            className="absolute transform -translate-x-1/2 -translate-y-1/2"
                            style={{ left: `${markerPercentage}%`, top: '50%' }}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleMarkerClick(marker);
                            }}
                        >
                            {/* Marker line */}
                            <div
                                className={`w-0.5 transition-all ${
                                    isFullYear
                                        ? 'h-6 bg-purple-500'
                                        : 'h-3 bg-gray-600'
                                } ${isActive ? 'bg-pink-400' : ''}`}
                            />
                            
                            {/* Year labels for full years */}
                            {isFullYear && marker > 0 && (
                                <div className="absolute top-7 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                                    <span className={`text-xs font-medium ${
                                        isActive ? 'text-pink-300' : 'text-white/60'
                                    }`}>
                                        {marker}
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                })}
                
                {/* Thumb */}
                <div
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all"
                    style={{ left: `${percentage}%`, top: '50%' }}
                >
                    <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full shadow-lg border-2 border-purple-400 cursor-grab active:cursor-grabbing flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                </div>
            </div>
            
            {/* Min/Max labels */}
            <div className="flex justify-between mt-2 text-white/60 text-sm">
                <span>0</span>
                <span>10 {t('years')}</span>
            </div>
        </div>
    );
}

export default TimeHorizonSlider;
