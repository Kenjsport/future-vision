import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for stored token on mount
        const storedToken = localStorage.getItem('futurevision_token');
        const storedUser = localStorage.getItem('futurevision_user');
        
        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
            // Verify token is still valid
            verifyToken(storedToken);
        } else {
            setLoading(false);
        }
    }, []);

    const verifyToken = async (tokenToVerify) => {
        try {
            const response = await fetch(`${API_BASE}/api/auth/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token: tokenToVerify }),
            });

            if (response.ok) {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const data = await response.json();
                    if (data.success && data.user) {
                        setUser(data.user);
                        setToken(tokenToVerify);
                        localStorage.setItem('futurevision_token', tokenToVerify);
                        localStorage.setItem('futurevision_user', JSON.stringify(data.user));
                    } else {
                        logout();
                    }
                } else {
                    // Response is not JSON, likely an error page
                    logout();
                }
            } else {
                // Token invalid, clear storage
                logout();
            }
        } catch (error) {
            console.error('Token verification failed:', error);
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const response = await fetch(`${API_BASE}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                try {
                    const errorData = JSON.parse(errorText);
                    return { success: false, error: errorData.error || 'Login failed' };
                } catch {
                    return { success: false, error: errorText || 'Login failed' };
                }
            }

            const data = await response.json();

            if (response.ok && data.success) {
                setToken(data.token);
                setUser(data.user);
                localStorage.setItem('futurevision_token', data.token);
                localStorage.setItem('futurevision_user', JSON.stringify(data.user));
                return { success: true };
            } else {
                return { success: false, error: data.error || 'Login failed' };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message || 'Login failed' };
        }
    };

    const register = async (email, password, name) => {
        try {
            const response = await fetch(`${API_BASE}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password, name }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                try {
                    const errorData = JSON.parse(errorText);
                    return { success: false, error: errorData.error || 'Registration failed' };
                } catch {
                    return { success: false, error: errorText || 'Registration failed' };
                }
            }

            const data = await response.json();

            if (response.ok && data.success) {
                setToken(data.token);
                setUser(data.user);
                localStorage.setItem('futurevision_token', data.token);
                localStorage.setItem('futurevision_user', JSON.stringify(data.user));
                return { success: true };
            } else {
                return { success: false, error: data.error || 'Registration failed' };
            }
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, error: error.message || 'Registration failed' };
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('futurevision_token');
        localStorage.removeItem('futurevision_user');
    };

    const getAuthHeaders = () => {
        if (token) {
            return {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            };
        }
        return {
            'Content-Type': 'application/json',
        };
    };

    const value = {
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user && !!token,
        getAuthHeaders,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

