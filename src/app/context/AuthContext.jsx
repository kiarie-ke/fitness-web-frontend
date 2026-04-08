"use client"

import { createContext, useState, useEffect, useContext } from "react"
import { useRouter } from "next/navigation"
import api, { setAuthToken } from "../lib/api"

// Create the AuthContext object — this is what components will consume
const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loaded, setLoaded] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setAuthToken(token);
            fetchUserProfile(token);
        } else {
            setLoaded(true);
        }
    }, []);

    const fetchUserProfile = async (token) => {
        try {
            const res = await api.get('/users/me');
            setUser({ access_token: token, ...res.data });
        } catch (e) {
            setUser({ access_token: token });
        } finally {
            setLoaded(true);
        }
    };

    const login = async (username, password) => {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);

        const response = await api.post('/auth/token', formData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        setAuthToken(response.data.access_token);
        localStorage.setItem('token', response.data.access_token);
        
        try {
            const userRes = await api.get('/users/me');
            setUser({ access_token: response.data.access_token, ...userRes.data });
        } catch (e) {
            setUser(response.data);
        }
        
        router.push('/');
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('token');
        setAuthToken(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loaded }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;