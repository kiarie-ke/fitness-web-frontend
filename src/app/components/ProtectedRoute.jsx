"use client"

import { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthContext from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
    const { user, loaded } = useContext(AuthContext);
    const router = useRouter();

    useEffect(() => {
        if (loaded && !user) {
            router.push('/login');
        }
    }, [loaded, user, router]);

    if (!loaded) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-gray-600">Checking your session...</p>
            </div>
        );
    }

    if (!user) return null;

    return children;
};

export default ProtectedRoute;