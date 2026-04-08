"use client";

import { useContext, useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthContext from "../../context/AuthContext";
import ProtectedRoute from "../../components/ProtectedRoute";
import api from "../../lib/api";

export default function ActiveSessionPage() {
    const { user } = useContext(AuthContext);
    const router = useRouter();
    const searchParams = useSearchParams();
    const routineId = searchParams.get('routineId');
    
    const [routine, setRoutine] = useState(null);
    const [session, setSession] = useState(null);
    const [history, setHistory] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    
    // Plate Calculator
    const [plateCalcTarget, setPlateCalcTarget] = useState(null);

    // Inputs for each workout
    const [inputs, setInputs] = useState({});
    
    // Check if session was already created
    const hasInitialized = useRef(false);

    // Timer States
    const [timerActive, setTimerActive] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        let interval = null;
        if (timerActive && timeLeft > 0) {
            interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
        } else if (timeLeft === 0 && timerActive) {
            setTimerActive(false);
            try {
                // Short beep on finish
                const audio = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA="); 
                audio.play().catch(e=>e);
            } catch(e){}
        }
        return () => clearInterval(interval);
    }, [timerActive, timeLeft]);

    useEffect(() => {
        if (user && routineId && !hasInitialized.current) {
            hasInitialized.current = true;
            initializeSession();
        }
    }, [user, routineId]);

    const initializeSession = async () => {
        setLoading(true);
        setError("");
        try {
            // Fetch routine details to get workouts
            const routinesResponse = await api.get('/routines/');
            const foundRoutine = routinesResponse.data.find(r => r.id === parseInt(routineId));
            
            if (!foundRoutine) {
                setError("Routine not found");
                setLoading(false);
                return;
            }
            setRoutine(foundRoutine);
            
            // Fetch histories for all workouts in this routine
            const historyMap = {};
            for (const workout of foundRoutine.workouts) {
                try {
                    const histRes = await api.get(`/workouts/${workout.id}/history`);
                    if (histRes.data) {
                        historyMap[workout.id] = histRes.data;
                    }
                } catch (err) {
                    // optionally log or ignore if no history
                }
            }
            setHistory(historyMap);

            // Start a new session
            const sessionResponse = await api.post('/sessions/', { routine_id: parseInt(routineId) });
            setSession({ ...sessionResponse.data, sets: [] }); // Initially empty sets
            
        } catch (err) {
            setError("Failed to initialize workout session");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (workoutId, field, value) => {
        setInputs(prev => ({
            ...prev,
            [workoutId]: {
                ...prev[workoutId],
                [field]: value
            }
        }));
    };

    const logSet = async (workoutId) => {
        if (!session) return;
        
        const repCount = parseInt(inputs[workoutId]?.reps);
        const weightAmount = parseFloat(inputs[workoutId]?.weight);
        
        if (isNaN(repCount) || repCount <= 0 || isNaN(weightAmount) || weightAmount < 0) {
            return; // Basic validation
        }

        try {
            await api.post(`/sessions/${session.id}/sets`, {
                workout_id: workoutId,
                reps: repCount,
                weight: weightAmount
            });
            
            // Clear inputs for this workout
            setInputs(prev => ({
                ...prev,
                [workoutId]: { reps: '', weight: '' }
            }));
            
            // Refresh session details to show the newly added set
            refreshSession();
            
            // Trigger Rest Timer
            const duration = user?.default_timer || 60;
            setTimeLeft(duration);
            setTimerActive(true);
        } catch (err) {
            console.error("Failed to log set", err);
            alert("Failed to log set. Make sure you are connected.");
        }
    };

    const refreshSession = async () => {
        if (!session) return;
        try {
            const response = await api.get(`/sessions/${session.id}`);
            setSession(response.data);
        } catch (err) {
            console.error(err);
        }
    };

    const deleteSet = async (setId) => {
        if (!session) return;
        try {
            await api.delete(`/sessions/${session.id}/sets/${setId}`);
            refreshSession();
        } catch (err) {
            console.error(err);
        }
    };

    const completeSession = async () => {
        if (!session) return;
        try {
            await api.put(`/sessions/${session.id}/complete`);
            router.push('/history');
        } catch (err) {
            alert("Failed to complete session.");
        }
    };

    const renderPlateCalculator = () => {
        if (!plateCalcTarget) return null;
        
        const unit = user?.weight_unit || 'kg';
        const barWeight = unit === 'lbs' ? 45 : 20;
        const availablePlates = unit === 'lbs' ? [45, 35, 25, 10, 5, 2.5] : [25, 20, 15, 10, 5, 2.5, 1.25];
        
        let remaining = (plateCalcTarget.weight - barWeight) / 2;
        const platesToLoad = [];
        
        if (remaining > 0) {
            for (const plate of availablePlates) {
                while (remaining >= plate) {
                    platesToLoad.push(plate);
                    remaining -= plate;
                }
            }
        }

        return (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setPlateCalcTarget(null)}>
                <div className="bg-[var(--color-surface)] p-6 sm:p-8 rounded-3xl max-w-sm w-full shadow-2xl relative border border-gray-100 dark:border-gray-800" onClick={e=>e.stopPropagation()}>
                    <button className="absolute top-4 right-4 text-gray-400 hover:text-[var(--color-foreground)]" onClick={() => setPlateCalcTarget(null)}>
                        ✕
                    </button>
                    <h3 className="text-xl font-black mb-2 text-[var(--color-foreground)]">Plate Calculator</h3>
                    <p className="text-sm text-[var(--color-muted)] mb-6">Target: <span className="font-bold">{plateCalcTarget.weight}{unit}</span> &nbsp;(Bar: {barWeight}{unit})</p>
                    
                    {plateCalcTarget.weight < barWeight ? (
                        <p className="text-[var(--color-error)] font-bold bg-[rgba(225,82,61,0.1)] p-3 rounded-lg text-center">Weight is below empty bar!</p>
                    ) : (
                        <div className="space-y-4">
                            <p className="font-bold text-[var(--color-primary)] dark:text-[var(--color-tertiary)] text-center bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">Load on EACH side:</p>
                            
                            <div className="flex gap-2 justify-center flex-wrap items-end h-24 border-b-4 border-gray-300 dark:border-gray-600 pb-1">
                                {/* Barbell shaft end */}
                                <div className="w-16 h-4 bg-gray-400 dark:bg-gray-500 rounded-l-md self-center"></div>
                                
                                {platesToLoad.map((p, i) => (
                                    <div key={i} className="flex flex-col items-center justify-center bg-[var(--color-secondary)] text-white font-black text-xs border-r border-[#003547] shadow-md" style={{
                                        width: '20px',
                                        height: p >= 20 ? '80px' : p >= 10 ? '60px' : p >= 5 ? '45px' : '30px',
                                        borderRadius: '4px'
                                    }}>
                                        <span style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>{p}</span>
                                    </div>
                                ))}
                                {platesToLoad.length === 0 && <span className="text-[var(--color-muted)] self-center text-sm font-bold ml-2">Empty Bar</span>}
                            </div>
                            
                            <div className="flex flex-wrap gap-2 justify-center pt-2">
                                {platesToLoad.map((p, i) => (
                                    <span key={i} className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-sm font-bold text-[var(--color-foreground)] border border-gray-200 dark:border-gray-700">{p}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <ProtectedRoute>
                <div className="min-h-full flex-1 flex flex-col items-center justify-center p-6 bg-[var(--color-background)]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[var(--color-primary)]"></div>
                    <p className="mt-4 font-bold text-[var(--color-muted)]">Setting up your session...</p>
                </div>
            </ProtectedRoute>
        );
    }

    if (error) {
        return (
            <ProtectedRoute>
                <div className="min-h-full flex-1 p-6 bg-[var(--color-background)]">
                    <div className="bg-[rgba(225,82,61,0.1)] border border-[var(--color-error)] rounded-xl p-4 text-center max-w-lg mx-auto mt-10">
                        <p className="text-[var(--color-error)] font-bold">{error}</p>
                        <button onClick={() => router.push('/routines')} className="mt-4 px-4 py-2 bg-[var(--color-background)] rounded-lg font-semibold text-[var(--color-foreground)]">Back to Routines</button>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <div className="min-h-full flex-1 p-6 sm:p-10 pb-32 bg-[var(--color-background)] relative">
                <div className="max-w-4xl mx-auto animate-fade-in">
                    <div className="mb-8 flex justify-between items-end">
                        <div>
                            <h1 className="text-4xl font-black text-[var(--color-primary)] dark:text-[var(--color-tertiary)] mb-1 tracking-tight flex items-center gap-3">
                                <span className="w-4 h-4 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.7)]"></span>
                                Active Session
                            </h1>
                            <p className="text-[var(--color-muted)] font-medium text-lg">{routine?.name}</p>
                        </div>
                    </div>

                    <div className="grid gap-8">
                        {routine?.workouts?.map((workout) => (
                            <div key={workout.id} className="human-panel p-6 sm:p-8 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-secondary)] opacity-5 rounded-bl-[100px] pointer-events-none"></div>
                                
                                <h2 className="text-2xl font-black mb-1 text-[var(--color-foreground)]">{workout.name}</h2>
                                {history[workout.id] ? (
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 mb-6 rounded-md bg-[rgba(194,187,0,0.15)] text-[var(--color-warning)] dark:text-[var(--color-tertiary)] text-xs font-bold uppercase tracking-wider">
                                       <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                       Last: {history[workout.id].weight}{user?.weight_unit || 'kg'} × {history[workout.id].reps}
                                    </div>
                                ) : (
                                    <div className="mb-6"></div>
                                )}
                                
                                {/* Previously logged sets for this workout */}
                                {session?.sets && session.sets.filter(s => s.workout_id === workout.id).length > 0 && (
                                    <div className="mb-6 space-y-2">
                                        {session.sets.filter(s => s.workout_id === workout.id).map((set, index) => (
                                            <div key={set.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                                                <div className="flex items-center gap-4">
                                                    <span className="text-sm font-bold w-6 h-6 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center">{index + 1}</span>
                                                    <span className="font-semibold text-[var(--color-foreground)]">{set.weight} kg</span>
                                                    <span className="text-gray-400">×</span>
                                                    <span className="font-semibold text-[var(--color-foreground)]">{set.reps} reps</span>
                                                </div>
                                                <button 
                                                    onClick={() => deleteSet(set.id)}
                                                    className="text-gray-400 hover:text-[var(--color-error)] transition-colors p-1"
                                                >
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Log new set input */}
                                <div className="flex items-end gap-3 sm:gap-4 mt-2">
                                    <div className="flex-1 relative">
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider block">Weight</label>
                                            <button 
                                                onClick={() => {
                                                    const w = parseFloat(inputs[workout.id]?.weight);
                                                    if (w) setPlateCalcTarget({ workoutId: workout.id, weight: w });
                                                    else alert("Enter a valid weight first to calculate plates!");
                                                }}
                                                className="text-[var(--color-secondary)] dark:text-gray-400 hover:text-[var(--color-primary)] dark:hover:text-white transition-colors p-0.5" 
                                                title="Open Plate Calculator"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18M5 6v12M19 6v12" /></svg>
                                            </button>
                                        </div>
                                        <div className="relative">
                                            <input 
                                                type="number" 
                                                value={inputs[workout.id]?.weight || ''}
                                                onChange={(e) => handleInputChange(workout.id, 'weight', e.target.value)}
                                                placeholder="0"
                                                className="w-full bg-[var(--color-background)] border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 pb-3 text-[var(--color-foreground)] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] shadow-sm text-center pr-8"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">{user?.weight_unit || 'kg'}</span>
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider mb-2">Reps</label>
                                        <input 
                                            type="number" 
                                            value={inputs[workout.id]?.reps || ''}
                                            onChange={(e) => handleInputChange(workout.id, 'reps', e.target.value)}
                                            placeholder="0"
                                            className="w-full bg-[var(--color-background)] border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-[var(--color-foreground)] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] shadow-sm text-center"
                                        />
                                    </div>
                                    <button 
                                        onClick={() => logSet(workout.id)}
                                        disabled={!inputs[workout.id]?.weight || !inputs[workout.id]?.reps}
                                        className="h-[52px] px-6 bg-[var(--color-primary)] text-white font-bold rounded-xl shadow-sm hover:bg-[var(--color-secondary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                    >
                                        Log
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Floating Complete Button */}
                <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[var(--color-background)] via-[var(--color-background)] to-transparent pointer-events-none flex justify-center pb-8 z-40">
                    <button 
                        onClick={completeSession}
                        className="pointer-events-auto w-full max-w-md bg-[var(--color-error)] text-white text-lg font-black py-4 rounded-2xl shadow-lg border-2 border-[rgba(255,255,255,0.1)] hover:bg-red-600 transform hover:scale-[1.02] transition-all duration-200"
                    >
                        FINISH WORKOUT
                    </button>
                </div>

                {/* Rest Timer Overlay */}
                {timerActive && (
                    <div 
                        className="fixed bottom-32 right-6 bg-white dark:bg-[var(--color-surface)] border-2 border-[var(--color-secondary)] p-3 pr-5 rounded-full shadow-2xl z-50 flex items-center gap-3 animate-bounce cursor-pointer hover:bg-[var(--color-secondary)] hover:text-white transition-colors group"
                        onClick={() => setTimerActive(false)}
                        title="Click to dismiss timer"
                    >
                        <div className="bg-[var(--color-secondary)] group-hover:bg-white text-white group-hover:text-[var(--color-secondary)] p-2 rounded-full transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        <span className="text-2xl font-black tracking-tight text-[var(--color-foreground)] group-hover:text-white">
                            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                        </span>
                    </div>
                )}
            </div>
            {renderPlateCalculator()}
        </ProtectedRoute>
    );
}
