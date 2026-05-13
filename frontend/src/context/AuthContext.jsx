import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const data = JSON.parse(storedUser);
            setUser(data);
            setToken(data.token);
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const { data } = await axios.post('http://localhost:5000/api/auth/login', { email, password });
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
        setToken(data.token);
        return data;
    };

    const signup = async (userData) => {
        const { data } = await axios.post('http://localhost:5000/api/auth/register', userData);
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
        setToken(data.token);
        return data;
    };

    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
        setToken(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
