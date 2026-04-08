"use client";

import { useContext, useEffect, useState } from "react";
import Link from "next/link";
import api from "../lib/api";
import AuthContext from "../context/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";

export default function WorkoutsPage() {
    const { user } = useContext(AuthContext);
    const [workouts, setWorkouts] = useState([]);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            fetchWorkouts();
        }
    }, [user]);

    const fetchWorkouts = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await api.get('/workouts/');
            setWorkouts(response.data);
        } catch (err) {
            setError('Failed to load workouts');
        } finally {
            setLoading(false);
        }
    };

    const createWorkout = async (e) => {
        e.preventDefault();
        setError('');

        if (!name.trim()) {
            setError('Workout name is required.');
            return;
        }

        try {
            await api.post('/workouts/', {
                name,
                description,
            });
            setName('');
            setDescription('');
            fetchWorkouts();
        } catch (err) {
            setError('Failed to create workout');
        }
    };

    const deleteWorkout = async (id) => {
        setError('');

        try {
            await api.delete(`/workouts/${id}`);
            fetchWorkouts();
        } catch (err) {
            setError('Failed to delete workout');
        }
    };

    return (
        <ProtectedRoute>
            <div className="min-h-full flex-1 p-6 sm:p-10 bg-[var(--color-background)]">
                <div className="max-w-3xl mx-auto animate-fade-in">
                    <div className="mb-8">
                        <h1 className="text-4xl font-black text-[var(--color-primary)] dark:text-[var(--color-tertiary)] mb-1 tracking-tight">
                            My Workouts
                        </h1>
                        <p className="text-[var(--color-muted)] font-medium">Build your workout library.</p>
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="mb-6 bg-[rgba(225,82,61,0.1)] border border-[var(--color-error)] rounded-xl p-3 flex items-center justify-center">
                            <p className="text-[var(--color-error)] text-sm font-semibold">{error}</p>
                        </div>
                    )}

                    {/* Create workout form */}
                    <div className="human-panel p-6 sm:p-8 mb-8">
                        <h2 className="text-2xl font-black mb-6 text-[var(--color-primary)] flex items-center gap-2">
                            <span className="bg-[var(--color-primary)] text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm shadow-sm">+</span>
                            Create Workout
                        </h2>
                        
                        <form onSubmit={createWorkout}>
                            <div className="grid sm:grid-cols-2 gap-5 mb-6">
                                <div>
                                    <label className="block text-sm font-bold mb-2 text-[var(--color-foreground)]">Name</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-[var(--color-background)] border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-colors duration-200"
                                        placeholder="e.g. Push Day"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-2 text-[var(--color-foreground)]">Description</label>
                                    <input
                                        type="text"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full bg-[var(--color-background)] border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-colors duration-200"
                                        placeholder="e.g. Chest and triceps"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="w-full sm:w-auto px-8 bg-[var(--color-primary)] text-white py-3.5 rounded-xl font-bold hover:bg-[var(--color-secondary)] transition-colors duration-200 shadow-sm"
                            >
                                Add Workout
                            </button>
                        </form>
                    </div>

                    {/* Workouts list */}
                    <div className="human-panel p-6 sm:p-8">
                        <h2 className="text-2xl font-black mb-6 text-[var(--color-primary)] dark:text-[var(--color-tertiary)]">All Workouts</h2>

                        {loading && (
                            <div className="flex justify-center p-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
                            </div>
                        )}

                        {!loading && workouts.length === 0 && (
                            <div className="bg-[var(--color-background)] border border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-10 text-center">
                                <p className="text-[var(--color-muted)] font-medium">No workouts yet. Create your first one above!</p>
                            </div>
                        )}

                        <div className="grid gap-4 sm:grid-cols-2">
                            {workouts.map((workout) => (
                                <div
                                    key={workout.id}
                                    className="group bg-[var(--color-background)] border border-gray-200 dark:border-gray-700 rounded-2xl p-5 hover:border-[var(--color-primary)] transition-colors duration-200"
                                >
                                    <div className="flex justify-between items-start gap-3">
                                        <div>
                                            <p className="font-bold text-lg text-[var(--color-foreground)] leading-tight mb-1">{workout.name}</p>
                                            {workout.description && (
                                                <p className="text-sm text-[var(--color-muted)] font-medium">{workout.description}</p>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => deleteWorkout(workout.id)}
                                            className="text-[var(--color-error)] hover:bg-[rgba(225,82,61,0.1)] p-2 rounded-lg text-sm font-semibold transition-colors duration-200"
                                            aria-label="Delete workout"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}