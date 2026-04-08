"use client";

import { useState, useEffect, useContext } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import AuthContext from '../context/AuthContext';
import api from '../lib/api';

export default function SettingsPage() {
    const { user, login } = useContext(AuthContext); // Need to re-trigger auth user fetch ideally, or manual update
    const [weightUnit, setWeightUnit] = useState('kg');
    const [bodyweight, setBodyweight] = useState(0);
    const [defaultTimer, setDefaultTimer] = useState(60);
    const [saving, setSaving] = useState(false);
    const [statusText, setStatusText] = useState('');

    useEffect(() => {
        if (user) {
            setWeightUnit(user.weight_unit || 'kg');
            setBodyweight(user.bodyweight || 0);
            setDefaultTimer(user.default_timer || 60);
        }
    }, [user]);

    const handleSave = async () => {
        setSaving(true);
        setStatusText('');
        try {
            await api.put('/users/me/settings', {
                weight_unit: weightUnit,
                bodyweight: parseFloat(bodyweight),
                default_timer: parseInt(defaultTimer)
            });
            setStatusText('Settings saved successfully!');
            
            // To make sure AuthContext has the latest data, we could just reload window 
            // since we wrote custom fetchLogic. Or just let user refresh later.
            setTimeout(() => setStatusText(''), 3000);
        } catch (e) {
            setStatusText('Failed to save settings.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <ProtectedRoute>
            <div className="min-h-full flex-1 p-6 sm:p-10 bg-[var(--color-background)]">
                <div className="max-w-3xl mx-auto animate-fade-in">
                    <div className="mb-8">
                        <h1 className="text-4xl font-black text-[var(--color-primary)] dark:text-[var(--color-tertiary)] tracking-tight">
                            Profile Settings
                        </h1>
                        <p className="text-[var(--color-muted)] font-medium mt-1">
                            Customize your preferences and tracker options.
                        </p>
                    </div>

                    <div className="human-panel p-6 sm:p-8 space-y-6">
                        {statusText && (
                            <div className={`p-4 rounded-xl font-bold bg-[var(--color-background)] ${statusText.includes('Fail') ? 'text-red-500 border border-red-500' : 'text-[var(--color-primary)] dark:text-[var(--color-tertiary)] border border-[var(--color-primary)] dark:border-[var(--color-tertiary)]'}`}>
                                {statusText}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-bold mb-2 text-[var(--color-foreground)]">Weight Unit Preferred</label>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setWeightUnit('kg')}
                                    className={`px-6 py-2 rounded-xl font-bold border-2 transition-all duration-200 ${weightUnit === 'kg' ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white' : 'border-gray-200 dark:border-gray-700 text-[var(--color-foreground)] hover:border-[var(--color-primary)]'}`}
                                >
                                    Kilograms (kg)
                                </button>
                                <button
                                    onClick={() => setWeightUnit('lbs')}
                                    className={`px-6 py-2 rounded-xl font-bold border-2 transition-all duration-200 ${weightUnit === 'lbs' ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white' : 'border-gray-200 dark:border-gray-700 text-[var(--color-foreground)] hover:border-[var(--color-primary)]'}`}
                                >
                                    Pounds (lbs)
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold mb-2 text-[var(--color-foreground)]">Your Bodyweight ({weightUnit})</label>
                            <input 
                                type="number" 
                                value={bodyweight}
                                onChange={(e) => setBodyweight(e.target.value)}
                                className="w-full bg-[var(--color-background)] border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-[var(--color-foreground)] font-bold focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                            />
                            <p className="text-xs text-[var(--color-muted)] mt-1">Used to calculate strength progression charts heavily reliant on body mass.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-bold mb-2 text-[var(--color-foreground)]">Default Rest Timer Duration (Seconds)</label>
                            <input 
                                type="number" 
                                value={defaultTimer}
                                onChange={(e) => setDefaultTimer(e.target.value)}
                                className="w-full bg-[var(--color-background)] border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-[var(--color-foreground)] font-bold focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                            />
                            <p className="text-xs text-[var(--color-muted)] mt-1">This timer automatically begins when you log an active set.</p>
                        </div>

                        <div className="pt-4">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="w-full sm:w-auto px-10 py-3 bg-[var(--color-secondary)] text-white rounded-xl font-bold disabled:opacity-50 transition-colors duration-200"
                            >
                                {saving ? "Saving..." : "Save Settings"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    )
}
