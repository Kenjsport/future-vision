import React from 'react';
import { TrendingUp, DollarSign, Briefcase } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';

export default function CareerPathsGraph({ careerPaths, salaryInfo, skill }) {
    if (!careerPaths || careerPaths.length === 0) {
        return null;
    }

    // Prepare data for the bar chart (career paths with growth potential)
    const chartData = careerPaths.map((path, idx) => ({
        name: path.title || `Path ${idx + 1}`,
        growth: path.growthPotential || 50,
        demand: path.marketDemand || 50,
        difficulty: path.difficulty || 50,
        fullName: path.title || `Path ${idx + 1}`
    }));

    // Prepare salary progression data
    const salaryData = salaryInfo?.progression || [];

    return (
        <div className="space-y-6 mt-6">
            {/* Career Paths Comparison Chart */}
            <div className="bg-gray-900/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                    <TrendingUp className="w-6 h-6 text-purple-300" />
                    <h2 className="text-2xl font-bold text-white">Career Development Paths</h2>
                </div>
                
                <div className="mb-4">
                    <p className="text-white/70 text-sm mb-4">
                        Explore different career directions you can take with {skill}. Each path shows growth potential, market demand, and difficulty level.
                    </p>
                </div>

                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis 
                            dataKey="name" 
                            stroke="#e0e0e0"
                            angle={-45}
                            textAnchor="end"
                            height={80}
                            tick={{ fill: '#e0e0e0', fontSize: 12 }}
                        />
                        <YAxis 
                            stroke="#e0e0e0"
                            tick={{ fill: '#e0e0e0', fontSize: 12 }}
                            label={{ value: 'Score (0-100)', angle: -90, position: 'insideLeft', fill: '#e0e0e0' }}
                        />
                        <Tooltip 
                            contentStyle={{ 
                                backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '8px',
                                color: '#fff'
                            }}
                        />
                        <Legend 
                            wrapperStyle={{ color: '#e0e0e0', paddingTop: '20px' }}
                        />
                        <Bar dataKey="growth" fill="#8b5cf6" name="Growth Potential" />
                        <Bar dataKey="demand" fill="#10b981" name="Market Demand" />
                        <Bar dataKey="difficulty" fill="#f59e0b" name="Difficulty" />
                    </BarChart>
                </ResponsiveContainer>

                {/* Career Paths Details */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {careerPaths.map((path, idx) => (
                        <div key={idx} className="bg-gray-800/40 rounded-lg p-4 border border-gray-700/30">
                            <h3 className="text-white font-semibold mb-2">{path.title}</h3>
                            <p className="text-white/70 text-sm mb-3">{path.description}</p>
                            <div className="flex flex-wrap gap-2">
                                {path.skills?.map((skill, i) => (
                                    <span key={i} className="bg-purple-500/30 text-purple-100 px-2 py-1 rounded text-xs">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Salary Information */}
            {salaryInfo && salaryInfo.hasJobPotential !== false && (
                <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 shadow-2xl">
                    <div className="flex items-center gap-3 mb-6">
                        <DollarSign className="w-6 h-6 text-green-300" />
                        <h2 className="text-2xl font-bold text-white">Future Salary Projections</h2>
                    </div>

                    {salaryInfo.midSalary && (
                        <div className="mb-6">
                            <div className="bg-gray-800/60 rounded-xl p-6 mb-4 border border-gray-700/50">
                                <div className="flex items-center gap-2 mb-2">
                                    <Briefcase className="w-5 h-5 text-green-300" />
                                    <span className="text-white/80 text-sm">Mid-Level Salary (Future)</span>
                                </div>
                                <div className="text-4xl font-bold text-green-300 mb-2">
                                    ${salaryInfo.midSalary.toLocaleString()}
                                </div>
                                <p className="text-white/60 text-sm">
                                    {salaryInfo.currency || 'USD'} per year • {salaryInfo.region || 'Global average'}
                                </p>
                                {salaryInfo.salaryRange && (
                                    <p className="text-white/50 text-xs mt-2">
                                        Range: ${salaryInfo.salaryRange.min?.toLocaleString()} - ${salaryInfo.salaryRange.max?.toLocaleString()}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Salary Progression Chart */}
                    {salaryData.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-4">Salary Growth Over Time</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={salaryData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                    <XAxis 
                                        dataKey="year" 
                                        stroke="#e0e0e0"
                                        tick={{ fill: '#e0e0e0', fontSize: 12 }}
                                    />
                                    <YAxis 
                                        stroke="#e0e0e0"
                                        tick={{ fill: '#e0e0e0', fontSize: 12 }}
                                        label={{ value: 'Salary ($)', angle: -90, position: 'insideLeft', fill: '#e0e0e0' }}
                                    />
                                    <Tooltip 
                                        contentStyle={{ 
                                            backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                                            border: '1px solid rgba(255, 255, 255, 0.2)',
                                            borderRadius: '8px',
                                            color: '#fff'
                                        }}
                                        formatter={(value) => `$${value.toLocaleString()}`}
                                    />
                                    <Legend 
                                        wrapperStyle={{ color: '#e0e0e0', paddingTop: '20px' }}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="salary" 
                                        stroke="#10b981" 
                                        strokeWidth={3}
                                        name="Annual Salary"
                                        dot={{ fill: '#10b981', r: 5 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {salaryInfo.jobTitles && salaryInfo.jobTitles.length > 0 && (
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold text-white mb-3">Related Job Titles</h3>
                            <div className="flex flex-wrap gap-2">
                                {salaryInfo.jobTitles.map((title, idx) => (
                                    <span key={idx} className="bg-green-500/30 text-green-100 px-3 py-1 rounded-full text-sm">
                                        {title}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

