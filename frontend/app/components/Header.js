'use client';

import { useAuth } from "@/app/context/AuthContext";
import { useEffect } from "react";
import toast from "react-hot-toast";
import api from "../lib/api";

export default function Header() {
    const { user, logout, setUser } = useAuth();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await api.get('/api/auth/me');
                setUser(res.data);
            } catch (error) {
                console.error("Could not fetch user data on tool page");
            }
        };
        fetchUser();
    }, [setUser]);


    const handleLogout = () => {
        logout();
        toast.success("Logged out successfully!");
    };
    
    return (
        <header className="bg-gray-800 text-white p-4 shadow-md">
            <div className="container mx-auto flex justify-between items-center">
                <h1 className="text-xl font-bold">Video Powerhouse</h1>
                {user && (
                    <div className="flex items-center gap-4">
                        <div className="text-sm">
                            <span>{user.email}</span>
                            <span className="ml-2 bg-indigo-600 px-2 py-1 rounded-full text-xs">
                                {user.conversionCount || 0} / 10
                            </span>
                        </div>
                        <button 
                            onClick={handleLogout}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-300"
                        >
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
}
