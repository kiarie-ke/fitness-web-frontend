"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "../lib/api";

export default function RegisterPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/auth/', {
                username,
                password,
            });
            router.push('/login');
        } catch (err) {
            setError(err.response?.data?.detail || 'Registration failed. Username may already exist.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-full flex-1 flex items-center justify-center p-6 bg-[var(--color-background)]">
            <div className="human-panel p-10 w-full max-w-md relative overflow-hidden transition-all duration-300">

                <div className="mb-8 text-center relative z-10">
                    <h1 className="text-3xl font-black mb-2 text-[var(--color-primary)] dark:text-[var(--color-tertiary)] tracking-tight">
                        Create Account
                    </h1>
                    <p className="text-[var(--color-muted)] text-sm font-medium">Join us to start tracking your progress.</p>
                </div>

                {error && (
                    <div className="mb-6 bg-[rgba(225,82,61,0.1)] border border-[var(--color-error)] rounded-xl p-3 flex items-center justify-center animate-fade-in relative z-10">
                        <p className="text-[var(--color-error)] text-sm font-semibold text-center">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="relative z-10">
                    <div className="mb-5">
                        <label className="block text-sm font-bold mb-2 text-[var(--color-foreground)]">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-white dark:bg-[var(--color-background)] border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-transparent transition-colors duration-200"
                            placeholder="Choose a username"
                        />
                    </div>

                    <div className="mb-8">
                        <label className="block text-sm font-bold mb-2 text-[var(--color-foreground)]">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-white dark:bg-[var(--color-background)] border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-transparent transition-colors duration-200"
                            placeholder="Create a secure password"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[var(--color-secondary)] text-white py-3.5 rounded-xl font-bold tracking-wide hover:bg-[var(--color-primary)] transition-colors duration-200 disabled:opacity-50"
                    >
                        {loading ? 'Creating Account...' : 'Register'}
                    </button>
                </form>

                <p className="text-sm text-center mt-6 text-[var(--color-muted)] font-medium relative z-10">
                    Already have an account?{' '}
                    <Link href="/login" className="text-[var(--color-tertiary)] hover:underline font-bold transition-all">
                        Login here
                    </Link>
                </p>
            </div>
        </div>
    );
}