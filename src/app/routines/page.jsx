"use client";

import { useContext, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthContext from "../context/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";
import api from "../lib/api";

export default function RoutinesPage() {
    const router = useRouter();
    const { user } = useContext(AuthContext);
    const [workouts, setWorkouts] = useState([]);
    const [routines, setRoutines] = useState([]);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedWorkouts, setSelectedWorkouts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            fetchWorkouts();
            fetchRoutines();
        }
    }, [user]);

    const fetchWorkouts = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get('/workouts/');
            setWorkouts(response.data);
        } catch (err) {
            setError('Unable to load workouts');
        } finally {
            setLoading(false);
        }
    };

    const fetchRoutines = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get('/routines/');
            setRoutines(response.data);
        } catch (err) {
            setError('Unable to load routines');
        } finally {
            setLoading(false);
        }
    };

    const toggleWorkout = (id) => {
        setSelectedWorkouts((current) =>
            current.includes(id)
                ? current.filter((workoutId) => workoutId !== id)
                : [...current, id]
        );
    };

    const createRoutine = async (e) => {
        e.preventDefault();
        setError('');

        if (!name.trim()) {
            setError('Routine name is required.');
            return;
        }

        try {
            await api.post('/routines/', {
                name,
                description,
                workouts: selectedWorkouts,
            });
            setName('');
            setDescription('');
            setSelectedWorkouts([]);
            fetchRoutines();
        } catch (err) {
            setError('Failed to create routine');
        }
    };

    const deleteRoutine = async (id) => {
        setError('');
        try {
            await api.delete(`/routines/${id}`);
            fetchRoutines();
        } catch (err) {
            setError('Failed to delete routine');
        }
    };

    return (
        <ProtectedRoute>
            <div className="min-h-full flex-1 p-6 sm:p-10 bg-[var(--color-background)]">
                <div className="max-w-4xl mx-auto animate-fade-in">
                    <div className="mb-8">
                        <h1 className="text-4xl font-black text-[var(--color-primary)] dark:text-[var(--color-tertiary)] mb-1 tracking-tight">
                            My Routines
                        </h1>
                        <p className="text-[var(--color-muted)] font-medium">Group workouts into reusable routines.</p>
                    </div>

                    {error && (
                        <div className="mb-6 bg-[rgba(225,82,61,0.1)] border border-[var(--color-error)] rounded-xl p-3 flex items-center justify-center">
                            <p className="text-[var(--color-error)] text-sm font-semibold">{error}</p>
                        </div>
                    )}

                    <div className="grid lg:grid-cols-12 gap-8">
                        {/* Form Column */}
                        <div className="lg:col-span-5 h-min">
                            <div className="human-panel p-6 sm:p-8">
                                <h2 className="text-2xl font-black mb-6 text-[var(--color-primary)] flex items-center gap-2">
                                    <span className="bg-[var(--color-primary)] text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm shadow-sm">+</span>
                                    Create Routine
                                </h2>
                                <form onSubmit={createRoutine}>
                                    <div className="mb-5">
                                        <label className="block text-sm font-bold mb-2 text-[var(--color-foreground)] pl-1">Name</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full bg-[var(--color-background)] border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-colors duration-200 shadow-sm"
                                            placeholder="e.g. Upper Body Split"
                                        />
                                    </div>
                                    <div className="mb-6">
                                        <label className="block text-sm font-bold mb-2 text-[var(--color-foreground)] pl-1">Description</label>
                                        <input
                                            type="text"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="w-full bg-[var(--color-background)] border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-colors duration-200 shadow-sm"
                                            placeholder="Optional routine details"
                                        />
                                    </div>

                                    <div className="mb-8">
                                        <p className="text-sm font-bold mb-3 text-[var(--color-foreground)] pl-1">Select Workouts</p>
                                        <div className="grid gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                            {workouts.length === 0 && (
                                                <p className="text-sm text-[var(--color-muted)] italic">Create workouts first to add them.</p>
                                            )}
                                            {workouts.map((workout) => (
                                                <label key={workout.id} className={`flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer transition-colors duration-200 ${selectedWorkouts.includes(workout.id) ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-background)] hover:border-[var(--color-primary)]'}`}>
                                                    <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${selectedWorkouts.includes(workout.id) ? 'border-white bg-[var(--color-primary)]' : 'border-gray-400 dark:border-gray-500'}`}>
                                                        {selectedWorkouts.includes(workout.id) && (
                                                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                                        )}
                                                    </div>
                                                    <input
                                                        type="checkbox"
                                                        className="hidden"
                                                        checked={selectedWorkouts.includes(workout.id)}
                                                        onChange={() => toggleWorkout(workout.id)}
                                                    />
                                                    <span className={`text-sm font-semibold select-none ${selectedWorkouts.includes(workout.id) ? 'text-white' : 'text-[var(--color-foreground)]'}`}>{workout.name}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full bg-[var(--color-primary)] text-white py-3.5 rounded-xl font-bold tracking-wide hover:bg-[var(--color-secondary)] transition-colors duration-200 shadow-sm"
                                    >
                                        Save Routine
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* List Column */}
                        <div className="lg:col-span-7">
                            <div className="human-panel p-6 sm:p-8 h-full">
                                <h2 className="text-2xl font-black mb-6 text-[var(--color-primary)] dark:text-[var(--color-tertiary)]">Saved Routines</h2>

                                {loading && (
                                    <div className="flex justify-center p-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
                                    </div>
                                )}

                                {!loading && routines.length === 0 && (
                                    <div className="bg-[var(--color-background)] border border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-10 text-center">
                                        <p className="text-[var(--color-muted)] font-medium">No routines yet. Build one from your workouts!</p>
                                    </div>
                                )}

                                <div className="grid gap-4">
                                    {routines.map((routine) => (
                                        <div key={routine.id} className="group bg-[var(--color-background)] border border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:border-[var(--color-primary)] transition-colors duration-200">
                                            
                                            <div className="flex justify-between items-start gap-4">
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-xl text-[var(--color-foreground)] tracking-tight">{routine.name}</h3>
                                                    {routine.description && (
                                                        <p className="text-[var(--color-muted)] mt-1 font-medium text-sm">{routine.description}</p>
                                                    )}
                                                    
                                                    {routine.workouts?.length > 0 && (
                                                        <div className="mt-4 flex flex-wrap gap-2">
                                                            {routine.workouts.map((workout) => (
                                                                <span key={workout.id} className="bg-white dark:bg-[var(--color-surface)] text-[var(--color-secondary)] border border-gray-200 dark:border-gray-600 px-3 py-1 rounded-lg text-xs font-bold tracking-wide">
                                                                    {workout.name}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => router.push(`/sessions/active?routineId=${routine.id}`)}
                                                        className="text-[var(--color-primary)] hover:bg-[rgba(0,53,71,0.1)] px-3 py-2 rounded-lg text-sm font-bold transition-colors duration-200"
                                                    >
                                                        Start Log
                                                    </button>
                                                    <button
                                                        onClick={() => deleteRoutine(routine.id)}
                                                        className="text-[var(--color-error)] hover:bg-[rgba(225,82,61,0.1)] p-2 rounded-lg text-sm font-semibold transition-colors duration-200"
                                                        aria-label="Delete routine"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
