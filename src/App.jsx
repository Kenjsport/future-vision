import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Loader2, Zap, History, Home, LogOut, Globe, User } from 'lucide-react';
import Landing from './components/Landing';
import Login from './components/Login';
import Register from './components/Register';
import AccountPage from './components/AccountPage';
import TestModal from './components/TestModal';
import Predictions from './components/Predictions';
import HistoryDashboard from './components/HistoryDashboard';
import ExportShare from './components/ExportShare';
import LearningResources from './components/LearningResources';
import ComparisonView from './components/ComparisonView';
import TimeHorizonSlider from './components/TimeHorizonSlider';
import { useLanguage } from './contexts/LanguageContext';
import { useAuth } from './contexts/AuthContext';
import { API_BASE } from './utils/api';
import { BLOCKED_WORDS } from '../dataBase';

export default function App() {
    const { t, language, changeLanguage } = useLanguage();
    const { user: authUser, isAuthenticated, logout } = useAuth();
    const [page, setPage] = useState('landing'); // landing, login, register, main, account
    const [view, setView] = useState('main'); // main, history, comparison
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    const [currentSkill, setCurrentSkill] = useState('');
    const [currentLevel, setCurrentLevel] = useState('beginner');
    const [timeframe, setTimeframe] = useState('1');
    const [predictions, setPredictions] = useState(null);
    const [currentPredictionId, setCurrentPredictionId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [showTest, setShowTest] = useState(false);
    const [testStep, setTestStep] = useState(0);
    const [testAnswers, setTestAnswers] = useState([]);
    
    const [comparisonIds, setComparisonIds] = useState([]);
    const [refreshHistory, setRefreshHistory] = useState(0);
    const [showLanguageMenu, setShowLanguageMenu] = useState(false);
    const languageMenuRef = useRef(null);
    
    // Close language menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (languageMenuRef.current && !languageMenuRef.current.contains(event.target)) {
                setShowLanguageMenu(false);
            }
        };
        
        if (showLanguageMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showLanguageMenu]);

    const generatePredictions = async () => {
        if (!currentSkill.trim()) {
            setError(t('pleaseEnterSkill'));
            return;
        }

        // Check for blocked words
        const inputLower = currentSkill.toLowerCase();
        const hasBlockedWord = BLOCKED_WORDS.some(word =>
            inputLower.includes(word.toLowerCase())
        );

        if (hasBlockedWord) {
            setError(t('rudeWordDetected'));
            return;
        }

        setLoading(true);
        setError('');
        setPredictions(null);

        try {
            const response = await fetch(`${API_BASE}/api/predict`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: `You are an expert in skill development and career planning. 

Skill/Project: ${currentSkill}
Current Level: ${currentLevel}
Time Horizon: ${timeframe} year(s)
Target Language: ${language === 'en' ? 'English' : language === 'ru' ? 'Russian (Русский)' : 'Armenian (Հայերեն)'}

IMPORTANT: Generate ALL text content in ${language === 'en' ? 'English' : language === 'ru' ? 'Russian' : 'Armenian'}. This includes:
- Trajectory descriptions
- Milestone periods (e.g., ${language === 'en' ? '"in 3 months"' : language === 'ru' ? '"через 3 месяца"' : '"3 ամիս հետո"'} - translate the "in/through/after" part)
- Achievement descriptions
- Opportunities
- Risks
- Next steps
- Career path titles and descriptions
- All skill names should remain in their original language (technical terms)

Create a realistic growth forecast in JSON format. Respond ONLY with JSON without explanation:

{
  "trajectory": "brief description of the general trajectory (2-3 sentences in ${language === 'en' ? 'English' : language === 'ru' ? 'Russian' : 'Armenian'})",
  "milestones": [
    {
      "period": "${language === 'en' ? 'in X months' : language === 'ru' ? 'через X месяцев' : 'X ամիս հետո'}",
      "achievement": "specific achievement (in ${language === 'en' ? 'English' : language === 'ru' ? 'Russian' : 'Armenian'})",
      "skills": ["skill1", "skill2"]
    }
  ],
  "opportunities": [
    "opportunity 1 (in ${language === 'en' ? 'English' : language === 'ru' ? 'Russian' : 'Armenian'})",
    "opportunity 2",
    "opportunity 3"
  ],
  "risks": [
    "risk/challenge 1 (in ${language === 'en' ? 'English' : language === 'ru' ? 'Russian' : 'Armenian'})",
    "risk/challenge 2"
  ],
  "nextSteps": [
    "specific step 1 (in ${language === 'en' ? 'English' : language === 'ru' ? 'Russian' : 'Armenian'})",
    "specific step 2",
    "specific step 3"
  ],
  "careerPaths": [
    {
      "title": "Career path name in ${language === 'en' ? 'English' : language === 'ru' ? 'Russian' : 'Armenian'}",
      "description": "Brief description in ${language === 'en' ? 'English' : language === 'ru' ? 'Russian' : 'Armenian'}",
      "growthPotential": 85,
      "marketDemand": 90,
      "difficulty": 70,
      "skills": ["skill1", "skill2", "skill3"]
    }
  ],
  "salaryInfo": {
    "hasJobPotential": true,
    "midSalary": 95000,
    "currency": "USD",
    "region": "Global average",
    "salaryRange": {
      "min": 70000,
      "max": 120000
    },
    "jobTitles": ["Job Title 1", "Job Title 2", "Job Title 3"],
    "progression": [
      {"year": "Year 1", "salary": 60000},
      {"year": "Year 2", "salary": 75000},
      {"year": "Year 3", "salary": 95000},
      {"year": "Year 5", "salary": 120000}
    ]
  }
}`
                })
            });

            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/71323d95-debc-4ecf-a311-79ceedb88b4e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.jsx:99',message:'API response received',data:{ok:response.ok,status:response.status,statusText:response.statusText},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
            // #endregion
            
            if (!response.ok) {
                const errorText = await response.text();
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/71323d95-debc-4ecf-a311-79ceedb88b4e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.jsx:103',message:'API response not ok',data:{status:response.status,errorText},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
                // #endregion
                throw new Error(`API Error: ${response.status} ${errorText}`);
            }
            
            const data = await response.json();

            if (data.error) {
                throw new Error(data.error.message || 'API Error');
            }

            if (!data.content || !data.content[0]) {
                throw new Error('Invalid response from model');
            }

            const content = data.content[0].text;

            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                try {
                    const parsed = JSON.parse(jsonMatch[0]);
                    // #region agent log
                    fetch('http://127.0.0.1:7242/ingest/71323d95-debc-4ecf-a311-79ceedb88b4e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.jsx:126',message:'JSON parsed successfully',data:{hasTrajectory:!!parsed.trajectory,hasMilestones:!!parsed.milestones,milestoneCount:parsed.milestones?.length||0,isArray:Array.isArray(parsed.milestones)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
                    // #endregion
                    
                    // Validate parsed data structure
                    if (!parsed.milestones || !Array.isArray(parsed.milestones)) {
                        parsed.milestones = [];
                    }
                    if (!parsed.opportunities || !Array.isArray(parsed.opportunities)) {
                        parsed.opportunities = [];
                    }
                    if (!parsed.risks || !Array.isArray(parsed.risks)) {
                        parsed.risks = [];
                    }
                    if (!parsed.nextSteps || !Array.isArray(parsed.nextSteps)) {
                        parsed.nextSteps = [];
                    }
                    if (!parsed.careerPaths || !Array.isArray(parsed.careerPaths)) {
                        parsed.careerPaths = [];
                    }
                    // Validate salaryInfo structure
                    if (parsed.salaryInfo && parsed.salaryInfo.hasJobPotential === false) {
                        parsed.salaryInfo = null;
                    } else if (parsed.salaryInfo) {
                        if (!parsed.salaryInfo.progression || !Array.isArray(parsed.salaryInfo.progression)) {
                            parsed.salaryInfo.progression = [];
                        }
                        if (!parsed.salaryInfo.jobTitles || !Array.isArray(parsed.salaryInfo.jobTitles)) {
                            parsed.salaryInfo.jobTitles = [];
                        }
                    }
                    
                    setPredictions(parsed);
                } catch (parseError) {
                    // #region agent log
                    fetch('http://127.0.0.1:7242/ingest/71323d95-debc-4ecf-a311-79ceedb88b4e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.jsx:140',message:'JSON parse error',data:{error:parseError.message,jsonMatchLength:jsonMatch[0]?.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'N'})}).catch(()=>{});
                    // #endregion
                    throw new Error(`Failed to parse JSON: ${parseError.message}`);
                }
                
                // Save prediction to backend
                const userId = authUser?.email || 'guest';
                try {
                    const saveResponse = await fetch(`${API_BASE}/api/predictions/save`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            userId,
                            skill: currentSkill,
                            level: currentLevel,
                            timeframe,
                            predictions: parsed
                        })
                    });
                    // #region agent log
                    fetch('http://127.0.0.1:7242/ingest/71323d95-debc-4ecf-a311-79ceedb88b4e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.jsx:132',message:'Save prediction response',data:{ok:saveResponse.ok,status:saveResponse.status},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
                    // #endregion
                    if (saveResponse.ok) {
                        const saveData = await saveResponse.json();
                        if (saveData.prediction) {
                            setCurrentPredictionId(saveData.prediction.id);
                        }
                    } else {
                        const errorText = await saveResponse.text();
                        console.error('Failed to save prediction:', errorText);
                    }
                } catch (saveErr) {
                    console.error('Error saving prediction:', saveErr);
                    // Continue even if save fails
                }
            } else {
                throw new Error('Could not parse JSON in model response');
            }
        } catch (err) {
            if (err instanceof TypeError && err.message.includes('fetch')) {
                setError('Could not connect to proxy server. Make sure "node server.js" is running.');
            } else {
                setError(`${t('error')}: ${err.message}`);
            }
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectPrediction = (prediction) => {
        setPredictions(prediction.predictions);
        setCurrentSkill(prediction.skill);
        setCurrentLevel(prediction.level);
        setTimeframe(prediction.timeframe);
        setCurrentPredictionId(prediction.id);
        setView('main');
    };

    const handleCompare = (ids) => {
        setComparisonIds(ids);
        setView('comparison');
    };

    const getUserId = () => {
        return authUser?.email || 'guest';
    };

    // Note: Authenticated users can still access main app, but account page requires login

    if (page === 'landing') {
        return <Landing setPage={setPage} />;
    }

    if (page === 'login') {
        return <Login setPage={setPage} email={email} setEmail={setEmail} password={password} setPassword={setPassword} />;
    }

    if (page === 'register') {
        return <Register setPage={setPage} email={email} setEmail={setEmail} password={password} setPassword={setPassword} name={name} setName={setName} />;
    }

    if (page === 'account') {
        if (!isAuthenticated) {
            setPage('login');
            return null;
        }
        return <AccountPage 
            onLogout={() => { logout(); setPage('landing'); }} 
            onGoToMain={() => { setPage('main'); }}
        />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 via-indigo-950 to-blue-950 p-4 md:p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-blue-500/10 pointer-events-none"></div>
            <div className="max-w-4xl mx-auto relative z-10">
                <div className="flex justify-between items-center mb-8">
                    <div className="text-center flex-1">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <Sparkles className="w-10 h-10 text-yellow-300 animate-pulse" />
                            <h1 className="text-4xl md:text-5xl font-bold text-white">
                                {t('futureSimulator')}
                            </h1>
                        </div>
                        <p className="text-purple-200 text-lg">
                            {t('hi')}, {authUser?.name || 'Guest'}! {t('discoverYourFuture')}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {isAuthenticated && (
                            <button
                                onClick={() => setPage('account')}
                                className="px-4 py-2 rounded-lg font-semibold bg-gray-800/60 text-white hover:bg-gray-700/60 border border-gray-700/50 transition-all flex items-center gap-2"
                            >
                                <User className="w-4 h-4" />
                                {t('account')}
                            </button>
                        )}
                        <div className="relative" ref={languageMenuRef}>
                            <button
                                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                                className="px-4 py-2 rounded-lg font-semibold bg-gray-800/60 text-white hover:bg-gray-700/60 border border-gray-700/50 transition-all flex items-center gap-2"
                            >
                                <Globe className="w-4 h-4" />
                                {language.toUpperCase()}
                            </button>
                            {showLanguageMenu && (
                                <div className="absolute top-full mt-2 right-0 bg-gray-800 backdrop-blur-lg rounded-lg shadow-xl border border-gray-700/50 overflow-hidden z-50 min-w-[120px]">
                                    <button
                                        onClick={() => {
                                            changeLanguage('en');
                                            setShowLanguageMenu(false);
                                        }}
                                        className={`w-full px-4 py-2 text-left hover:bg-gray-700/60 transition-all text-white ${
                                            language === 'en' ? 'bg-purple-600/30 font-semibold' : ''
                                        }`}
                                    >
                                        English
                                    </button>
                                    <button
                                        onClick={() => {
                                            changeLanguage('ru');
                                            setShowLanguageMenu(false);
                                        }}
                                        className={`w-full px-4 py-2 text-left hover:bg-gray-700/60 transition-all text-white ${
                                            language === 'ru' ? 'bg-purple-600/30 font-semibold' : ''
                                        }`}
                                    >
                                        Русский
                                    </button>
                                    <button
                                        onClick={() => {
                                            changeLanguage('hy');
                                            setShowLanguageMenu(false);
                                        }}
                                        className={`w-full px-4 py-2 text-left hover:bg-gray-700/60 transition-all text-white ${
                                            language === 'hy' ? 'bg-purple-600/30 font-semibold' : ''
                                        }`}
                                    >
                                        Հայերեն
                                    </button>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => setView('main')}
                                className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                                view === 'main'
                                    ? 'bg-purple-600 text-white border border-purple-500/30'
                                    : 'bg-gray-800/60 text-white hover:bg-gray-700/60 border border-gray-700/50'
                            }`}
                        >
                            <Home className="w-4 h-4" />
                            {t('home')}
                        </button>
                        <button
                            onClick={() => {
                                setView('history');
                                setRefreshHistory(prev => prev + 1);
                            }}
                            className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                                view === 'history'
                                    ? 'bg-purple-600 text-white border border-purple-500/30'
                                    : 'bg-gray-800/60 text-white hover:bg-gray-700/60 border border-gray-700/50'
                            }`}
                        >
                            <History className="w-4 h-4" />
                            {t('history')}
                        </button>
                        {isAuthenticated ? (
                            <button
                                onClick={() => {
                                    logout();
                                    setPage('landing');
                                    setView('main');
                                    setPredictions(null);
                                    setCurrentPredictionId(null);
                                }}
                                className="px-4 py-2 rounded-lg font-semibold bg-gray-800/60 text-white hover:bg-gray-700/60 border border-gray-700/50 transition-all flex items-center gap-2"
                            >
                                <LogOut className="w-4 h-4" />
                                {t('logout')}
                            </button>
                        ) : (
                            <button
                                onClick={() => setPage('login')}
                                className="px-4 py-2 rounded-lg font-semibold bg-gray-800/60 text-white hover:bg-gray-700/60 border border-gray-700/50 transition-all flex items-center gap-2"
                            >
                                {t('logIn')}
                            </button>
                        )}
                    </div>
                </div>

                {view === 'history' && (
                    <HistoryDashboard
                        userId={getUserId()}
                        onSelectPrediction={handleSelectPrediction}
                        onCompare={handleCompare}
                        onClose={() => setView('main')}
                        key={refreshHistory}
                    />
                )}

                {view === 'comparison' && (
                    <ComparisonView
                        userId={getUserId()}
                        predictionIds={comparisonIds}
                        onClose={() => setView('history')}
                    />
                )}

                {view === 'main' && (
                    <>

                <div className="bg-gray-900/80 backdrop-blur-lg rounded-2xl p-6 md:p-8 mb-8 border border-gray-700/50 shadow-2xl">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-white font-semibold mb-2">
                                {t('yourSkillOrProject')}
                            </label>
                            <input
                                type="text"
                                value={currentSkill}
                                onChange={(e) => setCurrentSkill(e.target.value)}
                                placeholder={t('skillPlaceholder')}
                                className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            />
                        </div>

                        <div>
                            <label className="block text-white font-semibold mb-2">
                                {t('currentLevel')}
                            </label>
                            <div className="grid grid-cols-4 gap-3">
                                {[
                                    { value: 'beginner', label: t('beginner') },
                                    { value: 'intermediate', label: t('intermediate') },
                                    { value: 'advanced', label: t('advanced') }
                                ].map((level) => (
                                    <button
                                        key={level.value}
                                        onClick={() => setCurrentLevel(level.value)}
                                        className={`py-3 rounded-lg font-medium transition-all ${currentLevel === level.value
                                    ? 'bg-purple-600 text-white shadow-lg scale-105'
                                    : 'bg-gray-800/60 text-white hover:bg-gray-700/60 border border-gray-700/50'
                                            }`}
                                    >
                                        {level.label}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setShowTest(true)}
                                    className="py-3 rounded-lg font-medium bg-gradient-to-r from-yellow-600 to-orange-600 text-white hover:shadow-lg transition-all border border-yellow-500/30"
                                >
                                    📝 {t('test')}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-white font-semibold mb-2">
                                {t('timeHorizon')}
                            </label>
                            <TimeHorizonSlider value={timeframe} onChange={setTimeframe} />
                        </div>

                        <button
                            onClick={generatePredictions}
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-lg font-bold text-lg hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border border-purple-500/30"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    {t('lookingIntoTheFuture')}
                                </>
                            ) : (
                                <>
                                    <Zap className="w-5 h-5" />
                                    {t('showMyFuture')}
                                </>
                            )}
                        </button>

                        {error && (
                            <div className="bg-red-500/20 border border-red-400 text-red-100 px-4 py-3 rounded-lg">
                                {error}
                            </div>
                        )}
                    </div>
                </div>

                        {predictions && (
                            <>
                                <div className="flex gap-3 mb-4">
                                    <ExportShare
                                        prediction={predictions}
                                        skill={currentSkill}
                                        level={currentLevel}
                                        timeframe={timeframe}
                                        userId={getUserId()}
                                        predictionId={currentPredictionId}
                                    />
                                </div>
                                <Predictions
                                    predictions={predictions}
                                    predictionId={currentPredictionId}
                                    userId={getUserId()}
                                    onProgressUpdate={() => setRefreshHistory(prev => prev + 1)}
                                    skill={currentSkill}
                                />
                                <LearningResources skill={currentSkill} />
                            </>
                        )}
                    </>
                )}
            </div>

            {showTest && (
                <TestModal
                    setShowTest={setShowTest}
                    testStep={testStep}
                    setTestStep={setTestStep}
                    testAnswers={testAnswers}
                    setTestAnswers={setTestAnswers}
                    setCurrentLevel={setCurrentLevel}
                />
            )}
        </div>
    );
}
