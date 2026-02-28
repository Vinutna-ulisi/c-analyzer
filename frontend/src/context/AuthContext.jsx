import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await api.get('/auth/me'); // We need to check if this endpoint exists
                    setUser(response.data);
                } catch (error) {
                    console.error("Failed to authenticate token", error);
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    const login = async (email, password) => {
        // FastAPI requires form-urlencoded data for OAuth2PasswordRequestForm
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);

        // Check if the backend auth.py uses standard JSON login or OAuth2PasswordRequestForm
        // We will assume standard JSON LoginRequest schema since models.py had `LoginRequest` schema
        const response = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', response.data.access_token);
        setUser({ email }); // We can fetch full profile later if needed
        return response.data;
    };

    const register = async (name, email, password) => {
        const response = await api.post('/auth/register', { name, email, password });
        return response.data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};
