"use client";

import { useContext, useEffect, useState } from "react";
import AuthContext from "../context/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";
import api from "../lib/api";

export default function HistoryPage() {
    const { user } = useContext(AuthContext);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (user) {
            fetchSessions();
        }
    }, [user]);

    const fetchSessions = async () => {
        try {
            const response = await api.get('/sessions/');
            setSessions(response.data);
        } catch (err) {
            setError("Failed to load workout history.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProtectedRoute>
            <div className="min-h-full flex-1 p-6 sm:p-10 bg-[var(--color-background)]">
                <div className="max-w-4xl mx-auto animate-fade-in">
                    <div className="mb-8">
                        <h1 className="text-4xl font-black text-[var(--color-primary)] dark:text-[var(--color-tertiary)] mb-1 tracking-tight">
                            Workout History
                        </h1>
                        <p className="text-[var(--color-muted)] font-medium">Review your past sessions and progress.</p>
                    </div>

                    {error && (
                        <div className="mb-6 bg-[rgba(225,82,61,0.1)] border border-[var(--color-error)] rounded-xl p-3 flex items-center justify-center">
                            <p className="text-[var(--color-error)] text-sm font-semibold">{error}</p>
                        </div>
                    )}

                    {loading ? (
                        <div className="flex justify-center p-12">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--color-primary)]"></div>
                        </div>
                    ) : sessions.length === 0 ? (
                        <div className="bg-[var(--color-surface)] border border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-12 text-center shadow-sm">
                            <p className="text-[var(--color-muted)] font-medium text-lg">No completed sessions yet.</p>
                            <p className="text-[var(--color-muted)] font-medium mt-2">Start a routine and log your sets to see them here.</p>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {sessions.map(session => (
                                <div key={session.id} className="human-panel p-6 sm:p-8 hover:border-[var(--color-primary)] transition-colors duration-200">
                                    <div className="flex justify-between items-start gap-4 flex-wrap">
                                        <div>
                                            <h3 className="font-bold text-2xl text-[var(--color-foreground)] tracking-tight mb-2">
                                                {session.routine_name}
                                            </h3>
                                            <div className="flex items-center text-sm font-semibold text-[var(--color-muted)]">
                                                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                                {new Date(session.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
                                            </div>
                                        </div>
                                        <div className="flex gap-6 mt-4 sm:mt-0 bg-[var(--color-background)] rounded-xl py-3 px-5 border border-gray-100 dark:border-gray-800 shadow-inner">
                                            <div className="text-center">
                                                <p className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider mb-1">Total Sets</p>
                                                <p className="font-black text-xl text-[var(--color-primary)] dark:text-[var(--color-tertiary)]">{session.total_sets}</p>
                                            </div>
                                            <div className="w-px bg-gray-200 dark:bg-gray-700"></div>
                                            <div className="text-center">
                                                <p className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider mb-1">Volume</p>
                                                <p className="font-black text-xl text-[var(--color-secondary)]">{session.total_volume} <span className="text-sm font-semibold text-[var(--color-muted)]">kg</span></p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
