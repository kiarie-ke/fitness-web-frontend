"use client";

import Link from 'next/link';
import { useAuth } from '../app/context/AuthContext';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';

export default function Navbar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!user) return null; // Only show for logged in users

    const navLinks = [
        { name: 'Dashboard', path: '/' },
        { name: 'Workouts', path: '/workouts' },
        { name: 'Routines', path: '/routines' },
        { name: 'History', path: '/history' },
        { name: 'Settings', path: '/settings' }
    ];

    return (
        <nav className="bg-[var(--color-surface)] border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <Link href="/" className="font-black text-xl text-[var(--color-primary)] dark:text-[var(--color-tertiary)] tracking-tight">
                                Workout App
                            </Link>
                        </div>
                        <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                            {navLinks.map((link) => {
                                const isActive = pathname === link.path;
                                return (
                                    <Link
                                        key={link.path}
                                        href={link.path}
                                        className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-bold transition-colors duration-200 ${
                                            isActive 
                                                ? 'border-[var(--color-primary)] text-[var(--color-primary)] dark:text-[var(--color-tertiary)] dark:border-[var(--color-tertiary)]' 
                                                : 'border-transparent text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:border-gray-300 dark:hover:border-gray-600'
                                        }`}
                                    >
                                        {link.name}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                        {mounted && (
                            <button
                                onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                                className="p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-gray-100 dark:bg-gray-800 text-[var(--color-foreground)] hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                aria-label="Toggle Dark Mode"
                            >
                                {resolvedTheme === 'dark' ? (
                                    <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                )}
                            </button>
                        )}
                        <span className="text-sm font-semibold text-[var(--color-foreground)] hidden sm:block">
                            Hi, {user.username}
                        </span>
                        <button
                            onClick={logout}
                            className="text-sm font-bold bg-[rgba(225,82,61,0.1)] text-[var(--color-error)] px-4 py-2 rounded-lg hover:bg-[var(--color-error)] hover:text-white transition-colors duration-200"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Mobile menu (simplified) */}
            <div className="sm:hidden flex overflow-x-auto pb-2 px-4 space-x-4 border-t border-gray-100 dark:border-gray-800">
                {navLinks.map((link) => {
                     const isActive = pathname === link.path;
                     return (
                         <Link
                             key={link.path}
                             href={link.path}
                             className={`whitespace-nowrap px-3 py-2 rounded-md text-sm font-bold mt-2 ${
                                 isActive 
                                     ? 'bg-[var(--color-primary)] text-white dark:bg-[var(--color-tertiary)] dark:text-black' 
                                     : 'text-[var(--color-muted)] hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-[var(--color-foreground)]'
                             }`}
                         >
                             {link.name}
                         </Link>
                     );
                 })}
            </div>
        </nav>
    );
}
